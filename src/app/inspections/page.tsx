'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Eye, Trash2, Calendar, X, FileSearch, AlertTriangle,
    ClipboardCheck, Check, Loader2, Timer, BarChart2, Car, TrendingUp,
    TrendingDown, Minus, ChevronUp, ChevronDown, Filter, Printer
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';

function formatDuration(s: number) {
    if (!s || s === 0) return '—';
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

export default function InspectionsPage() {
    const [inspections, setInspections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // all | today | week | month
    const [resultFilter, setResultFilter] = useState('all'); // all | passed | failed
    const [sortBy, setSortBy] = useState<'date' | 'duration' | 'result'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) fetchInspections();
    }, [isMounted]);

    const fetchInspections = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/inspection/history');
            const data = await res.json();
            if (data.error) { setError(data.error); setInspections([]); }
            else setInspections(data);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this inspection record?')) return;
        const t = toast.loading('Deleting...');
        try {
            const res = await fetch(`/api/inspection/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Deleted', { id: t });
            setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            fetchInspections();
            if (selectedEntry?._id === id) setSelectedEntry(null);
        } catch (e: any) { toast.error(e.message, { id: t }); }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} selected inspection(s)?`)) return;
        setIsBulkDeleting(true);
        const t = toast.loading(`Deleting ${selectedIds.size} records...`);
        try {
            await Promise.all([...selectedIds].map(id => fetch(`/api/inspection/${id}`, { method: 'DELETE' })));
            toast.success(`Deleted ${selectedIds.size} records`, { id: t });
            setSelectedIds(new Set());
            fetchInspections();
        } catch (e: any) { toast.error(e.message, { id: t }); }
        finally { setIsBulkDeleting(false); }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(e => e._id)));
        }
    };

    const handleStatusToggle = (itemIdx: number) => {
        if (!selectedEntry) return;
        const updated = { ...selectedEntry };
        updated.items[itemIdx].status = updated.items[itemIdx].status === 'correct' ? 'wrong' : 'correct';
        setSelectedEntry(updated);
    };

    const handleView = async (id: string) => {
        const t = toast.loading('Loading report details...');
        try {
            const res = await fetch(`/api/inspection/${id}`);
            if (!res.ok) throw new Error('Failed to load details');
            const data = await res.json();
            setSelectedEntry(data);
            toast.dismiss(t);
        } catch (e: any) { toast.error(e.message, { id: t }); }
    };

    const handleSave = async () => {
        if (!selectedEntry) return;
        if (!confirm('Are you sure you want to save these changes?')) return;
        setIsSubmitting(true);
        const t = toast.loading('Saving...');
        try {
            const res = await fetch(`/api/inspection/${selectedEntry._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedEntry)
            });
            if (!res.ok) throw new Error('Failed to save');
            toast.success('Saved!', { id: t });
            fetchInspections();
            setSelectedEntry(null);
        } catch (e: any) { toast.error(e.message, { id: t }); }
        finally { setIsSubmitting(false); }
    };

    // --- Analytics ---
    const analytics = useMemo(() => {
        if (!inspections.length) return null;
        const total = inspections.length;
        const passed = inspections.filter(i => i.totalWrong === 0).length;
        const withTime = inspections.filter(i => i.duration > 0);
        const avgTime = withTime.length > 0
            ? Math.round(withTime.reduce((s, i) => s + i.duration, 0) / withTime.length)
            : 0;
        const fastest = withTime.length > 0 ? Math.min(...withTime.map(i => i.duration)) : 0;
        const slowest = withTime.length > 0 ? Math.max(...withTime.map(i => i.duration)) : 0;
        return { total, passed, failed: total - passed, avgTime, fastest, slowest, passRate: Math.round((passed / total) * 100) };
    }, [inspections]);

    // --- Filter + Sort ---
    const filtered = useMemo(() => {
        let list = [...inspections];

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            list = list.filter(i => {
                const d = new Date(i.createdAt);
                if (dateFilter === 'today') return d.toDateString() === now.toDateString();
                if (dateFilter === 'week') return (now.getTime() - d.getTime()) < 7 * 86400000;
                if (dateFilter === 'month') return (now.getTime() - d.getTime()) < 30 * 86400000;
                return true;
            });
        }

        // Result filter
        if (resultFilter === 'passed') list = list.filter(i => i.totalWrong === 0);
        if (resultFilter === 'failed') list = list.filter(i => i.totalWrong > 0);

        // Search
        const q = search.trim().toUpperCase();
        if (q) list = list.filter(i =>
            (i.vin || '').toUpperCase().includes(q) ||
            (i.lcdv || '').toUpperCase().includes(q) ||
            (i.code || '').toUpperCase().includes(q)
        );

        // Sort
        list.sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sortBy === 'duration') cmp = (a.duration || 0) - (b.duration || 0);
            if (sortBy === 'result') cmp = (a.totalWrong || 0) - (b.totalWrong || 0);
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return list;
    }, [inspections, search, dateFilter, resultFilter, sortBy, sortDir]);

    function toggleSort(col: 'date' | 'duration' | 'result') {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('desc'); }
    }

    function SortIcon({ col }: { col: 'date' | 'duration' | 'result' }) {
        if (sortBy !== col) return <ChevronUp className="w-3 h-3 text-gray-300" />;
        return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />;
    }

    if (!isMounted) return null;

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto space-y-5">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Plant Inspection Report</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Flexible analytics and history for all vehicle inspections.</p>
                    </div>
                    <a href="/checklist" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                        <ClipboardCheck className="w-4 h-4" />
                        New Inspection
                    </a>
                </header>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Total Records', value: analytics.total, icon: FileSearch, color: 'bg-gray-900 text-white', text: 'text-white', sub: 'text-gray-400' },
                            { label: 'Passed', value: analytics.passed, icon: Check, color: 'bg-emerald-500 text-white', text: 'text-white', sub: 'text-emerald-100' },
                            { label: 'Failed', value: analytics.failed, icon: X, color: 'bg-red-500 text-white', text: 'text-white', sub: 'text-red-100' },
                            { label: 'Avg Time', value: formatDuration(analytics.avgTime), icon: Timer, color: 'bg-blue-600 text-white', text: 'text-white', sub: 'text-blue-100' },
                            { label: 'Fastest', value: formatDuration(analytics.fastest), icon: TrendingUp, color: 'bg-purple-600 text-white', text: 'text-white', sub: 'text-purple-100' },
                            { label: 'Slowest', value: formatDuration(analytics.slowest), icon: TrendingDown, color: 'bg-orange-500 text-white', text: 'text-white', sub: 'text-orange-100' },
                        ].map((c, i) => (
                            <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className={`${c.color} p-4 rounded-2xl relative overflow-hidden`}>
                                <c.icon className="absolute -bottom-2 -right-2 w-12 h-12 opacity-10" />
                                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${c.sub}`}>{c.label}</p>
                                <p className={`text-2xl font-black ${c.text}`}>{c.value}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[180px]">
                            <input type="text" placeholder="Search VIN, LCDV, Code..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase" />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        </div>

                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                            {(['all', 'today', 'week', 'month'] as const).map(d => (
                                <button key={d} onClick={() => setDateFilter(d)}
                                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        dateFilter === d ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-100')}>
                                    {d === 'all' ? 'All Time' : d === 'today' ? 'Today' : d === 'week' ? '7 Days' : '30 Days'}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                            {(['all', 'passed', 'failed'] as const).map(r => (
                                <button key={r} onClick={() => setResultFilter(r)}
                                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                        resultFilter === r
                                            ? r === 'passed' ? 'bg-emerald-600 text-white' : r === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
                                            : 'text-gray-500 hover:bg-gray-100')}>
                                    {r}
                                </button>
                            ))}
                        </div>

                        <button onClick={fetchInspections} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-1.5">
                            <Filter className="w-3 h-3" /> Refresh
                        </button>

                        {/* Bulk Delete */}
                        {selectedIds.size > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-lg shadow-red-200 disabled:opacity-50">
                                {isBulkDeleting
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <Trash2 className="w-3 h-3" />}
                                Delete {selectedIds.size} Selected
                            </motion.button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-red-900">Database Error</div>
                                <div className="text-[10px] text-red-600 font-mono">{error}</div>
                            </div>
                        </div>
                        <button onClick={fetchInspections} className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all">Retry</button>
                    </div>
                )}

                {/* Table */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 animate-pulse">
                        <FileSearch className="w-10 h-10 mb-3" />
                        <div className="font-bold uppercase tracking-widest text-[10px]">Loading Reports...</div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="pl-4 py-3 w-10">
                                            <input type="checkbox"
                                                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                                checked={filtered.length > 0 && selectedIds.size === filtered.length}
                                                onChange={toggleSelectAll} />
                                        </th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicle</th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => toggleSort('result')}>
                                            <span className="inline-flex items-center gap-1">Result <SortIcon col="result" /></span>
                                        </th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => toggleSort('duration')}>
                                            <span className="inline-flex items-center gap-1">Time Taken <SortIcon col="duration" /></span>
                                        </th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => toggleSort('date')}>
                                            <span className="inline-flex items-center gap-1">Date <SortIcon col="date" /></span>
                                        </th>
                                        <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map((entry, i) => {
                                        const avgTime = analytics?.avgTime || 0;
                                        const dur = entry.duration || 0;
                                        const diff = avgTime > 0 && dur > 0 ? dur - avgTime : null;
                                        return (
                                            <motion.tr key={entry._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={cn("group transition-colors", selectedIds.has(entry._id) ? "bg-blue-50" : "hover:bg-blue-50/30")}>
                                                <td className="pl-4 py-3 w-10">
                                                    <input type="checkbox"
                                                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                                        checked={selectedIds.has(entry._id)}
                                                        onChange={() => toggleSelect(entry._id)} />
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="font-bold text-gray-900 text-sm font-mono">{entry.vin || '—'}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">{entry.lcdv || '—'}</div>
                                                </td>
                                                <td className="px-5 py-3 text-xs font-black text-blue-600">{entry.code || '—'}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider w-fit",
                                                            entry.totalWrong === 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200")}>
                                                            {entry.totalWrong === 0
                                                                ? <><Check className="w-2.5 h-2.5" /> Passed</>
                                                                : <><X className="w-2.5 h-2.5" /> {entry.totalWrong} Wrong</>
                                                            }
                                                        </span>
                                                        <span className="text-[9px] text-gray-400">✓ {entry.totalCorrect} Correct</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-black text-gray-800 font-mono">{formatDuration(dur)}</span>
                                                        {diff !== null && (
                                                            <span className={cn("text-[9px] font-bold flex items-center gap-0.5",
                                                                diff > 0 ? 'text-red-500' : diff < 0 ? 'text-emerald-500' : 'text-gray-400')}>
                                                                {diff > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : diff < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                                                                {diff > 0 ? `+${diff}s vs avg` : diff < 0 ? `${diff}s vs avg` : 'On average'}
                                                            </span>
                                                        )}
                                                        {entry.startedAt && entry.endedAt && (
                                                            <span className="text-[8px] text-gray-400 font-mono">
                                                                {new Date(entry.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} → {new Date(entry.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="text-xs font-bold text-gray-800">{new Date(entry.createdAt).toLocaleDateString()}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    {entry.updatedAt && new Date(entry.updatedAt).getTime() - new Date(entry.createdAt).getTime() > 1000 && (
                                                        <div className="mt-1.5 flex flex-col gap-0.5">
                                                            <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-1 py-0.5 rounded border border-amber-100 w-fit">Edited</span>
                                                            <span className="text-[8px] text-gray-400 font-bold">
                                                                {new Date(entry.updatedAt).toLocaleDateString()} {new Date(entry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => handleView(entry._id)}
                                                            className="p-1.5 hover:bg-blue-100 text-gray-400 hover:text-blue-600 rounded-lg transition-all" title="View">
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {filtered.length === 0 && (
                                <div className="flex flex-col items-center py-16 text-gray-400">
                                    <BarChart2 className="w-10 h-10 mb-3 opacity-30" />
                                    <div className="font-bold uppercase tracking-widest text-[10px]">{inspections.length === 0 ? 'No inspections yet' : 'No results found'}</div>
                                </div>
                            )}
                        </div>

                        {/* Footer summary */}
                        {filtered.length > 0 && (
                            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Showing {filtered.length} of {inspections.length} records</span>
                                {analytics && <span>Pass Rate: {analytics.passRate}%</span>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedEntry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedEntry(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                            {/* Modal Header */}
                            <div className="p-5 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-start shrink-0">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Inspection Report</h3>
                                    <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap items-center gap-3">
                                        <span><Calendar className="w-3 h-3 inline mr-1" />{new Date(selectedEntry.createdAt).toLocaleString()}</span>
                                        {selectedEntry.updatedAt && (
                                            <span className="text-gray-300">| Last Edited: {new Date(selectedEntry.updatedAt).toLocaleString()}</span>
                                        )}
                                        {selectedEntry.duration > 0 && (
                                            <span className="bg-gray-800 text-gray-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                                <Timer className="w-3 h-3" /> {formatDuration(selectedEntry.duration)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="flex-1 overflow-auto p-5 space-y-5 bg-gray-50/50">
                                {/* Vehicle Summary */}
                                <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    {[
                                        { label: 'VIN', value: selectedEntry.vin || '—', mono: true },
                                        { label: 'LCDV', value: selectedEntry.lcdv || '—', mono: true },
                                        { label: 'Code', value: selectedEntry.code || '—', mono: false, blue: true }
                                    ].map(f => (
                                        <div key={f.label}>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{f.label}</p>
                                            <p className={cn("text-xs font-bold", f.mono ? 'font-mono text-gray-900' : f.blue ? 'text-blue-600' : 'text-gray-900')}>{f.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Result Summary Cards */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Correct</p>
                                        <p className="text-2xl font-black text-emerald-700">{selectedEntry.totalCorrect || 0}</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-center">
                                        <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Wrong</p>
                                        <p className="text-2xl font-black text-red-700">{selectedEntry.totalWrong || 0}</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Time</p>
                                        <p className="text-xl font-black text-blue-700">{formatDuration(selectedEntry.duration)}</p>
                                    </div>
                                </div>

                                {/* Item List */}
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Checklist Items</h4>
                                    {selectedEntry.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-100 hover:bg-gray-50 rounded-xl transition-colors">
                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400 shrink-0">{idx + 1}</div>
                                            {item.image && (
                                                <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-gray-900 truncate">{item.partName}</div>
                                                {item.spec && <div className="text-[9px] text-gray-400 truncate">{item.spec}</div>}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => handleStatusToggle(idx)}
                                                    className={cn("px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                                        item.status === 'correct' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400 hover:bg-emerald-50")}>
                                                    ✓ OK
                                                </button>
                                                <button onClick={() => handleStatusToggle(idx)}
                                                    className={cn("px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                                                        item.status === 'wrong' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-400 hover:bg-red-50")}>
                                                    ✗ No
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t border-gray-100 flex gap-3 shrink-0">
                                <button onClick={handleSave} disabled={isSubmitting}
                                    className="flex-[2] py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                </button>
                                <button onClick={() => handleDelete(selectedEntry._id)} disabled={isSubmitting}
                                    className="flex-1 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 border border-red-100 transition-all flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
