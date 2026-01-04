
import { storage } from "@/lib/storage";
import { insertCafeSchema } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const cafes = await storage.getCafesByOwnerId(session.user.id);
    return NextResponse.json(cafes);
}

import { canCreateCafe } from "@/lib/subscription-guard";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Ensure Subscription Exists (Auto-start trial for new users)
    const existingSub = await storage.getSubscription(session.user.id);
    if (!existingSub) {
        await storage.createSubscription(session.user.id);
    }

    // 2. Check Limits
    const limitCheck = await canCreateCafe(session.user.id);
    if (!limitCheck.allowed) {
        return NextResponse.json({ message: limitCheck.reason }, { status: 403 });
    }

    try {
        const body = await req.json();
        const result = insertCafeSchema.omit({ ownerId: true, slug: true }).safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid input", errors: result.error }, { status: 400 });
        }

        const name = result.data.name || "My Cafe";
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
        const host = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const publicUrl = `${host}/menu/${slug}`;
        const qrCodeDataUrl = await QRCode.toDataURL(publicUrl);

        const cafe = await storage.createCafe({
            ...result.data,
            name,
            ownerId: session.user.id,
            slug,
            qrCodeUrl: qrCodeDataUrl,
        });




        return NextResponse.json(cafe, { status: 201 });
    } catch (error) {
        console.error("Create Cafe Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
