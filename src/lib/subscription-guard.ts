import { storage } from "./storage";
import { isSubscriptionExpired } from "./subscription-utils";

/**
 * Check if user can perform admin actions
 * Returns details about permission
 */
export async function canPerformAdminAction(userId: number) {
    const sub = await storage.getSubscription(userId);

    if (!sub) {
        return {
            allowed: false,
            reason: 'No subscription found. Please contact support.',
            subscription: null
        };
    }

    const now = new Date();

    // Auto-expire if endDate passed
    if (new Date(sub.endDate) < now && sub.status !== 'expired') {
        // We lazily update status to expired
        const updated = await storage.updateSubscription(userId, {
            status: 'expired',
            updatedAt: new Date()
        });
        return {
            allowed: false,
            reason: 'Subscription expired. Please renew to continue.',
            subscription: updated
        };
    }

    // Check final status
    if (sub.status === 'expired') {
        return {
            allowed: false,
            reason: 'Subscription expired. Please renew to continue.',
            subscription: sub
        };
    }

    // Trial or Active = allowed
    return {
        allowed: true,
        subscription: sub
    };
}

/**
 * Require active subscription or throw error
 * Use in API routes
 */
export async function requireActiveSubscription(userId: number) {
    const check = await canPerformAdminAction(userId);

    if (!check.allowed) {
        throw new Error(check.reason || 'Subscription required');
    }

    return check.subscription;
}

/**
 * Check if user can purchase a new plan
 */
export async function canPurchasePlan(userId: number, newPlanType: string) {
    const sub = await storage.getSubscription(userId);

    if (!sub) {
        // Should ideally have a sub, but if not, allow purchase to fix it
        return { allowed: true };
    }

    const now = new Date();

    // If active and not expired, block plan change
    // Exception: If it's a trial, we allow upgrading to paid
    if (sub.status === 'active' && new Date(sub.endDate) > now) {
        return {
            allowed: false,
            reason: `Your ${sub.planType} plan is active until ${new Date(sub.endDate).toLocaleDateString('en-IN')}. You cannot change plans mid-cycle.`
        };
    }

    return { allowed: true };
}

/**
 * Check if user can create a new cafe based on plan limits
 */
export async function canCreateCafe(userId: number) {
    // 1. Basic Active Subscription Check
    const accessCheck = await canPerformAdminAction(userId);
    if (!accessCheck.allowed) {
        return accessCheck;
    }

    const sub = accessCheck.subscription;
    const planType = sub?.planType || 'trial';

    // 2. Check Limits
    const cafes = await storage.getCafesByOwnerId(userId);
    const cafeCount = cafes.length;

    let limit = 2; // Default for Trial and Basic

    if (planType.startsWith('pro')) {
        limit = 1000; // Effectively unlimited
    }

    if (cafeCount >= limit) {
        return {
            allowed: false,
            reason: `You have reached the limit of ${limit} cafes for your ${planType === 'trial' ? 'Free Trial' : 'Basic Plan'}. Upgrade to Pro for unlimited cafes.`
        };
    }

    return { allowed: true };
}
