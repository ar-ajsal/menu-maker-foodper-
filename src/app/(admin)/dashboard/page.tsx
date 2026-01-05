
"use client";

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMyCafes, useCreateCafe, useUpdateCafe } from '@/hooks/use-cafes';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Store, Upload, QrCode, ExternalLink, RefreshCw, Crown } from 'lucide-react';
import { CreateCafeDialog } from '@/components/CreateCafeDialog';
import { MenuManagement } from '@/components/MenuManagement';
import { OfferManagement } from '@/components/OfferManagement';
import { QRPosterDialog } from '@/components/QRPosterDialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { QRCodeSVG } from 'qrcode.react';

function DashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'menu';

    // ... existing hooks ...
    const { data: cafes, isLoading: cafesLoading } = useMyCafes();
    const { data: subscription, isLoading: subLoading } = useSubscription();
    const createCafe = useCreateCafe();
    const updateCafe = useUpdateCafe();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);

    // Initial Selection Effect
    React.useEffect(() => {
        if (!selectedCafeId && cafes?.length > 0) {
            setSelectedCafeId(String(cafes[0].id || cafes[0]._id));
        }
    }, [cafes, selectedCafeId]);

    const activeCafe = cafes?.find((c: any) => String(c.id || c._id) === selectedCafeId) || null;

    const handleUpdateCafe = (updates: any) => {
        if (!activeCafe) return;
        updateCafe.mutate({ id: String(activeCafe.id || activeCafe._id), ...updates });
    };

    const handleTabChange = (value: string) => {
        router.push(`/dashboard?tab=${value}`);
    };

    if (cafesLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    }

    if (!cafes || cafes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-6 text-center">
                <div className="bg-indigo-50 p-6 rounded-full">
                    <Store className="w-16 h-16 text-indigo-600" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome to Menu Maker</h1>
                    <p className="text-gray-500">Get started by creating your first cafe or restaurant.</p>
                </div>
                <CreateCafeDialog trigger={<Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">Create My First Cafe</Button>} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Top Bar: Cafe Selector and Quick Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <Store className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Cafe</Label>
                        <Select value={selectedCafeId || ''} onValueChange={setSelectedCafeId}>
                            <SelectTrigger className="w-[240px] border-none bg-transparent p-0 h-auto font-bold text-xl shadow-none focus:ring-0">
                                <SelectValue placeholder="Select Cafe" />
                            </SelectTrigger>
                            <SelectContent>
                                {cafes.map((cafe: any) => (
                                    <SelectItem key={cafe.id || cafe._id} value={String(cafe.id || cafe._id)} className="font-medium">
                                        {cafe.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <CreateCafeDialog trigger={<Button variant="outline"><PlusIcon className="w-4 h-4 mr-2" /> New Cafe</Button>} />
                    {activeCafe && (
                        <Button variant="default" className="bg-indigo-600" onClick={() => window.open(`/menu/${activeCafe.slug}`, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" /> View Menu
                        </Button>
                    )}
                </div>
            </div>

            {activeCafe && (
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-6">
                        <TabsTrigger value="menu">Menu</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="offers">Offers</TabsTrigger>
                        <TabsTrigger value="qr">QR Code</TabsTrigger>
                    </TabsList>

                    {/* MENU TAB */}
                    <TabsContent value="menu" className="space-y-6 animate-in fade-in-50 duration-500">
                        <MenuManagement cafeId={activeCafe.id || activeCafe._id} cafe={activeCafe} />
                    </TabsContent>

                    {/* DETAILS TAB */}
                    <TabsContent value="details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cafe Information</CardTitle>
                                    <CardDescription>Update your basic business details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Cafe Name</Label>
                                        <Input defaultValue={activeCafe.name} onChange={(e) => handleUpdateCafe({ name: e.target.value })} onBlur={(e) => handleUpdateCafe({ name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Slug (URL Path)</Label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 flex items-center px-3 rounded-md border text-gray-500 text-sm bg-gray-50">
                                                menu-maker.com/menu/
                                                <span className="text-gray-900 font-medium ml-1">{activeCafe.slug}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Address/Location</Label>
                                        <Textarea defaultValue={activeCafe.address || ''} onBlur={(e) => handleUpdateCafe({ address: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Logo</Label>
                                        <ImageUpload value={activeCafe.logoUrl || ''} onChange={(url) => handleUpdateCafe({ logoUrl: url })} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance & Settings</CardTitle>
                                    <CardDescription>Customize how your menu looks.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Theme</Label>
                                        <Select
                                            value={activeCafe.theme || 'standard'}
                                            onValueChange={(val) => handleUpdateCafe({ theme: val })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="standard">Standard Light</SelectItem>
                                                <SelectItem value="modern">Modern Dark</SelectItem>
                                                <SelectItem value="premium">Premium</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Menu Type</Label>
                                        <Select
                                            value={activeCafe.menuType || 'digital'}
                                            onValueChange={(val) => handleUpdateCafe({ menuType: val })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="digital">Digital (Interactive)</SelectItem>
                                                <SelectItem value="image">Image Based (Uploads)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* OFFERS TAB */}
                    <TabsContent value="offers">
                        <OfferManagement cafeId={String(activeCafe.id || activeCafe._id)} subscriptionPlan={subscription?.plan} />
                    </TabsContent>

                    {/* QR TAB */}
                    <TabsContent value="qr">
                        <Card>
                            <CardHeader>
                                <CardTitle>QR Code & Sharing</CardTitle>
                                <CardDescription>Get your cafe out there.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="bg-white p-4 rounded-xl border-4 border-black shadow-lg">
                                    <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${activeCafe.slug}`} size={200} />
                                </div>
                                <div className="space-y-4 flex-1">
                                    <h3 className="text-xl font-bold">Your Menu is Live!</h3>
                                    <p className="text-gray-600">Scan this code to instantly access your digital menu. Print it and place it on tables.</p>
                                    <div className="flex gap-3">
                                        <QRPosterDialog cafe={activeCafe} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}

export default function DashboardPage() {
    return (
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
            <DashboardContent />
        </React.Suspense>
    );
}
