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
  slug: text("slug").notNull().unique(), // For public URL
  address: text("address"),
  logoUrl: text("logo_url"),
  qrCodeUrl: text("qr_code_url"),
  menuType: text("menu_type").notNull().default("digital"), // 'digital' or 'image'
  imageMenuUrl: text("image_menu_url"), // For image-based menu
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCafeSchema = createInsertSchema(cafes).omit({ id: true, createdAt: true, qrCodeUrl: true });

// === CATEGORIES (For Digital Menu) ===
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  cafeId: integer("cafe_id").notNull(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").default(0),
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
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });

// === OFFERS ===
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  cafeId: integer("cafe_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).omit({ id: true, createdAt: true });

// === SUBSCRIPTIONS ===
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  status: text("status").notNull().default("trial"), // 'trial', 'active', 'expired'
  trialEndsAt: timestamp("trial_ends_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type Subscription = typeof subscriptions.$inferSelect;

// === API DTOs ===
export type CreateCafeRequest = InsertCafe;
export type UpdateCafeRequest = Partial<InsertCafe>;
