
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect, type Option } from "@/components/ui/multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    offerType: z.enum(["category", "item", "flat"]),
    discountType: z.enum(["percent", "flat"]),
    discountValue: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1, "Value must be positive")),
    appliedCategories: z.array(z.string()).default([]),
    appliedItems: z.array(z.string()).default([]),
    startAt: z.date().optional(),
    endAt: z.date().optional(),
    isActive: z.boolean().default(true),
    isVisible: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    cafeId: z.number(),
}).refine((data) => {
    if (data.offerType === 'category' && data.appliedCategories.length === 0) return false;
    if (data.offerType === 'item' && data.appliedItems.length === 0) return false;
    return true;
}, {
    message: "You must select at least one category/item for this offer type",
    path: ["offerType"]
});

type FormValues = z.infer<typeof formSchema>;

interface OfferDialogProps {
    cafeId: number;
    trigger?: React.ReactNode;
    initialData?: any;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function OfferDialog({ cafeId, trigger, initialData, open: controlledOpen, onOpenChange: setControlledOpen }: OfferDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [categories, setCategories] = useState<Option[]>([]);
    const [items, setItems] = useState<Option[]>([]);

    useEffect(() => {
        if (open && cafeId) {
            fetch(`/api/categories?cafeId=${cafeId}`)
                .then(res => res.json())
                .then(data => {
                    const list = Array.isArray(data) ? data : (data.data || []);
                    setCategories(list.map((c: any) => ({ label: c.name, value: String(c.id || c._id) })));
                });

            fetch(`/api/menu-items?cafeId=${cafeId}`)
                .then(res => res.json())
                .then(data => {
                    const list = Array.isArray(data) ? data : (data.data || []);
                    setItems(list.map((i: any) => ({ label: i.name, value: String(i.id || i._id) })));
                });
        }
    }, [open, cafeId]);

    // Construct default values without duplication
    const defaultValues: Partial<FormValues> = {
        title: initialData?.title || "",
        description: initialData?.description || "",
        imageUrl: initialData?.imageUrl || "",
        offerType: initialData?.offerType || "flat",
        discountType: initialData?.discountType || "percent",
        discountValue: initialData?.discountValue?.toString() || "0",
        appliedCategories: initialData?.appliedCategories?.map(String) || [],
        appliedItems: initialData?.appliedItems?.map(String) || [],
        startAt: initialData?.startAt ? new Date(initialData.startAt) : undefined,
        endAt: initialData?.endAt ? new Date(initialData.endAt) : undefined,
        isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
        isVisible: initialData?.isVisible !== undefined ? initialData.isVisible : true,
        isFeatured: initialData?.isFeatured !== undefined ? initialData.isFeatured : false,
        cafeId: cafeId,
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues as FormValues,
    });

    const offerType = form.watch("offerType");

    useEffect(() => {
        if (open) {
            form.reset(defaultValues as FormValues);
        }
    }, [open, initialData, cafeId]); // Removed form from deps to avoid loop if form object changes

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const payload = {
                ...values,
                appliedCategories: values.appliedCategories.map(Number),
                appliedItems: values.appliedItems.map(Number),
            };

            const id = initialData?.id || initialData?._id;

            const url = id
                ? `/api/offers/${id}`
                : `/api/offers`;

            const method = id ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers', cafeId] });
            setOpen(false);
            toast({ title: "Success", description: `Offer ${initialData ? 'updated' : 'created'} successfully` });
            form.reset();
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        },
    });

    function onSubmit(values: FormValues) {
        mutation.mutate(values);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Offer" : "Create New Offer"}</DialogTitle>
                    <DialogDescription>Configure your offer details.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">Basic Info</h3>
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="isActive" render={({ field }) => (
                                    <FormItem className="flex items-center justify-between border p-3 rounded-lg"><FormLabel>Active</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="isFeatured" render={({ field }) => (
                                    <FormItem className="flex items-center justify-between border p-3 rounded-lg"><FormLabel>Featured</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                )} />
                            </div>
                        </div>

                        {/* Rules */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">Rules</h3>
                            <FormField control={form.control} name="offerType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="flat" /></FormControl><FormLabel>Flat</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="category" /></FormControl><FormLabel>Category</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="item" /></FormControl><FormLabel>Item</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {offerType === 'category' && (
                                <FormField control={form.control} name="appliedCategories" render={({ field }) => (
                                    <FormItem><FormLabel>Categories</FormLabel><FormControl><MultiSelect selected={field.value} options={categories} onChange={field.onChange} placeholder="Select categories" /></FormControl><FormMessage /></FormItem>
                                )} />
                            )}
                            {offerType === 'item' && (
                                <FormField control={form.control} name="appliedItems" render={({ field }) => (
                                    <FormItem><FormLabel>Items</FormLabel><FormControl><MultiSelect selected={field.value} options={items} onChange={field.onChange} placeholder="Select items" /></FormControl><FormMessage /></FormItem>
                                )} />
                            )}

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <FormField control={form.control} name="discountType" render={({ field }) => (
                                    <FormItem><FormLabel>Discount Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="percent">Percentage %</SelectItem><SelectItem value="flat">Flat Amount ₹</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="discountValue" render={({ field }) => (
                                    <FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        {/* Validity */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="startAt" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                                    </Popover>
                                    <FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="endAt" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>End Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>No Expiry</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent>
                                    </Popover>
                                    <FormMessage /></FormItem>
                            )} />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="button" variant="outline" className="mr-2" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save Offer"}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
