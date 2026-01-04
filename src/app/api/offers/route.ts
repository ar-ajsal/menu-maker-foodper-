
import { storage } from "@/lib/storage";
import { insertOfferSchema } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const cafeId = searchParams.get("cafeId");

    if (!cafeId) {
        return NextResponse.json({ message: "Cafe ID is required" }, { status: 400 });
    }

    const offers = await storage.getOffers(parseInt(cafeId));
    return NextResponse.json(offers);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        // Convert dates if needed, zod handles string to date if coerced, but our schema expects Date objects maybe? 
        // Let's check schema. insertOfferSchema (drizzle) expects Date objects for timestamps.
        // But invalid date string might fail.
        if (body.startAt) body.startAt = new Date(body.startAt);
        if (body.endAt) body.endAt = new Date(body.endAt);

        const result = insertOfferSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid input", errors: result.error }, { status: 400 });
        }

        const cafe = await storage.getCafe(result.data.cafeId);
        if (!cafe || cafe.ownerId !== session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const offer = await storage.createOffer(result.data);
        return NextResponse.json(offer, { status: 201 });
    } catch (error) {
        console.error("Create Offer Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
