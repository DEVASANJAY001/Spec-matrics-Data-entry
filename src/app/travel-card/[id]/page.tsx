'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Printer, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

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
    variant: string;
    region: string;
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
                if (data.vin) {
                    document.title = data.vin;
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchInspection();

        return () => {
            document.title = 'Spec Matrix';
        };
    }, [id]);

    const handlePrint = () => {
        if (inspection?.vin) {
            document.title = inspection.vin;
        }
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
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
        <div className="min-h-screen bg-gray-50 py-4 print:bg-white print:py-0 text-black">
            {/* Action Bar */}
            <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center px-4 print:hidden">
                <div className="flex items-center gap-4">
                    <a href="/travel-cards" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-gray-900 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Travel Card Preview</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                    >
                        <Printer className="w-4 h-4" />
                        Print as PDF
                    </button>
                </div>
            </div>

            {/* Travel Card Document */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto bg-white border border-gray-900 shadow-xl overflow-hidden print:shadow-none print:max-w-none print:w-full print:border-none"
                id="printable-card"
            >
                {/* Header */}
                <div className="flex border-b-2 border-gray-900">
                    <div className="w-1/4 p-2 flex items-center justify-center border-r-2 border-gray-900 py-6">
                        <img src="/citroen-logo.png" alt="Citroën" className="h-32 object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col border-r-2 border-gray-900">
                        <div className="h-12 p-2 flex items-center justify-center border-b-2 border-gray-900 bg-gray-50/50">
                            <h2 className="text-3xl font-black tracking-[0.4em] text-gray-900 uppercase">Travel Card</h2>
                        </div>
                        <div className="flex-1 flex divide-x-2 divide-gray-900 min-h-[96px]">
                            <div className="w-[120px] flex flex-col items-center justify-center p-2 shrink-0">
                                <QRCodeSVG
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/travel-card/${id}`}
                                    size={64}
                                    level="H"
                                />
                                <span className="text-[5px] font-black text-gray-400 uppercase mt-2 tracking-widest text-center">Digital Card QR</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-1 px-3 overflow-hidden">
                                <Barcode
                                    value={inspection.vin}
                                    width={1.1}
                                    height={38}
                                    fontSize={8}
                                    margin={0}
                                    background="transparent"
                                />
                                <span className="text-[5px] font-black text-gray-400 uppercase mt-1 tracking-widest">VIN Barcode</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-1 px-3 overflow-hidden">
                                <Barcode
                                    value={inspection.lcdv}
                                    width={1.1}
                                    height={38}
                                    fontSize={8}
                                    margin={0}
                                    background="transparent"
                                />
                                <span className="text-[5px] font-black text-gray-400 uppercase mt-1 tracking-widest">LCDV Barcode</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/4 p-2 flex flex-col items-center justify-center text-right space-y-3">
                        <div className="text-[8px] font-bold text-gray-400 italic">DOC No: (PAIPL/QCP/TC-02)</div>
                        <img src="/stellantis-logo.png" alt="Stellantis" className="h-10 object-contain" />
                    </div>
                </div>

                {/* Meta Info Grid */}
                <div className="grid grid-cols-6 border-b-2 border-gray-900 text-[10px] font-black uppercase tracking-wider">
                    <div className="p-2 border-r-2 border-gray-900 flex flex-col justify-center">
                        <span className="text-[7px] text-gray-400 mb-0.5">VIN NO :</span>
                        <span className="text-gray-900 break-all">{inspection.vin}</span>
                    </div>
                    <div className="p-2 border-r-2 border-gray-900 flex flex-col justify-center">
                        <span className="text-[7px] text-gray-400 mb-0.5">LCDV :</span>
                        <span className="text-gray-900 break-all">{inspection.lcdv}</span>
                    </div>
                    <div className="p-2 border-r-2 border-gray-900 flex flex-col justify-center">
                        <span className="text-[7px] text-gray-400 mb-0.5">CAR MODEL :</span>
                        <span className="text-gray-900 break-words">{inspection.carModel || '-'}</span>
                    </div>
                    <div className="p-2 border-r-2 border-gray-900 flex flex-col justify-center">
                        <span className="text-[7px] text-gray-400 mb-0.5">VARIANT :</span>
                        <span className="text-gray-900 break-words">{inspection.variant || '-'}</span>
                    </div>
                    <div className="p-2 border-r-2 border-gray-900 flex flex-col justify-center">
                        <span className="text-[7px] text-gray-400 mb-0.5">REGION :</span>
                        <span className="text-gray-900 break-words">{inspection.region || '-'}</span>
                    </div>
                    <div className="p-2 flex flex-col justify-center">
                        <span className="text-[7px] text-gray-400 mb-0.5">CODE :</span>
                        <span className="text-gray-900 break-words">{inspection.code || '-'}</span>
                    </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 border-b-2 border-gray-900 text-[10px] font-black uppercase tracking-wider">
                    <div className="p-2 border-r-2 border-gray-900 flex items-center gap-2">
                        <span className="text-gray-400">CVT IN DATE & TIME :</span>
                        <span className="text-gray-900">{formattedDate} {formattedTime}</span>
                    </div>
                    <div className="p-2 flex items-center gap-6 justify-end pr-6">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-gray-400 font-black">MODEL:</span>
                            <span className="text-[12px] font-black text-gray-900 underline underline-offset-4">{inspection.carModel || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-gray-400 font-black">VAR:</span>
                            <span className="text-[12px] font-black text-gray-900 underline underline-offset-4">{inspection.variant || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-gray-400 font-black">REG:</span>
                            <span className="text-[12px] font-black text-gray-900 underline underline-offset-4">{inspection.region || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Diagrams */}
                <div className="grid grid-cols-2">
                    <div className="border-r-2 border-gray-900">
                        <div className="bg-gray-50 border-b-2 border-gray-900 text-[9px] font-black uppercase tracking-widest p-1.5 text-center text-gray-900">
                            Static Inspection - Front End & LH Side
                        </div>
                        <div className="p-1">
                            <img src="/LH.png" alt="LH Side" className="w-full h-auto object-contain max-h-[160px] grayscale" />
                        </div>
                    </div>
                    <div>
                        <div className="bg-gray-50 border-b-2 border-gray-900 text-[9px] font-black uppercase tracking-widest p-1.5 text-center text-gray-900">
                            Static Inspection - Rear End & RH Side
                        </div>
                        <div className="p-1">
                            <img src="/RH.png" alt="RH Side" className="w-full h-auto object-contain max-h-[160px] grayscale" />
                        </div>
                    </div>
                </div>

                {/* Status Indicator Fix: High-Contrast Bold Icons */}
                <table className="w-full border-t-2 border-gray-900 border-collapse table-fixed">
                    <thead>
                        <tr className="bg-white text-gray-900 text-[7px] font-black uppercase tracking-widest border-b-2 border-gray-900 h-8">
                            <th className="p-1 border-r border-gray-900 w-6">SL</th>
                            <th className="p-1 border-r border-gray-900 w-14">IMAGE</th>
                            <th className="p-1 border-r border-gray-900">PART NAME & DESCRIPTION</th>
                            <th className="p-1 border-r border-gray-900 w-16">STATUS</th>
                            <th className="p-1 w-24">REMARK</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-black">
                        {inspection.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-900 h-11 overflow-hidden">
                                <td className="p-1 border-r border-gray-900 text-center text-gray-900 font-black">{idx + 1}</td>
                                <td className="p-0.5 border-r border-gray-900">
                                    <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.partName} className="w-full h-full object-cover grayscale" />
                                        ) : (
                                            <div className="w-4 h-4 border border-dashed border-gray-100" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-1 border-r border-gray-900">
                                    <div className="text-gray-900 uppercase leading-tight font-black text-[12px]">{item.partName}</div>
                                    <div className="text-[10px] text-gray-500 font-bold leading-tight">{item.spec}</div>
                                </td>
                                <td className="p-1 border-r border-gray-900">
                                    <div className="flex flex-col items-center justify-center h-full">
                                        {item.status === 'correct' ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-5 h-5 border-2 border-gray-900 flex items-center justify-center text-[14px] font-[900] leading-none mb-0.5">✓</div>
                                                <span className="text-[8px] font-black text-gray-900 uppercase">OK</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="w-5 h-5 border-2 border-gray-900 flex items-center justify-center text-[13px] font-[900] leading-none mb-0.5">X</div>
                                                <span className="text-[8px] font-black text-gray-900 uppercase">NOT OK</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-1"></td>
                            </tr>
                        ))}
                        {/* Empty Rows */}
                        {inspection.items.length < 10 && Array.from({ length: 10 - inspection.items.length }).map((_, i) => (
                            <tr key={`fill-${i}`} className="border-b border-gray-900 h-11">
                                <td className="p-1 border-r border-gray-900 text-center text-gray-200">{inspection.items.length + i + 1}</td>
                                <td className="p-1 border-r border-gray-900"></td>
                                <td className="p-1 border-r border-gray-900"></td>
                                <td className="p-1 border-r border-gray-900"></td>
                                <td className="p-1"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="grid grid-cols-2 border-t-2 border-gray-900 bg-white">
                    <div className="p-2 border-r-2 border-gray-900 flex flex-col justify-between h-14">
                        <div className="text-[7px] font-black uppercase tracking-widest text-gray-400">Quality Summary</div>
                        <div className="flex gap-10">
                            <div className="text-xs font-black text-gray-900">TOTAL OK: <span className="underline decoration-black decoration-2 underline-offset-4 px-1">{inspection.totalCorrect}</span></div>
                            <div className="text-xs font-black text-gray-900">TOTAL NOT OK: <span className="underline decoration-black decoration-2 underline-offset-4 px-1">{inspection.totalWrong}</span></div>
                        </div>
                    </div>
                    <div className="p-2 flex flex-col justify-between h-14">
                        <div className="flex justify-between items-end h-full">
                            <div className="flex flex-col">
                                <div className="text-[7px] font-black uppercase tracking-widest text-gray-400">Auditor Name</div>
                                <div className="text-xs font-black text-gray-900 uppercase underline decoration-gray-400 decoration-dotted underline-offset-2">{inspection.inspector || 'VERIF_01'}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-[7px] font-black uppercase tracking-widest text-gray-400">Authorized Stamp</div>
                                <div className="w-24 h-4 border-b-2 border-gray-900 text-[8px] text-gray-300 italic flex items-end justify-center">Quality Verification</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-gray-900 p-2 flex justify-between items-center px-6 text-gray-900">
                    <span className="text-[7px] font-black uppercase tracking-widest">Authenticated Digital Quality Card</span>
                    <span className="text-[7px] font-black uppercase tracking-tighter opacity-70 italic">Generated: {new Date().toLocaleString()}</span>
                </div>
            </motion.div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    #printable-card {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        max-width: none !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                    }
                    /* Ensure all borders and backgrounds are visible */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
