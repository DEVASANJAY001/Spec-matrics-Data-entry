'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Printer, Calendar, FileText, Filter, Loader2, ChevronRight, Car, Package, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';

interface Inspection {
    _id: string;
    vin: string;
    lcdv: string;
    carModel: string;
    code: string;
    inspector: string;
    totalCorrect: number;
    totalWrong: number;
    createdAt: string;
}

export default function TravelCardsListPage() {
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterBy, setFilterBy] = useState('all'); // all | passed | failed

    useEffect(() => {
        const fetchInspections = async () => {
            try {
                const res = await fetch('/api/inspection/history');
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setInspections(data);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load inspections');
            } finally {
                setLoading(false);
            }
        };
        fetchInspections();
    }, []);

    const filtered = useMemo(() => {
        let list = [...inspections];
        if (filterBy === 'passed') list = list.filter(i => i.totalWrong === 0);
        if (filterBy === 'failed') list = list.filter(i => i.totalWrong > 0);

        const q = search.trim().toUpperCase();
        if (q) {
            list = list.filter(i =>
                (i.vin || '').toUpperCase().includes(q) ||
                (i.lcdv || '').toUpperCase().includes(q) ||
                (i.code || '').toUpperCase().includes(q) ||
                (i.carModel || '').toUpperCase().includes(q)
            );
        }
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [inspections, search, filterBy]);

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-right" />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                            <Printer className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Travel Cards</h1>
                            <p className="text-gray-500 text-sm font-medium">Browse, search, and print professional quality travel cards for all inspections.</p>
                        </div>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[280px]">
                        <input
                            type="text"
                            placeholder="Search by VIN, Model, LCDV or Code..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-gray-400"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    </div>

                    <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        {['all', 'passed', 'failed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilterBy(f)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filterBy === f
                                        ? "bg-white text-emerald-600 shadow-sm border border-emerald-50"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {f === 'all' ? 'All Records' : f}
                            </button>
                        ))}
                    </div>

                    <button className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl border border-gray-100 transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-600" />
                        <p className="font-black uppercase tracking-widest text-xs">Fetching Inspections...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((entry, idx) => (
                                <motion.a
                                    key={entry._id}
                                    href={`/travel-card/${entry._id}`}
                                    target="_blank"
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100 hover:border-emerald-100 transition-all duration-300 overflow-hidden"
                                >
                                    {/* Action Decorator */}
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                                            <Printer className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                <Car className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{entry.vin || 'NO VIN'}</h3>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Model</span>
                                                <span className="text-xs font-black text-gray-900">{entry.carModel}</span>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Code</span>
                                                <span className="text-xs font-black text-blue-600">{entry.code || '—'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                                    entry.totalWrong === 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                )}>
                                                    {entry.totalWrong === 0 ? 'Passed' : `${entry.totalWrong} Found`}
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400">by {entry.inspector || 'System'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                                                <span>Preview</span>
                                                <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.a>
                            ))}
                        </AnimatePresence>

                        {!loading && filtered.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center text-gray-400">
                                <FileText className="w-16 h-16 opacity-10 mb-4" />
                                <p className="font-black uppercase tracking-widest text-sm">No Travel Cards match your search</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
