import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canPurchasePlan } from "@/lib/subscription-guard";
import { getPlanAmount } from "@/lib/subscription-utils";
import Razorpay from "razorpay";

// Initialize Razorpay
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("Razorpay keys are missing. Payment features will fail.");
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { planType } = body;

        // Allow 'basic-monthly', 'pro-monthly', 'pro-yearly'
        if (!['basic-monthly', 'pro-monthly', 'pro-yearly'].includes(planType)) {
            return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
        }

        const userId = session.user.id;

        // 1. Validate if user can purchase
        const check = await canPurchasePlan(userId, planType);
        if (!check.allowed) {
            return NextResponse.json({ error: check.reason }, { status: 403 });
        }

        // 2. Get Amount
        const amount = getPlanAmount(planType as any);
        if (amount === 0) {
            return NextResponse.json({ error: 'Invalid plan amount' }, { status: 400 });
        }

        // 3. Create Order
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ error: 'Payment gateway configuration missing' }, { status: 503 });
        }

        // 4. Create Order
        const options = {
            amount: amount, // Amount in paise
            currency: "INR",
            receipt: `rcpt_${userId}_${Date.now()}`,
            notes: {
                userId: String(userId),
                planType: planType
            }
        };

        try {
            const order = await razorpay.orders.create(options);
            return NextResponse.json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            });
        } catch (rzpError: any) {
            console.error('Razorpay Error:', rzpError);
            // If keys are missing or invalid, provide a mocked success for developing/testing if needed
            // But better to fail loud.
            return NextResponse.json({ error: 'Payment gateway error', details: rzpError.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
