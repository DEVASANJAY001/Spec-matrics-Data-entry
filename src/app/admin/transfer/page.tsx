'use client';

import React, { useState, useEffect } from 'react';
import {
    Zap,
    ArrowRight,
    Search,
    Car,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    MoveHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Autocomplete from '@/components/Autocomplete';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function TransferPartPage() {
    const [sourceCode, setSourceCode] = useState('');
    const [targetCode, setTargetCode] = useState('');
    const [sourceSpecs, setSourceSpecs] = useState<any[]>([]);
    const [selectedSpecIds, setSelectedSpecIds] = useState<string[]>([]);
    const [isLoadingSource, setIsLoadingSource] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);

    // Target car details (optional, but good for verification)
    const [targetDetails, setTargetDetails] = useState({
        carModel: '',
        variant: '',
        region: ''
    });

    useEffect(() => {
        if (sourceCode) {
            fetchSourceSpecs();
        } else {
            setSourceSpecs([]);
            setSelectedSpecIds([]);
        }
    }, [sourceCode]);

    const fetchSourceSpecs = async () => {
        setIsLoadingSource(true);
        try {
            const res = await fetch(`/api/specifications?code=${encodeURIComponent(sourceCode)}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSourceSpecs(data);
                // Also automatically prep the target details if empty, assuming similarity
                if (data.length > 0 && !targetDetails.carModel) {
                    setTargetDetails({
                        carModel: data[0]['Car Model'] || '',
                        variant: data[0]['Variant'] || '',
                        region: data[0]['Region'] || ''
                    });
                }
            }
        } catch (err) {
            toast.error('Failed to load parts for source code');
        } finally {
            setIsLoadingSource(false);
        }
    };

    const toggleSpec = (id: string) => {
        setSelectedSpecIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const isSameCode = sourceCode && targetCode && sourceCode === targetCode;

    const handleTransfer = async () => {
        if (!sourceCode || !targetCode || selectedSpecIds.length === 0) {
            toast.error('Please select source, target, and at least one part');
            return;
        }

        if (isSameCode) {
            toast.error('Source and Target car codes cannot be the same');
            return;
        }

        if (!targetDetails.carModel || !targetDetails.variant || !targetDetails.region) {
            toast.error('Please specify target vehicle details (Model, Variant, Region)');
            return;
        }

        setIsTransferring(true);
        const loadingToast = toast.loading(`Transferring ${selectedSpecIds.length} parts...`);

        try {
            let successCount = 0;
            let failCount = 0;

            for (const specId of selectedSpecIds) {
                const spec = sourceSpecs.find(s => s._id === specId);
                if (!spec) continue;

                // Fetch full spec including image (since regular list API omits it)
                const fullRes = await fetch(`/api/specifications/${specId}`);
                const fullSpecData = await fullRes.json();

                const payload = {
                    carModel: targetDetails.carModel,
                    variant: targetDetails.variant,
                    region: targetDetails.region,
                    category: fullSpecData['Category'],
                    part: fullSpecData['Part Name'],
                    code: targetCode,
                    spec: fullSpecData['Specification Details'],
                    imageUrl: fullSpecData['Documentation Image'] || ''
                };

                const res = await fetch('/api/specifications/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) successCount++;
                else failCount++;
            }

            if (failCount === 0) {
                toast.success(`Successfully transferred ${successCount} parts to ${targetCode}`, { id: loadingToast });
                // Reset
                setTargetCode('');
                setSelectedSpecIds([]);
            } else {
                toast.error(`Transferred ${successCount} parts, but ${failCount} failed.`, { id: loadingToast });
            }
        } catch (err) {
            toast.error('Transfer failed due to a system error', { id: loadingToast });
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4">
            <Toaster position="top-right" />

            <div className="max-w-5xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100 mb-4 animate-bounce-subtle">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Transfer Specifications</h1>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest text-center px-4 max-w-md mx-auto leading-relaxed">
                        Copy recorded part specifications from one car code to another with a single click.
                    </p>
                </header>

                <AnimatePresence>
                    {isSameCode && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 mb-4"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <div className="text-xs font-bold uppercase tracking-tight">
                                Warning: Source and Target car codes are identical. Transfer aborted.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Source Section */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xs">1</span>
                                Source Vehicle (From)
                            </h3>

                            <Autocomplete
                                label="Source Car Code"
                                placeholder="Search by Code (e.g. AA2...)"
                                apiUrl="/api/codes/search"
                                value={sourceCode}
                                onChange={setSourceCode}
                            />

                            <div className="mt-8 space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex justify-between items-center">
                                    <span>Available Parts ({sourceSpecs.length})</span>
                                    {sourceSpecs.length > 0 && (
                                        <button
                                            onClick={() => setSelectedSpecIds(selectedSpecIds.length === sourceSpecs.length ? [] : sourceSpecs.map(s => s._id))}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            {selectedSpecIds.length === sourceSpecs.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </label>

                                <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                                    {isLoadingSource ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Loading Specs...</span>
                                        </div>
                                    ) : sourceSpecs.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-gray-300 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                                            <Search className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Select code to see parts</span>
                                        </div>
                                    ) : (
                                        sourceSpecs.map((spec) => (
                                            <button
                                                key={spec._id}
                                                onClick={() => toggleSpec(spec._id)}
                                                className={cn(
                                                    "w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group",
                                                    selectedSpecIds.includes(spec._id)
                                                        ? "bg-blue-50 border-blue-200 shadow-sm shadow-blue-50"
                                                        : "bg-white border-gray-100 hover:border-blue-100"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                        selectedSpecIds.includes(spec._id) ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                                                    )}>
                                                        <Car className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-gray-900 leading-tight">{spec['Part Name']}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{spec['Category']}</div>
                                                    </div>
                                                </div>
                                                {selectedSpecIds.includes(spec._id) && (
                                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Target Section */}
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group h-full">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">2</span>
                                Target Vehicle (To)
                            </h3>

                            <div className="space-y-5 relative z-10">
                                <Autocomplete
                                    label="Target Car Code"
                                    placeholder="Enter or Search Target Code..."
                                    apiUrl="/api/codes/search"
                                    value={targetCode}
                                    onChange={setTargetCode}
                                />

                                <div className="pt-4 border-t border-gray-50 space-y-4">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Target Details Verification</div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Car Model</label>
                                            <input
                                                type="text"
                                                value={targetDetails.carModel}
                                                onChange={e => setTargetDetails(prev => ({ ...prev, carModel: e.target.value.toUpperCase() }))}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs"
                                                placeholder="..."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Region</label>
                                            <input
                                                type="text"
                                                value={targetDetails.region}
                                                onChange={e => setTargetDetails(prev => ({ ...prev, region: e.target.value.toUpperCase() }))}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs"
                                                placeholder="..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Variant</label>
                                        <input
                                            type="text"
                                            value={targetDetails.variant}
                                            onChange={e => setTargetDetails(prev => ({ ...prev, variant: e.target.value.toUpperCase() }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all font-bold text-xs"
                                            placeholder="..."
                                        />
                                    </div>

                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 mt-6">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <div className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                                            Ensure the target details are correct. All selected specifications will be created as new master records for this car code.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <footer className="flex flex-col items-center justify-center pt-8 gap-4">
                    <button
                        onClick={handleTransfer}
                        disabled={isTransferring || !sourceCode || !targetCode || selectedSpecIds.length === 0}
                        className="w-full max-w-sm py-5 bg-gray-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {isTransferring ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Transferring...</>
                        ) : (
                            <><MoveHorizontal className="w-5 h-5" /> Execute Transfer</>
                        )}
                    </button>

                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Preserves Image Data</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Auto-Resolves Master Models</span>
                    </div>
                </footer>
            </div>
        </main>
    );
}
