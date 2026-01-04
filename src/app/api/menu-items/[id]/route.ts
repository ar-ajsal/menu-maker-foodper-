
import { storage } from "@/lib/storage";
import { insertMenuItemSchema } from "@/lib/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: idString } = await params;
        const id = parseInt(idString);
        const body = await req.json();
        const result = insertMenuItemSchema.partial().safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid input", errors: result.error }, { status: 400 });
        }

        const updated = await storage.updateMenuItem(id, result.data);
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update Menu Item Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id: idString } = await params;
        const id = parseInt(idString);
        await storage.deleteMenuItem(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Delete Menu Item Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
