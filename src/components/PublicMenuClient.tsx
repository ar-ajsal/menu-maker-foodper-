"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Info, Image as ImageIcon, Search, X, Star, Utensils, Leaf, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PublicMenuItem } from "@/components/PublicMenuItem";
import { useState, useMemo, useEffect, useRef } from "react";

interface PublicMenuClientProps {
    cafe: any;
    categories: any[];
    offers?: any[];
}

export default function PublicMenuClient({ cafe, categories, offers = [] }: PublicMenuClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Refs for scroll spy
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const navRef = useRef<HTMLDivElement>(null);

    // Sort categories
    const sortedCategories = useMemo(() => {
        return [...categories]
            .filter((c: any) => c.isVisible !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }, [categories]);

    // Initialize active category
    useEffect(() => {
        if (!activeCategory && sortedCategories.length > 0) {
            setActiveCategory(sortedCategories[0].id.toString());
        }
    }, [activeCategory, sortedCategories]);

    // Scroll Spy Logic
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150; // Offset for header/nav

            for (const cat of sortedCategories) {
                const element = categoryRefs.current[cat.id];
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveCategory(cat.id.toString());
                        // Scroll nav to active item
                        const navItem = document.getElementById(`nav-${cat.id}`);
                        if (navItem && navRef.current) {
                            navRef.current.scrollTo({
                                left: navItem.offsetLeft - navRef.current.offsetWidth / 2 + navItem.offsetWidth / 2,
                                behavior: 'smooth'
                            });
                        }
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sortedCategories]);

    const scrollToCategory = (catId: string) => {
        const element = categoryRefs.current[catId];
        if (element) {
            const navHeight = 120; // Approx sticky header height
            const y = element.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveCategory(catId);
        }
    };

    // Filter Logic (Returns matching Items grouped by Category)
    const filteredMenu = useMemo(() => {
        return sortedCategories.map(cat => {
            let items = cat.items || [];

            // Search filter
            if (searchQuery.trim()) {
                items = items.filter((item: any) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Diet filter
            if (dietFilter !== 'all') {
                items = items.filter((item: any) => {
                    const badges = item.badges || [];
                    if (dietFilter === 'veg') {
                        return badges.some((b: string) => b.toLowerCase().includes('veg') && !b.toLowerCase().includes('non'));
                    } else {
                        return badges.some((b: string) => b.toLowerCase().includes('non-veg') || b.toLowerCase().includes('nonveg'));
                    }
                });
            }

            return { ...cat, items };
        }).filter(cat => cat.items.length > 0); // Hide empty categories
    }, [sortedCategories, searchQuery, dietFilter]);

    // Theme Logic
    const theme = cafe.theme || 'standard';
    const themeClasses: Record<string, string> = {
        standard: "bg-gradient-to-br from-slate-50 via-white to-slate-50 text-foreground",
        modern: "bg-zinc-950 text-zinc-50",
        premium: "bg-[#0a0a0a] text-amber-50/90 font-serif"
    };
    const rootClass = themeClasses[theme] || themeClasses.standard;

    // Active Offers Logic
    const activeOffers = useMemo(() => {
        if (!offers) return [];
        return offers.filter(o => o.active !== false && o.isVisible !== false);
    }, [offers]);

    const getBestOffer = (item: any) => {
        if (!activeOffers.length) return null;
        // Match by Item ID or Category ID. logic assumes IDs can be converted to numbers as per schema
        const itemId = Number(item.id);
        const catId = Number(item.categoryId);

        const validOffers = activeOffers.filter((o: any) => {
            const hasItem = o.appliedItems?.map(Number).includes(itemId);
            const hasCat = o.appliedCategories?.map(Number).includes(catId);
            // If offer has no specific scope, maybe it applies to all? Assuming strict scope for now.
            return hasItem || hasCat;
        });

        if (validOffers.length === 0) return null;
        // Sort by value (approximation, percent vs flat is hard to compare without price, but high value usually better)
        return validOffers.sort((a, b) => b.discountValue - a.discountValue)[0];
    };

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-500 ${rootClass}`}>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setPreviewImage(null)}
                    >
                        <button className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20">
                            <X className="w-6 h-6" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            src={previewImage}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subscription Banner */}
            {cafe.subscriptionStatus === 'expired' && (
                <div className="bg-red-600 text-white p-3 text-center font-bold sticky top-0 z-50 shadow-md">
                    Subscription expired. Please renew.
                </div>
            )}

            {/* Header */}
            <header className={`relative pt-8 pb-6 px-4 overflow-hidden ${theme === 'modern' ? 'bg-zinc-900 border-b border-zinc-800' : theme === 'premium' ? 'bg-[#151515] border-b border-amber-900/20' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-4 max-w-2xl mx-auto">
                    {cafe.logoUrl ? (
                        <img src={cafe.logoUrl} alt={cafe.name} className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white/10" />
                    ) : (
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${theme === 'premium' ? 'bg-amber-900/30 text-amber-500' : 'bg-indigo-100 text-indigo-600'}`}>
                            {cafe.name.substring(0, 1)}
                        </div>
                    )}
                    <div>
                        <h1 className={`text-2xl font-bold leading-tight ${theme === 'premium' ? 'font-serif text-amber-50' : ''}`}>{cafe.name}</h1>
                        {cafe.address && <p className="text-sm opacity-60 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {cafe.address}</p>}
                    </div>
                </div>
            </header>

            {/* Sticky Search & Nav Container */}
            <div className={`sticky top-0 z-40 shadow-sm transition-all ${theme === 'modern' ? 'bg-zinc-950/95 border-b border-zinc-800' : theme === 'premium' ? 'bg-black/95 border-b border-white/5' : 'bg-white/95 border-b border-gray-100'} backdrop-blur-md`}>
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                        <Input
                            type="text" placeholder="Search menu..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className={`pl-9 h-10 rounded-xl border-0 shadow-inner ${theme === 'modern' ? 'bg-zinc-900 text-zinc-100' : theme === 'premium' ? 'bg-white/5 text-amber-50 placeholder:text-white/20' : 'bg-gray-100'}`}
                        />
                        {/* Diet Filters (Inline with search for compactness) */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <button onClick={() => setDietFilter(prev => prev === 'veg' ? 'all' : 'veg')} className={`p-1.5 rounded-md transition-colors ${dietFilter === 'veg' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-green-600'}`}>
                                <Leaf className="w-4 h-4 fill-current" />
                            </button>
                            <button onClick={() => setDietFilter(prev => prev === 'nonveg' ? 'all' : 'nonveg')} className={`p-1.5 rounded-md transition-colors ${dietFilter === 'nonveg' ? 'bg-red-100 text-red-700' : 'text-gray-400 hover:text-red-600'}`}>
                                <Utensils className="w-4 h-4 fill-current" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Nav */}
                {cafe.menuType !== 'image' && sortedCategories.length > 0 && (
                    <div className="max-w-2xl mx-auto px-4 pb-2">
                        <div
                            ref={navRef}
                            className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full"
                        >
                            {sortedCategories.map((cat: any) => (
                                <button
                                    key={cat.id}
                                    id={`nav-${cat.id}`}
                                    onClick={() => scrollToCategory(cat.id.toString())}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id.toString()
                                            ? theme === 'premium'
                                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
                                                : 'bg-indigo-600 text-white shadow-md'
                                            : theme === 'premium'
                                                ? 'text-zinc-400 hover:text-amber-100'
                                                : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto pt-4 px-4 space-y-8">

                {/* Offers Carousel */}
                {activeOffers.length > 0 && !searchQuery && (
                    <section>
                        <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme === 'premium' ? 'text-amber-500' : ''}`}>
                            <Star className="w-5 h-5 fill-current" /> Today's Offers
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
                            {activeOffers.map((offer: any) => (
                                <div key={offer.id || offer._id} className={`snap-center shrink-0 w-[280px] p-4 rounded-xl relative overflow-hidden ${theme === 'premium' ? 'bg-gradient-to-br from-amber-900/40 to-black border border-amber-900/30' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'}`}>
                                    <div className="relative z-10">
                                        <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">{offer.discountType === 'percent' ? `${offer.discountValue}% OFF` : `FLAT ₹${offer.discountValue} OFF`}</div>
                                        <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                                        <p className="text-sm opacity-90 line-clamp-2">{offer.description}</p>
                                    </div>
                                    {/* Deco bubbles */}
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-lg" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Menu List */}
                {cafe.menuType === 'image' ? (
                    <div className="space-y-4">
                        {cafe.imageMenuUrls && cafe.imageMenuUrls.length > 0 ? (
                            cafe.imageMenuUrls.map((url: string, index: number) => (
                                <div key={index} className="rounded-xl overflow-hidden shadow-lg border border-border/50">
                                    <img
                                        src={url}
                                        alt={`Menu Page ${index + 1}`}
                                        className="w-full h-auto cursor-zoom-in"
                                        loading="lazy"
                                        onClick={() => setPreviewImage(url)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground p-8 rounded-xl border border-dashed">
                                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No menu images uploaded.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8 pb-12">
                        {filteredMenu.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <Search className="w-12 h-12 mx-auto mb-4" />
                                <p>No items found matching your filters.</p>
                            </div>
                        ) : (
                            filteredMenu.map((cat: any) => (
                                <section
                                    key={cat.id}
                                    id={cat.id.toString()}
                                    ref={el => { categoryRefs.current[cat.id] = el }}
                                    className="scroll-mt-36"
                                >
                                    <h2 className={`text-xl font-bold mb-4 sticky top-[105px] z-10 py-2 ${theme === 'modern' ? 'bg-zinc-950/95 text-zinc-100' : theme === 'premium' ? 'bg-black/95 text-amber-500 font-serif' : 'bg-gray-50/95 text-gray-800'} backdrop-blur-sm`}>
                                        {cat.name} <span className="text-sm font-normal opacity-50 ml-2">({cat.items.length})</span>
                                    </h2>
                                    <div className="grid gap-4">
                                        {cat.items.map((item: any, idx: number) => {
                                            const offer = getBestOffer(item);
                                            return (
                                                <PublicMenuItem
                                                    key={item.id || item._id}
                                                    item={item}
                                                    cafe={cafe}
                                                    theme={theme}
                                                    bestOffer={offer} // Passes actual offer
                                                    finalPrice={offer ? (offer.discountType === 'percent' ? item.price * (1 - offer.discountValue / 100) : item.price - offer.discountValue) : item.price}
                                                    index={idx}
                                                    onImageClick={() => setPreviewImage(item.imageUrl)}
                                                />
                                            );
                                        })}
                                    </div>
                                </section>
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center py-8 opacity-40 text-xs">
                <p>Powered by <span className="font-bold">MenuMaker</span></p>
                {cafe.phone && <p className="mt-1">Contact: {cafe.phone}</p>}
            </footer>
        </div>
    );
}
