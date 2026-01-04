import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CategoryList } from '@/components/admin/CategoryList';
import { CategoryModal } from '@/components/admin/CategoryModal';
import { ItemForm } from '@/components/admin/ItemForm';
import { Button } from '@/components/ui/button';
import { Plus, Search, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { useUpdateCafe } from '@/hooks/use-cafes';

interface MenuManagementProps {
    cafeId: number | string;
    cafe?: any; // Full cafe object for menuType check
}

export const MenuManagement = ({ cafeId, cafe }: MenuManagementProps) => {
    const [search, setSearch] = useState('');
    const updateCafe = useUpdateCafe();

    // Modal States
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [newItemCategoryId, setNewItemCategoryId] = useState<string>('');

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories', cafeId],
        queryFn: async () => {
            const res = await fetch(`/api/categories?cafeId=${cafeId}`);
            const data = await res.json();
            return Array.isArray(data) ? data : (data.data || []);
        },
        // Only fetch categories if we are in digital mode
        enabled: !cafe || cafe.menuType === 'digital'
    });

    // --- Image Menu Handlers ---
    const handleAddImage = (url: string) => {
        if (!cafe) return;
        const currentImages = cafe.imageMenuUrls || [];
        updateCafe.mutate({ id: cafe.id || cafe._id, imageMenuUrls: [...currentImages, url] });
    };

    const handleRemoveImage = (index: number) => {
        if (!cafe) return;
        const currentImages = cafe.imageMenuUrls || [];
        const newImages = currentImages.filter((_: any, i: number) => i !== index);
        updateCafe.mutate({ id: cafe.id || cafe._id, imageMenuUrls: newImages });
    };

    // --- Digital Menu Handlers ---
    const openNewCategory = () => {
        setEditingCategory(null);
        setCategoryModalOpen(true);
    };

    const openEditCategory = (category: any) => {
        setEditingCategory(category);
        setCategoryModalOpen(true);
    };

    const openNewItem = (categoryId: string) => {
        setEditingItem(null);
        setNewItemCategoryId(categoryId);
        setItemModalOpen(true);
    };

    const openEditItem = (item: any) => {
        setEditingItem(item);
        setItemModalOpen(true);
    };

    // RENDER: Image Menu
    if (cafe && cafe.menuType === 'image') {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900">Image Based Menu</h2>
                    <p className="text-sm text-gray-500">
                        Upload images of your physical menu pages. Customers can swipe through them.
                        This is the fastest way to get your menu online.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Existing Images */}
                    {(cafe.imageMenuUrls || []).map((url: string, index: number) => (
                        <div key={`${url}-${index}`} className="relative group rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-[3/4]">
                            <img src={url} alt={`Menu Page ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="scale-90 hover:scale-100 transition-transform"
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                Page {index + 1}
                            </div>
                        </div>
                    ))}

                    {/* Add New Image */}
                    <div className="aspect-[3/4] flex flex-col h-full">
                        <ImageUpload
                            value=""
                            onChange={handleAddImage}
                            className="h-full aspect-auto min-h-[300px]"
                        />
                    </div>
                </div>

                {(cafe.imageMenuUrls || []).length === 0 && (
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                        <span className="font-bold">Tip:</span> Upload your menu pages in order. Portrait images work best on mobile.
                    </div>
                )}
            </div>
        );
    }

    // RENDER: Digital Menu
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Digital Menu</h2>
                    <p className="text-sm text-gray-500">Organize your categories and items.</p>
                </div>
                <Button onClick={openNewCategory} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search items..."
                        className="pl-9 bg-gray-50 border-gray-200 h-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="space-y-4">
                    {categories.map((cat: any) => (
                        <CategoryList
                            key={cat.id || cat._id}
                            category={cat}
                            cafeId={cafeId}
                            onEditCategory={openEditCategory}
                            onAddItem={openNewItem}
                            onEditItem={openEditItem}
                        />
                    ))}

                    {categories.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 mb-4">No categories created yet.</p>
                            <Button onClick={openNewCategory} variant="outline">Create First Category</Button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <CategoryModal
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                initialData={editingCategory}
                cafeId={cafeId}
            />

            <ItemForm
                open={itemModalOpen}
                onClose={() => setItemModalOpen(false)}
                initialData={editingItem}
                categories={categories}
                defaultCategoryId={newItemCategoryId}
                cafeId={cafeId}
            />
        </div>
    );
};
