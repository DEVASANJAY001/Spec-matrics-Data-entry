'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit2, CheckCircle,
    XCircle, Eye, EyeOff, UserPlus, Save, X,
    Lock, User, Shield, AlertCircle, ChevronRight, Users, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WorkerManagement() {
    const [workers, setWorkers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingWorker, setEditingWorker] = useState<any>(null);
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        password: '',
        dob: '',
        restrictedPages: [] as string[],
    });

    const AVAILABLE_PAGES = [
        { id: '/dashboard', name: 'Dashboard', icon: Shield },
        { id: '/checklist', name: 'Spec Check List', icon: Shield },
        { id: '/inspections', name: 'Inspection Logs', icon: Shield },
        { id: '/travel-cards', name: 'Travel Card', icon: Shield },
        { id: '/entries', name: 'Master Data', icon: Shield },
        { id: '/master', name: 'New Entry', icon: Shield },
    ];

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            const res = await fetch('/api/admin/workers');
            if (res.ok) {
                const data = await res.json();
                setWorkers(data);
            }
        } catch (error) {
            toast.error('Failed to fetch workers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (worker: any) => {
        const newStatus = worker.status === 'active' ? 'deactivated' : 'active';
        try {
            const res = await fetch(`/api/admin/workers/${worker._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Worker ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
                fetchWorkers();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingWorker ? `/api/admin/workers/${editingWorker._id}` : '/api/admin/workers';
        const method = editingWorker ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingWorker ? 'Worker updated' : 'Worker created successfully');
                setShowModal(false);
                setEditingWorker(null);
                setFormData({ userId: '', name: '', password: '', dob: '', restrictedPages: [] });
                fetchWorkers();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save worker data');
            }
        } catch (error) {
            toast.error('Error saving worker profile');
        }
    };

    const openEditModal = (worker: any) => {
        setEditingWorker(worker);
        setFormData({
            userId: worker.userId,
            name: worker.name,
            password: '',
            dob: worker.dob ? new Date(worker.dob).toISOString().split('T')[0] : '',
            restrictedPages: worker.restrictedPages || [],
        });
        setShowModal(true);
    };

    const togglePasswordVisibility = (id: string) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredWorkers = workers.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto min-h-screen bg-[#f8fafc]">
            {/* Condensed Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-[#0f172a] tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Personnel Management
                    </h1>
                    <p className="text-slate-500 font-bold text-sm">
                        Manage worker accounts and platform access permissions.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative group flex-1 sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-bold text-slate-900 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => { setEditingWorker(null); setFormData({ userId: '', name: '', password: '', dob: '', restrictedPages: [] }); setShowModal(true); }}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg shadow-blue-100 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        New Worker
                    </button>
                </div>
            </div>

            {/* Compact Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto text-slate-900">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] border-b border-slate-100">Profile</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] border-b border-slate-100">Credentials</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] border-b border-slate-100 text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] border-b border-slate-100">Restrictions</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] border-b border-slate-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                                            <span className="text-slate-400 font-bold text-xs tracking-widest uppercase">Fetching Records</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredWorkers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 py-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-1">
                                                <Users className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <span className="text-slate-400 font-bold text-base uppercase tracking-tight">No records found</span>
                                            <button onClick={() => setSearchQuery('')} className="text-blue-600 text-xs font-bold hover:underline">Clear search filters</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredWorkers.map((worker, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        key={worker._id}
                                        className="hover:bg-slate-50 transition-all group"
                                    >
                                        <td className="px-6 py-3 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-base border border-white shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {worker.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#0f172a] group-hover:text-blue-700 transition-colors uppercase tracking-tight text-sm">{worker.name}</div>
                                                    <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 uppercase tracking-wider mt-0.5">
                                                        <span className="text-slate-500">ID: {worker.userId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 border-b border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-slate-100 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold text-slate-700 border border-transparent group-hover:bg-white group-hover:border-slate-200 transition-all">
                                                    {showPasswords[worker._id] ? worker.plainPassword : '••••••••'}
                                                </div>
                                                <button
                                                    onClick={() => togglePasswordVisibility(worker._id)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200 text-slate-400 hover:text-blue-600 active:scale-90"
                                                >
                                                    {showPasswords[worker._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-center border-b border-slate-50">
                                            <button
                                                onClick={() => handleToggleStatus(worker)}
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${worker.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100'
                                                    }`}
                                            >
                                                {worker.status === 'active' ? (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                                ) : (
                                                    <XCircle className="w-3 h-3" />
                                                )}
                                                {worker.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-3 border-b border-slate-50">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {worker.restrictedPages?.length > 0 ? (
                                                    worker.restrictedPages.map((page: string) => (
                                                        <span key={page} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold border border-indigo-100 uppercase">
                                                            {AVAILABLE_PAGES.find(p => p.id === page)?.name || page}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-tight">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Unlimited
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right border-b border-slate-50">
                                            <button
                                                onClick={() => openEditModal(worker)}
                                                className="w-8 h-8 inline-flex items-center justify-center text-slate-400 hover:text-blue-700 hover:bg-blue-50 bg-slate-100 rounded-lg transition-all border border-transparent hover:border-blue-100"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Summary */}
                {!isLoading && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Total records identified: {filteredWorkers.length}
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{workers.filter(w => w.status === 'active').length} Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{workers.filter(w => w.status !== 'active').length} Offline</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Compact Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                                <div className="space-y-0.5">
                                    <h2 className="text-xl font-black text-[#0f172a] flex items-center gap-2">
                                        {editingWorker ? 'Configure Profile' : 'Onboard Worker'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {editingWorker ? `Worker ID: ${editingWorker.userId}` : 'Complete identity setup'}
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-blue-600" />
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Identity</h3>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 ml-0.5">Full Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g. John Doe"
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 ml-0.5">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm"
                                                    value={formData.dob}
                                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-3.5 h-3.5 text-indigo-600" />
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Security</h3>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 ml-0.5">Worker Identifier</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="ST-XXXXX"
                                                    disabled={!!editingWorker}
                                                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm disabled:opacity-60 cursor-not-allowed"
                                                    value={formData.userId}
                                                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5 ml-0.5">{editingWorker ? 'Reset Secret' : 'Access Secret'}</label>
                                                <input
                                                    required={!editingWorker}
                                                    type="text"
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Access Restrictions</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {AVAILABLE_PAGES.map(page => {
                                            const isRestricted = formData.restrictedPages.includes(page.id);
                                            return (
                                                <label
                                                    key={page.id}
                                                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${isRestricted
                                                            ? 'border-rose-300 bg-rose-50'
                                                            : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded text-rose-600 border-slate-300"
                                                        checked={isRestricted}
                                                        onChange={(e) => {
                                                            const pages = e.target.checked
                                                                ? [...formData.restrictedPages, page.id]
                                                                : formData.restrictedPages.filter(p => p !== page.id);
                                                            setFormData({ ...formData, restrictedPages: pages });
                                                        }}
                                                    />
                                                    <div className="space-y-0.5">
                                                        <span className={`text-[10px] font-black uppercase tracking-tight block transition-colors ${isRestricted ? 'text-rose-700' : 'text-slate-700'}`}>
                                                            {page.name}
                                                        </span>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 border border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f8fafc;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #cbd5e1;
              }
            `}</style>
        </div>
    );
}
