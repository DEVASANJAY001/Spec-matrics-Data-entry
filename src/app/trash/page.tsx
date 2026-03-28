'use client';

import React, { useState, useEffect } from 'react';
import {
    Trash2,
    RotateCcw,
    Calendar,
    Search,
    Archive,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Database,
    FileText,
    History,
    ChevronRight,
    XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface TrashItem {
    _id: string;
    originalId: string;
    collectionName: 'specifications' | 'inspections';
    type: 'Master' | 'Log';
    identifier: string;
    deletedAt: string;
    data: any;
}

export default function TrashPage() {
    const [items, setItems] = useState<TrashItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchTrash();
    }, []);

    const fetchTrash = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/trash');
            const data = await res.json();
            if (Array.isArray(data)) {
                setItems(data);
            }
        } catch (err) {
            toast.error('Failed to load trash items');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async (id: string) => {
        setIsActionLoading(id);
        const loadingToast = toast.loading('Restoring item...');
        try {
            const res = await fetch('/api/trash/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                toast.success('Item restored successfully', { id: loadingToast });
                setItems(prev => prev.filter(item => item._id !== id));
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to restore');
            }
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this item? This cannot be undone.')) return;

        setIsActionLoading(id);
        const loadingToast = toast.loading('Deleting permanently...');
        try {
            const res = await fetch(`/api/trash/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Permanently deleted', { id: loadingToast });
                setItems(prev => prev.filter(item => item._id !== id));
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to clear the entire trash? ALL items will be permanently deleted!')) return;

        const loadingToast = toast.loading('Clearing trash...');
        try {
            const res = await fetch('/api/trash', { method: 'DELETE' });
            if (res.ok) {
                toast.success('Trash cleared', { id: loadingToast });
                setItems([]);
            } else {
                throw new Error('Failed to clear trash');
            }
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        }
    };

    const filteredItems = items.filter(item =>
        item.identifier.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 pb-20">
            <Toaster position="top-right" />

            <div className="max-w-5xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex p-3 bg-red-600 rounded-2xl text-white shadow-xl shadow-red-100 mb-4 animate-pulse-slow">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Trash</h1>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                            Deleted items are kept here for 7 days before permanent removal.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClearAll}
                            disabled={items.length === 0}
                            className="px-6 py-3 bg-white border-2 border-red-50 hover:bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    </div>
                </header>

                <div className="bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-50">
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by identifier or type..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold placeholder:text-gray-400"
                            />
                        </div>

                        <div className="flex items-center gap-6 px-4">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Items</span>
                                <span className="text-lg font-black text-gray-900">{items.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="min-h-[400px] p-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Retrieving Trash...</span>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-gray-300">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <Archive className="w-10 h-10 opacity-20" />
                                </div>
                                <span className="text-sm font-black uppercase tracking-[0.2em]">{search ? 'No matches found' : 'Trash is empty'}</span>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Check back later for deleted items</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2">
                                <AnimatePresence mode='popLayout'>
                                    {filteredItems.map((item) => (
                                        <motion.div
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="group bg-white hover:bg-gray-50/50 border border-gray-100 rounded-[2rem] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                                    item.type === 'Master' ? "bg-amber-500 text-white shadow-amber-100" : "bg-blue-600 text-white shadow-blue-100"
                                                )}>
                                                    {item.type === 'Master' ? <Database className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                                                            item.type === 'Master' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                                        )}>
                                                            {item.type} Data
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            Deleted {new Date(item.deletedAt).toLocaleString('en-IN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-sm font-black text-gray-900 uppercase">
                                                        {item.identifier}
                                                    </h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                        From: {item.collectionName}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRestore(item._id)}
                                                    disabled={isActionLoading !== null}
                                                    className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                >
                                                    {isActionLoading === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                                    Restore
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={isActionLoading !== null}
                                                    className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-[1.2rem] transition-all disabled:opacity-50"
                                                    title="Permanently Delete"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex gap-4 items-start">
                    <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-100">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Security & Privacy Policy</h4>
                        <p className="text-xs font-bold text-amber-700/80 leading-relaxed uppercase tracking-tight">
                            Deletion of records is semi-permanent. Data moved to trash will be automatically purged after 7 days to maintain database health. Once purged, data cannot be recovered.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
