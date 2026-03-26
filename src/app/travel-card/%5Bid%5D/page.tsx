'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Printer, CheckCircle2, XCircle, Clock, Car, MapPin, Hash, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InspectionItem {
    partName: string;
    spec: string;
    status: 'correct' | 'wrong';
    image?: string;
}

interface Inspection {
    _id: string;
    vin: string;
    lcdv: string;
    carModel: string;
    code: string;
    inspector: string;
    date: string;
    items: InspectionItem[];
    totalCorrect: number;
    totalWrong: number;
    duration: number;
    createdAt: string;
}

export default function DigitalTravelCard() {
    const { id } = useParams();
    const [inspection, setInspection] = useState<Inspection | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInspection = async () => {
            try {
                const res = await fetch(`/api/inspection/${id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch');
                setInspection(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchInspection();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!inspection) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-black text-gray-400">
                Inspection Not Found
            </div>
        );
    }

    const inspectionDate = new Date(inspection.createdAt);
    const formattedDate = inspectionDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = inspectionDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
            {/* Action Bar - Hidden on Print */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center px-4 print:hidden">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Digital Travel Card</h1>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    <Printer className="w-4 h-4" />
                    Print Card
                </button>
            </div>

            {/* Travel Card Document */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden print:shadow-none print:max-w-none print:w-full"
                id="printable-card"
            >
                {/* Header */}
                <div className="flex border-b-2 border-gray-900">
                    <div className="w-1/4 p-4 flex items-center justify-center border-r-2 border-gray-900">
                        <img src="/citroen-logo.png" alt="Citroën" className="h-16 object-contain" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col items-center justify-center">
                        <h2 className="text-3xl font-black tracking-[0.2em] text-gray-900 uppercase">Travel Card</h2>
                    </div>
                    <div className="w-1/4 p-4 flex flex-col items-center justify-center border-l-2 border-gray-900">
                        <div className="text-[8px] font-bold text-gray-400 self-end mb-2">DOC No: (PAIPL/QCP/TC-02)</div>
                        <img src="/stellantis-logo.png" alt="Stellantis" className="h-10 object-contain" />
                    </div>
                </div>

                {/* Meta Info Grid */}
                <div className="grid grid-cols-4 border-b-2 border-gray-900 text-[10px] font-bold uppercase tracking-wider">
                    <div className="p-2 border-r-2 border-gray-900 flex items-center gap-2 bg-gray-50">
                        <span>VIN NO :</span>
                        <span className="text-blue-600 bg-white px-1 border border-gray-200 flex-1">{inspection.vin}</span>
                    </div>
                    <div className="p-2 border-r-2 border-gray-900 flex items-center gap-2 bg-gray-50">
                        <span>ENGINE :</span>
                        <span className="text-gray-900 bg-white px-1 border border-gray-200 flex-1">{inspection.code || '-'}</span>
                    </div>
                    <div className="p-2 border-r-2 border-gray-900 col-span-2 flex items-center justify-between bg-gray-50">
                        <div className="flex gap-4">
                            <span>MODEL :</span>
                            <div className="flex gap-4">
                                {['CC21', 'ECC21', 'CC24', 'CC22'].map(m => (
                                    <div key={m} className="flex items-center gap-1">
                                        <div className={cn("w-3 h-3 border-2 border-gray-900", inspection.carModel.includes(m) ? "bg-gray-900" : "bg-white")} />
                                        <span>{m}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 border-b-2 border-gray-900 text-[10px] font-bold uppercase tracking-wider">
                    <div className="p-2 border-r-2 border-gray-900 flex items-center gap-2">
                        <span>CVT In Date & Time :</span>
                        <span className="text-gray-900">{formattedDate} {formattedTime}</span>
                    </div>
                    <div className="p-2"></div>
                </div>

                {/* User Requested Details */}
                <div className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest p-1 px-4 flex justify-between">
                    <div className="flex gap-8">
                        <span className="flex items-center gap-1"><Car className="w-3 h-3" /> Model: {inspection.carModel}</span>
                        <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Variant: {inspection.lcdv}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Region: India</span>
                    </div>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time: {formattedTime}</span>
                </div>

                {/* Static Inspection Sections */}
                <div className="grid grid-cols-2">
                    {/* Left Column: Front & LH Side */}
                    <div className="border-r-2 border-gray-900">
                        <div className="bg-gray-200 border-b-2 border-gray-900 text-[10px] font-black uppercase tracking-widest p-1 text-center">
                            Static Inspection - Front End & LH Side
                        </div>
                        <div className="p-4 flex flex-col items-center">
                            <div className="flex gap-4 mb-4">
                                <div className="w-32 h-20 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 flex-col">
                                    <Car className="w-8 h-8 opacity-20" />
                                    <span>SIDE VIEW</span>
                                </div>
                                <div className="w-32 h-20 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 flex-col">
                                    <div className="rotate-90"><Car className="w-8 h-8 opacity-20" /></div>
                                    <span>FRONT VIEW</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[8px] text-gray-300">
                                        PART IMG
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Rear & RH Side */}
                    <div>
                        <div className="bg-gray-200 border-b-2 border-gray-900 text-[10px] font-black uppercase tracking-widest p-1 text-center">
                            Static Inspection - Rear End & RH Side
                        </div>
                        <div className="p-4 flex flex-col items-center">
                            <div className="flex gap-4 mb-4">
                                <div className="w-32 h-20 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 flex-col">
                                    <div className="rotate-180"><Car className="w-8 h-8 opacity-20" /></div>
                                    <span>REAR VIEW</span>
                                </div>
                                <div className="w-32 h-20 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 flex-col">
                                    <div className="-scale-x-100"><Car className="w-8 h-8 opacity-20" /></div>
                                    <span>RH SIDE</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-[8px] text-gray-300">
                                        PART IMG
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inspection Table */}
                <table className="w-full border-t-2 border-gray-900 border-collapse table-fixed">
                    <thead>
                        <tr className="bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest">
                            <th className="p-1 border border-white w-8">SL</th>
                            <th className="p-1 border border-white w-24">IMAGE</th>
                            <th className="p-1 border border-white">PART NAME & DESCRIPTION</th>
                            <th className="p-1 border border-white w-12">STATUS</th>
                            <th className="p-1 border border-white w-16">REPAIR</th>
                            <th className="p-1 border border-white w-16">DONE BY</th>
                        </tr>
                    </thead>
                    <tbody className="text-[9px] font-bold">
                        {inspection.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="p-2 border-r border-gray-200 text-center text-gray-400">{idx + 1}</td>
                                <td className="p-1 border-r border-gray-200">
                                    <div className="w-full aspect-square bg-gray-50 rounded border border-gray-100 overflow-hidden flex items-center justify-center">
                                        {item.image ? (
                                            <img src={item.image} alt={item.partName} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="w-4 h-4 text-gray-200" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-2 border-r border-gray-200">
                                    <div className="text-gray-900 uppercase">{item.partName}</div>
                                    <div className="text-[8px] text-gray-500 font-medium leading-tight">{item.spec}</div>
                                </td>
                                <td className="p-2 border-r border-gray-200 text-center">
                                    {item.status === 'correct' ? (
                                        <div className="flex flex-col items-center gap-0.5 text-emerald-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-[6px] font-black">OK</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-0.5 text-rose-600">
                                            <XCircle className="w-4 h-4" />
                                            <span className="text-[6px] font-black">NO</span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-2 border-r border-gray-200"></td>
                                <td className="p-2 text-center text-gray-400 italic">SYSTEM</td>
                            </tr>
                        ))}
                        {/* Placeholder rows to maintain length if needed */}
                        {inspection.items.length < 10 && Array.from({ length: 10 - inspection.items.length }).map((_, i) => (
                            <tr key={`fill-${i}`} className="border-b border-gray-200 h-10">
                                <td className="p-2 border-r border-gray-200 text-center text-gray-200 italic">{inspection.items.length + i + 1}</td>
                                <td className="p-2 border-r border-gray-200"></td>
                                <td className="p-2 border-r border-gray-200"></td>
                                <td className="p-2 border-r border-gray-200"></td>
                                <td className="p-2 border-r border-gray-200"></td>
                                <td className="p-2"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer Section */}
                <div className="grid grid-cols-2 border-t-2 border-gray-900 bg-gray-50">
                    <div className="p-4 border-r-2 border-gray-900 flex flex-col justify-between h-20">
                        <div className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">Notes / Observations</div>
                        <div className="text-[10px] font-bold text-gray-900">Total OK: {inspection.totalCorrect} | Total NO: {inspection.totalWrong}</div>
                    </div>
                    <div className="p-4 flex flex-col justify-between h-20">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">Inspector</div>
                                <div className="text-sm font-black text-gray-900 uppercase">{inspection.inspector || 'UNKNOWN'}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">Verified By</div>
                                <div className="w-24 h-6 border-b border-gray-300 italic text-[10px] text-gray-400 flex items-end justify-center">Pending Verif.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 text-white p-2 flex justify-between items-center px-4">
                    <span className="text-[8px] font-bold uppercase tracking-widest">Digital Travel Card Portal • Confiential Quality Report</span>
                    <span className="text-[8px] font-bold">Generated: {new Date().toLocaleString()}</span>
                </div>
            </motion.div>

            {/* Custom Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    #printable-card {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    );
}
