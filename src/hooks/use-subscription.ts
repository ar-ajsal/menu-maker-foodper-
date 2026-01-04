
import { useQuery } from "@tanstack/react-query";

export function useSubscription() {
    return useQuery<any>({
        queryKey: ['/api/subscription/status'],
        queryFn: async () => {
            const res = await fetch('/api/subscription/status');
            if (!res.ok) throw new Error('Failed to fetch status');
            return res.json();
        }
    });
}
