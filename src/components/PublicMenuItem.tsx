
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Heart, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface PublicMenuItemProps {
    item: any;
    cafe: any;
    theme: string;
    bestOffer: any;
    finalPrice: number;
    index: number;
    onImageClick?: () => void;
}

export function PublicMenuItem({ item, theme, bestOffer, finalPrice, index, onImageClick }: PublicMenuItemProps) {
    const [isLiked, setIsLiked] = useState(false);

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: item.name,
                    text: item.description || `Check out ${item.name}!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: 0.3,
                delay: index * 0.05,
                layout: { duration: 0.3 }
            }}
            whileHover={{ scale: 1.02 }}
        >
            <Card className={`overflow-hidden transition-all duration-300 group relative
          ${theme === 'premium' ? 'bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-amber-900/40 hover:border-amber-500/60 shadow-2xl shadow-black/40 hover:shadow-amber-900/20' :
                    theme === 'modern' ? 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-700 shadow-xl' :
                        'bg-white border-border/50 hover:border-primary/30 hover:shadow-xl shadow-lg'}
          ${item.isAvailable === false ? 'opacity-70 grayscale' : ''} 
      `}>
                <div className="flex relative">
                    {/* Sold Out Overlay */}
                    {item.isAvailable === false && (
                        <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <span className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xl transform -rotate-12">
                                SOLD OUT
                            </span>
                        </div>
                    )}

                    {/* Quick Actions - Floating */}
                    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsLiked(!isLiked)}
                            className={`p-2 rounded-full backdrop-blur-md shadow-lg ${isLiked
                                ? 'bg-red-500 text-white'
                                : theme === 'premium'
                                    ? 'bg-black/60 text-amber-200 hover:bg-black/80'
                                    : 'bg-white/90 text-gray-700 hover:bg-white'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleShare}
                            className={`p-2 rounded-full backdrop-blur-md shadow-lg ${theme === 'premium'
                                ? 'bg-black/60 text-amber-200 hover:bg-black/80'
                                : 'bg-white/90 text-gray-700 hover:bg-white'
                                }`}
                        >
                            <Share2 className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Hot Deal Badge */}
                    {bestOffer && (
                        <motion.div
                            initial={{ rotate: -12, scale: 0 }}
                            animate={{ rotate: -12, scale: 1 }}
                            className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                        >
                            🔥 DEAL
                        </motion.div>
                    )}

                    {/* Image Section */}
                    {item.imageUrl ? (
                        <div
                            className="w-32 h-32 shrink-0 relative overflow-hidden cursor-zoom-in"
                            onClick={(e) => {
                                e.stopPropagation();
                                onImageClick?.();
                            }}
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            {theme === 'premium' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
                            )}
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ) : (
                        <div className={`w-32 h-32 shrink-0 flex items-center justify-center ${theme === 'premium' ? 'bg-gradient-to-br from-[#1a1008] to-[#0a0604]' :
                            theme === 'modern' ? 'bg-gradient-to-br from-zinc-800 to-zinc-900' :
                                'bg-gradient-to-br from-gray-100 to-gray-200'
                            }`}>
                            <ImageIcon className={`w-10 h-10 ${theme === 'premium' ? 'text-amber-900/40' :
                                theme === 'modern' ? 'text-zinc-700' :
                                    'text-gray-300'
                                }`} />
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-h-[130px]">
                        <div>
                            <h3 className={`font-semibold text-lg leading-tight mb-1 ${theme === 'premium' ? 'font-serif text-amber-50 tracking-wide' :
                                theme === 'modern' ? 'text-zinc-50' :
                                    'text-gray-900'
                                }`}>
                                {item.name}
                            </h3>
                            {item.description && (
                                <p className={`text-xs line-clamp-2 mb-2 ${theme === 'premium' ? 'text-zinc-400' :
                                    theme === 'modern' ? 'text-zinc-400' :
                                        'text-gray-600'
                                    }`}>
                                    {item.description}
                                </p>
                            )}

                            {/* Badges */}
                            {item.badges && Array.isArray(item.badges) && item.badges.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {item.badges.map((badge: string, i: number) => {
                                        const isVeg = badge.toLowerCase().includes('veg') && !badge.toLowerCase().includes('non');
                                        const isNonVeg = badge.toLowerCase().includes('non-veg') || badge.toLowerCase().includes('nonveg');

                                        return (
                                            <span
                                                key={i}
                                                className={`text-[10px] px-2 py-1 rounded-full font-medium inline-flex items-center gap-1 ${isVeg
                                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                                    : isNonVeg
                                                        ? 'bg-red-100 text-red-700 border border-red-300'
                                                        : theme === 'premium'
                                                            ? 'bg-amber-900/30 text-amber-500 border border-amber-900/50'
                                                            : theme === 'modern'
                                                                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                                                : 'bg-primary/10 text-primary border border-primary/20'
                                                    }`}
                                            >
                                                {isVeg && <span className="w-2 h-2 rounded-full bg-green-600"></span>}
                                                {isNonVeg && <span className="w-2 h-2 rounded-full bg-red-600"></span>}
                                                {badge}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Price Section */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                            {bestOffer ? (
                                <>
                                    <span className={`font-bold text-xl ${theme === 'premium' ? 'text-amber-400' :
                                        theme === 'modern' ? 'text-emerald-400' :
                                            'text-primary'
                                        }`}>
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(finalPrice)}
                                    </span>
                                    <span className="text-muted-foreground line-through text-sm">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)}
                                    </span>
                                    <Badge className="text-[10px] h-5 px-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600">
                                        {bestOffer.discountType === 'percent' ? `${bestOffer.discountValue}% OFF` : `₹${bestOffer.discountValue} OFF`}
                                    </Badge>
                                </>
                            ) : (
                                <span className={`font-bold text-xl ${theme === 'premium' ? 'text-amber-400' :
                                    theme === 'modern' ? 'text-emerald-400' :
                                        'text-primary'
                                    }`}>
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Accent Bar for Premium */}
                {theme === 'premium' && (
                    <div className="h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                )}
            </Card>
        </motion.div>
    );
}
