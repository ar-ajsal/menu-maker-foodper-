
import { storage } from "@/lib/storage"; // This will run on server
import PublicMenuClient from "@/components/PublicMenuClient";
import { Metadata } from 'next';

// Generate Metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const cafe = await storage.getCafeBySlug(slug);
    return {
        title: cafe ? `${cafe.name} - Digital Menu` : 'Cafe Not Found',
        description: cafe?.description || 'View our digital menu.',
    };
}

export default async function PublicMenuPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    // 1. Fetch Cafe
    const cafe = await storage.getCafeBySlug(params.slug);

    if (!cafe) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 text-center">
                <div>
                    <h1 className="text-2xl font-bold font-serif mb-2">Cafe Not Found</h1>
                    <p className="text-muted-foreground">The menu you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    // 2. Fetch Categories and Items
    const categoriesData = await storage.getCategories(cafe.id); // Returns Category[]
    const itemsData = await storage.getMenuItems(cafe.id); // Returns MenuItem[]
    const offersData = await storage.getOffers(cafe.id); // Returns Offer[]

    // 3. Nest Items into Categories
    const categories = categoriesData.map(cat => {
        const catIdStr = String(cat.id || (cat as any)._id);
        const catItems = itemsData.filter(item => String(item.categoryId) === catIdStr);
        return {
            ...cat,
            id: catIdStr, // Normalize ID for client
            items: catItems.map(i => ({ ...i, id: String(i.id || (i as any)._id) }))
        };
    });

    const offers = offersData.map(o => ({ ...o, id: String(o.id || (o as any)._id) }));

    return (
        <PublicMenuClient
            cafe={{ ...cafe, id: String(cafe.id || (cafe as any)._id) }}
            categories={categories}
            offers={offers}
        />
    );
}
