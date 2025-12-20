import { useCafeBySlug } from "@/hooks/use-cafes";
import { useRoute } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Info, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicMenu() {
  const [, params] = useRoute("/menu/:slug");
  const slug = params?.slug || "";
  const { data: cafe, isLoading, error } = useCafeBySlug(slug);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-8">
        <div className="space-y-4 text-center">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold font-serif mb-2">Cafe Not Found</h1>
          <p className="text-muted-foreground">The menu you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  // Group items by category for easy display
  const categories = cafe.categories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative bg-primary/5 pb-8 pt-12 px-4 rounded-b-[2rem] shadow-sm mb-6">
        <div className="max-w-md mx-auto text-center space-y-3">
          {cafe.logoUrl ? (
            <img 
              src={cafe.logoUrl} 
              alt={cafe.name} 
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-white flex items-center justify-center border-4 border-primary/10 shadow-md text-primary font-bold text-3xl font-serif">
              {cafe.name.substring(0, 1)}
            </div>
          )}
          
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-foreground">{cafe.name}</h1>
            {cafe.address && (
              <div className="flex items-center justify-center text-sm text-muted-foreground gap-1">
                <MapPin className="w-3 h-3" />
                <span>{cafe.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offers Banner */}
      {cafe.offers && cafe.offers.length > 0 && (
        <div className="max-w-md mx-auto px-4 mb-8">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-xl shadow-lg shadow-primary/20">
            <h3 className="font-bold text-sm uppercase tracking-wider opacity-90 mb-1">Special Offer</h3>
            <p className="text-lg font-serif">{cafe.offers[0].title}</p>
            {cafe.offers[0].description && (
              <p className="text-sm opacity-90 mt-1">{cafe.offers[0].description}</p>
            )}
          </div>
        </div>
      )}

      {/* Menu Categories & Items */}
      <div className="max-w-md mx-auto px-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Menu items are being updated.</p>
            <p className="text-sm">Please check back soon.</p>
          </div>
        ) : (
          <Tabs defaultValue={categories[0].id.toString()} className="space-y-6">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <TabsList className="w-full justify-start bg-transparent p-0 gap-2">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id.toString()}
                    className="rounded-full px-6 py-2 border border-border data-[state=active]:bg-foreground data-[state=active]:text-background shadow-sm"
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id.toString()} className="space-y-4 focus-visible:outline-none">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-serif">{cat.name}</h2>
                  <Badge variant="outline" className="text-xs font-normal">
                    {cat.items.length} items
                  </Badge>
                </div>
                
                <div className="grid gap-4">
                  {cat.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden border-border/50 hover:border-border transition-colors">
                        <div className="flex">
                          {item.imageUrl && (
                            <div className="w-28 h-auto bg-muted shrink-0">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          {!item.imageUrl && (
                             <div className="w-24 h-auto bg-muted/30 shrink-0 flex items-center justify-center">
                               <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
                             </div>
                          )}
                          
                          <div className="flex-1 p-4 flex flex-col justify-between min-h-[100px]">
                            <div>
                              <h3 className="font-semibold text-lg leading-tight mb-1">{item.name}</h3>
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                              )}
                            </div>
                            <div className="mt-2 font-bold text-primary text-base">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                
                {cat.items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm italic bg-muted/30 rounded-lg">
                    No items in this category yet.
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-muted-foreground pb-8">
        <p>Powered by QR Menu</p>
      </footer>
    </div>
  );
}
