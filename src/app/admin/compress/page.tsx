'use client';

import React, { useState, useEffect } from 'react';
import { compressImage } from '@/lib/imageCompression';
import { Loader2, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminCompressPage() {
    const [specs, setSpecs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState({ total: 0, compressible: 0, completed: 0, failed: 0 });

    useEffect(() => {
        const fetchSpecs = async () => {
            try {
                // Fetch all specifications (limit 1000 for safety, but typically enough)
                const res = await fetch('/api/specifications?limit=2000');
                const data = await res.json();

                // Find specs with large base64 images (e.g. > 100KB which is roughly 133000 chars)
                const compressibleSpecs = data.filter((s: any) => {
                    const img = s['Documentation Image'];
                    return img && img.startsWith('data:image') && img.length > 100000;
                });

                setSpecs(compressibleSpecs);
                setStats(prev => ({ ...prev, total: data.length, compressible: compressibleSpecs.length }));
            } catch (err) {
                toast.error('Failed to load specifications');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSpecs();
    }, []);

    const processCompression = async () => {
        if (!confirm(`Are you sure you want to compress ${specs.length} images? This might take a few minutes.`)) return;

        setIsProcessing(true);
        let completed = 0;
        let failed = 0;

        for (let i = 0; i < specs.length; i++) {
            const spec = specs[i];
            try {
                // Convert base64 to Blob
                const res = await fetch(spec['Documentation Image']);
                const blob = await res.blob();

                // Compress it
                const compressedBlob = await compressImage(blob, 1200, 1200, 0.6);

                // Convert compressed blob back to base64
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                });
                reader.readAsDataURL(compressedBlob);
                const compressedBase64 = await base64Promise;

                // Send update
                const updateRes = await fetch(`/api/specifications/${spec._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        carModel: spec['Car Model'],
                        variant: spec['Variant'],
                        region: spec['Region'],
                        category: spec['Category'],
                        part: spec['Part Name'],
                        code: spec['Code'],
                        spec: spec['Specification Details'],
                        imageUrl: compressedBase64
                    })
                });

                if (!updateRes.ok) throw new Error('Update failed');
                completed++;
            } catch (err) {
                console.error(`Failed to compress spec ${spec._id}:`, err);
                failed++;
            }

            setProgress(Math.round(((i + 1) / specs.length) * 100));
            setStats(prev => ({ ...prev, completed, failed }));
        }

        setIsProcessing(false);
        toast.success('Compression completed!');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <Toaster position="top-right" />

            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 border border-gray-100">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Bulk Image Compression</h1>
                    <p className="text-sm text-gray-500 font-medium">Finds and compresses heavy Base64 images in your database to reduce payload sizes and improve speed.</p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning Database...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                <div className="text-3xl font-black text-gray-900">{stats.total}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Specs</div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                                <div className="text-3xl font-black text-amber-600">{stats.compressible}</div>
                                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">Need Compression</div>
                            </div>
                        </div>

                        {isProcessing && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <span>Processing...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex gap-4 pt-2 text-xs font-medium center justify-center">
                                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {stats.completed} Done</span>
                                    <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {stats.failed} Failed</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={processCompression}
                            disabled={isProcessing || stats.compressible === 0}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                        >
                            {isProcessing ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Compressing...</>
                            ) : stats.compressible === 0 ? (
                                <><CheckCircle className="w-5 h-5" /> All Optimized</>
                            ) : (
                                <><Play className="w-5 h-5 fill-current" /> Start Compression</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
