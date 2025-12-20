import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCafeRequest, type UpdateCafeRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// === CAFES ===

export function useMyCafes() {
  return useQuery({
    queryKey: [api.cafes.getMine.path],
    queryFn: async () => {
      const res = await fetch(api.cafes.getMine.path);
      if (!res.ok) throw new Error("Failed to fetch cafes");
      return api.cafes.getMine.responses[200].parse(await res.json());
    },
  });
}

export function useCafeBySlug(slug: string) {
  return useQuery({
    queryKey: [api.cafes.getBySlug.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.cafes.getBySlug.path, { slug });
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch cafe");
      }
      return api.cafes.getBySlug.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

export function useCreateCafe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCafeRequest) => {
      // Omit fields that shouldn't be sent if the type requires it, 
      // but api input schema already handles omitting ownerId/slug
      const res = await fetch(api.cafes.create.path, {
        method: api.cafes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create cafe");
      return api.cafes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cafes.getMine.path] });
      toast({ title: "Success", description: "Cafe created successfully" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateCafe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateCafeRequest) => {
      const url = buildUrl(api.cafes.update.path, { id });
      const res = await fetch(url, {
        method: api.cafes.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update cafe");
      return api.cafes.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.cafes.getMine.path] });
      queryClient.invalidateQueries({ queryKey: [api.cafes.getBySlug.path, data.slug] });
      toast({ title: "Success", description: "Cafe settings updated" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
