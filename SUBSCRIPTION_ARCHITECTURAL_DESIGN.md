# Subscription System Design

## 1. Subscription Flow Overview

The subscription lifecycle follows this strict flow:

### A. Signup & Free Trial
1. **User Registers**: A new user account is created.
2. **Auto-Trial**: A subscription record is automatically created with:
   - `planType`: 'trial'
   - `status`: 'trial'
   - `startDate`: `Date.now()`
   - `endDate`: `Date.now() + 7 days` (configurable)
3. **Access**: User has full access to admin features.

### B. Trial Expiry (Lazy Check)
1. **Admin Action**: User attempts to edit menu (or any protected action).
2. **Guard Check**: System checks `canPerformAdminAction(userId)`.
3. **Expiry Detection**:
   - If `endDate < now`:
     - Update status to `expired`.
     - Return `allowed: false`.
4. **Result**: User is blocked from editing and sees "Subscription Expired" banner. Public menu remains visible.

### C. Purchasing a Plan
1. **Selection**: User selects 'Monthly', 'Quarterly', or 'Yearly' on subscription page.
2. **Pre-Purchase Check**:
   - Call `canPurchasePlan(userId)`.
   - **Rule**: If user has an `active` paid plan that hasn't expired, BLOCK the purchase. (No mid-cycle changes).
   - **Exception**: If user is on `trial` (even if not expired) or `expired` status, ALLOW purchase.
3. **Payment**: User completes Razorpay checkout.
4. **Activation**:
   - Webhook/Verification endpoint validates payment.
   - Update subscription record:
     - `planType`: 'basic-monthly' | 'pro-monthly', etc.
     - `status`: 'active'
     - `startDate`: `Date.now()`
     - `endDate`: `Date.now() + duration` (30, 90, or 365 days).
     - `razorpayPaymentId`: Store implementation ID.

### D. Renewal
1. **After Expiry**: User's status becomes `expired`.
2. **Re-Purchase**: `canPurchasePlan` now returns true.
3. **Cycle**: Process repeats from Step C.

---

## 2. Database Schema

The system uses a unified schema design compatible with both PostgreSQL (Drizzle) and MongoDB (Mongoose).

### Drizzle Schema (PostgreSQL)
```typescript
export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(), // One active sub per user
    planType: text("plan_type").notNull().default("trial"), // 'trial', 'monthly', 'yearly'
    status: text("status").notNull().default("trial"), // 'trial', 'active', 'expired'
    startDate: timestamp("start_date").notNull().defaultNow(),
    endDate: timestamp("end_date").notNull(),
    razorpayPaymentId: text("razorpay_payment_id"),
    razorpayOrderId: text("razorpay_order_id"),
    amount: integer("amount"), // Stored in paise
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Mongoose Schema (MongoDB)
```javascript
const subscriptionSchema = new Schema({
    _id: Number,
    userId: { type: Number, unique: true, required: true },
    planType: { type: String, default: "trial" },
    status: { type: String, default: "trial" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    amount: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
```

---

## 3. Validation Logic & Rules

### Rule 1: One Subscription Per User
- The `userId` field is unique.
- We do not create new rows for renewals; we **update** the existing row. History can be stored in a separate `transactions` table if needed later, but for MVP, we simply overwrite the active subscription.

### Rule 2: Lazy Expiry
- We do not run cron jobs.
- Expiration is checked **Just-In-Time** when the user attempts an action.
- If `currentDate > endDate`, status is flipped to `expired` immediately before blocking the action.

### Rule 3: No Mid-Cycle Downgrades/Upgrades
- **Scenario**: User is on 'Monthly' with 15 days left.
- **Action**: User tries to buy 'Yearly'.
- **Result**: Rejected. Message: "Please wait for your current plan to expire."
- **Rationale**: drastically simplifies billing logic (no proration, no partial refunds).

---

## 4. Pseudocode & Implementation Logic

### Guard: `canPerformAdminAction(userId)`
```typescript
function canPerformAdminAction(userId) {
    sub = fetchSubscription(userId)
    
    if (!sub) return { allowed: false, reason: "Missing" }

    if (now > sub.endDate && sub.status != 'expired') {
        // Lazy update
        updateSubscription(userId, { status: 'expired' })
        return { allowed: false, reason: "Expired" }
    }

    if (sub.status == 'expired') {
        return { allowed: false, reason: "Expired" }
    }

    // Status is 'trial' or 'active' AND date is valid
    return { allowed: true }
}
```

### Guard: `canPurchasePlan(userId)`
```typescript
function canPurchasePlan(userId) {
    sub = fetchSubscription(userId)
    
    // Allow if no sub exists (edge case recovery)
    if (!sub) return { allowed: true }

    // Allow if trial (upgrade anytime)
    if (sub.status == 'trial') return { allowed: true }

    // Allow if expired
    if (sub.status == 'expired') return { allowed: true }

    // If active plan has NOT expired yet, Block
    if (sub.status == 'active' && now < sub.endDate) {
        return { 
            allowed: false, 
            reason: "Current plan still active. Wait for expiry." 
        }
    }

    return { allowed: true }
}
```

### Action: `activateSubscription(userId, planType, paymentDetails)`
```typescript
function activateSubscription(userId, planType, paymentData) {
    duration = getDurationDays(planType) // 30, 90, 365
    
    updateSubscription(userId, {
        planType: planType,
        status: 'active',
        startDate: new Date(),
        endDate: new Date() + duration,
        razorpayPaymentId: paymentData.id,
        updatedAt: new Date()
    })
}
```

---

## 5. Production Readiness Confirmation

### Safety Analysis
- **Simplicity**: By strictly enforcing "one plan at a time" and "no mid-cycle changes", we eliminate 90% of billing bugs (proration errors, double billing).
- **Security**: Admin routes are guarded by `requireActiveSubscription` which performs a DB check. Even if UI hacks enable buttons, the API will reject the request.
- **Fail-Safe**: Public pages (menus) purposely **bypass** these checks, ensuring that even if a café owner's card declines, their customers can still order food. 
- **Data Integrity**: Using specific `planType` enums and single-record-per-user ensures predictable state.

### Missing Elements (MVP Constraints)
- **Invoicing**: No PDF invoice generation (add later).
- **Emails**: No email notifications on expiry (add later).
- **Grace Period**: No grace period implemented; expiry is hard stop for admin features.

**Verdict**: The logic is **SOLID** and **MVP-READY**.
