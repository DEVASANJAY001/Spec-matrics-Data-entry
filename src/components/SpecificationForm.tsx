'use client';

import { Save, RotateCcw, Image as ImageIcon, X, Loader2, Clipboard, Camera, FileImage } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Autocomplete from './Autocomplete';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React, { useState, useEffect, useCallback } from 'react';
import { saveRecentEntry } from '@/lib/recent-entries';

const INITIAL_FORM_STATE = {
    carModel: '',
    variant: '',
    region: '',
    code: '',
    partName: '',
    category: '',
    spec: '',
    imageUrl: '',
};

interface SpecificationFormProps {
    editId?: string;
    onSuccess?: () => void;
}

export default function SpecificationForm({ editId, onSuccess }: SpecificationFormProps) {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Fetch data if in edit mode
    useEffect(() => {
        if (editId) {
            const fetchData = async () => {
                setIsLoadingData(true);
                try {
                    const res = await fetch(`/api/specifications/${editId}`);
                    if (!res.ok) throw new Error('Failed to fetch specification');
                    const data = await res.json();

                    const mappedData = {
                        carModel: data['Car Model'] || '',
                        variant: data['Variant'] || '',
                        region: data['Region'] || '',
                        code: data['Code'] || '',
                        partName: data['Part Name'] || '',
                        category: data['Category'] || '',
                        spec: data['Specification Details'] || '',
                        imageUrl: data['Documentation Image'] || '',
                    };

                    setFormData(mappedData);
                    setPreviewImage(data['Documentation Image'] || null);
                } catch (error) {
                    toast.error('Error loading entry');
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchData();
        }
    }, [editId]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
        const file = e instanceof File ? e : e.target.files?.[0];
        if (file) {
            // Immediate local preview for UX
            const localReader = new FileReader();
            localReader.onloadend = () => {
                setPreviewImage(localReader.result as string);
            };
            localReader.readAsDataURL(file);

            // Upload to server
            const uploadToast = toast.loading('Uploading image...');
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) throw new Error('Upload failed');

                const { url } = await res.json();
                handleInputChange('imageUrl', url);
                toast.success('Image uploaded!', { id: uploadToast });
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Failed to upload image', { id: uploadToast });
            }
        }
    };

    // Global Paste Handler
    const handlePaste = useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    handleImageChange(blob);
                    toast.success('Image pasted from clipboard!');
                }
            }
        }
    }, [formData]);

    useEffect(() => {
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE);
        setPreviewImage(null);
        toast.success('Form reset successfully');
    };

    const validate = () => {
        const required = ['carModel', 'variant', 'region', 'code', 'partName', 'category', 'spec'];
        for (const field of required) {
            if (!formData[field as keyof typeof formData]) {
                toast.error(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        const loadingToast = toast.loading(editId ? 'Updating...' : 'Saving...');

        try {
            const url = editId ? `/api/specifications/${editId}` : '/api/specifications/create';
            const method = editId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    part: formData.partName
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to save specification');
            }

            toast.success(editId ? 'Updated successfully!' : 'Saved successfully!', { id: loadingToast });

            // Save recent entries
            saveRecentEntry('Car Model', formData.carModel);
            saveRecentEntry('Variant', formData.variant);
            saveRecentEntry('Region', formData.region);
            saveRecentEntry('Code', formData.code);
            saveRecentEntry('Category', formData.category);
            saveRecentEntry('Part Name', formData.partName);

            if (!editId) {
                setFormData(INITIAL_FORM_STATE);
                setPreviewImage(null);
            }

            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Something went wrong';
            toast.error(message, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="font-bold text-xs uppercase tracking-widest">Loading for Edit...</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-2 sm:py-6 px-2 sm:px-4">
            <Toaster position="top-right" />

            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight mb-1">
                                {editId ? 'Edit' : 'New'} <span className="text-blue-600">Spec Entry</span>
                            </h1>
                            <p className="text-gray-400 text-[10px] sm:text-xs mb-4">
                                {editId ? 'Modify existing data entry.' : 'Industrial master data generator.'}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {/* Capture Button */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        title="Capture Photo"
                                    />
                                    <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100">
                                        <Camera className="w-3.5 h-3.5" />
                                        Capture
                                    </button>
                                </div>

                                {/* Gallery Button */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        title="Select from Gallery"
                                    />
                                    <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                                        <FileImage className="w-3.5 h-3.5" />
                                        Gallery
                                    </button>
                                </div>

                                {/* Dedicated Paste Input Box */}
                                <div className="flex-1 min-w-[150px]">
                                    <div className="relative group/paste">
                                        <input
                                            type="text"
                                            readOnly
                                            placeholder="Paste Photo Here..."
                                            className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-600 placeholder:text-amber-400 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all cursor-text pr-10"
                                            onPaste={(e) => {
                                                // This handles local paste on the input specifically
                                                const items = e.clipboardData?.items;
                                                if (!items) return;
                                                for (let i = 0; i < items.length; i++) {
                                                    if (items[i].type.indexOf('image') !== -1) {
                                                        const blob = items[i].getAsFile();
                                                        if (blob) handleImageChange(blob);
                                                    }
                                                }
                                            }}
                                        />
                                        <Clipboard className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative group/upload shrink-0">
                            <div className={cn(
                                "w-20 h-20 sm:w-28 sm:h-28 rounded-3xl border-2 border-dashed flex items-center justify-center transition-all overflow-hidden",
                                previewImage ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-gray-50 hover:bg-blue-50/50 hover:border-blue-200"
                            )}>
                                {previewImage ? (
                                    <div className="relative w-full h-full">
                                        <img src={previewImage} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewImage(null);
                                                handleInputChange('imageUrl', '');
                                            }}
                                            className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-20 shadow-lg border-2 border-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                                        <ImageIcon className="w-8 h-8 text-gray-200" />
                                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-tight">No Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3 sm:gap-y-4">
                            <Autocomplete
                                label="Car Model"
                                placeholder="..."
                                apiUrl="/api/carmodels/search"
                                value={formData.carModel}
                                onChange={(val) => handleInputChange('carModel', val)}
                                required
                            />

                            <Autocomplete
                                label="Variant"
                                placeholder="..."
                                apiUrl="/api/variants/search"
                                value={formData.variant}
                                onChange={(val) => handleInputChange('variant', val)}
                                extraParams={{ carModel: formData.carModel }}
                                required
                            />

                            <Autocomplete
                                label="Region"
                                placeholder="..."
                                apiUrl="/api/regions/search"
                                value={formData.region}
                                onChange={(val) => handleInputChange('region', val)}
                                required
                            />

                            <Autocomplete
                                label="Code"
                                placeholder="FR-BMP-01"
                                apiUrl="/api/codes/search"
                                value={formData.code}
                                onChange={(val) => handleInputChange('code', val)}
                                required
                            />

                            <Autocomplete
                                label="Category"
                                placeholder="..."
                                apiUrl="/api/categories/search"
                                value={formData.category}
                                onChange={(val) => handleInputChange('category', val)}
                                required
                            />

                            <Autocomplete
                                label="Part Name"
                                placeholder="..."
                                apiUrl="/api/parts/search"
                                value={formData.partName}
                                onChange={(val) => handleInputChange('partName', val)}
                                extraParams={{ category: formData.category }}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                Specification Details <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Details..."
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-xs sm:text-sm placeholder:text-gray-300 resize-none text-gray-900 uppercase"
                                value={formData.spec}
                                onChange={(e) => handleInputChange('spec', e.target.value.toUpperCase())}
                                required
                            />
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-[2] flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editId ? 'Update Entry' : 'Save Entry'}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-500 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
