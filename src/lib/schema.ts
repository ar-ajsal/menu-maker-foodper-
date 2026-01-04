
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === USERS (Admins/Cafe Owners) ===
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(), // Email
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

// === CAFES ===
export const cafes = pgTable("cafes", {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id").notNull(), // Foreign key to users
    name: text("name").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(), // For public URL
    address: text("address"),
    logoUrl: text("logo_url"),
    qrCodeUrl: text("qr_code_url"),
    menuType: text("menu_type").notNull().default("digital"), // 'digital' or 'image'
    imageMenuUrls: jsonb("image_menu_urls").$type<string[]>(), // Array of image URLs
    theme: text("theme").notNull().default("standard"), // 'standard', 'modern', 'premium' (Pro only)
    createdAt: timestamp("created_at").defaultNow(),
});

export const insertCafeSchema = createInsertSchema(cafes).omit({ id: true, createdAt: true, qrCodeUrl: true });

// === CATEGORIES (For Digital Menu) ===
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    cafeId: integer("cafe_id").notNull(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(0),
    isVisible: boolean("is_visible").default(true),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

// === MENU ITEMS (For Digital Menu) ===
export const menuItems = pgTable("menu_items", {
    id: serial("id").primaryKey(),
    cafeId: integer("cafe_id").notNull(),
    categoryId: integer("category_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    price: integer("price").notNull(), // In cents/paisa
    imageUrl: text("image_url"),
    isAvailable: boolean("is_available").default(true),
    sortOrder: integer("sort_order").default(0),
    badges: jsonb("badges").$type<string[]>().default([]), // ["spicy", "veg", "bestseller", "new"]
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });

// === TAGS (New Table for TagManager) ===
export const tags = pgTable("tags", {
    id: serial("id").primaryKey(),
    label: text("label").notNull(),
    group: text("group").notNull(), // 'Characteristics', 'Dietary', 'Allergen'
    key: text("key").notNull().unique(), // Unique identifier slug
    cafeId: integer("cafe_id"), // Optional: if null, global tag? For now, we make it global or user scoped. 
    // TagManager implies global set, but typically we want user to manage THEIR tags?
    // Given the code "mock api", let's assume global for simplicity in this port, or allow creating global tags.
    // Actually, if we allow users to create tags, they should probably be persistent throughout the app (global) or specific to them.
    // Let's make current usage GLOBAL for now (cafeId optional).
});
export const insertTagSchema = createInsertSchema(tags).omit({ id: true });


// === OFFERS ===
export const offers = pgTable("offers", {
    id: serial("id").primaryKey(),
    cafeId: integer("cafe_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    offerType: text("offer_type").notNull().default("flat"), // 'category', 'item', 'flat'
    discountType: text("discount_type").default("percent").notNull(), // 'percent' or 'flat'
    discountValue: integer("discount_value").default(0).notNull(), // percent (e.g. 10) or amount (e.g. 50)
    appliedCategories: jsonb("applied_categories").$type<number[]>().default([]),
    appliedItems: jsonb("applied_items").$type<number[]>().default([]),
    startAt: timestamp("start_at"),
    endAt: timestamp("end_at"),
    isActive: boolean("is_active").default(true),
    isVisible: boolean("is_visible").default(true),
    isFeatured: boolean("is_featured").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, createdAt: true });

// === SUBSCRIPTIONS ===
export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(), // One subscription per user
    planType: text("plan_type").notNull().default("trial"), // 'trial', 'monthly', 'quarterly', 'yearly'
    status: text("status").notNull().default("trial"), // 'trial', 'active', 'expired'
    startDate: timestamp("start_date").notNull().defaultNow(),
    endDate: timestamp("end_date").notNull(), // When subscription expires
    razorpayPaymentId: text("razorpay_payment_id"), // Last payment ID
    razorpayOrderId: text("razorpay_order_id"), // Last order ID
    amount: integer("amount"), // In paise (499 → 49900)
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });

// === PROMO CODES ===
export const promoCodes = pgTable("promo_codes", {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    type: text("type").notNull(), // 'percent' or 'flat'
    value: integer("value").notNull(), // percent (e.g. 10 for 10%) or amount in cents
    maxUses: integer("max_uses"),
    currentUses: integer("current_uses").default(0),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, createdAt: true, currentUses: true });

// === RELATIONS ===
export const cafesRelations = relations(cafes, ({ one, many }) => ({
    owner: one(users, {
        fields: [cafes.ownerId],
        references: [users.id],
    }),
    categories: many(categories),
    menuItems: many(menuItems),
    offers: many(offers),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    cafe: one(cafes, {
        fields: [categories.cafeId],
        references: [cafes.id],
    }),
    items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
    cafe: one(cafes, {
        fields: [menuItems.cafeId],
        references: [cafes.id],
    }),
    category: one(categories, {
        fields: [menuItems.categoryId],
        references: [categories.id],
    }),
}));

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Cafe = typeof cafes.$inferSelect;
export type InsertCafe = z.infer<typeof insertCafeSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;

// === API DTOs ===
export type CreateCafeRequest = InsertCafe;
export type UpdateCafeRequest = Partial<InsertCafe>;
