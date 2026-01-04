
import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { insertTagSchema } from "@/lib/schema";

export async function GET() {
    try {
        const tags = await storage.getTags();
        return NextResponse.json(tags);
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = insertTagSchema.parse(body);
        const tag = await storage.createTag(parsed);
        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        if ((error as any).name === 'ZodError') {
            return NextResponse.json((error as any).errors, { status: 400 });
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
