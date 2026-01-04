
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type InsertCafe } from "@/lib/schema";
import { useToast } from "@/hooks/use-toast";

export function useMyCafes() {
    return useQuery({
        queryKey: ["/api/cafes"],
        queryFn: async () => {
            const res = await fetch("/api/cafes");
            if (!res.ok) throw new Error("Failed to fetch cafes");
            // Returns Cafe[]
            return await res.json();
        },
    });
}

export function useCafeBySlug(slug: string) {
    // Wait, the dashboard might use it. 
    // Actually dashboard uses `useMyCafes`.
    // `PublicMenu` uses `useCafeBySlug`.
    // We will likely implement a public API or just use Server Actions / Server Components for public menu.
    return useQuery({
        queryKey: ["/api/cafes", slug],
        enabled: false, // Disable for now until public API is ready or needed
        queryFn: async () => null
    });
}

export function useCreateCafe() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: Partial<InsertCafe>) => {
            const res = await fetch("/api/cafes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to create cafe");
            }
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/cafes"] });
            toast({ title: "Success", description: "Cafe created successfully" });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });
}

export function useUpdateCafe() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: number | string } & Partial<InsertCafe>) => {
            // Need to implement PATCH /api/cafes/[id] or similar.
            // Or just use POST to update?
            // Let's assume we will create /api/cafes/[id]/route.ts
            // But for now, let's see. I haven't implemented update yet.
            // Wait, I only implemented GET and POST in api/cafes.
            // I need api/cafes/[id].
            const res = await fetch(`/api/cafes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to update cafe");
            }
            return await res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/cafes"] });
            toast({ title: "Success", description: "Cafe settings updated" });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });
}
