'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Check,
    X,
    Search,
    Plus,
    Trash2,
    ClipboardCheck,
    History,
    BarChart3,
    Save,
    RotateCcw,
    Loader2,
    AlertCircle,
    ChevronDown,
    MoreHorizontal,
    ArrowRight,
    Package,
    Camera,
    FileImage,
    ImageIcon,
    ChevronLeft,
    ChevronRight,
    Timer,
    ChevronsUpDown,
    Clipboard as LucideClipboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Autocomplete from '@/components/Autocomplete';
import { cn } from '@/lib/utils';
import { saveRecentEntry, getRecentEntries } from '@/lib/recent-entries';
import { compressImage } from '@/lib/imageCompression';

const SafeImage = ({ src, alt, className, fallback, onClick }: { src?: string, alt?: string, className?: string, fallback?: React.ReactNode, onClick?: (e: any) => void }) => {
    const [error, setError] = useState(!src);
    useEffect(() => setError(!src), [src]);
    if (error) return <>{fallback}</>;
    return <img src={src} alt={alt} className={className} onClick={onClick} onError={() => setError(true)} />;
};

interface ChecklistItem {
    _id?: string;
    partName: string;
    spec: string;
    image?: string;
    status: 'pending' | 'correct' | 'wrong';
    isCustom?: boolean;
}

interface InspectionStats {
    totalCars: number;
    correctCars: number;
    totalWrong: number;
    wrongPartsTrend: { _id: string; count: number }[];
}

export default function ChecklistPage() {
    const [view, setView] = useState<'inspect' | 'reports'>('inspect');

    // Vehicle Info
    const [vin, setVin] = useState('');
    const [lcdv, setLcdv] = useState('');
    const [code, setCode] = useState('');

    // Checklist State
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [isLoadingChecklist, setIsLoadingChecklist] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [summary, setSummary] = useState('');

    // Reports State
    const [stats, setStats] = useState<InspectionStats | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    // Modal States
    const [isAddPartOpen, setIsAddPartOpen] = useState(false);
    const [isCreatePartOpen, setIsCreatePartOpen] = useState(false);

    // Gallery & Preview States
    const [focusedPartIndex, setFocusedPartIndex] = useState<number | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isFastMode, setIsFastMode] = useState(false);
    const [inspectionStartTime, setInspectionStartTime] = useState<number | null>(null);
    const lastDurationRef = useRef<number | null>(null);

    // Master Data Form States (for creating new parts)
    const [newPartImage, setNewPartImage] = useState<string | null>(null);
    const [newSpec, setNewSpec] = useState({
        carModel: '',
        variant: '',
        region: '',
        code: 'FR-BMP-01',
        category: '',
        partName: '',
        spec: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);


    // Fetch stats and history
    const fetchReports = useCallback(async () => {
        setIsLoadingReports(true);
        try {
            const [statsRes, historyRes] = await Promise.all([
                fetch('/api/inspection/stats'),
                fetch('/api/inspection/history')
            ]);
            setStats(await statsRes.json());
            setHistory(await historyRes.json());
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setIsLoadingReports(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'reports') fetchReports();
    }, [view, fetchReports]);

    // Fetch Checklist when Code is selected
    useEffect(() => {
        if (code) {
            const fetchChecklist = async () => {
                setIsLoadingChecklist(true);
                try {
                    const res = await fetch(`/api/checklist?code=${encodeURIComponent(code)}`);
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setChecklist(data.map(item => ({
                            _id: item._id,
                            partName: item['Part Name'] || item.partId?.name || 'Unknown Part',
                            spec: item['Specification Details'] || item.spec || '',
                            image: `/api/specifications/${item._id}/image`,
                            status: 'pending' as const
                        })));
                        setInspectionStartTime(Date.now());
                    }
                } catch (error) {
                    toast.error('Failed to load checklist');
                } finally {
                    setIsLoadingChecklist(false);
                }
            };
            fetchChecklist();
        } else {
            setChecklist([]);
        }
    }, [code]);

    const handleStatusChange = (index: number, status: 'correct' | 'wrong') => {
        if (!inspectionStartTime) setInspectionStartTime(Date.now());
        const newChecklist = [...checklist];
        newChecklist[index].status = status;
        setChecklist(newChecklist);
    };

    const handleRemoveItem = (index: number) => {
        setChecklist(checklist.filter((_, i) => i !== index));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
        const file = e instanceof File ? e : e.target.files?.[0];
        if (file) {
            // Immediate local preview for UX
            const localReader = new FileReader();
            localReader.onloadend = () => {
                setNewPartImage(localReader.result as string);
            };
            localReader.readAsDataURL(file);

            // Upload to server
            const uploadToast = toast.loading('Compressing and uploading image...');
            try {
                // Compress image before upload
                const compressedBlob = await compressImage(file);

                const formData = new FormData();
                formData.append('file', compressedBlob, file.name || 'image.jpg');

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Upload failed');
                }

                const { url } = await res.json();
                setNewPartImage(url); // This will now be a URL after upload
                toast.success('Image uploaded!', { id: uploadToast });
            } catch (error: any) {
                console.error('Upload error:', error);
                toast.error(`Upload failed: ${error.message}`, { id: uploadToast });
            }
        }
    };

    const handlePaste = useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    handleImageChange(blob);
                    toast.success('Image pasted!');
                }
            }
        }
    }, []);

    useEffect(() => {
        if (isCreatePartOpen) {
            window.addEventListener('paste', handlePaste);
            return () => window.removeEventListener('paste', handlePaste);
        }
    }, [isCreatePartOpen, handlePaste]);

    const handleAddCustomPart = (part: any) => {
        const partName = part.partName || part.part || part.name || part['Part Name'] || 'Unknown Part';
        // Save to recent entries
        saveRecentEntry('Search Part', partName);

        setChecklist([
            ...checklist,
            {
                _id: part._id,
                partName: partName,
                spec: part.spec || part['Specification Details'] || '',
                image: part.image || part.imageUrl || part['Documentation Image'] || '',
                status: 'pending',
                isCustom: true
            }
        ]);
        setIsAddPartOpen(false);
    };

    const handleSubmit = async (next = false) => {
        if (!vin || !lcdv || !code) {
            toast.error('Please fill vehicle details');
            return;
        }

        const pending = checklist.filter(item => item.status === 'pending');
        if (pending.length > 0) {
            if (!confirm(`There are ${pending.length} items not checked. Continue?`)) return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Saving inspection...');

        try {
            const endedAt = new Date();
            const startedAt = inspectionStartTime ? new Date(inspectionStartTime) : endedAt;
            const duration = Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000));

            const totalCorrect = checklist.filter(item => item.status === 'correct').length;
            const totalWrong = checklist.filter(item => item.status === 'wrong').length;
            const wrongPartDetails = checklist
                .filter(item => item.status === 'wrong')
                .map(item => `${item.partName}: ${item.spec}`)
                .join(', ');

            const payload = {
                vin,
                lcdv,
                code,
                items: checklist.map(item => {
                    // Reduce payload size: Don't send the entire image if it's already a large Base64 string from the database.
                    // If it's a URL, keep it. If it's a small custom image, keep it.
                    let imageToSend = item.image || '';
                    if (!item.isCustom && imageToSend.startsWith('data:image')) {
                        imageToSend = ''; // The server can reference it via sourceSpecId if needed
                    }

                    return {
                        sourceSpecId: item._id,
                        partName: item.partName,
                        spec: item.spec,
                        image: imageToSend,
                        status: item.status === 'pending' ? 'correct' : item.status,
                        isCustom: item.isCustom
                    };
                }),
                totalCorrect,
                totalWrong,
                wrongPartDetails,
                summary,
                duration,
                startedAt,
                endedAt,
                date: new Date()
            };

            const res = await fetch('/api/inspection/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success('Inspection saved!', { id: loadingToast });
            saveRecentEntry('Code', code);

            // Reset or prep for next
            if (next) {
                setVin('');
                setLcdv('');
                setCode('');
                setChecklist([]);
                setSummary('');
                setInspectionStartTime(null);
            } else {
                setView('reports');
            }
        } catch (error) {
            toast.error('Error saving inspection', { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] pb-12">
            <Toaster position="top-right" />

            {/* Sub-header with View Switch */}
            <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Plant Inspection</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Operator Portal</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setView('inspect')}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                            view === 'inspect' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Save className="w-3.5 h-3.5" />
                        Inspect
                    </button>
                    <button
                        onClick={() => setView('reports')}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                            view === 'reports' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Reports
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 sm:p-8">
                {view === 'inspect' && (
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inspection</h1>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                                <span>Master Data Checklist</span>
                                <span>•</span>
                                <span className="text-blue-600">Active Session</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Recent Creations Dropdown */}
                            <div className="relative group/recent">
                                <button
                                    className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                                    title="Recent Creations"
                                >
                                    <History className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Recent</span>
                                </button>

                                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl py-3 z-[110] opacity-0 translate-y-2 pointer-events-none group-hover/recent:opacity-100 group-hover/recent:translate-y-0 group-hover/recent:pointer-events-auto transition-all">
                                    <div className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Plus className="w-3 h-3" />
                                        Latest Creations
                                    </div>
                                    <div className="max-h-60 overflow-y-auto px-2">
                                        {isMounted && getRecentEntries('Search Part').length > 0 ? (
                                            getRecentEntries('Search Part').map((name) => (
                                                <button
                                                    key={`header-recent-${name}`}
                                                    onClick={() => {
                                                        toast.success(`Search for "${name}" to add it.`);
                                                        setIsAddPartOpen(true);
                                                    }}
                                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center justify-between group/item"
                                                >
                                                    <span className="truncate">{name}</span>
                                                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover/item:text-blue-500 transition-colors" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-6 text-center text-gray-300 italic text-[10px]">No recent creations</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsFastMode(!isFastMode)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 bg-white text-gray-400 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all",
                                    isFastMode && "bg-amber-100 text-amber-700 border-amber-200"
                                )}
                            >
                                <Timer className="w-4 h-4" />
                                {isFastMode ? 'Fast Mode ON' : 'Standard Mode'}
                            </button>
                        </div>
                    </header>
                )}
                {view === 'inspect' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Vehicle Entry */}
                        <div className="lg:col-span-4 space-y-6">
                            <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-3 bg-blue-600 rounded-full" />
                                    Vehicle Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">VIN / Chassis Number</label>
                                        <input
                                            type="text"
                                            placeholder="Enter or scan VIN..."
                                            value={vin}
                                            onChange={(e) => setVin(e.target.value.toUpperCase())}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">LCDV Code</label>
                                        <input
                                            type="text"
                                            placeholder="..."
                                            value={lcdv}
                                            onChange={(e) => setLcdv(e.target.value.toUpperCase())}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm text-gray-900 placeholder-gray-400"
                                        />
                                    </div>
                                    <Autocomplete
                                        label="Code"
                                        placeholder="AA2..."
                                        apiUrl="/api/codes/search"
                                        value={code}
                                        onChange={setCode}
                                        required
                                        disabled={!vin || !lcdv}
                                    />
                                </div>
                            </section>

                            <section className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-200">
                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Today's Progress</h4>
                                <div className="text-3xl font-black mb-1">{stats?.totalCars || 0}</div>
                                <div className="text-[11px] font-bold opacity-80">Cars inspected today</div>
                                <div className="mt-4 flex gap-2">
                                    <div className="flex-1 bg-white/10 rounded-xl p-3">
                                        <div className="text-xs font-black">{stats?.correctCars || 0}</div>
                                        <div className="text-[9px] font-bold opacity-60 uppercase">Pass</div>
                                    </div>
                                    <div className="flex-1 bg-white/10 rounded-xl p-3">
                                        <div className="text-xs font-black">{stats?.totalWrong || 0}</div>
                                        <div className="text-[9px] font-bold opacity-60 uppercase">Fail</div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Checklist Section */}
                        <div className="lg:col-span-8 space-y-6">
                            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900">Spec Checklist</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{code || 'No Code Selected'}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddPartOpen(true)}
                                        className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Part
                                    </button>
                                </div>

                                <div className="p-2 sm:p-4">
                                    {isLoadingChecklist ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Loading Specs...</span>
                                        </div>
                                    ) : checklist.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                                            <AlertCircle className="w-8 h-8 mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Select a model to load checklist</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <AnimatePresence initial={false}>
                                                {checklist.map((item, idx) => (
                                                    <motion.div
                                                        key={item._id || idx}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className={cn(
                                                            "group relative p-4 rounded-[1.5rem] border transition-all cursor-pointer",
                                                            item.status === 'correct' ? "bg-emerald-50/50 border-emerald-100 shadow-sm shadow-emerald-50" :
                                                                item.status === 'wrong' ? "bg-red-50/50 border-red-100 shadow-sm shadow-red-50" :
                                                                    "bg-white border-gray-100 hover:border-blue-200"
                                                        )}
                                                        onClick={() => setFocusedPartIndex(idx)}
                                                    >
                                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                            <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                                                                {/* S.No */}
                                                                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100">
                                                                    {idx + 1}
                                                                </div>

                                                                {/* Image Preview */}
                                                                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center relative group/img shadow-sm cursor-pointer" onClick={() => setFocusedPartIndex(idx)}>
                                                                    <SafeImage
                                                                        src={item.image}
                                                                        alt={item.partName}
                                                                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                                                                        fallback={<AlertCircle className="w-6 h-6 text-gray-200" />}
                                                                    />
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className={cn(
                                                                            "font-black text-sm sm:text-base tracking-tight truncate",
                                                                            item.status === 'correct' ? "text-emerald-900" :
                                                                                item.status === 'wrong' ? "text-red-900" : "text-gray-900"
                                                                        )}>
                                                                            {item.partName}
                                                                        </span>
                                                                        {item.isCustom && (
                                                                            <span className="px-1.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100">Added</span>
                                                                        )}
                                                                    </div>
                                                                    <div className={cn(
                                                                        "text-[11px] sm:text-xs font-bold truncate opacity-60",
                                                                        item.status === 'correct' ? "text-emerald-700" :
                                                                            item.status === 'wrong' ? "text-red-700" : "text-gray-500"
                                                                    )}>
                                                                        {item.spec}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Controls */}
                                                            <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t border-gray-50 sm:border-0">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(idx, 'correct'); }}
                                                                    className={cn(
                                                                        "flex-1 sm:flex-none h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 border-2",
                                                                        item.status === 'correct' ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white border-gray-100 text-emerald-500/30 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50"
                                                                    )}
                                                                >
                                                                    <Check className="w-7 h-7 stroke-[3.5]" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(idx, 'wrong'); }}
                                                                    className={cn(
                                                                        "flex-1 sm:flex-none h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 border-2",
                                                                        item.status === 'wrong' ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200" : "bg-white border-gray-100 text-red-500/30 hover:border-red-500 hover:text-red-500 hover:bg-red-50"
                                                                    )}
                                                                >
                                                                    <X className="w-7 h-7 stroke-[3.5]" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleRemoveItem(idx); }}
                                                                    className="w-12 h-14 rounded-2xl flex items-center justify-center text-red-200 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                                                    title="Remove from list"
                                                                >
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-gray-50/50 border-t border-gray-50 mt-4">
                                    <textarea
                                        rows={2}
                                        placeholder="Add inspection notes or summary..."
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-xs resize-none"
                                    />

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => setIsPreviewOpen(true)}
                                            disabled={isSubmitting || !code}
                                            className="flex-1 py-4 bg-gray-900 shadow-xl shadow-gray-200 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                                        >
                                            <ImageIcon className="w-5 h-5" />
                                            Preview Summary
                                        </button>
                                    </div>

                                    <div className="flex gap-3 mt-3">
                                        <button
                                            onClick={() => handleSubmit(true)}
                                            disabled={isSubmitting || !code}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Save & Next Car
                                        </button>
                                        <button
                                            onClick={() => handleSubmit(false)}
                                            disabled={isSubmitting || !code}
                                            className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all disabled:opacity-50"
                                        >
                                            Finish
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Total Car Inspected', value: stats?.totalCars || 0, icon: ClipboardCheck, color: 'blue' },
                                { label: 'Correct Specs', value: stats?.correctCars || 0, icon: Check, color: 'emerald' },
                                { label: 'Wrong Specs', value: stats?.totalWrong || 0, icon: AlertCircle, color: 'red' },
                            ].map((card, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                                        card.color === 'blue' ? "bg-blue-50 text-blue-600" :
                                            card.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                                "bg-red-50 text-red-600"
                                    )}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</div>
                                        <div className="text-2xl font-black text-gray-900">{card.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Trend and History */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="text-sm font-black text-gray-900">Recent Inspections</h3>
                                    <button onClick={fetchReports} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Vehicle</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Result</th>
                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {history.map((inspection) => (
                                                <tr key={inspection._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-black text-gray-900">{inspection.vin}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono">{inspection.lcdv}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-700">{inspection.code || inspection.carModel}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                                            inspection.totalWrong === 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                                                        )}>
                                                            {inspection.totalWrong === 0 ? 'Passed' : `${inspection.totalWrong} Wrong`}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[10px] text-gray-400 font-bold">
                                                        {new Date(inspection.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="lg:col-span-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6">
                                <h3 className="text-sm font-black text-gray-900 mb-6">Common Failures</h3>
                                <div className="space-y-4">
                                    {stats?.wrongPartsTrend.map((trend, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                                                <span className="text-gray-900 truncate pr-2">{trend._id}</span>
                                                <span className="text-red-600">{trend.count} rejects</span>
                                            </div>
                                            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(trend.count / stats.totalCars) * 100}%` }}
                                                    className="h-full bg-red-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {stats?.wrongPartsTrend.length === 0 && (
                                        <div className="py-10 text-center text-gray-300">
                                            <Check className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No failures recorded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Gallery Focus Modal */}
            <AnimatePresence>
                {focusedPartIndex !== null && checklist[focusedPartIndex] && (
                    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setFocusedPartIndex(null)}
                            className="absolute inset-0 bg-gray-900/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 flex justify-between items-center border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                                        {focusedPartIndex + 1}/{checklist.length}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-sm md:text-lg tracking-tight truncate max-w-[200px]">{checklist[focusedPartIndex].partName}</h3>
                                        {checklist[focusedPartIndex].isCustom && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Added Part</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        onClick={() => setIsFastMode(!isFastMode)}
                                        className={cn(
                                            "px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all",
                                            isFastMode ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        )}
                                    >
                                        {isFastMode ? 'Fast: ON' : 'Fast: OFF'}
                                    </button>
                                    <button onClick={() => setFocusedPartIndex(null)} className="p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-gray-50/50 min-h-[150px] sm:min-h-[300px] max-h-[40vh] sm:max-h-[50vh] relative overflow-hidden rounded-[2rem] mx-4 sm:mx-6">
                                <SafeImage
                                    src={checklist[focusedPartIndex].image}
                                    className="w-full h-full object-contain"
                                    alt="Part"
                                    fallback={
                                        <div className="flex flex-col items-center justify-center text-gray-300">
                                            <Package className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-4 opacity-50" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Image Available</p>
                                        </div>
                                    }
                                />
                            </div>

                            <div className="p-4 sm:p-6 bg-white border-t border-gray-50">
                                <p className="text-xs sm:text-sm font-bold text-gray-600 mb-4 sm:mb-6 text-center truncate max-w-sm mx-auto">{checklist[focusedPartIndex].spec}</p>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <button
                                        onClick={() => {
                                            handleStatusChange(focusedPartIndex, 'correct');
                                            if (isFastMode) {
                                                if (focusedPartIndex === checklist.length - 1) {
                                                    setFocusedPartIndex(null);
                                                    setIsPreviewOpen(true);
                                                } else {
                                                    setFocusedPartIndex(focusedPartIndex + 1);
                                                }
                                            }
                                        }}
                                        className={cn(
                                            "py-3 sm:py-6 rounded-3xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all border-2",
                                            checklist[focusedPartIndex].status === 'correct' ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-xl shadow-emerald-100 scale-105" : "bg-white border-gray-100 text-gray-400 hover:border-emerald-300 hover:bg-emerald-50/50 hover:scale-[1.02]"
                                        )}
                                    >
                                        <Check className="w-5 h-5 sm:w-8 sm:h-8" />
                                        <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest">Correct</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleStatusChange(focusedPartIndex, 'wrong');
                                            if (isFastMode) {
                                                if (focusedPartIndex === checklist.length - 1) {
                                                    setFocusedPartIndex(null);
                                                    setIsPreviewOpen(true);
                                                } else {
                                                    setFocusedPartIndex(focusedPartIndex + 1);
                                                }
                                            }
                                        }}
                                        className={cn(
                                            "py-3 sm:py-6 rounded-3xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all border-2",
                                            checklist[focusedPartIndex].status === 'wrong' ? "bg-red-50 border-red-500 text-red-600 shadow-xl shadow-red-100 scale-105" : "bg-white border-gray-100 text-gray-400 hover:border-red-300 hover:bg-red-50/50 hover:scale-[1.02]"
                                        )}
                                    >
                                        <X className="w-5 h-5 sm:w-8 sm:h-8" />
                                        <span className="text-[9px] sm:text-xs font-black uppercase tracking-widest">Wrong</span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        onClick={() => setFocusedPartIndex(prev => prev! > 0 ? prev! - 1 : prev)}
                                        disabled={focusedPartIndex === 0}
                                        className="p-4 rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>

                                    {focusedPartIndex === checklist.length - 1 ? (
                                        <button
                                            onClick={() => {
                                                setFocusedPartIndex(null);
                                                setIsPreviewOpen(true);
                                            }}
                                            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[11px] sm:text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl"
                                        >
                                            Preview Summary <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setFocusedPartIndex(prev => prev! < checklist.length - 1 ? prev! + 1 : prev)}
                                            className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-[11px] sm:text-sm uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            Next Part <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Preview Summary Modal */}
            <AnimatePresence>
                {isPreviewOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-4 sm:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-900 text-white">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-black tracking-tight">Inspection Summary</h3>
                                    <p className="text-[9px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">Review before final save</p>
                                </div>
                                <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-gray-50/30">
                                {/* Vehicle Recap */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">VIN Number</p>
                                        <p className="font-mono text-xs font-bold text-gray-900">{vin || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">LCDV Code</p>
                                        <p className="font-mono text-xs font-bold text-gray-900">{lcdv || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vehicle Code</p>
                                        <p className="text-xs font-black text-blue-600">{code || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex gap-2 sm:gap-4">
                                    <div className="flex-1 bg-emerald-50 p-3 sm:p-4 rounded-2xl border border-emerald-100 text-center">
                                        <p className="text-xl sm:text-2xl font-black text-emerald-600 mb-1">{checklist.filter(i => i.status === 'correct').length}</p>
                                        <p className="text-[8px] sm:text-[9px] font-black text-emerald-700/60 uppercase tracking-widest">Correct</p>
                                    </div>
                                    <div className="flex-1 bg-red-50 p-3 sm:p-4 rounded-2xl border border-red-100 text-center">
                                        <p className="text-xl sm:text-2xl font-black text-red-600 mb-1">{checklist.filter(i => i.status === 'wrong').length}</p>
                                        <p className="text-[8px] sm:text-[9px] font-black text-red-700/60 uppercase tracking-widest">Wrong</p>
                                    </div>
                                    <div className="flex-1 bg-gray-100 p-3 sm:p-4 rounded-2xl border border-gray-200 text-center">
                                        <p className="text-xl sm:text-2xl font-black text-gray-600 mb-1">{checklist.filter(i => i.status === 'pending').length}</p>
                                        <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest">Pending</p>
                                    </div>
                                </div>

                                {/* Part Details */}
                                <div className="space-y-1">
                                    {checklist.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 sm:gap-4 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2 rounded-lg">
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] sm:text-[9px] font-black text-gray-400 flex-shrink-0">{idx + 1}</div>

                                            <div className="w-8 h-8 rounded shrink-0 bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
                                                <SafeImage
                                                    src={item.image}
                                                    className="w-full h-full object-cover"
                                                    fallback={<span className="text-[8px] font-black text-gray-300">N/A</span>}
                                                />
                                            </div>

                                            <div className="flex-1 flex justify-between items-center min-w-0">
                                                <span className="text-[10px] sm:text-xs font-bold text-gray-900 truncate pr-2">{item.partName}</span>
                                                <div className="flex-shrink-0">
                                                    {item.status === 'correct' ? <Check className="w-4 h-4 text-emerald-500" /> :
                                                        item.status === 'wrong' ? <X className="w-4 h-4 text-red-500" /> :
                                                            <span className="w-4 h-4 flex items-center justify-center text-[10px] text-gray-400 font-bold bg-gray-100 rounded-full">?</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex gap-2 sm:gap-4">
                                <button
                                    onClick={() => { setIsPreviewOpen(false); handleSubmit(true); }}
                                    disabled={isSubmitting}
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <span>Save & Next Car</span>}
                                </button>
                                <button
                                    onClick={() => { setIsPreviewOpen(false); handleSubmit(false); }}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-gray-900 text-white rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-black transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                                >
                                    Finish
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Part Modal */}
            <AnimatePresence>
                {isAddPartOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddPartOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Add Existing Part</h3>
                                <button onClick={() => setIsAddPartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <Autocomplete
                                    label="Search Part"
                                    placeholder="Search by part, model, or spec..."
                                    apiUrl="/api/specifications"
                                    value=""
                                    onChange={(name, fullObj) => {
                                        if (fullObj && typeof fullObj === 'object') {
                                            handleAddCustomPart(fullObj);
                                        } else {
                                            handleAddCustomPart({ partName: name });
                                        }
                                    }}
                                    renderOption={(opt) => (
                                        <div className="flex gap-3 py-1">
                                            <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                <SafeImage
                                                    src={opt['Documentation Image']}
                                                    className="w-full h-full object-cover"
                                                    fallback={<Package className="w-4 h-4 text-gray-200" />}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="text-[11px] font-black text-blue-600 uppercase tracking-tight truncate leading-tight">
                                                    {opt['Car Model']} {opt['Variant']}
                                                </div>
                                                <div className="text-[12px] font-bold text-gray-900 truncate leading-tight">
                                                    {opt['Part Name']}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                    <span className="bg-gray-100 px-1 rounded uppercase tracking-widest">{opt['Code']}</span>
                                                    <span>•</span>
                                                    <span className="truncate">{opt['Category']}</span>
                                                </div>
                                                <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-tight">
                                                    {opt['Region']}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />

                                <div className="pt-4 border-t border-gray-50 flex flex-col items-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Or create something new</p>
                                    <button
                                        onClick={() => {
                                            setIsAddPartOpen(false);
                                            setIsCreatePartOpen(true);
                                        }}
                                        className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Spec Entry
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create Part Modal */}
            <AnimatePresence>
                {isCreatePartOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreatePartOpen(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden p-10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="mb-10 flex justify-between items-start">
                                <div>
                                    <h2 className="text-4xl font-black text-blue-600 tracking-tighter leading-none mb-2">New <span className="text-gray-900">Spec Entry</span></h2>
                                    <p className="text-sm text-gray-400 font-bold italic tracking-wide">Industrial master data generator.</p>
                                </div>
                                <button onClick={() => setIsCreatePartOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-300">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setIsSubmitting(true);
                                try {
                                    const payload = {
                                        carModel: newSpec.carModel,
                                        variant: newSpec.variant,
                                        region: newSpec.region,
                                        code: newSpec.code,
                                        category: newSpec.category,
                                        part: newSpec.partName, // API expects 'part'
                                        spec: newSpec.spec,
                                        imageUrl: newPartImage // API expects 'imageUrl'
                                    };

                                    const res = await fetch('/api/specifications/create', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(payload)
                                    });
                                    if (!res.ok) throw new Error('Failed to create');
                                    const createdPart = await res.json();
                                    toast.success('Master Data Generated!');
                                    handleAddCustomPart(createdPart);
                                    setIsCreatePartOpen(false);
                                    // Reset form
                                    setNewSpec({
                                        carModel: '', variant: '', region: '', code: 'FR-BMP-01', category: '', partName: '', spec: ''
                                    });
                                    setNewPartImage(null);
                                } catch (error) {
                                    toast.error('Error creating master data');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }} className="space-y-10">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => cameraInputRef.current?.click()}
                                            className="flex items-center gap-2 px-6 py-4 bg-[#EEF2FF] text-[#4F46E5] rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all border border-[#E0E7FF]"
                                        >
                                            <Camera className="w-5 h-5" />
                                            Capture
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-6 py-4 bg-[#F8FAFC] text-[#64748B] rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-[#F1F5F9]"
                                        >
                                            <FileImage className="w-5 h-5" />
                                            Gallery
                                        </button>
                                        <div
                                            onClick={() => {
                                                toast('Ready for paste! Use Ctrl+V', { icon: '📋' });
                                            }}
                                            className="flex-1 flex items-center justify-between px-6 py-4 bg-[#FFFBEB] text-[#D97706] rounded-[1.25rem] font-black text-xs uppercase tracking-widest border-2 border-[#FDE68A] cursor-pointer hover:bg-[#FEF3C7] transition-all"
                                        >
                                            <span>Paste Photo Here...</span>
                                            <LucideClipboard className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div
                                        className={cn(
                                            "w-36 h-36 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden bg-[#F8FAFC] shrink-0",
                                            newPartImage ? "border-emerald-500 bg-emerald-50/10" : "border-gray-100"
                                        )}
                                    >
                                        {newPartImage ? (
                                            <div className="relative w-full h-full group">
                                                <img src={newPartImage} className="w-full h-full object-cover" alt="Preview" />
                                                <button
                                                    type="button"
                                                    onClick={() => setNewPartImage(null)}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <X className="w-8 h-8 text-white" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center opacity-20 flex flex-col items-center gap-1">
                                                <ImageIcon className="w-10 h-10" />
                                                <p className="text-[10px] font-black uppercase tracking-tighter">No Preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <Autocomplete
                                            label="Car Model"
                                            required
                                            placeholder="..."
                                            apiUrl="/api/specifications/fields"
                                            extraParams={{ field: 'Car Model' }}
                                            value={newSpec.carModel}
                                            onChange={(val) => setNewSpec({ ...newSpec, carModel: val })}
                                            className="bg-blue-50/50 border-blue-200 text-blue-900 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Autocomplete
                                            label="Variant"
                                            required
                                            placeholder="..."
                                            apiUrl="/api/specifications/fields"
                                            extraParams={{ field: 'Variant', carModel: newSpec.carModel }}
                                            value={newSpec.variant}
                                            onChange={(val) => setNewSpec({ ...newSpec, variant: val })}
                                            className="bg-blue-50/50 border-blue-200 text-blue-900 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Autocomplete
                                            label="Region"
                                            required
                                            placeholder="..."
                                            apiUrl="/api/specifications/fields"
                                            extraParams={{ field: 'Region' }}
                                            value={newSpec.region}
                                            onChange={(val) => setNewSpec({ ...newSpec, region: val })}
                                            className="bg-blue-50/50 border-blue-200 text-blue-900 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Autocomplete
                                            label="Code"
                                            required
                                            placeholder="FR-BMP-01"
                                            apiUrl="/api/specifications/fields"
                                            extraParams={{ field: 'Code' }}
                                            value={newSpec.code}
                                            onChange={(val) => setNewSpec({ ...newSpec, code: val })}
                                            className="bg-blue-50/50 border-blue-200 text-blue-900 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Autocomplete
                                            label="Category"
                                            required
                                            placeholder="..."
                                            apiUrl="/api/specifications/fields"
                                            extraParams={{ field: 'Category' }}
                                            value={newSpec.category}
                                            onChange={(val) => setNewSpec({ ...newSpec, category: val })}
                                            className="bg-blue-50/50 border-blue-200 text-blue-900 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Autocomplete
                                            label="Part Name"
                                            required
                                            placeholder="..."
                                            apiUrl="/api/specifications/fields"
                                            extraParams={{ field: 'Part Name' }}
                                            value={newSpec.partName}
                                            onChange={(val) => setNewSpec({ ...newSpec, partName: val })}
                                            className="bg-blue-50/50 border-blue-200 text-blue-900 font-bold"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-2 flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                                            Specification Details <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="spec"
                                            required
                                            rows={3}
                                            value={newSpec.spec}
                                            onChange={(e) => setNewSpec({ ...newSpec, spec: e.target.value })}
                                            placeholder="DETAILS..."
                                            className="w-full px-3 py-2 bg-blue-50/50 border-blue-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm uppercase font-bold text-blue-900 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-5 bg-[#0F172A] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Entry
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNewSpec({
                                                carModel: '', variant: '', region: '', code: 'FR-BMP-01', category: '', partName: '', spec: ''
                                            });
                                            setNewPartImage(null);
                                        }}
                                        className="px-8 py-5 bg-white text-gray-400 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:text-gray-900 transition-all border border-gray-100 flex items-center justify-center gap-2 active:scale-[0.98]"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
