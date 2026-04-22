'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AdminProfile() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        userId: '',
        role: '',
        password: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name,
                    userId: data.userId,
                    role: data.role,
                    password: '',
                });
            }
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    password: formData.password || undefined,
                }),
            });

            if (res.ok) {
                toast.success('Profile updated successfully');
                setFormData(prev => ({ ...prev, password: '' }));
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Update failed');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden"
            >
                <div className="p-8 bg-slate-50/50 border-b border-slate-100">
                    <div className="w-16 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 shadow-sm mb-4">
                        <img src="/stellantis-logo.png" alt="Stellantis" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
                    <p className="text-slate-500">Manage your administrative profile</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-9 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1">Username / ID</label>
                            <input
                                disabled
                                type="text"
                                className="w-full px-4 py-2.5 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 font-mono text-sm"
                                value={formData.userId}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1">Role</label>
                        <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                            {formData.role}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1">Change Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                placeholder="Enter new password to change"
                                className="w-full pl-9 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">Leave blank if you don't want to change your password.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
