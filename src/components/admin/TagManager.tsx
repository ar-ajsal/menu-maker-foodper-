
"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TagManagerProps {
    selectedTags: string[]; // array of tag IDs
    onChange: (tags: string[]) => void;
}

export const TagManager = ({ selectedTags, onChange }: TagManagerProps) => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [newTagOpen, setNewTagOpen] = useState(false);
    const [newTag, setNewTag] = useState({ label: '', group: 'Characteristics', key: '' });

    // Mock API for tags for now, or implement /api/tags
    const { data: tags = [] } = useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const res = await fetch('/api/tags');
            if (res.status === 404) return []; // Graceful fallback if API not ready
            const data = await res.json();
            return Array.isArray(data) ? data : (data.data || []);
        }
    });

    const createTag = useMutation({
        mutationFn: async (tag: any) => {
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tag)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            setNewTagOpen(false);
            setNewTag({ label: '', group: 'Characteristics', key: '' });
        }
    });

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onChange(selectedTags.filter(id => id !== tagId));
        } else {
            onChange([...selectedTags, tagId]);
        }
    };

    const groupedTags = tags.reduce((acc: any, tag: any) => {
        if (!acc[tag.group]) acc[tag.group] = [];
        acc[tag.group].push(tag);
        return acc;
    }, {});

    const handleCreate = () => {
        const key = newTag.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
        createTag.mutate({ ...newTag, key });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.length === 0 && <span className="text-sm text-gray-500 italic">No tags selected</span>}
                {selectedTags.map(id => {
                    const t = tags.find((t: any) => t._id === id || t.id === id); // id compatibility
                    if (!t) return null;
                    return <Badge key={id} variant="secondary">{t.label}</Badge>
                })}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" /> Manage Tags
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Manage Tags</DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        {Object.keys(groupedTags).length === 0 && <p className="text-center text-gray-500">No tags available.</p>}

                        {Object.entries(groupedTags).map(([group, groupTags]: [string, any]) => (
                            <div key={group}>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-1">{group}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {groupTags.map((tag: any) => (
                                        <div
                                            key={tag.id || tag._id}
                                            onClick={() => toggleTag(tag.id || tag._id)}
                                            className={`cursor-pointer px-3 py-1.5 rounded-full text-sm border transition-all select-none
                        ${selectedTags.includes(tag.id || tag._id)
                                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium ring-1 ring-indigo-500'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            {tag.label}
                                            {selectedTags.includes(tag.id || tag._id) && <Check className="w-3 h-3 inline-block ml-1.5" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="pt-4 border-t border-gray-100">
                            {!newTagOpen ? (
                                <Button variant="ghost" onClick={() => setNewTagOpen(true)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0 h-auto">
                                    + Create New Tag
                                </Button>
                            ) : (
                                <div className="flex items-end gap-3 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-1">
                                        <Label className="text-xs">Label</Label>
                                        <Input
                                            value={newTag.label} onChange={e => setNewTag({ ...newTag, label: e.target.value })}
                                            placeholder="e.g. Vegan" className="bg-white h-8"
                                        />
                                    </div>
                                    <div className="w-40">
                                        <Label className="text-xs">Group</Label>
                                        <Select value={newTag.group} onValueChange={v => setNewTag({ ...newTag, group: v })}>
                                            <SelectTrigger className="bg-white h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Characteristics">Characteristics</SelectItem>
                                                <SelectItem value="Dietary">Dietary</SelectItem>
                                                <SelectItem value="Allergen">Allergen</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button size="sm" onClick={handleCreate} disabled={!newTag.label || createTag.isPending}>
                                        Save
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setNewTagOpen(false)}>Cancel</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
