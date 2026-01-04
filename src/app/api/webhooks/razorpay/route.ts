import { NextResponse } from "next/server";
import crypto from "crypto";
import { storage } from "@/lib/storage";
import { calculateEndDate } from "@/lib/subscription-utils";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not set");
            return NextResponse.json({ error: "Configuration error" }, { status: 500 });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest("hex");

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);

        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;
            const paymentId = payment.id;

            // Razorpay puts notes in the entity
            // Note: notes key might be flattened or inside notes object depending on API version
            // Usually payment.notes
            const userId = parseInt(payment.notes?.userId);
            const planType = payment.notes?.planType;

            if (userId && planType) {
                const startDate = new Date();
                const endDate = calculateEndDate(planType, startDate);

                await storage.updateSubscription(userId, {
                    status: 'active',
                    planType: planType,
                    startDate: startDate,
                    endDate: endDate,
                    razorpayPaymentId: paymentId,
                    razorpayOrderId: orderId,
                    amount: payment.amount,
                    updatedAt: new Date()
                });

                console.log(`Subscription activated for user ${userId} to ${planType}`);
            } else {
                console.error("Missing userId or planType in payment notes", payment.notes);
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
