'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Car,
    Layers,
    Settings,
    ArrowUpRight,
    Clock,
    ChevronRight,
    Search,
    AlertTriangle,
    RefreshCw,
    ClipboardCheck
} from 'lucide-react';

interface Stats {
    totalSpecs: number;
    totalModels: number;
    totalCategories: number;
    totalParts: number;
}

export default function DashboardPage() {
    const [data, setData] = useState<{ stats: Stats; recentActivity: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/dashboard/stats');
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setData(data);
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Connection failed');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (isLoading) return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <div className="text-gray-500 font-medium">Loading Dashboard...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-xl text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Connection Failed</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        We couldn't reach the database. This is usually due to missing IP Whitelisting in MongoDB Atlas.
                    </p>
                    <div className="mt-4 p-3 bg-red-50 rounded-xl text-[10px] text-red-600 font-mono break-all text-left">
                        {error}
                    </div>
                </div>
                <button
                    onClick={() => fetchStats()}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200"
                >
                    Try to Reconnect
                </button>
            </div>
        </div>
    );

    const cards = [
        { title: 'Total Specifications', value: data?.stats.totalSpecs, icon: FileText, color: 'bg-blue-500' },
        { title: 'Car Models', value: data?.stats.totalModels, icon: Car, color: 'bg-purple-500' },
        { title: 'Categories', value: data?.stats.totalCategories, icon: Layers, color: 'bg-orange-500' },
        { title: 'Part Records', value: data?.stats.totalParts, icon: Settings, color: 'bg-emerald-500' },
    ];

    const formatDuration = (s: number) => {
        if (!s) return '0s';
        if (s > 60) return `${Math.floor(s / 60)}m ${s % 60}s`;
        return `${s}s`;
    };

    const todayCards = [
        { title: "Today's Vehicles", value: data?.stats.todayVehicleCount || 0, icon: Car, color: 'bg-blue-600' },
        { title: "Today's Inspections", value: data?.stats.todayInspectionCount || 0, icon: ClipboardCheck, color: 'bg-emerald-600' },
        { title: "Avg Insp. Time", value: formatDuration(data?.stats.avgInspectionTime || 0), icon: Clock, color: 'bg-purple-600' },
    ];

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Overview</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Metrics for Spec Matrix infrastructure.</p>
                    </div>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        New Spec
                        <ArrowUpRight className="w-4 h-4" />
                    </a>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm text-center sm:text-left"
                        >
                            <div className="flex items-center justify-center sm:justify-start mb-2">
                                <div className={`${card.color} w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm`}>
                                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                            <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{card.title}</div>
                            <div className="text-xl sm:text-2xl font-black text-gray-900">{card.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Daily Stats Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-2 mb-6">
                    {todayCards.map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-gray-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-gray-800 text-center sm:text-left flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-center sm:justify-start mb-2">
                                <div className={`${card.color} w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-sm`}>
                                    <card.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-black text-gray-400 border-b border-gray-800 pb-1 mb-1 uppercase tracking-widest truncate">{card.title}</div>
                                <div className="text-xl sm:text-2xl font-black text-white">{card.value}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <h2 className="font-bold text-gray-900 text-sm sm:text-base">Recent Specs</h2>
                            </div>
                            <a href="/entries" className="text-[10px] sm:text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">Expand</a>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {data?.recentActivity.map((spec: { _id: string; 'Car Model': string; 'Variant': string; 'Part Name': string; 'Code': string;[key: string]: any }) => (
                                <div key={spec._id} className="p-3 sm:p-4 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 font-black text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors border border-gray-100">
                                            {spec['Car Model']?.[0] || spec.carModel?.[0] || (spec as any).carModelId?.name?.[0] || 'S'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-xs sm:text-sm">
                                                {spec['Car Model'] || spec.carModel || (spec as any).carModelId?.name} <span className="text-blue-600 font-medium">{spec['Variant'] || spec.variant || (spec as any).variantId?.name}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 uppercase font-medium">
                                                {spec['Part Name'] || spec.partName || (spec as any).partId?.name} • LP: {spec['Code'] || spec.code}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-gray-900 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Access */}
                    <div className="space-y-4 flex flex-col justify-start">
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-blue-600 p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-white relative overflow-hidden group"
                        >
                            <div className="relative z-10 space-y-1">
                                <h3 className="text-base font-bold">Plant Inspection Report</h3>
                                <p className="text-blue-100 text-[10px] opacity-70">Review completed vehicle checklists.</p>
                                <div className="pt-2">
                                    <a href="/inspections" className="inline-block bg-white text-blue-600 px-4 py-1.5 rounded-lg font-black text-xs shadow-lg active:scale-95 transition-all">View Reports</a>
                                </div>
                            </div>
                            <FileText className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-emerald-600 p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-white relative overflow-hidden group"
                        >
                            <div className="relative z-10 space-y-1">
                                <h3 className="text-base font-bold">Operator Portal</h3>
                                <p className="text-emerald-100 text-[10px] opacity-70">Start real-time spec checklist.</p>
                                <div className="pt-2">
                                    <a href="/checklist" className="inline-block bg-white text-emerald-600 px-4 py-1.5 rounded-lg font-black text-xs shadow-lg active:scale-95 transition-all">Start Portal</a>
                                </div>
                            </div>
                            <ClipboardCheck className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-white relative overflow-hidden group"
                        >
                            <div className="relative z-10 space-y-1">
                                <h3 className="text-base font-bold text-gray-100">Master Data Base</h3>
                                <p className="text-gray-400 text-[10px] opacity-80">Configure variants and parts.</p>
                                <div className="pt-2">
                                    <a href="/entries" className="inline-block bg-white text-gray-900 px-4 py-1.5 rounded-lg font-black text-xs shadow-lg active:scale-95 transition-all">Manage Data</a>
                                </div>
                            </div>
                            <Settings className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                        </motion.div>

                    </div>
                </div>
            </div>
        </main>
    );
}
