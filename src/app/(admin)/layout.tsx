"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Menu, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AdminSidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const { data: sub } = useSubscription();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Sidebar - Fixed Position for robustness */}
            <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-50 shadow-sm">
                <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading menu...</div>}>
                    <AdminSidebar />
                </Suspense>
            </aside>

            {/* Main Content - margins to account for fixed sidebar */}
            <main className="md:ml-64 min-h-screen flex flex-col">
                <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center gap-4 sticky top-0 z-40">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 bg-white z-[60]">
                            <div className="p-6 border-b border-gray-100">
                                <h1 className="text-xl font-bold text-gray-900">Menu Admin</h1>
                            </div>
                            <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading menu...</div>}>
                                <AdminSidebar onClose={() => setOpen(false)} />
                            </Suspense>
                        </SheetContent>
                    </Sheet>
                    <h1 className="text-lg font-bold">Menu Admin</h1>
                </header>

                {/* Trial Banner */}
                {sub?.status === 'trial' && (
                    <div className="bg-indigo-600 text-white px-4 py-2 text-center text-sm font-medium sticky top-0 md:top-0 z-30 shadow-md">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>
                                Free Trial Active: <span className="font-bold text-amber-300">{sub.daysRemaining} days remaining</span>.
                                <Link href="/subscription" className="underline hover:text-indigo-100 ml-1">Upgrade now to keep premium features.</Link>
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
