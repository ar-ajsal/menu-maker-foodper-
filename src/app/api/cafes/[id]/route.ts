
import { storage } from "@/lib/storage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { canPerformAdminAction } from "@/lib/subscription-guard";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15 params is a Promise
) {
    // Await params because in Next.js 15 dynamic route params are async
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // Corrected: session.user.id is a number

    // 1. Subscription Check
    const subCheck = await canPerformAdminAction(userId);
    if (!subCheck.allowed && subCheck.reason !== 'Subscription required') { // canPerform returns strict reasons
        // But for updateCafe, even expired might want to be blocked?
        // Prompt says "Admin actions ... are restricted" if expired.
        // So yes, block if not allowed.
        return NextResponse.json({ message: subCheck.reason }, { status: 403 });
    }

    // 2. Ownership Check
    const cafe = await storage.getCafe(Number(id));
    if (!cafe) {
        return NextResponse.json({ message: "Cafe not found" }, { status: 404 });
    }

    // Since session.user.id in authOptions is typically string, but our schema uses numbers...
    // In `auth.ts`, the callbacks usually cast it. In `storage.ts`, it expects number.
    // Let's coerce to number just in case or assume session.user.id is correct.
    // In strict TS, session.user.id is string.
    if (cafe.ownerId !== Number(userId)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { theme, imageMenuUrls, menuType, logoUrl, overlayText, address, name } = body;

        // 3. Feature Gating
        const sub = subCheck.subscription;
        const isPro = sub?.status === 'active' && (sub.planType === 'pro-monthly' || sub.planType === 'pro-yearly');
        const isTrial = sub?.status === 'trial';
        const hasPremiumAccess = isPro || isTrial;

        // Theme Restriction
        if (theme && ['modern', 'premium'].includes(theme)) {
            if (!hasPremiumAccess) {
                return NextResponse.json({
                    message: "Premium themes are only available on the Pro plan or during Trial."
                }, { status: 403 });
            }
        }

        // 4. Update
        const updates: any = {};
        if (theme) updates.theme = theme;
        if (imageMenuUrls) updates.imageMenuUrls = imageMenuUrls; // simple array
        if (menuType) updates.menuType = menuType;
        if (logoUrl !== undefined) updates.logoUrl = logoUrl;
        if (address !== undefined) updates.address = address;
        if (name !== undefined) updates.name = name;

        const updatedCafe = await storage.updateCafe(Number(id), updates);

        return NextResponse.json(updatedCafe);

    } catch (error: any) {
        console.error("Update Cafe Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
