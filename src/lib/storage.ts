
import { db } from "./db";
import {
    users, cafes, categories, menuItems, offers, subscriptions,
    type User, type InsertUser,
    type Cafe, type InsertCafe,
    type Category, type InsertCategory,
    type MenuItem, type InsertMenuItem,
    type Offer, type InsertOffer,
    type Subscription, type InsertSubscription,
    type PromoCode, type InsertPromoCode,
    type Tag, type InsertTag,
    promoCodes, tags
} from "./schema";
import { eq, and } from "drizzle-orm";
import mongoose, { Schema, model } from "mongoose";

export interface IStorage {
    // User
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;

    // Cafe
    getCafe(id: number): Promise<Cafe | undefined>;
    getCafeBySlug(slug: string): Promise<Cafe | undefined>;
    getCafeByOwnerId(ownerId: number): Promise<Cafe | undefined>;
    getCafesByOwnerId(ownerId: number): Promise<Cafe[]>;
    createCafe(cafe: InsertCafe & { ownerId: number, slug: string, qrCodeUrl: string }): Promise<Cafe>;
    updateCafe(id: number, updates: Partial<Cafe>): Promise<Cafe>;

    // Categories
    getCategories(cafeId: number): Promise<Category[]>;
    createCategory(category: InsertCategory): Promise<Category>;
    deleteCategory(id: number): Promise<void>;
    updateCategory(id: number, updates: Partial<Category>): Promise<Category>;

    // Menu Items
    getMenuItems(cafeId: number, categoryId?: number): Promise<MenuItem[]>;
    createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
    updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem>;
    deleteMenuItem(id: number): Promise<void>;

    // Offers
    getOffers(cafeId: number): Promise<Offer[]>;
    createOffer(offer: InsertOffer): Promise<Offer>;
    updateOffer(id: number, updates: Partial<InsertOffer>): Promise<Offer>;
    deleteOffer(id: number): Promise<void>;

    // Subscription
    getSubscription(userId: number): Promise<Subscription | undefined>;
    createSubscription(userId: number): Promise<Subscription>;
    updateSubscription(userId: number, updates: Partial<Subscription>): Promise<Subscription>;

    // Promo Codes
    getPromoCode(code: string): Promise<PromoCode | undefined>;
    createPromoCode(code: InsertPromoCode): Promise<PromoCode>;
    updatePromoCode(id: number, updates: Partial<PromoCode>): Promise<PromoCode>;
    // Tags
    getTags(): Promise<Tag[]>;
    createTag(tag: InsertTag): Promise<Tag>;
}

export class DatabaseStorage implements IStorage {
    // ... existing implementations ...

    async getTags(): Promise<Tag[]> {
        return await db!.select().from(tags);
    }

    async createTag(tag: InsertTag): Promise<Tag> {
        const [newTag] = await db!.insert(tags).values(tag as any).returning();
        return newTag;
    }

    // User
    async getUser(id: number): Promise<User | undefined> {
        const [user] = await db!.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const [user] = await db!.select().from(users).where(eq(users.username, username));
        return user;
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const [user] = await db!.insert(users).values(insertUser as any).returning();
        return user;
    }

    // Cafe
    async getCafe(id: number): Promise<Cafe | undefined> {
        const [cafe] = await db!.select().from(cafes).where(eq(cafes.id, id));
        return cafe;
    }

    async getCafeBySlug(slug: string): Promise<Cafe | undefined> {
        const [cafe] = await db!.select().from(cafes).where(eq(cafes.slug, slug));
        return cafe;
    }

    async getCafeByOwnerId(ownerId: number): Promise<Cafe | undefined> {
        const [cafe] = await db!.select().from(cafes).where(eq(cafes.ownerId, ownerId));
        return cafe;
    }

    async getCafesByOwnerId(ownerId: number): Promise<Cafe[]> {
        return await db!.select().from(cafes).where(eq(cafes.ownerId, ownerId));
    }

    async createCafe(cafe: InsertCafe & { ownerId: number, slug: string, qrCodeUrl: string }): Promise<Cafe> {
        const [newCafe] = await db!.insert(cafes).values({
            ...cafe,
            imageMenuUrls: (cafe as any).imageMenuUrls ?? null
        } as any).returning();
        return newCafe;
    }

    async updateCafe(id: number, updates: Partial<Cafe>): Promise<Cafe> {
        const [updated] = await db!.update(cafes).set(updates).where(eq(cafes.id, id)).returning();
        return updated;
    }

    // Categories
    async getCategories(cafeId: number): Promise<Category[]> {
        return await db!.select().from(categories).where(eq(categories.cafeId, cafeId)).orderBy(categories.sortOrder);
    }

    async createCategory(category: InsertCategory): Promise<Category> {
        const [newCategory] = await db!.insert(categories).values(category as any).returning();
        return newCategory;
    }

    async deleteCategory(id: number): Promise<void> {
        await db!.delete(categories).where(eq(categories.id, id));
    }

    async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
        const [updated] = await db!.update(categories).set(updates).where(eq(categories.id, id)).returning();
        return updated;
    }

    // Menu Items
    async getMenuItems(cafeId: number, categoryId?: number): Promise<MenuItem[]> {
        if (categoryId) {
            return await db!.select().from(menuItems).where(and(eq(menuItems.cafeId, cafeId), eq(menuItems.categoryId, categoryId))).orderBy(menuItems.sortOrder);
        }
        return await db!.select().from(menuItems).where(eq(menuItems.cafeId, cafeId)).orderBy(menuItems.sortOrder);
    }

    async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
        const [newItem] = await db!.insert(menuItems).values(item as any).returning();
        return newItem;
    }

    async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
        const [updated] = await db!.update(menuItems).set(updates).where(eq(menuItems.id, id)).returning();
        return updated;
    }

    async deleteMenuItem(id: number): Promise<void> {
        await db!.delete(menuItems).where(eq(menuItems.id, id));
    }

    // Offers
    async getOffers(cafeId: number): Promise<Offer[]> {
        return await db!.select().from(offers).where(eq(offers.cafeId, cafeId));
    }

    async createOffer(offer: InsertOffer): Promise<Offer> {
        const [newOffer] = await db!.insert(offers).values(offer as any).returning();
        return newOffer;
    }

    async deleteOffer(id: number): Promise<void> {
        await db!.delete(offers).where(eq(offers.id, id));
    }

    async updateOffer(id: number, updates: Partial<InsertOffer>): Promise<Offer> {
        const [updated] = await db!.update(offers).set(updates).where(eq(offers.id, id)).returning();
        return updated;
    }

    // Subscription
    async getSubscription(userId: number): Promise<Subscription | undefined> {
        const [sub] = await db!.select().from(subscriptions).where(eq(subscriptions.userId, userId));
        return sub;
    }

    async createSubscription(userId: number): Promise<Subscription> {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // 7 days trial

        const [sub] = await db!.insert(subscriptions).values({
            userId,
            planType: 'trial',
            status: 'trial',
            startDate: new Date(),
            endDate
        } as any).returning();
        return sub;
    }

    async updateSubscription(userId: number, updates: Partial<Subscription>): Promise<Subscription> {
        const [updated] = await db!.update(subscriptions).set(updates).where(eq(subscriptions.userId, userId)).returning();
        return updated;
    }

    // Promo Codes
    async getPromoCode(code: string): Promise<PromoCode | undefined> {
        const [promo] = await db!.select().from(promoCodes).where(eq(promoCodes.code, code));
        return promo;
    }

    async createPromoCode(insertPromo: InsertPromoCode): Promise<PromoCode> {
        const [promo] = await db!.insert(promoCodes).values(insertPromo as any).returning();
        return promo;
    }

    async updatePromoCode(id: number, updates: Partial<PromoCode>): Promise<PromoCode> {
        const [updated] = await db!.update(promoCodes).set(updates).where(eq(promoCodes.id, id)).returning();
        return updated;
    }
}

// === MONGO DB STORAGE ===

const userSchema = new Schema({
    _id: Number,
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const cafeSchema = new Schema({
    _id: Number,
    ownerId: Number,
    name: String,
    slug: { type: String, unique: true },
    address: String,
    logoUrl: String,
    qrCodeUrl: String,
    menuType: { type: String, default: "digital" },
    imageMenuUrls: [String],
    theme: { type: String, default: "standard" },
    createdAt: { type: Date, default: Date.now }
});

const categorySchema = new Schema({
    _id: Number,
    cafeId: Number,
    name: String,
    sortOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true }
});

const menuItemSchema = new Schema({
    _id: Number,
    cafeId: Number,
    categoryId: Number,
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    isAvailable: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    badges: { type: [String], default: [] }
});

const offerSchema = new Schema({
    _id: Number,
    cafeId: Number,
    categoryId: Number,
    itemId: Number,
    title: String,
    description: String,
    discountType: { type: String, default: "percent" },
    discountValue: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const subscriptionSchema = new Schema({
    _id: Number,
    userId: { type: Number, unique: true, required: true },
    planType: { type: String, default: "trial" }, // 'trial', 'monthly', 'quarterly', 'yearly'
    status: { type: String, default: "trial" }, // 'trial', 'active', 'expired'
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    amount: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const promoCodeSchema = new Schema({
    _id: Number,
    code: { type: String, unique: true, required: true },
    type: { type: String, required: true }, // 'percent' or 'flat'
    value: { type: Number, required: true },
    maxUses: Number,
    currentUses: { type: Number, default: 0 },
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now }
});

// Use existing models if defined, otherwise define them
const UserModel = mongoose.models.User || model("User", userSchema);
const CafeModel = mongoose.models.Cafe || model("Cafe", cafeSchema);
const CategoryModel = mongoose.models.Category || model("Category", categorySchema);
const MenuItemModel = mongoose.models.MenuItem || model("MenuItem", menuItemSchema);
const OfferModel = mongoose.models.Offer || model("Offer", offerSchema);
const SubscriptionModel = mongoose.models.Subscription || model("Subscription", subscriptionSchema);
const PromoCodeModel = mongoose.models.PromoCode || model("PromoCode", promoCodeSchema);

export class MongoStorage implements IStorage {
    constructor() {
        if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
            mongoose.connect(process.env.MONGODB_URI!).then(() => {
                console.log("Connected to MongoDB via Drizzle Storage Adapter");
            }).catch(err => {
                console.error("MongoDB Connection Error:", err);
            });
        }
    }

    private async getNextId(model: any): Promise<number> {
        const lastItem = await model.findOne().sort({ _id: -1 });
        return lastItem ? lastItem._id + 1 : 1;
    }

    private toUser(doc: any): User {
        if (!doc) return undefined as any;
        const obj = doc.toObject();
        return { ...obj, id: obj._id };
    }

    private toCafe(doc: any): Cafe {
        if (!doc) return undefined as any;
        const obj = doc.toObject();
        return { ...obj, id: obj._id };
    }

    private toCategory(doc: any): Category {
        if (!doc) return undefined as any;
        const obj = doc.toObject();
        return { ...obj, id: obj._id };
    }

    private toMenuItem(doc: any): MenuItem {
        if (!doc) return undefined as any;
        const obj = doc.toObject();
        return { ...obj, id: obj._id };
    }

    private toOffer(doc: any): Offer {
        if (!doc) return undefined as any;
        const obj = doc.toObject();
        return { ...obj, id: obj._id };
    }

    private toSub(doc: any): Subscription {
        if (!doc) return undefined as any;
        const obj = doc.toObject();
        return { ...obj, id: obj._id };
    }

    private toPromoCode(doc: any): PromoCode {
        if (!doc) return undefined as any;
        const obj = doc.toObject();
        return { ...obj, id: obj._id };
    }

    // User
    async getUser(id: number): Promise<User | undefined> {
        const doc = await UserModel.findById(id);
        return doc ? this.toUser(doc) : undefined;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const doc = await UserModel.findOne({ username });
        return doc ? this.toUser(doc) : undefined;
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const id = await this.getNextId(UserModel);
        const doc = await UserModel.create({ ...(insertUser as any), _id: id });
        return this.toUser(doc);
    }

    // Cafe
    async getCafe(id: number): Promise<Cafe | undefined> {
        const doc = await CafeModel.findById(id);
        return doc ? this.toCafe(doc) : undefined;
    }

    async getCafeBySlug(slug: string): Promise<Cafe | undefined> {
        const doc = await CafeModel.findOne({ slug });
        return doc ? this.toCafe(doc) : undefined;
    }

    async getCafeByOwnerId(ownerId: number): Promise<Cafe | undefined> {
        const doc = await CafeModel.findOne({ ownerId });
        return doc ? this.toCafe(doc) : undefined;
    }

    async getCafesByOwnerId(ownerId: number): Promise<Cafe[]> {
        const docs = await CafeModel.find({ ownerId });
        return docs.map(d => this.toCafe(d));
    }

    async createCafe(cafe: InsertCafe & { ownerId: number, slug: string, qrCodeUrl: string }): Promise<Cafe> {
        const id = await this.getNextId(CafeModel);
        const doc = await CafeModel.create({ ...(cafe as any), _id: id });
        return this.toCafe(doc);
    }

    async updateCafe(id: number, updates: Partial<Cafe>): Promise<Cafe> {
        const doc = await CafeModel.findByIdAndUpdate(id, updates, { new: true });
        if (!doc) throw new Error("Cafe not found");
        return this.toCafe(doc);
    }

    // Categories
    async getCategories(cafeId: number): Promise<Category[]> {
        const docs = await CategoryModel.find({ cafeId }).sort({ sortOrder: 1 });
        return docs.map(d => this.toCategory(d));
    }

    async createCategory(category: InsertCategory): Promise<Category> {
        const id = await this.getNextId(CategoryModel);
        const doc = await CategoryModel.create({ ...(category as any), _id: id });
        return this.toCategory(doc);
    }

    async deleteCategory(id: number): Promise<void> {
        await CategoryModel.deleteOne({ _id: id });
    }

    async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
        const doc = await CategoryModel.findByIdAndUpdate(id, updates, { new: true });
        if (!doc) throw new Error("Category not found");
        return this.toCategory(doc);
    }

    // Menu Items
    async getMenuItems(cafeId: number, categoryId?: number): Promise<MenuItem[]> {
        const query: any = { cafeId };
        if (categoryId) query.categoryId = categoryId;
        const docs = await MenuItemModel.find(query).sort({ sortOrder: 1 });
        return docs.map(d => this.toMenuItem(d));
    }

    async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
        const id = await this.getNextId(MenuItemModel);
        const doc = await MenuItemModel.create({ ...(item as any), _id: id });
        return this.toMenuItem(doc);
    }

    async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
        const doc = await MenuItemModel.findByIdAndUpdate(id, updates, { new: true });
        if (!doc) throw new Error("Item not found");
        return this.toMenuItem(doc);
    }

    async deleteMenuItem(id: number): Promise<void> {
        await MenuItemModel.deleteOne({ _id: id });
    }

    // Offers
    async getOffers(cafeId: number): Promise<Offer[]> {
        const docs = await OfferModel.find({ cafeId });
        return docs.map(d => this.toOffer(d));
    }

    async createOffer(offer: InsertOffer): Promise<Offer> {
        const id = await this.getNextId(OfferModel);
        const doc = await OfferModel.create({ ...(offer as any), _id: id });
        return this.toOffer(doc);
    }

    async deleteOffer(id: number): Promise<void> {
        await OfferModel.deleteOne({ _id: id });
    }

    async updateOffer(id: number, updates: Partial<InsertOffer>): Promise<Offer> {
        const doc = await OfferModel.findByIdAndUpdate(id, updates, { new: true });
        if (!doc) throw new Error("Offer not found");
        return this.toOffer(doc);
    }

    // Subscription
    async getSubscription(userId: number): Promise<Subscription | undefined> {
        const doc = await SubscriptionModel.findOne({ userId });
        return doc ? this.toSub(doc) : undefined;
    }

    async createSubscription(userId: number): Promise<Subscription> {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // 7 days trial

        const id = await this.getNextId(SubscriptionModel);
        const doc = await SubscriptionModel.create({
            _id: id,
            userId,
            planType: 'trial',
            status: 'trial',
            startDate: new Date(),
            endDate
        });
        return this.toSub(doc);
    }

    async updateSubscription(userId: number, updates: Partial<Subscription>): Promise<Subscription> {
        const doc = await SubscriptionModel.findOneAndUpdate({ userId }, updates, { new: true });
        if (!doc) throw new Error("Subscription not found");
        return this.toSub(doc);
    }

    // Promo Codes
    async getPromoCode(code: string): Promise<PromoCode | undefined> {
        const doc = await PromoCodeModel.findOne({ code });
        return doc ? this.toPromoCode(doc) : undefined;
    }

    async createPromoCode(insertPromo: InsertPromoCode): Promise<PromoCode> {
        const id = await this.getNextId(PromoCodeModel);
        const doc = await PromoCodeModel.create({ ...(insertPromo as any), _id: id });
        return this.toPromoCode(doc);
    }

    async updatePromoCode(id: number, updates: Partial<PromoCode>): Promise<PromoCode> {
        const doc = await PromoCodeModel.findByIdAndUpdate(id, updates, { new: true });
        if (!doc) throw new Error("Promo Code not found");
        return this.toPromoCode(doc);
    }

    // Tags - Mongo implementation stub
    async getTags(): Promise<Tag[]> {
        // Not implemented in Mongo yet
        return [];
    }

    async createTag(tag: InsertTag): Promise<Tag> {
        throw new Error("createTag not implemented in MongoStorage");
    }
}

export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private cafes: Map<number, Cafe>;
    private categories: Map<number, Category>;
    private menuItems: Map<number, MenuItem>;
    private offers: Map<number, Offer>;
    private tags: Map<number, Tag>;
    private subscriptions: Map<number, Subscription>;
    private promoCodes: Map<number, PromoCode>;
    currentUserId: number;
    currentCafeId: number;
    currentCategoryId: number;
    currentMenuItemId: number;
    currentOfferId: number;
    currentSubscriptionId: number;
    currentTagId: number;

    constructor() {
        this.users = new Map();
        this.cafes = new Map();
        this.categories = new Map();
        this.menuItems = new Map();
        this.offers = new Map();
        this.tags = new Map();
        this.subscriptions = new Map();
        this.currentUserId = 1;
        this.currentCafeId = 1;
        this.currentCategoryId = 1;
        this.currentMenuItemId = 1;
        this.currentOfferId = 1;
        this.currentSubscriptionId = 1;
        this.currentTagId = 1;
        this.promoCodes = new Map();
    }

    // User
    async getUser(id: number): Promise<User | undefined> {
        return this.users.get(id);
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        return Array.from(this.users.values()).find(
            (user) => user.username === username,
        );
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const id = this.currentUserId++;
        const user: User = {
            ...(insertUser as any),
            id,
            createdAt: new Date()
        };
        this.users.set(id, user);
        return user;
    }

    // Cafe
    async getCafe(id: number): Promise<Cafe | undefined> {
        return this.cafes.get(id);
    }

    async getCafeBySlug(slug: string): Promise<Cafe | undefined> {
        return Array.from(this.cafes.values()).find(
            (cafe) => cafe.slug === slug,
        );
    }

    async getCafeByOwnerId(ownerId: number): Promise<Cafe | undefined> {
        return Array.from(this.cafes.values()).find(
            (cafe) => cafe.ownerId === ownerId,
        );
    }

    async getCafesByOwnerId(ownerId: number): Promise<Cafe[]> {
        return Array.from(this.cafes.values()).filter(
            (cafe) => cafe.ownerId === ownerId,
        );
    }

    async createCafe(cafe: InsertCafe & { ownerId: number, slug: string, qrCodeUrl: string }): Promise<Cafe> {
        const id = this.currentCafeId++;
        const cafeData = cafe as any;
        const newCafe: Cafe = {
            ...cafeData,
            id,
            createdAt: new Date(),
            address: cafeData.address ?? null,
            logoUrl: cafeData.logoUrl ?? null,
            imageMenuUrls: (cafeData.imageMenuUrls as string[]) ?? null,
            theme: cafeData.theme ?? "standard",
            qrCodeUrl: cafeData.qrCodeUrl ?? null,
            menuType: cafeData.menuType ?? "digital"
        };
        this.cafes.set(id, newCafe);
        return newCafe;
    }

    async updateCafe(id: number, updates: Partial<Cafe>): Promise<Cafe> {
        const cafe = await this.getCafe(id);
        if (!cafe) throw new Error("Cafe not found");
        const updatedCafe = { ...cafe, ...updates };
        this.cafes.set(id, updatedCafe);
        return updatedCafe;
    }

    // Categories
    async getCategories(cafeId: number): Promise<Category[]> {
        return Array.from(this.categories.values())
            .filter((category) => category.cafeId === cafeId)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }

    async createCategory(category: InsertCategory): Promise<Category> {
        const id = this.currentCategoryId++;
        const categoryData = category as any;
        const newCategory: Category = {
            ...categoryData,
            id,
            sortOrder: categoryData.sortOrder ?? 0,
            isVisible: categoryData.isVisible ?? true
        };
        this.categories.set(id, newCategory);
        return newCategory;
    }

    async deleteCategory(id: number): Promise<void> {
        this.categories.delete(id);
    }

    async updateCategory(id: number, updates: Partial<Category>): Promise<Category> {
        const category = this.categories.get(id);
        if (!category) throw new Error("Category not found");
        const updatedCategory = { ...category, ...updates };
        this.categories.set(id, updatedCategory);
        return updatedCategory;
    }

    // Menu Items
    async getMenuItems(cafeId: number, categoryId?: number): Promise<MenuItem[]> {
        return Array.from(this.menuItems.values())
            .filter((item) => item.cafeId === cafeId && (!categoryId || item.categoryId === categoryId))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }

    async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
        const id = this.currentMenuItemId++;
        const itemData = item as any;
        const newItem: MenuItem = {
            ...itemData,
            id,
            description: itemData.description ?? null,
            imageUrl: itemData.imageUrl ?? null,
            isAvailable: itemData.isAvailable ?? true,
            sortOrder: itemData.sortOrder ?? 0,
            badges: (itemData.badges as string[]) ?? []
        };
        this.menuItems.set(id, newItem);
        return newItem;
    }

    async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
        const item = await this.menuItems.get(id);
        if (!item) throw new Error("Item not found");
        const updatedItem = { ...item, ...updates };
        this.menuItems.set(id, updatedItem);
        return updatedItem;
    }

    async deleteMenuItem(id: number): Promise<void> {
        this.menuItems.delete(id);
    }

    // Offers
    async getOffers(cafeId: number): Promise<Offer[]> {
        return Array.from(this.offers.values()).filter(
            (offer) => offer.cafeId === cafeId,
        );
    }

    async createOffer(offer: InsertOffer): Promise<Offer> {
        const id = this.currentOfferId++;
        const offerData = offer as any;
        const newOffer: Offer = {
            ...offerData,
            id,
            createdAt: new Date(),
            description: offerData.description ?? null,
            imageUrl: offerData.imageUrl ?? null,
            offerType: offerData.offerType ?? "flat",
            appliedCategories: (offerData.appliedCategories as number[]) ?? [],
            appliedItems: (offerData.appliedItems as number[]) ?? [],
            startAt: offerData.startAt ?? null,
            endAt: offerData.endAt ?? null,
            isActive: offerData.isActive ?? true,
            isVisible: offerData.isVisible ?? true,
            isFeatured: offerData.isFeatured ?? false,
        };
        this.offers.set(id, newOffer);
        return newOffer;
    }

    async updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer> {
        const existing = this.offers.get(id);
        if (!existing) throw new Error("Offer not found");
        const updated: Offer = { ...existing, ...offer };
        this.offers.set(id, updated);
        return updated;
    }

    async deleteOffer(id: number): Promise<void> {
        this.offers.delete(id);
    }

    // Subscription
    async getSubscription(userId: number): Promise<Subscription | undefined> {
        return Array.from(this.subscriptions.values()).find(
            (sub) => sub.userId === userId,
        );
    }

    async createSubscription(userId: number): Promise<Subscription> {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7); // 7 days trial

        const id = this.currentSubscriptionId++;
        const sub: Subscription = {
            id,
            userId,
            status: 'trial',
            planType: 'trial',
            startDate: new Date(),
            endDate,
            razorpayPaymentId: null,
            razorpayOrderId: null,
            amount: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.subscriptions.set(id, sub);
        return sub;
    }

    async updateSubscription(userId: number, updates: Partial<Subscription>): Promise<Subscription> {
        const sub = await this.getSubscription(userId);
        if (!sub) throw new Error("Subscription not found");
        const updatedSub = { ...sub, ...updates };
        this.subscriptions.set(sub.id, updatedSub);
        return updatedSub;
    }

    // Promo Codes
    async getPromoCode(code: string): Promise<PromoCode | undefined> {
        return Array.from(this.promoCodes.values()).find(p => p.code === code);
    }

    async createPromoCode(insertPromo: InsertPromoCode): Promise<PromoCode> {
        const id = this.promoCodes.size + 1; // Simple ID
        const promoData = insertPromo as any;
        const promo: PromoCode = {
            ...promoData,
            id,
            currentUses: 0,
            createdAt: new Date(),
            expiresAt: promoData.expiresAt ?? null,
            maxUses: promoData.maxUses ?? null
        };
        this.promoCodes.set(id, promo);
        return promo;
    }

    async updatePromoCode(id: number, updates: Partial<PromoCode>): Promise<PromoCode> {
        const promo = this.promoCodes.get(id);
        if (!promo) throw new Error("Promo Code not found");
        const updatedPromo = { ...promo, ...updates };
        this.promoCodes.set(id, updatedPromo);
        return updatedPromo;
    }

    // Tags
    async getTags(): Promise<Tag[]> {
        return Array.from(this.tags.values());
    }

    async createTag(insertTag: InsertTag): Promise<Tag> {
        const id = this.currentTagId++;
        const tagData = insertTag as any;
        const tag: Tag = { ...tagData, id, cafeId: tagData.cafeId ?? null };
        this.tags.set(id, tag);
        return tag;
    }
}

export const storage = process.env.DATABASE_URL
    ? new DatabaseStorage()
    : (process.env.MONGODB_URI ? new MongoStorage() : new MemStorage());
