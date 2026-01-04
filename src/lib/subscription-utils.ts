// Subscription utility functions

export const PLAN_PRICING = {
    'basic-monthly': 9900,    // ₹99
    'pro-monthly': 19900,     // ₹199
    'pro-yearly': 100000      // ₹1000
} as const;

export const PLAN_DURATIONS = {
    trial: 7,               // 7 days
    'basic-monthly': 30,    // 30 days
    'pro-monthly': 30,      // 30 days
    'pro-yearly': 365       // 365 days
} as const;

export type PlanType = 'trial' | 'basic-monthly' | 'pro-monthly' | 'pro-yearly';
export type SubscriptionStatus = 'trial' | 'active' | 'expired';

/**
 * Get plan amount in paise
 */
export function getPlanAmount(planType: PlanType): number {
    if (planType === 'trial') return 0;
    return PLAN_PRICING[planType as keyof typeof PLAN_PRICING] || 0;
}

/**
 * Calculate end date for a plan
 */
export function calculateEndDate(planType: PlanType, startDate: Date = new Date()): Date {
    const endDate = new Date(startDate);
    const days = PLAN_DURATIONS[planType] || 30;
    endDate.setDate(endDate.getDate() + days);
    return endDate;
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(planType: PlanType): string {
    const names = {
        trial: 'Free Trial',
        'basic-monthly': 'Basic Monthly',
        'pro-monthly': 'Pro Monthly',
        'pro-yearly': 'Pro Yearly'
    };
    return names[planType] || planType;
}

/**
 * Format amount in rupees
 */
export function formatAmount(amountInPaise: number): string {
    return `₹${(amountInPaise / 100).toFixed(2)}`;
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(subscription: {
    status: string;
    endDate: Date | string;
}): boolean {
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    return now > endDate || subscription.status === 'expired';
}

/**
 * Get days remaining in subscription
 */
export function getDaysRemaining(endDate: Date | string): number {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
