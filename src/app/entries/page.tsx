'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Eye,
    MoreVertical,
    Trash2,
    Calendar,
    X,
    FileSearch,
    AlertTriangle
} from 'lucide-react';

import SpecificationForm from '@/components/SpecificationForm';
import toast, { Toaster } from 'react-hot-toast';

export default function EntriesPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async (q = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/specifications?q=${q}`);
            const data = await res.json();
            if (data.error) {
                setError(data.error);
                setEntries([]);
            } else {
                setEntries(data);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Failed to fetch entries');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchEntries(search);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        const loadingToast = toast.loading('Deleting...');
        try {
            const res = await fetch(`/api/specifications/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Entry deleted', { id: loadingToast });
            fetchEntries(search);
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto space-y-5">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Logs</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Manage master data entries.</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-xs"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all">
                            Filter
                        </button>
                    </form>
                </header>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-200">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-red-900 leading-none mb-1">Database Error</div>
                                <div className="text-[10px] text-red-600 font-medium font-mono line-clamp-1 opacity-80">{error}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchEntries()}
                            className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all active:scale-95 shrink-0"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
                        <FileSearch className="w-10 h-10 mb-3" />
                        <div className="font-bold uppercase tracking-widest text-[10px]">Syncing...</div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Master</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Region</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {entries.map((entry, i) => (
                                        <motion.tr
                                            key={entry._id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="group hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                        {(entry['Documentation Image'] || entry.imageUrl) ? (
                                                            <img src={entry['Documentation Image'] || entry.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-200 font-bold text-[10px]">S</div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-gray-900 text-sm truncate">{entry['Code'] || entry.code}</div>
                                                        <div className="text-[10px] text-gray-400 line-clamp-1">{entry['Specification Details'] || entry.spec}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs font-bold text-gray-700 truncate">
                                                    {entry['Car Model'] || entry.carModel || entry.carModelId?.name}
                                                </div>
                                                <div className="text-[10px] text-gray-400 truncate">
                                                    {entry['Variant'] || entry.variant || entry.variantId?.name} • {entry['Part Name'] || entry.partName || entry.partId?.name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black uppercase rounded-md border border-blue-100">
                                                    {entry['Region'] || entry.region || entry.regionId?.name}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1 transition-opacity">
                                                    <button
                                                        onClick={() => setSelectedEntry(entry)}
                                                        className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingEntryId(entry._id)}
                                                        className="p-1.5 hover:bg-amber-50 text-gray-400 hover:text-amber-600 rounded-lg transition-all"
                                                        title="Edit Entry"
                                                    >
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(entry._id)}
                                                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all"
                                                        title="Delete Entry"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
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
                            className="relative bg-[#F8FAFC] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 right-0 p-4 flex justify-end z-[110]">
                                <button
                                    onClick={() => setEditingEntryId(null)}
                                    className="p-2 bg-white/80 backdrop-blur-md text-gray-500 rounded-full hover:bg-white hover:text-gray-900 shadow-sm transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="-mt-12">
                                <SpecificationForm
                                    editId={editingEntryId}
                                    onSuccess={() => {
                                        setEditingEntryId(null);
                                        fetchEntries(search);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedEntry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEntry(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="relative h-48 sm:h-64 bg-gray-50 border-b border-gray-100">
                                {(selectedEntry['Documentation Image'] || selectedEntry.imageUrl) ? (
                                    <img src={selectedEntry['Documentation Image'] || selectedEntry.imageUrl} alt="" className="w-full h-full object-contain p-4" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-100 -rotate-6 font-black text-4xl sm:text-6xl tracking-tighter uppercase opacity-40">SPEC MATRIX</div>
                                )}
                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black transition-colors backdrop-blur-md"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-5 sm:p-8">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                    <div>
                                        <div className="inline-block px-2.5 py-1 bg-gray-900 text-white text-[10px] font-black uppercase rounded-lg mb-2 tracking-widest shadow-lg shadow-gray-200">
                                            {selectedEntry['Code'] || selectedEntry.code}
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                                            {selectedEntry['Car Model'] || selectedEntry.carModel || selectedEntry.carModelId?.name} <span className="text-blue-600 font-medium">{selectedEntry['Variant'] || selectedEntry.variant || selectedEntry.variantId?.name}</span>
                                        </h2>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Master Identity</div>
                                        <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5 sm:justify-end">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            {new Date(selectedEntry.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <div className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Core Unit</div>
                                        <div className="font-bold text-gray-800 text-sm">
                                            {selectedEntry['Part Name'] || selectedEntry.partName || selectedEntry.partId?.name}
                                        </div>
                                        <div className="text-[11px] text-gray-500 font-medium">
                                            {selectedEntry['Category'] || selectedEntry.category || selectedEntry.categoryId?.name}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                                        <div className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Regional Scope</div>
                                        <div className="font-bold text-gray-800 text-sm">
                                            {selectedEntry['Region'] || selectedEntry.region || selectedEntry.regionId?.name}
                                        </div>
                                        <div className="text-[11px] text-gray-500 font-medium tracking-tight">Standard Operating Mode</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-[9px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Detailed Specifications</div>
                                    <div className="p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl text-gray-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                                        {selectedEntry['Specification Details'] || selectedEntry.spec}
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex gap-2">
                                    <button
                                        onClick={() => {
                                            const id = selectedEntry._id;
                                            setSelectedEntry(null);
                                            setEditingEntryId(id);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all"
                                    >
                                        <MoreVertical className="w-3.5 h-3.5" />
                                        Edit Entry
                                    </button>
                                    <button
                                        onClick={() => {
                                            const id = selectedEntry._id;
                                            handleDelete(id);
                                            setSelectedEntry(null);
                                        }}
                                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-all border border-red-100"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
