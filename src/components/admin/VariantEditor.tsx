
import React from 'react';
import { Plus, Trash2, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface Option {
    id: string; // temp id for key
    label: string;
    priceModifier: number;
}

interface VariantGroup {
    id: string; // temp id
    name: string;
    minSelect: number;
    maxSelect: number;
    options: Option[];
}

interface VariantEditorProps {
    variants: VariantGroup[];
    onChange: (variants: VariantGroup[]) => void;
}

export const VariantEditor = ({ variants, onChange }: VariantEditorProps) => {
    const addGroup = () => {
        onChange([
            ...variants,
            {
                id: Math.random().toString(36).substr(2, 9),
                name: 'New Option Group',
                minSelect: 0,
                maxSelect: 1,
                options: []
            }
        ]);
    };

    const removeGroup = (index: number) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        onChange(newVariants);
    };

    const updateGroup = (index: number, updates: Partial<VariantGroup>) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], ...updates };
        onChange(newVariants);
    };

    const addOption = (groupIndex: number) => {
        const newVariants = [...variants];
        newVariants[groupIndex].options.push({
            id: Math.random().toString(36).substr(2, 9),
            label: 'New Option',
            priceModifier: 0
        });
        onChange(newVariants);
    };

    const removeOption = (groupIndex: number, optionIndex: number) => {
        const newVariants = [...variants];
        newVariants[groupIndex].options.splice(optionIndex, 1);
        onChange(newVariants);
    };

    const updateOption = (groupIndex: number, optionIndex: number, updates: Partial<Option>) => {
        const newVariants = [...variants];
        newVariants[groupIndex].options[optionIndex] = {
            ...newVariants[groupIndex].options[optionIndex],
            ...updates
        };
        onChange(newVariants);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Product Variants & Modifiers</Label>
                <Button size="sm" variant="outline" type="button" onClick={addGroup} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Group
                </Button>
            </div>

            {variants.length === 0 && (
                <div className="text-center p-8 border border-dashed rounded-lg text-sm text-gray-500 bg-gray-50">
                    No variants added. E.g., Size, Toppings, Spice Level.
                </div>
            )}

            {variants.map((group, gIndex) => (
                <Card key={group.id} className="p-4 bg-gray-50/50">
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-gray-500">Group Name</Label>
                                    <Input
                                        value={group.name}
                                        onChange={(e) => updateGroup(gIndex, { name: e.target.value })}
                                        placeholder="e.g., Size"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Label className="text-xs text-gray-500">Min Select</Label>
                                        <Input
                                            type="number" min={0}
                                            value={group.minSelect}
                                            onChange={(e) => updateGroup(gIndex, { minSelect: parseInt(e.target.value) || 0 })}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label className="text-xs text-gray-500">Max Select</Label>
                                        <Input
                                            type="number" min={1}
                                            value={group.maxSelect}
                                            onChange={(e) => updateGroup(gIndex, { maxSelect: parseInt(e.target.value) || 1 })}
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeGroup(gIndex)} className="text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Options List */}
                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                            <Label className="text-xs text-gray-500 block mb-2">Options</Label>
                            {group.options.map((option, oIndex) => (
                                <div key={option.id} className="flex items-center gap-3">
                                    <Input
                                        value={option.label}
                                        onChange={(e) => updateOption(gIndex, oIndex, { label: e.target.value })}
                                        placeholder="Option Name"
                                        className="bg-white flex-[2]"
                                    />
                                    <div className="flex items-center gap-1 flex-1">
                                        <span className="text-sm text-gray-500">+₹</span>
                                        <Input
                                            type="number"
                                            value={option.priceModifier}
                                            onChange={(e) => updateOption(gIndex, oIndex, { priceModifier: parseFloat(e.target.value) || 0 })}
                                            placeholder="0"
                                            className="bg-white"
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(gIndex, oIndex)} className="h-8 w-8 text-gray-400 hover:text-red-600">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button size="sm" variant="ghost" type="button" onClick={() => addOption(gIndex)} className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 mt-2">
                                <PlusCircle className="w-4 h-4" /> Add Option
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
