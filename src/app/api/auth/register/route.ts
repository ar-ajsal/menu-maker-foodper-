
import { storage } from "@/lib/storage";
import { insertUserSchema } from "@/lib/schema";
import { NextResponse } from "next/server";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = insertUserSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ message: "Invalid input", errors: result.error }, { status: 400 });
        }

        const existingUser = await storage.getUserByUsername(result.data.username);
        if (existingUser) {
            return NextResponse.json({ message: "Username already exists" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(result.data.password);
        const user = await storage.createUser({
            ...result.data,
            password: hashedPassword,
        });

        return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
