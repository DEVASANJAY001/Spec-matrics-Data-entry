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
    History,
    FileSearch,
    AlertTriangle,
    ClipboardCheck,
    ChevronRight,
    ChevronDown,
    Layers,
    Globe,
    Car,
    Hash
} from 'lucide-react';
import SpecificationForm from '@/components/SpecificationForm';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const SafeImage = ({ src, alt, className, fallback, onClick }: { src?: string, alt?: string, className?: string, fallback?: React.ReactNode, onClick?: (e: any) => void }) => {
    const [error, setError] = useState(!src);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => setError(!src), [src]);
    if (error) return <>{fallback}</>;
    return (
        <div className={cn("relative", className)}>
            <img
                src={src}
                alt={alt}
                className={cn(className, isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300")}
                onClick={onClick}
                onLoad={() => setIsLoading(false)}
                onError={() => setError(true)}
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};

export default function EntriesPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recentEntries, setRecentEntries] = useState<any[]>([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [stats, setStats] = useState<any>({ codes: {}, models: {}, variants: {}, regions: {}, categories: {} });
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [expandedStat, setExpandedStat] = useState<string | null>(null);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            fetchEntries();
            fetchRecent();
        }
    }, [isMounted]);


    const fetchRecent = async () => {
        setIsLoadingRecent(true);
        try {
            const res = await fetch('/api/specifications?limit=10');
            const data = await res.json();
            if (Array.isArray(data)) setRecentEntries(data);
        } catch (e) {
            console.error('Failed to fetch recent:', e);
        } finally {
            setIsLoadingRecent(false);
        }
    };

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

    useEffect(() => {
        if (entries.length > 0) {
            const s = { codes: {}, models: {}, variants: {}, regions: {}, categories: {} } as any;
            entries.forEach(e => {
                const code = e['Code'] || 'N/A';
                const model = e['Car Model'] || 'N/A';
                const variant = e['Variant'] || 'N/A';
                const region = e['Region'] || 'N/A';
                const cat = e['Category'] || 'N/A';

                s.codes[code] = (s.codes[code] || 0) + 1;
                s.models[model] = (s.models[model] || 0) + 1;
                s.variants[variant] = (s.variants[variant] || 0) + 1;
                s.regions[region] = (s.regions[region] || 0) + 1;
                s.categories[cat] = (s.categories[cat] || 0) + 1;
            });
            setStats(s);
        }
    }, [entries]);

    const handleStatClick = (type: string, value: string) => {
        setSearch(value);
        fetchEntries(value);
        setActiveFilter(value);
    };

    const clearFilter = () => {
        setSearch('');
        fetchEntries('');
        setActiveFilter(null);
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
            fetchRecent();
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        }
    };

    const handleDeleteCode = async (code: string) => {
        const count = stats.codes[code] || 0;
        if (!confirm(`WARNING: This will delete ALL ${count} specifications and parts for car code "${code}". [${count} parts will be removed]. Are you sure you want to continue?`)) return;

        const loadingToast = toast.loading(`Deleting all ${count} entries for ${code}...`);
        try {
            const res = await fetch(`/api/specifications/bulk-delete?code=${encodeURIComponent(code)}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete code');
            toast.success(data.message || `Deleted ${data.deletedCount} entries`, { id: loadingToast });
            clearFilter();
        } catch (error: any) {
            toast.error(error.message, { id: loadingToast });
        }
    };

    if (!isMounted) return null;

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Logs</h1>
                            <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Master Data Management</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                placeholder="Quick Search..."
                                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-bold"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        </form>
                        <div className="flex gap-2">
                            <a href="/checklist" className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95">
                                <ClipboardCheck className="w-4 h-4" />
                                Start Inspection
                            </a>
                            <button onClick={handleSearch} className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95">
                                Filter
                            </button>
                        </div>
                    </div>
                </header>

                {/* Interactive Summary Dashboard */}
                <section className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
                    {[
                        { label: 'Codes', key: 'codes', icon: Hash, color: 'blue' },
                        { label: 'Models', key: 'models', icon: Car, color: 'emerald' },
                        { label: 'Variants', key: 'variants', icon: Layers, color: 'amber' },
                        { label: 'Regions', key: 'regions', icon: Globe, color: 'indigo' },
                        { label: 'Categories', key: 'categories', icon: ClipboardCheck, color: 'rose' },
                    ].map((stat) => (
                        <div key={stat.key} className="flex flex-col gap-2">
                            <button
                                onClick={() => setExpandedStat(expandedStat === stat.key ? null : stat.key)}
                                className={cn(
                                    "p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all text-left group hover:border-blue-200",
                                    expandedStat === stat.key && "ring-2 ring-blue-500/10 border-blue-200"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={cn("p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:text-blue-600 transition-colors bg-opacity-50",
                                        stat.color === 'blue' && "text-blue-600",
                                        stat.color === 'emerald' && "text-emerald-600",
                                        stat.color === 'amber' && "text-amber-600",
                                        stat.color === 'indigo' && "text-indigo-600",
                                        stat.color === 'rose' && "text-rose-600"
                                    )}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    {expandedStat === stat.key ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                </div>
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                <div className="text-xl font-black text-gray-900 tracking-tight">{Object.keys(stats[stat.key]).length}</div>
                            </button>

                            <AnimatePresence>
                                {expandedStat === stat.key && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-lg p-2 max-h-48 overflow-y-auto z-10 scrollbar-hide"
                                    >
                                        {Object.entries(stats[stat.key]).map(([val, count]: any) => (
                                            <button
                                                key={val}
                                                onClick={() => handleStatClick(stat.key, val)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-2.5 rounded-xl text-[10px] font-bold text-left hover:bg-gray-50 transition-colors uppercase tracking-tight",
                                                    activeFilter === val ? "bg-blue-50 text-blue-700" : "text-gray-600"
                                                )}
                                            >
                                                <span className="truncate pr-2">{val}</span>
                                                <span className="shrink-0 px-1.5 py-0.5 bg-gray-100 rounded-md text-[8px] font-black text-gray-500">{count}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </section>

                {activeFilter && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between p-3 bg-blue-600 rounded-2xl shadow-lg border border-blue-500 shadow-blue-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Search className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-white">
                                <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Active Filter:</span>
                                <div className="text-xs font-black uppercase">{activeFilter}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearFilter}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all active:scale-95"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Latest 10 Entries Carousel */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Latest 10 Entries</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
                        {isLoadingRecent ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="min-w-[200px] h-[80px] bg-white rounded-2xl border border-gray-100 animate-pulse" />
                            ))
                        ) : recentEntries.length > 0 ? (
                            recentEntries.map((entry, i) => (
                                <motion.div
                                    key={entry._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedEntry(entry)}
                                    className="min-w-[240px] bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-50 overflow-hidden shrink-0">
                                            <SafeImage
                                                src={`/api/specifications/${entry._id}/image`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                fallback={<div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-[10px]">M</div>}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[8px] font-black text-blue-600 uppercase tracking-tight truncate mb-0.5">{entry['Region']}</div>
                                            <h4 className="text-[11px] font-black text-gray-900 truncate tracking-tight">{entry['Part Name']}</h4>
                                            <div className="text-[9px] text-gray-400 font-bold truncate">{entry['Code']}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex-1 py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                No history found
                            </div>
                        )}
                    </div>
                </section>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-red-900 leading-none mb-1">Database Error</div>
                                <div className="text-[10px] text-red-600 font-medium font-mono truncate max-w-[200px]">{error}</div>
                            </div>
                        </div>
                        <button onClick={() => fetchEntries()} className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl">Retry</button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FileSearch className="w-10 h-10 mb-3 animate-bounce" />
                        <div className="font-black uppercase tracking-widest text-[10px]">Syncing Logs...</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity & Proof</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Classification</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Production Scope</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {entries.map((entry, i) => (
                                            <motion.tr
                                                key={entry._id}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="group hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 group-hover:scale-110 transition-transform">
                                                            <SafeImage
                                                                src={`/api/specifications/${entry._id}/image`}
                                                                className="w-full h-full object-cover"
                                                                fallback={<div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-[10px]">M</div>}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-black text-gray-900 text-sm tracking-tight">{entry['Code']}</div>
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate max-w-[200px]">{entry['Specification Details']}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-black text-gray-900 tracking-tight">
                                                        {entry['Car Model']} <span className="text-blue-600">{entry['Variant']}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                                        {entry['Part Name']} • {entry['Category']}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                                                        {entry['Region']}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => setSelectedEntry(entry)} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all"><Eye className="w-4 h-4" /></button>
                                                        <button onClick={() => setEditingEntryId(entry._id)} className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-600 rounded-xl transition-all"><MoreVertical className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(entry._id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {entries.map((entry, i) => (
                                <motion.div
                                    key={entry._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                                <SafeImage
                                                    src={`/api/specifications/${entry._id}/image`}
                                                    className="w-full h-full object-cover"
                                                    fallback={<div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-xs">M</div>}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{entry['Code']}</div>
                                                <h3 className="text-sm font-black text-gray-900 tracking-tight">{entry['Part Name']}</h3>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => setSelectedEntry(entry)} className="p-2 bg-gray-50 text-gray-400 rounded-lg"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => setEditingEntryId(entry._id)} className="p-2 bg-gray-50 text-gray-400 rounded-lg"><MoreVertical className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-gray-50 rounded-xl">
                                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Vehicle</div>
                                            <div className="text-[10px] font-black text-gray-800 truncate">{entry['Car Model']}</div>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-xl">
                                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Region</div>
                                            <div className="text-[10px] font-black text-gray-800 truncate">{entry['Region']}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(entry._id)}
                                        className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-100"
                                    >
                                        Delete Entry
                                    </button>
                                </motion.div>
                            ))}
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
                                <SafeImage
                                    src={`/api/specifications/${selectedEntry._id}/image`}
                                    className="w-full h-full object-contain p-4"
                                    fallback={<div className="w-full h-full flex items-center justify-center text-gray-100 -rotate-6 font-black text-4xl sm:text-6xl tracking-tighter uppercase opacity-40">SPEC MATRIX</div>}
                                />
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
        </main >
    );
}
