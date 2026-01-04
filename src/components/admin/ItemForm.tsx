
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { ImageUpload } from './ImageUpload';
import { VariantEditor } from './VariantEditor';
import { TagManager } from './TagManager';

const itemSchema = z.object({
    name: z.string().min(2).max(120),
    description: z.string().max(1000).optional().or(z.literal('')),
    price: z.number().min(0),
    categoryId: z.union([z.string(), z.number()]),
    foodType: z.enum(['vegetarian', 'non_vegetarian', 'other']),
    imageUrl: z.string().optional().or(z.literal('')),
    tags: z.array(z.string()).default([]),
    variants: z.array(z.any()).default([]),
    isAvailable: z.boolean().default(true) // Added field
});

interface ItemFormProps {
    open: boolean;
    onClose: () => void;
    initialData?: any; // If editing
    categories: any[];
    defaultCategoryId?: string;
    cafeId: number | string;
}

export const ItemForm = ({ open, onClose, initialData, categories, defaultCategoryId, cafeId }: ItemFormProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            categoryId: defaultCategoryId || '',
            foodType: 'other',
            imageUrl: '',
            tags: [],
            variants: [],
            isAvailable: true
        }
    });

    // ... (keep middle lines about useEffect)

    {/* VARIANTS TAB */ }
    <TabsContent value="variants" className="pt-4">
        <FormField control={form.control} name="variants" render={({ field }) => (
            <VariantEditor variants={field.value || []} onChange={field.onChange} />
        )} />
    </TabsContent>

    {/* TAGS TAB */ }
    <TabsContent value="tags" className="pt-4">
        <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem>
                <FormLabel>Tags (Dietary, Allergen, etc.)</FormLabel>
                <FormControl>
                    <TagManager selectedTags={field.value || []} onChange={field.onChange} />
                </FormControl>
            </FormItem>
        )} />
    </TabsContent>

    // Reset form when initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    ...initialData,
                    price: parseFloat(initialData.price) || 0,
                    categoryId: String(initialData.categoryId || defaultCategoryId || ''),
                    isAvailable: initialData.isAvailable ?? true
                });
            } else {
                form.reset({
                    name: '',
                    description: '',
                    price: 0,
                    categoryId: String(defaultCategoryId || categories[0]?.id || categories[0]?._id || ''),
                    foodType: 'other',
                    imageUrl: '',
                    tags: [],
                    variants: [],
                    isAvailable: true
                });
            }
        }
    }, [open, initialData, defaultCategoryId, categories, form]);

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            // Support both id and _id
            const id = initialData?.id || initialData?._id;
            const url = initialData ? `/api/menu-items/${id}` : '/api/menu-items';
            const method = initialData ? 'PATCH' : 'POST';

            // Ensure categoryId matches DB expectations (string for Mongo, number for Postgres)
            // But strict typing in schema might want number.
            // Let's pass what the input provides, or convert based on what we know contextually?
            // Actually, we should just let the backend validation/coercion handle it or store as is.
            // Since we updated storage to handle both, we should likely send as string if that's what we have, or number if possible.
            // If we use Mongo, IDs are strings. If Postgres, IDs are numbers.
            // The safest bet for now is to try parsing to int if it looks like a number, else keep string.
            const catIdRaw = values.categoryId;
            const catId = !isNaN(Number(catIdRaw)) ? Number(catIdRaw) : catIdRaw;

            const payload = {
                ...values,
                cafeId,
                categoryId: catId
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to save item');
            }
            return await res.json();
        },
        onSuccess: () => {
            // queryKey matches CategoryList's useItems key partial
            // CategoryList uses ['items', categoryId, cafeId]
            // We should just invalidate all items for this cafe to be safe/simple
            // But React Query fuzzy matching works on array prefix
            // Wait, CategoryList key is ['items', filteredCatId, cafeId]
            // So ['items'] should invalidate all.
            queryClient.invalidateQueries({ queryKey: ['items'] });
            toast({ title: initialData ? "Item updated" : "Item created" });
            onClose();
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const onSubmit = (values: any) => {
        mutation.mutate(values);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="details">Details & Price</TabsTrigger>
                                <TabsTrigger value="variants">Variants</TabsTrigger>
                                <TabsTrigger value="tags">Tags & Meta</TabsTrigger>
                            </TabsList>

                            {/* DETAILS TAB */}
                            <TabsContent value="details" className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Item Name</FormLabel>
                                                <FormControl><Input {...field} placeholder="e.g. Classic Burger" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="description" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl><Textarea {...field} placeholder="Ingredients, taste..." className="resize-none" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField control={form.control} name="price" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Base Price (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <FormField control={form.control} name="foodType" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Food Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                                            <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                                                            <SelectItem value="other">Other/Drinks</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={form.control} name="categoryId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((cat: any) => (
                                                            <SelectItem key={cat.id || cat._id} value={String(cat.id || cat._id)}>{cat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="space-y-4">
                                        {/* Image Upload */}
                                        <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Item Image</FormLabel>
                                                <FormControl>
                                                    <ImageUpload value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* VARIANTS TAB */}
                            {/* VARIANTS TAB */}
                            <TabsContent value="variants" className="pt-4">
                                <FormField control={form.control} name="variants" render={({ field }) => (
                                    <VariantEditor variants={field.value || []} onChange={field.onChange} />
                                )} />
                            </TabsContent>

                            {/* TAGS TAB */}
                            <TabsContent value="tags" className="pt-4">
                                <FormField control={form.control} name="tags" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags (Dietary, Allergen, etc.)</FormLabel>
                                        <FormControl>
                                            <TagManager selectedTags={field.value || []} onChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Saving...' : 'Save Item'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
