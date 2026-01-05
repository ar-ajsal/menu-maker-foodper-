"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Menu, Settings, LogOut, QrCode, Sparkles, Crown } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';

const SubscriptionWidget = () => {
    const { data: sub } = useSubscription();
    const router = useRouter();

    if (!sub) return null;

    const isPro = sub.status === 'active' && (sub.planType?.startsWith('pro') || sub.planType === 'pro');
    const isBasic = sub.status === 'active' && sub.planType?.startsWith('basic');

    return (
        <div className={`p-4 rounded-xl border ${isPro ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-700 text-white' : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'}`}>
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${isPro ? 'bg-amber-400 text-indigo-900' : 'bg-indigo-100 text-indigo-600'}`}>
                    {isPro ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <span className={`font-bold text-sm ${isPro ? 'text-white' : 'text-indigo-900'}`}>
                    {isPro ? 'Pro Plan' : isBasic ? 'Basic Plan' : 'Free Trial'}
                </span>
            </div>

            <p className={`text-xs mb-3 ${isPro ? 'text-indigo-200' : 'text-gray-500'}`}>
                {isPro ? 'You have access to all premium features.' : 'Upgrade to unlock premium themes & features.'}
            </p>

            {!isPro && (
                <Button
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    onClick={() => router.push('/subscription')}
                >
                    Upgrade Now
                </Button>
            )}
        </div>
    );
};

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Menu Management', href: '/dashboard?tab=menu', icon: Menu },
        { label: 'QR Code', href: '/dashboard?tab=qr', icon: QrCode },
        { label: 'Subscription', href: '/subscription', icon: Crown },
        { label: 'Settings', href: '/dashboard?tab=details', icon: Settings },
    ];

    const isActive = (item: any) => {
        if (item.href === '/dashboard' && !item.href.includes('?')) {
            const tab = searchParams.get('tab');
            return pathname === '/dashboard' && !tab;
        }

        if (item.href.includes('?')) {
            const itemPath = item.href.split('?')[0];
            const itemParams = new URLSearchParams(item.href.split('?')[1]);
            const tab = itemParams.get('tab');

            return pathname === itemPath && searchParams.get('tab') === tab;
        }

        return pathname === item.href;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-100 md:block hidden">
                <h1 className="text-xl font-bold text-gray-900">Menu Admin</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isActive(item)
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}>
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </div>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 mt-auto space-y-4">
                <SubscriptionWidget />
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
