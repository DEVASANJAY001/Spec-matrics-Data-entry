'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Autocomplete from './Autocomplete';
import { cn } from '@/lib/utils';

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

export default function SpecificationForm() {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewImage(result);
                handleInputChange('imageUrl', result);
            };
            reader.readAsDataURL(file);
        }
    };

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
        const loadingToast = toast.loading('Saving specification...');

        try {
            const res = await fetch('/api/specifications/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    part: formData.partName
                }),
            });

            if (!res.ok) throw new Error('Failed to save specification');

            toast.success('Specification saved successfully!', { id: loadingToast });
            setFormData(INITIAL_FORM_STATE);
            setPreviewImage(null);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Something went wrong';
            toast.error(message, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto py-2 sm:py-6 px-2 sm:px-4">
            <Toaster position="top-right" />

            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="p-4 sm:p-6 lg:p-8">
                    <header className="mb-4 sm:mb-6 border-b border-gray-50 pb-4 flex items-start justify-between">
                        <div>
                            <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight mb-1">
                                New <span className="text-blue-600">Spec Entry</span>
                            </h1>
                            <p className="text-gray-400 text-[10px] sm:text-xs">Industrial master data generator.</p>
                        </div>

                        <div className="relative group/upload">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className={cn(
                                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-dashed flex items-center justify-center transition-all",
                                previewImage ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-gray-50 hover:bg-blue-50/50 hover:border-blue-200"
                            )}>
                                {previewImage ? (
                                    <div className="relative w-full h-full p-1">
                                        <img src={previewImage} alt="" className="w-full h-full object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewImage(null);
                                                handleInputChange('imageUrl', '');
                                            }}
                                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-20 shadow-sm"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                            {!previewImage && (
                                <div className="absolute top-full mt-1 right-0 text-[8px] font-black text-gray-400 uppercase tracking-tighter whitespace-nowrap opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                    Attach Image
                                </div>
                            )}
                        </div>
                    </header>

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

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                    Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="FR-BMP-01"
                                    className="w-full px-3 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-xs sm:text-sm placeholder:text-gray-300 text-gray-900"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value)}
                                    required
                                />
                            </div>

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
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-xs sm:text-sm placeholder:text-gray-300 resize-none text-gray-900"
                                value={formData.spec}
                                onChange={(e) => handleInputChange('spec', e.target.value)}
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
                                Save Entry
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
