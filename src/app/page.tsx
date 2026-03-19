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
  Database
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
      title: 'System Dashboard', // Worker friendly
      description: 'View overall numbers and daily inspection progress.',
      href: '/dashboard',
      icon: LayoutDashboard,
      color: 'bg-rose-600',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-700',
      shadow: 'shadow-rose-100',
      tag: 'Stats'
    }
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-12 sm:pt-20">
      {/* Navigation Grid */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {navigations.map((nav, i) => (
            <motion.a
              key={nav.title}
              href={nav.href}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden"
            >
              {/* Card Background Accent */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                nav.color
              )} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300",
                    nav.color,
                    nav.shadow
                  )}>
                    <nav.icon className="w-8 h-8" />
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                    nav.bgLight,
                    nav.textColor,
                    `border-${nav.color.split('-')[1]}-100`
                  )}>
                    {nav.tag}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors">
                  {nav.title}
                </h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                  {nav.description}
                </p>

                <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] group-hover:text-gray-900 transition-colors">
                  <span>Access Module</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

    </main>
  );
}
