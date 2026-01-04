
import { storage } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json({ message: "Slug is required" }, { status: 400 });
    }

    try {
        const cafe = await storage.getCafeBySlug(slug);
        if (!cafe) {
            return NextResponse.json({ message: "Cafe not found" }, { status: 404 });
        }
        return NextResponse.json(cafe);
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
