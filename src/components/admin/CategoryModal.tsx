
"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertCategorySchema, type InsertCategory } from '@/lib/schema';

// Use shared schema if possible, or define here. 
// insertCategorySchema requires cafeId.
// We can use a partial schema for the form.

const formSchema = z.object({
    name: z.string().min(2).max(120),
    isVisible: z.boolean().default(true)
});

interface CategoryModalProps {
    open: boolean;
    onClose: () => void;
    initialData?: any;
    cafeId: number | string;
}

export const CategoryModal = ({ open, onClose, initialData, cafeId }: CategoryModalProps) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            isVisible: true
        }
    });

    useEffect(() => {
        if (open) {
            form.reset({
                name: initialData?.name || '',
                isVisible: initialData?.isVisible ?? true
            });
        }
    }, [open, initialData, form]);

    const mutation = useMutation({
        mutationFn: async (values: any) => {
            // Support both id and _id
            const id = initialData?.id || initialData?._id;
            const url = initialData ? `/api/categories/${id}` : '/api/categories';
            const method = initialData ? 'PATCH' : 'POST'; // Changed PUT to PATCH

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, cafeId })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to save category');
            }
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', cafeId] });
            toast({ title: initialData ? "Category updated" : "Category created" });
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Category' : 'New Category'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g. Starters" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="isVisible" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Active Status</FormLabel>
                                    <div className="text-xs text-muted-foreground">
                                        Visible in public menu
                                    </div>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Saving...' : 'Save Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
