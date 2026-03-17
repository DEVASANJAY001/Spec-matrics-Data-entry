'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Eye,
    X,
    FileSearch,
    Calendar,
    RefreshCw,
    MoreVertical,
    Trash2
} from 'lucide-react';
import Autocomplete from '@/components/Autocomplete';
import SpecificationForm from '@/components/SpecificationForm';
import toast, { Toaster } from 'react-hot-toast';

export default function ExplorerPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

    // Filters
    const [filters, setFilters] = useState({
        carModel: '',
        variant: '',
        region: '',
        code: '',
        q: ''
    });

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.carModel) params.append('carModel', filters.carModel);
            if (filters.variant) params.append('variant', filters.variant);
            if (filters.region) params.append('region', filters.region);
            if (filters.code) params.append('code', filters.code);
            if (filters.q) params.append('q', filters.q);

            const res = await fetch(`/api/specifications?${params.toString()}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setEntries(data);
            } else if (data.error) {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        const loadingToast = toast.loading('Deleting...');
        try {
            const res = await fetch(`/api/specifications/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Entry deleted', { id: loadingToast });
            fetchEntries();
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Toaster position="top-right" />
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <FileSearch className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Data <span className="text-blue-600">Explorer</span></h1>
                            <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">Master Repository</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchEntries()}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto p-4 flex flex-col lg:flex-row gap-6">
                {/* Advanced Filters Sidebar */}
                <div className="w-full lg:w-80 shrink-0 space-y-4">
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Filter className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">Advanced Filters</span>
                        </div>

                        <div className="space-y-5">
                            <Autocomplete
                                label="Car Model"
                                placeholder="Search model..."
                                apiUrl="/api/carmodels/search"
                                value={filters.carModel}
                                onChange={(val: string) => handleFilterChange('carModel', val)}
                            />

                            <Autocomplete
                                label="Variant"
                                placeholder="Search variant..."
                                apiUrl="/api/variants/search"
                                value={filters.variant}
                                onChange={(val: string) => handleFilterChange('variant', val)}
                                extraParams={{ carModel: filters.carModel }}
                            />

                            <Autocomplete
                                label="Region"
                                placeholder="Search region..."
                                apiUrl="/api/regions/search"
                                value={filters.region}
                                onChange={(val: string) => handleFilterChange('region', val)}
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Universal Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Any detail..."
                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                        value={filters.q}
                                        onChange={(e) => handleFilterChange('q', e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setFilters({ carModel: '', variant: '', region: '', code: '', q: '' })}
                                className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl shadow-gray-200">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Found Entries</div>
                        <div className="text-3xl font-black">{entries.length}</div>
                        <div className="w-full h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-blue-500 w-2/3" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-[2rem] h-48 animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-100 rounded-[2rem] p-12 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RefreshCw className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-black text-red-900 mb-2">Connection Blocked</h3>
                            <p className="text-red-600 text-sm max-w-sm mx-auto mb-6">{error}</p>
                            <button
                                onClick={() => fetchEntries()}
                                className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                            >
                                Retry Connection
                            </button>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-12 border border-dashed border-gray-200 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-200" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-1">No matches found</h3>
                            <p className="text-gray-400 text-xs">Try adjusting your filters or use universal search.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {entries.map((entry, i) => (
                                <motion.div
                                    key={entry._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group bg-white rounded-[2rem] border border-gray-100 p-5 hover:shadow-2xl hover:shadow-gray-200 transition-all cursor-pointer relative overflow-hidden"
                                    onClick={() => setSelectedEntry(entry)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">
                                            {entry['Code'] || entry.code}
                                        </div>
                                        <div className="text-[9px] font-bold text-gray-300 group-hover:text-blue-500 transition-colors uppercase tracking-widest">
                                            View Details →
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-black text-gray-900 mb-1 leading-tight line-clamp-1">
                                        {entry['Car Model'] || entry.carModel}
                                    </h3>
                                    <p className="text-blue-600 text-[11px] font-bold mb-4 tracking-tight line-clamp-1">
                                        {entry['Variant'] || entry.variant}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                                            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Region</div>
                                            <div className="text-[10px] font-black text-gray-700 truncate">{entry['Region'] || entry.region}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                                            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Part</div>
                                            <div className="text-[10px] font-black text-gray-700 truncate">{entry['Part Name'] || entry.partName}</div>
                                        </div>
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingEntryId(entry._id);
                                            }}
                                            className="p-2 bg-amber-500 text-white rounded-lg shadow-lg"
                                        >
                                            <MoreVertical className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(entry._id);
                                            }}
                                            className="p-2 bg-red-500 text-white rounded-lg shadow-lg"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1.5 pt-4 border-t border-gray-50 text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[9px] font-bold">{new Date(entry.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {selectedEntry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEntry(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="relative h-56 sm:h-80 bg-gray-50 border-b border-gray-100">
                                {(selectedEntry['Documentation Image'] || selectedEntry.imageUrl) ? (
                                    <img src={selectedEntry['Documentation Image'] || selectedEntry.imageUrl} alt="" className="w-full h-full object-contain p-4" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-100 -rotate-6 font-black text-4xl sm:text-7xl tracking-tighter uppercase opacity-30 select-none">SPEC MATRIX</div>
                                )}
                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="absolute top-6 right-6 p-2.5 bg-black/50 text-white rounded-full hover:bg-black transition-all backdrop-blur-md"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 sm:p-12">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
                                    <div>
                                        <div className="inline-block px-3 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase rounded-xl mb-3 tracking-widest shadow-xl shadow-gray-200">
                                            {selectedEntry['Code'] || selectedEntry.code}
                                        </div>
                                        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">
                                            {selectedEntry['Car Model'] || selectedEntry.carModel}
                                        </h2>
                                        <p className="text-blue-600 text-lg font-bold tracking-tight">
                                            {selectedEntry['Variant'] || selectedEntry.variant}
                                        </p>
                                    </div>
                                    <div className="shrink-0 space-y-1">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left sm:text-right">Registry Date</div>
                                        <div className="flex items-center gap-2 text-sm font-black text-gray-900 sm:justify-end">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            {new Date(selectedEntry.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                                    <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                        <div className="text-[9px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Part Unit</div>
                                        <div className="font-black text-gray-900 text-sm mb-0.5 truncate">{selectedEntry['Part Name'] || selectedEntry.partName}</div>
                                        <div className="text-[10px] text-gray-500 font-bold truncate">{selectedEntry['Category'] || selectedEntry.category}</div>
                                    </div>
                                    <div className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100">
                                        <div className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Region</div>
                                        <div className="font-black text-gray-900 text-sm mb-0.5">{selectedEntry['Region'] || selectedEntry.region}</div>
                                        <div className="text-[10px] text-gray-500 font-bold tracking-tight">Global Standard</div>
                                    </div>
                                    <div className="p-5 bg-blue-50 rounded-[2rem] border border-blue-100 sm:col-span-1 col-span-2">
                                        <div className="text-[9px] font-bold text-blue-400 uppercase mb-2 tracking-widest">Master Status</div>
                                        <div className="font-black text-blue-700 text-sm mb-0.5">VERIFIED</div>
                                        <div className="text-[10px] text-blue-500 font-bold tracking-tight">Ready for Export</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Detailed Specifications</div>
                                    <div className="p-6 sm:p-8 bg-white border-2 border-gray-50 rounded-[2.5rem] text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap shadow-sm font-medium">
                                        {selectedEntry['Specification Details'] || selectedEntry.spec}
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-gray-50 flex gap-3">
                                    <button
                                        onClick={() => {
                                            const id = selectedEntry._id;
                                            setSelectedEntry(null);
                                            setEditingEntryId(id);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-3xl font-black text-xs hover:bg-black transition-all shadow-xl shadow-gray-200"
                                    >
                                        Edit Entry
                                    </button>
                                    <button
                                        onClick={() => {
                                            const id = selectedEntry._id;
                                            handleDelete(id);
                                            setSelectedEntry(null);
                                        }}
                                        className="px-6 py-4 bg-red-50 text-red-600 rounded-3xl font-black text-xs hover:bg-red-100 transition-all border border-red-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingEntryId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingEntryId(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-[#F8FAFC] w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 right-0 p-6 flex justify-end z-[110]">
                                <button
                                    onClick={() => setEditingEntryId(null)}
                                    className="p-3 bg-white/80 backdrop-blur-md text-gray-500 rounded-full hover:bg-white hover:text-gray-900 shadow-sm transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="-mt-16">
                                <SpecificationForm
                                    editId={editingEntryId}
                                    onSuccess={() => {
                                        setEditingEntryId(null);
                                        fetchEntries();
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
