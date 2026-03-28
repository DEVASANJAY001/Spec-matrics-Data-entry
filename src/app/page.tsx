'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  FileText,
  Plus,
  Search,
  History,
  LayoutDashboard,
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  Database,
  Printer,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigations = [
    {
      title: 'Start Inspection', // Worker friendly
      description: 'Begin a new vehicle checklist for quality checking.',
      href: '/checklist',
      icon: ClipboardCheck,
      color: 'bg-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      shadow: 'shadow-emerald-100',
      tag: 'Action'
    },
    {
      title: 'Audit Reports', // Worker friendly
      description: 'Check previous inspection results and daily logs.',
      href: '/inspections',
      icon: FileText,
      color: 'bg-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
      shadow: 'shadow-blue-100',
      tag: 'History'
    },
    {
      title: 'New Master Data', // Worker friendly
      description: 'Manually add a new specification to the system.',
      href: '/master',
      icon: Plus,
      color: 'bg-indigo-600',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      shadow: 'shadow-indigo-100',
      tag: 'System'
    },
    {
      title: 'Search System', // Worker friendly
      description: 'Quickly find any part or specification detail.',
      href: '/explorer',
      icon: Search,
      color: 'bg-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-700',
      shadow: 'shadow-purple-100',
      tag: 'Search'
    },
    {
      title: 'Edit Master Logs', // Worker friendly
      description: 'Change or update existing master record details.',
      href: '/entries',
      icon: History,
      color: 'bg-amber-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
      shadow: 'shadow-amber-100',
      tag: 'Admin'
    },
    {
      title: 'Digital Travel Card',
      description: 'Generate and print professional vehicle inspection cards.',
      href: '/travel-cards',
      icon: Printer,
      color: 'bg-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      shadow: 'shadow-emerald-100',
      tag: 'Print'
    },
    {
      title: 'System Dashboard', // Worker friendly
      description: 'View overall numbers and daily inspection progress.',
      href: '/dashboard',
      icon: LayoutDashboard,
      color: 'bg-rose-600',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-700',
      shadow: 'shadow-rose-100',
      tag: 'Stats'
    },
    {
      title: 'Compress Utility',
      description: 'Optimize system performance by compressing database images.',
      href: '/admin/compress',
      icon: Shield,
      color: 'bg-slate-600',
      bgLight: 'bg-slate-50',
      textColor: 'text-slate-700',
      shadow: 'shadow-slate-100',
      tag: 'Admin'
    },
    {
      title: 'Transfer Part',
      description: 'Copy or move part specifications between different car codes.',
      href: '/admin/transfer',
      icon: Zap,
      color: 'bg-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
      shadow: 'shadow-blue-100',
      tag: 'Tools'
    },
    {
      title: 'System Trash',
      description: 'Recover or permanently delete removed system records.',
      href: '/trash',
      icon: Trash2,
      color: 'bg-red-600',
      bgLight: 'bg-red-50',
      textColor: 'text-red-700',
      shadow: 'shadow-red-200',
      tag: 'System'
    }
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-8 sm:py-16">
      {/* Navigation Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {navigations.map((nav, i) => (
            <motion.a
              key={nav.title}
              href={nav.href}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden"
            >
              {/* Card Background Accent */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                nav.color
              )} />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg mb-3 transform group-hover:scale-110 transition-all duration-300",
                  nav.color,
                  nav.shadow
                )}>
                  <nav.icon className="w-6 h-6" />
                </div>

                <h2 className="text-sm font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  {nav.title}
                </h2>

                <div className="mt-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open</span>
                  <ChevronRight className="w-2 h-2" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

    </main>
  );
}
