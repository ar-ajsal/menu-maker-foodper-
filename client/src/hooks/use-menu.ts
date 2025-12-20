import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  api, 
  buildUrl, 
  type InsertCategory, 
  type InsertMenuItem,
  type InsertOffer
} from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// === CATEGORIES ===

export function useCategories(cafeId: number) {
  return useQuery({
    queryKey: [api.categories.list.path, cafeId],
    queryFn: async () => {
      const url = buildUrl(api.categories.list.path, { cafeId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return api.categories.list.responses[200].parse(await res.json());
    },
    enabled: !!cafeId,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ cafeId, ...data }: { cafeId: number } & Omit<InsertCategory, "cafeId">) => {
      const url = buildUrl(api.categories.create.path, { cafeId });
      const res = await fetch(url, {
        method: api.categories.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return api.categories.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path, variables.cafeId] });
      toast({ title: "Category added" });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, cafeId }: { id: number, cafeId: number }) => {
      const url = buildUrl(api.categories.delete.path, { id });
      const res = await fetch(url, { method: api.categories.delete.method });
      if (!res.ok) throw new Error("Failed to delete category");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.categories.list.path, variables.cafeId] });
      toast({ title: "Category deleted" });
    },
  });
}

// === ITEMS ===

export function useItems(cafeId: number) {
  return useQuery({
    queryKey: [api.menuItems.list.path, cafeId],
    queryFn: async () => {
      const url = buildUrl(api.menuItems.list.path, { cafeId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch items");
      return api.menuItems.list.responses[200].parse(await res.json());
    },
    enabled: !!cafeId,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ cafeId, ...data }: { cafeId: number } & Omit<InsertMenuItem, "cafeId">) => {
      const url = buildUrl(api.menuItems.create.path, { cafeId });
      // Ensure numeric coercion
      const payload = {
        ...data,
        price: Number(data.price),
        categoryId: Number(data.categoryId),
      };
      
      const res = await fetch(url, {
        method: api.menuItems.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create item");
      return api.menuItems.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.menuItems.list.path, variables.cafeId] });
      toast({ title: "Item added" });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, cafeId }: { id: number, cafeId: number }) => {
      const url = buildUrl(api.menuItems.delete.path, { id });
      const res = await fetch(url, { method: api.menuItems.delete.method });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.menuItems.list.path, variables.cafeId] });
      toast({ title: "Item deleted" });
    },
  });
}

// === OFFERS ===

export function useOffers(cafeId: number) {
  return useQuery({
    queryKey: [api.offers.list.path, cafeId],
    queryFn: async () => {
      const url = buildUrl(api.offers.list.path, { cafeId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch offers");
      return api.offers.list.responses[200].parse(await res.json());
    },
    enabled: !!cafeId,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ cafeId, ...data }: { cafeId: number } & Omit<InsertOffer, "cafeId">) => {
      const url = buildUrl(api.offers.create.path, { cafeId });
      const res = await fetch(url, {
        method: api.offers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create offer");
      return api.offers.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.offers.list.path, variables.cafeId] });
      toast({ title: "Offer added" });
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, cafeId }: { id: number, cafeId: number }) => {
      const url = buildUrl(api.offers.delete.path, { id });
      const res = await fetch(url, { method: api.offers.delete.method });
      if (!res.ok) throw new Error("Failed to delete offer");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.offers.list.path, variables.cafeId] });
      toast({ title: "Offer deleted" });
    },
  });
}
