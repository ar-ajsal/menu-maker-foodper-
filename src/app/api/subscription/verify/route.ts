import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { storage } from "@/lib/storage";
import crypto from "crypto";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = body;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });

        // Verify Signature
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 });
        }

        // Calculate End Date
        const now = new Date();
        const endDate = new Date();

        // Use standard durations if possible, but for now strict assignment
        // Hardcoded pricing matching PLAN_PRICING utils to ensure consistency
        let amountInPaise = 0;

        switch (planType) {
            case 'pro-yearly':
                endDate.setFullYear(endDate.getFullYear() + 1);
                amountInPaise = 100000; // ₹1000.00
                break;
            case 'pro-monthly':
                endDate.setMonth(endDate.getMonth() + 1);
                amountInPaise = 19900; // ₹199.00
                break;
            case 'basic-monthly':
                endDate.setMonth(endDate.getMonth() + 1);
                amountInPaise = 9900; // ₹99.00
                break;
            default:
                // Fallback or error?
                endDate.setMonth(endDate.getMonth() + 1);
                amountInPaise = 9900;
        }

        // Update Subscription
        await storage.updateSubscription(session.user.id, {
            status: 'active',
            planType,
            startDate: now,
            endDate: endDate,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            amount: amountInPaise,
            updatedAt: now
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Verify Payment Error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}
