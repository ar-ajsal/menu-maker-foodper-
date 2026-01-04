
import { storage } from "@/lib/storage";
import { insertCategorySchema } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const cafeId = searchParams.get("cafeId");

    if (!cafeId) {
        return NextResponse.json({ message: "Cafe ID is required" }, { status: 400 });
    }

    const categories = await storage.getCategories(parseInt(cafeId));
    return NextResponse.json(categories);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = insertCategorySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid input", errors: result.error }, { status: 400 });
        }

        // Verify ownership
        const cafe = await storage.getCafe(result.data.cafeId);
        if (!cafe || cafe.ownerId !== session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const category = await storage.createCategory(result.data);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("Create Category Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
