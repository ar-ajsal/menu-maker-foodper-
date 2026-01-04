import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { getDaysRemaining } from "@/lib/subscription-utils";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    let sub = await storage.getSubscription(userId);

    if (!sub) {
        // Try creating one if missing (auto-fix for legacy users)
        try {
            sub = await storage.createSubscription(userId);
        } catch (e) {
            return NextResponse.json({
                hasSubscription: false,
                canPerformActions: false
            });
        }
    }

    const now = new Date();
    const endDate = new Date(sub.endDate);

    // Lazy expiry check
    if (endDate < now && sub.status !== 'expired') {
        sub = await storage.updateSubscription(userId, {
            status: 'expired',
            updatedAt: now
        });
    }

    const daysRemaining = getDaysRemaining(sub.endDate);

    return NextResponse.json({
        hasSubscription: true,
        status: sub.status,
        planType: sub.planType,
        startDate: sub.startDate,
        endDate: sub.endDate,
        daysRemaining,
        canPerformActions: sub.status !== 'expired',
        canChangePlan: sub.status === 'expired' || sub.status === 'trial',
        amount: sub.amount
    });
}
