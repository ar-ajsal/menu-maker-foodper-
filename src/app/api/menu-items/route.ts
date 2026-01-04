
import { storage } from "@/lib/storage";
import { insertMenuItemSchema } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const cafeId = searchParams.get("cafeId");

    if (!cafeId) {
        return NextResponse.json({ message: "Cafe ID is required" }, { status: 400 });
    }

    const categoryId = searchParams.get("categoryId");

    const items = await storage.getMenuItems(
        parseInt(cafeId),
        categoryId ? parseInt(categoryId) : undefined
    );
    return NextResponse.json(items);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = insertMenuItemSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid input", errors: result.error }, { status: 400 });
        }

        const cafe = await storage.getCafe(result.data.cafeId);
        if (!cafe || cafe.ownerId !== session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const item = await storage.createMenuItem(result.data);
        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error("Create Menu Item Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
