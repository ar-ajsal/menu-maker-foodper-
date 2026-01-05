
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Tag, Percent, IndianRupee } from "lucide-react";
import { OfferDialog } from "./OfferDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OfferManagementProps {
    cafeId: number | string;
    subscriptionPlan?: string;
}

export function OfferManagement({ cafeId, subscriptionPlan }: OfferManagementProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // const isPro = subscriptionPlan === 'pro'; // simplified logic for now

    const { data: offers = [], isLoading } = useQuery({
        queryKey: ['offers', cafeId],
        queryFn: async () => {
            const res = await fetch(`/api/offers?cafeId=${cafeId}`);
            if (!res.ok) throw new Error('Failed to fetch offers');
            const data = await res.json();
            return Array.isArray(data) ? data : (data.data || []);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/offers/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(await res.text());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers', cafeId] });
            toast({ title: "Deleted", description: "Offer removed successfully" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Special Offers</h2>
                    <p className="text-sm text-gray-500">Create highlighted deals to attract more customers.</p>
                </div>

                <OfferDialog
                    cafeId={Number(cafeId)}
                    trigger={
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Offer
                        </Button>
                    }
                />
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading offers...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {offers.map((offer: any) => (
                        <Card key={offer.id || offer._id} className="relative overflow-hidden group">
                            {/* Actions overlay */}
                            <div className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/80 backdrop-blur-sm rounded-md border z-10">
                                <OfferDialog
                                    cafeId={Number(cafeId)}
                                    initialData={offer}
                                    trigger={
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                        </Button>
                                    }
                                />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Offer?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove "{offer.title}" from your menu.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteMutation.mutate(offer.id || offer._id)} className="bg-red-600 hover:bg-red-700">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2">
                                        {offer.isFeatured && <Badge variant="default" className="bg-yellow-500">Featured</Badge>}
                                        <Badge variant={offer.isActive ? "default" : "secondary"}>{offer.isActive ? "Active" : "Inactive"}</Badge>
                                    </div>
                                    <Badge variant="outline" className="flex gap-1 items-center font-bold">
                                        {offer.discountType === 'percent' ? <Percent className="w-3 h-3" /> : <IndianRupee className="w-3 h-3" />}
                                        {offer.discountValue}{offer.discountType === 'percent' ? '%' : ''}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg">{offer.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{offer.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-xs text-muted-foreground">
                                    {offer.offerType === 'flat' ? "All Items" : `${offer.offerType} specific`}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {offers.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 mb-4">No offers created yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
