
import React from 'react';
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ItemProps {
    item: any;
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
    onToggleActive: (item: any) => void;
    dragHandleProps?: any; // For dnd-kit later
}

export const ItemCard = ({ item, onEdit, onDelete, onToggleActive, dragHandleProps }: ItemProps) => {
    return (
        <div className={`group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-all ${!item.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
            {/* Drag Handle */}
            <div {...dragHandleProps} className="cursor-grab text-gray-300 hover:text-gray-600">
                <GripVertical className="w-5 h-5" />
            </div>

            {/* Image */}
            <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                    {item.foodType !== 'other' && (
                        <span className={`w-2 h-2 rounded-full ${item.foodType === 'vegetarian' ? 'bg-green-500' : 'bg-red-500'}`} />
                    )}
                </div>
                <p className="text-sm text-gray-500 truncate mb-1">{item.description}</p>
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-900">₹{item.price.toFixed(2)}</span>
                    {item.variants?.length > 0 && <Badge variant="outline" className="text-xs">{item.variants.length} Variants</Badge>}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Switch
                    checked={item.isActive}
                    onCheckedChange={() => onToggleActive(item)}
                    className="data-[state=checked]:bg-green-500"
                />
                <div className="flex items-center gap-1 border-l pl-3 ml-1 border-gray-200">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8 text-gray-500 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item._id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
