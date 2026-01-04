
"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, GripVertical, Settings2, Trash2 } from 'lucide-react';
import { ItemCard } from './ItemCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const useItems = (categoryId: string, cafeId: number) => {
    return useQuery({
        queryKey: ['items', categoryId, cafeId],
        queryFn: async () => {
            // Updated API call to use query params
            const res = await fetch(`/api/menu-items?cafeId=${cafeId}&categoryId=${categoryId}`);
            // My API returns array directly
            const data = await res.json();
            return Array.isArray(data) ? data : (data.data || []);
        },
        enabled: !!categoryId && !!cafeId
    });
};

export const CategoryList = ({ category, onEditCategory, onAddItem, onEditItem, cafeId }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: items = [], isLoading } = useItems(category.id, cafeId); // category.id (Postgres/Next) vs _id
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Use string/number compatible ID
    const catId = category.id || category._id;

    const toggleItemActive = useMutation({
        mutationFn: async (item: any) => {
            const itemId = item.id || item._id;
            const res = await fetch(`/api/menu-items/${itemId}`, {
                method: 'PATCH', // Changed to PATCH
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !item.isAvailable }) // isAvailable instead of isActive? DB schema says isAvailable
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items', catId, cafeId] });
        }
    });

    const deleteItem = useMutation({
        mutationFn: async (itemId: string) => {
            const res = await fetch(`/api/menu-items/${itemId}`, { method: 'DELETE' });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items', catId, cafeId] });
            toast({ title: "Item deleted" });
        }
    });

    const toggleCategoryActive = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/categories/${catId}`, {
                method: 'PATCH', // Changed to PATCH
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVisible: !category.isVisible }) // isVisible instead of isActive? DB schema says isVisible
            });
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories', cafeId] });
            toast({ title: `Category ${data.isVisible ? 'enabled' : 'disabled'}` });
        }
    });

    const deleteCategory = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/categories/${catId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error("Failed to delete");
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', cafeId] });
            toast({ title: "Category deleted" });
        },
        onError: () => {
            toast({ title: "Failed to delete category", variant: "destructive" });
        }
    });


    return (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm mb-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                {/* Category Header */}
                <div className="flex items-center gap-3 p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />

                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 w-8 h-8 hover:bg-gray-200/50">
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                    </CollapsibleTrigger>

                    <div className="flex-1 flex items-center gap-3">
                        <h3 className="font-semibold text-lg text-gray-800">{category.name}</h3>
                        <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                            {items.length || 0} items
                        </Badge>
                        {!category.isVisible && <Badge variant="destructive" className="text-xs">Hidden</Badge>}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-xs uppercase font-bold text-gray-400">Active</span>
                            <Switch
                                checked={category.isVisible}
                                onCheckedChange={() => toggleCategoryActive.mutate()}
                            />
                        </div>

                        <Button variant="outline" size="sm" className="gap-2" onClick={(e) => { e.stopPropagation(); onAddItem(catId); }}>
                            <Plus className="w-4 h-4" />
                            Add Item
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => onEditCategory(category)}>
                            <Settings2 className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-red-500 hover:bg-red-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Delete this category and all its items?")) {
                                    deleteCategory.mutate();
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Items List */}
                <CollapsibleContent>
                    <div className="p-4 bg-gray-50/30 space-y-3 pl-12 border-t border-gray-100">
                        {isLoading ? (
                            <div className="text-center py-4 text-sm text-gray-400">Loading items...</div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                                No items yet. Click "Add Item" to start.
                            </div>
                        ) : (
                            items.map((item: any) => (
                                <ItemCard
                                    key={item.id || item._id}
                                    item={{
                                        ...item,
                                        isActive: item.isAvailable // Map isAvailable to isActive for ItemCard
                                    }}
                                    onEdit={onEditItem}
                                    onDelete={(id) => {
                                        if (confirm('Are you sure you want to delete this item?')) {
                                            deleteItem.mutate(id);
                                        }
                                    }}
                                    onToggleActive={(item) => toggleItemActive.mutate(item)} // This passes item back to mutation
                                />
                            ))
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};
