
"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
}

export const ImageUpload = ({ value, onChange, className }: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file); // Changed from 'image' to 'file' to match API

        try {
            const res = await fetch('/api/upload', { // Changed URL to new API
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.url) { // New API returns { url: ... }
                onChange(data.url);
                toast({ title: "Image uploaded" });
            } else {
                throw new Error(data.message || "Upload failed");
            }
        } catch (error: any) {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    }, [onChange, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 1,
        multiple: false
    });

    if (value) {
        return (
            <div className={`relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50 ${className}`}>
                <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-sm bg-white/80 hover:bg-white"
                    onClick={() => onChange('')}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div
            {...(getRootProps() as any)}
            className={`relative w-full aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                } ${className}`}
        >
            <input {...(getInputProps() as any)} />
            {uploading ? (
                <div className="flex flex-col items-center gap-2 text-indigo-600">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm font-medium">Uploading...</span>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Upload className="w-8 h-8 opacity-50" />
                    <div className="text-center text-sm">
                        <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
                    </div>
                    <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                </div>
            )}
        </div>
    );
};
