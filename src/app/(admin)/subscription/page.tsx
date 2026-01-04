"use client";

import { useSubscription } from '@/hooks/use-subscription';
import { useMyCafes } from '@/hooks/use-cafes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Script from 'next/script';

export default function SubscriptionPage() {
    const { data: subscription, isLoading, refetch } = useSubscription();
    const { data: cafes } = useMyCafes();
    const router = useRouter();
    const { toast } = useToast();

    const handleUpgrade = async (planType: string) => {
        try {
            // 1. Create Order
            const res = await fetch('/api/subscription/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create order');
            }

            const order = await res.json();

            // 2. Open Razorpay
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "Menu Maker",
                description: `${planType.replace('-', ' ').toUpperCase()} Plan`,
                image: "https://menu-maker.com/logo.png",
                order_id: order.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/subscription/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                planType // Closed over from handleUpgrade scope
                            })
                        });

                        if (!verifyRes.ok) throw new Error('Payment verification failed');

                        toast({
                            title: "Payment Successful!",
                            description: "Your subscription is active.",
                            className: "bg-green-600 text-white"
                        });

                        setTimeout(() => refetch(), 1000);
                    } catch (err) {
                        toast({
                            title: "Verification Failed",
                            description: "Payment succeeded but verification failed. Support contacted.",
                            variant: "destructive"
                        });
                    }
                },
                prefill: {
                    name: "Cafe Owner",
                    email: "owner@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#4F46E5"
                }
            };

            // Safety check for Razorpay loading
            if (!(window as any).Razorpay) {
                toast({ title: "Loading...", description: "Payment gateway is initializing. Please click again." });
                return;
            }

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const isPro = subscription?.status === 'active' && (subscription?.planType?.startsWith('pro') || subscription?.planType === 'pro');
    const isBasic = subscription?.status === 'active' && subscription?.planType?.startsWith('basic');
    const isTrial = subscription?.status === 'trial';
    const isExpired = subscription?.status === 'expired';
    const cafeCount = cafes?.length || 0;

    const features = {
        basic: [
            'Up to 2 cafes',
            'Unlimited menu items',
            'QR code generation',
            'Basic themes',
            'Email support'
        ],
        pro: [
            'Unlimited cafes',
            'Premium themes',
            'Advanced offers & promos',
            'Custom branding',
            'Priority support',
            'Analytics dashboard',
            'White-label option'
        ]
    };

    return (
        <div className="space-y-8 pb-12">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            {/* Current Plan Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className={`${isPro ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-700' :
                    isBasic ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' :
                        isExpired ? 'bg-red-50 border-red-200' : ''}`}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isPro ? (
                                    <div className="p-3 rounded-full bg-amber-400 text-indigo-900">
                                        <Crown className="w-6 h-6" />
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                )}
                                <div>
                                    <CardTitle className="text-2xl">
                                        {isPro ? 'Pro Plan' : isBasic ? 'Basic Plan' : isTrial ? 'Free Trial' : 'Subscription Expired'}
                                    </CardTitle>
                                    <CardDescription className={isPro ? 'text-indigo-200' : ''}>
                                        {subscription?.status === 'active'
                                            ? `Active until ${new Date(subscription?.endDate).toLocaleDateString('en-IN')}`
                                            : isTrial
                                                ? `${subscription?.daysRemaining} days remaining in trial`
                                                : 'Please renew to continue'}
                                    </CardDescription>
                                </div>
                            </div>
                            {subscription?.status && (
                                <Badge
                                    variant={
                                        subscription.status === 'active' ? 'default' :
                                            subscription.status === 'trial' ? 'secondary' :
                                                'destructive'
                                    }
                                    className="text-xs px-3 py-1 uppercase"
                                >
                                    {subscription.status}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-lg ${isPro ? 'bg-white/10' : 'bg-white border'}`}>
                                <div className={`text-3xl font-bold mb-1 ${isPro ? 'text-white' : 'text-gray-900'}`}>
                                    {cafeCount}
                                </div>
                                <div className={`text-sm ${isPro ? 'text-indigo-200' : 'text-gray-600'}`}>
                                    Active Cafes
                                </div>
                            </div>
                            <div className={`p-4 rounded-lg ${isPro ? 'bg-white/10' : 'bg-white border'}`}>
                                <div className={`text-3xl font-bold mb-1 ${isPro ? 'text-white' : 'text-gray-900'}`}>
                                    {isPro ? '∞' : '2'}
                                </div>
                                <div className={`text-sm ${isPro ? 'text-indigo-200' : 'text-gray-600'}`}>
                                    Cafe Limit
                                </div>
                            </div>
                            <div className={`p-4 rounded-lg ${isPro ? 'bg-white/10' : 'bg-white border'}`}>
                                <div className={`text-3xl font-bold mb-1 ${isPro ? 'text-white' : 'text-gray-900'}`}>
                                    {subscription?.daysRemaining}
                                </div>
                                <div className={`text-sm ${isPro ? 'text-indigo-200' : 'text-gray-600'}`}>
                                    Days Left
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Upgrade Options */}
            {/* Always show plans so users know what is available. Buttons disabled if active. */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <h2 className="text-xl font-bold mb-4">Choose a Plan</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Basic Monthly */}
                    <Card
                        className={`border-2 transition-colors cursor-pointer ${isBasic ? 'border-green-500 bg-green-50' : 'hover:border-indigo-500'}`}
                        onClick={() => !isBasic && handleUpgrade('basic-monthly')}
                    >
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                Basic
                                {isBasic && <Check className="w-5 h-5 text-green-600" />}
                            </CardTitle>
                            <div className="text-3xl font-bold">₹99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <p className="text-sm text-gray-500">Essential tools</p>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                variant={isBasic ? "secondary" : "outline"}
                                disabled={isBasic}
                                onClick={(e) => { e.stopPropagation(); handleUpgrade('basic-monthly'); }}
                            >
                                {isBasic ? "Current Plan" : "Choose Basic"}
                            </Button>
                            <ul className="mt-4 space-y-2 text-sm text-gray-500">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> 2 Cafes</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Basic Themes</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Pro Monthly */}
                    <Card
                        className={`border-2 relative overflow-hidden transform hover:scale-105 transition-all shadow-xl ${isPro && !subscription?.planType?.includes('yearly') ? 'border-green-500 bg-green-50' : 'border-indigo-500'}`}
                        onClick={() => handleUpgrade('pro-monthly')}
                    >
                        {(!isPro) && <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">RECOMMENDED</div>}
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                Pro Monthly
                                {isPro && !subscription?.planType?.includes('yearly') && <Check className="w-5 h-5 text-green-600" />}
                            </CardTitle>
                            <div className="text-3xl font-bold">₹199<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <p className="text-sm text-indigo-600">All features unlocked</p>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                disabled={isPro && !subscription?.planType?.includes('yearly')}
                                onClick={(e) => { e.stopPropagation(); handleUpgrade('pro-monthly'); }}
                            >
                                {(isPro && !subscription?.planType?.includes('yearly')) ? "Current Plan" : "Choose Pro"}
                            </Button>
                            <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-amber-500" /> Unlimited Cafes</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-amber-500" /> Premium Themes</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Pro Yearly */}
                    <Card
                        className={`border-2 transition-colors cursor-pointer ${subscription?.planType === 'pro-yearly' ? 'border-green-500 bg-green-50' : 'hover:border-indigo-500'}`}
                        onClick={() => handleUpgrade('pro-yearly')}
                    >
                        <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">BEST VALUE</div>
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                Pro Yearly
                                {subscription?.planType === 'pro-yearly' && <Check className="w-5 h-5 text-green-600" />}
                            </CardTitle>
                            <div className="text-3xl font-bold">₹1000<span className="text-sm font-normal text-muted-foreground">/yr</span></div>
                            <p className="text-xs text-green-600 font-semibold">Save ₹1388 vs Monthly</p>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                variant={subscription?.planType === 'pro-yearly' ? "secondary" : "outline"}
                                disabled={subscription?.planType === 'pro-yearly'}
                                onClick={(e) => { e.stopPropagation(); handleUpgrade('pro-yearly'); }}
                            >
                                {subscription?.planType === 'pro-yearly' ? "Current Plan" : "Choose Yearly"}
                            </Button>
                            <p className="text-xs text-center mt-2 text-gray-500">Only ₹83/month</p>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            {/* Feature Comparison */}
            <Card>
                <CardHeader>
                    <CardTitle>Plan Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-4 text-lg">Trial / Basic</h3>
                            <ul className="space-y-3">
                                {features.basic.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {f}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2 text-indigo-600"><Crown className="w-5 h-5" /> Pro Features</h3>
                            <ul className="space-y-3">
                                {features.pro.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> {f}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
