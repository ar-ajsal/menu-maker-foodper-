import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import QRCode from "qrcode";
import { insertCafeSchema, insertCategorySchema, insertMenuItemSchema, insertOfferSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // === CAFE ROUTES ===

  app.post(api.cafes.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const input = insertCafeSchema.omit({ ownerId: true, slug: true, qrCodeUrl: true }).parse(req.body);
      const name = (input as any).name || "My Cafe";
      
      // Generate unique slug (simple version)
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
      
      // Generate QR Code URL
      // In a real app, this would point to the deployed URL. For now, localhost/replit URL.
      const publicUrl = `https://${req.get('host')}/menu/${slug}`;
      const qrCodeDataUrl = await QRCode.toDataURL(publicUrl);

      const cafe = await storage.createCafe({
        ...input,
        name: (input as any).name || "My Cafe",
        ownerId: req.user.id,
        slug,
        qrCodeUrl: qrCodeDataUrl,
      });

      // Also create a subscription for the user
      await storage.createSubscription(req.user.id);

      res.status(201).json(cafe);
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json(error.errors);
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.cafes.getMine.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const cafe = await storage.getCafeByOwnerId(req.user.id);
    res.json(cafe ? [cafe] : []);
  });

  app.get(api.cafes.getBySlug.path, async (req, res) => {
    const cafe = await storage.getCafeBySlug(req.params.slug);
    if (!cafe) return res.status(404).json({ message: "Cafe not found" });

    const categories = await storage.getCategories(cafe.id);
    const items = await storage.getMenuItems(cafe.id);
    const offers = await storage.getOffers(cafe.id);

    // Group items by category
    const categoriesWithItems = categories.map(cat => ({
      ...cat,
      items: items.filter(item => item.categoryId === cat.id)
    }));

    // Add "Uncategorized" items if any? (Simplification: assuming all items have valid category)
    
    res.json({
      ...cafe,
      categories: categoriesWithItems,
      offers
    });
  });

  app.patch(api.cafes.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const cafe = await storage.getCafe(parseInt(req.params.id));
    if (!cafe || cafe.ownerId !== req.user.id) return res.sendStatus(403);

    const input = insertCafeSchema.partial().parse(req.body);
    const updated = await storage.updateCafe(cafe.id, input);
    res.json(updated);
  });

  // === CATEGORY ROUTES ===
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories(parseInt(req.params.cafeId));
    res.json(categories);
  });

  app.post(api.categories.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = insertCategorySchema.omit({ cafeId: true }).parse(req.body);
    const cafeId = parseInt(req.params.cafeId);
    
    // Verify ownership
    const cafe = await storage.getCafe(cafeId);
    if (!cafe || cafe.ownerId !== req.user.id) return res.sendStatus(403);

    const category = await storage.createCategory({ ...input, cafeId });
    res.status(201).json(category);
  });

  app.delete(api.categories.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteCategory(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // === MENU ITEM ROUTES ===
  app.get(api.menuItems.list.path, async (req, res) => {
    const items = await storage.getMenuItems(parseInt(req.params.cafeId));
    res.json(items);
  });

  app.post(api.menuItems.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = insertMenuItemSchema.omit({ cafeId: true }).parse(req.body);
    const cafeId = parseInt(req.params.cafeId);

    // Verify ownership
    const cafe = await storage.getCafe(cafeId);
    if (!cafe || cafe.ownerId !== req.user.id) return res.sendStatus(403);

    const item = await storage.createMenuItem({ ...input, cafeId });
    res.status(201).json(item);
  });

  app.patch(api.menuItems.update.path, async (req, res) => {
     if (!req.isAuthenticated()) return res.sendStatus(401);
     const input = insertMenuItemSchema.partial().parse(req.body);
     const updated = await storage.updateMenuItem(parseInt(req.params.id), input);
     res.json(updated);
  });

  app.delete(api.menuItems.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteMenuItem(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // === OFFERS ROUTES ===
  app.get(api.offers.list.path, async (req, res) => {
    const offers = await storage.getOffers(parseInt(req.params.cafeId));
    res.json(offers);
  });

  app.post(api.offers.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = insertOfferSchema.omit({ cafeId: true }).parse(req.body);
    const cafeId = parseInt(req.params.cafeId);

     // Verify ownership
    const cafe = await storage.getCafe(cafeId);
    if (!cafe || cafe.ownerId !== req.user.id) return res.sendStatus(403);

    const offer = await storage.createOffer({ ...input, cafeId });
    res.status(201).json(offer);
  });

  app.delete(api.offers.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteOffer(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // === SUBSCRIPTION ROUTES ===
  app.get(api.subscription.status.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sub = await storage.getSubscription(req.user.id);
    res.json(sub || { status: 'none' });
  });

  return httpServer;
}
