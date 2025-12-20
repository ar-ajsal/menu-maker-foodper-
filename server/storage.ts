import { db } from "./db";
import { 
  users, cafes, categories, menuItems, offers, subscriptions,
  type User, type InsertUser,
  type Cafe, type InsertCafe,
  type Category, type InsertCategory,
  type MenuItem, type InsertMenuItem,
  type Offer, type InsertOffer,
  type Subscription
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Cafe
  getCafe(id: number): Promise<Cafe | undefined>;
  getCafeBySlug(slug: string): Promise<Cafe | undefined>;
  getCafeByOwnerId(ownerId: number): Promise<Cafe | undefined>;
  createCafe(cafe: InsertCafe & { ownerId: number, slug: string, qrCodeUrl: string }): Promise<Cafe>;
  updateCafe(id: number, updates: Partial<Cafe>): Promise<Cafe>;

  // Categories
  getCategories(cafeId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Menu Items
  getMenuItems(cafeId: number): Promise<MenuItem[]>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;

  // Offers
  getOffers(cafeId: number): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  deleteOffer(id: number): Promise<void>;

  // Subscription
  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(userId: number): Promise<Subscription>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Cafe
  async getCafe(id: number): Promise<Cafe | undefined> {
    const [cafe] = await db.select().from(cafes).where(eq(cafes.id, id));
    return cafe;
  }

  async getCafeBySlug(slug: string): Promise<Cafe | undefined> {
    const [cafe] = await db.select().from(cafes).where(eq(cafes.slug, slug));
    return cafe;
  }

  async getCafeByOwnerId(ownerId: number): Promise<Cafe | undefined> {
    const [cafe] = await db.select().from(cafes).where(eq(cafes.ownerId, ownerId));
    return cafe;
  }

  async createCafe(cafe: InsertCafe & { ownerId: number, slug: string, qrCodeUrl: string }): Promise<Cafe> {
    const [newCafe] = await db.insert(cafes).values(cafe).returning();
    return newCafe;
  }

  async updateCafe(id: number, updates: Partial<Cafe>): Promise<Cafe> {
    const [updated] = await db.update(cafes).set(updates).where(eq(cafes.id, id)).returning();
    return updated;
  }

  // Categories
  async getCategories(cafeId: number): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.cafeId, cafeId)).orderBy(categories.sortOrder);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Menu Items
  async getMenuItems(cafeId: number): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.cafeId, cafeId)).orderBy(menuItems.sortOrder);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    const [updated] = await db.update(menuItems).set(updates).where(eq(menuItems.id, id)).returning();
    return updated;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Offers
  async getOffers(cafeId: number): Promise<Offer[]> {
    return await db.select().from(offers).where(eq(offers.cafeId, cafeId));
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  async deleteOffer(id: number): Promise<void> {
    await db.delete(offers).where(eq(offers.id, id));
  }

  // Subscription
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return sub;
  }

  async createSubscription(userId: number): Promise<Subscription> {
    // 14 day trial
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);
    
    const [sub] = await db.insert(subscriptions).values({
      userId,
      status: 'trial',
      trialEndsAt: trialEnds
    }).returning();
    return sub;
  }
}

export const storage = new DatabaseStorage();
