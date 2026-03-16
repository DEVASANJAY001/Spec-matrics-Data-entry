"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, X, LayoutDashboard, FileSearch, History, PlusCircle } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Data Explorer', href: '/explorer', icon: FileSearch },
    { name: 'Previous Entries', href: '/entries', icon: History },
    { name: 'New Entry', href: '/', icon: PlusCircle },
  ];

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased selection:bg-blue-100 selection:text-blue-900`}>
        <nav className="sticky top-0 z-[60] w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-8">
                <a href="/" className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform shadow-lg shadow-gray-200">
                    S
                  </div>
                  <span className="text-xl font-bold text-gray-900 tracking-tight">Spec Matrix</span>
                </a>

                <div className="hidden md:flex items-center gap-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-6">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                    Live Portal
                  </span>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                  AD
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] md:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-[280px] bg-white z-[101] md:hidden shadow-2xl p-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Navigation</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold"
                    >
                      <link.icon className="w-5 h-5" />
                      {link.name}
                    </a>
                  ))}
                </div>

                <div className="absolute bottom-10 left-6 right-6">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Session Identity</div>
                    <div className="text-sm font-black text-gray-900 mb-0.5">Admin User</div>
                    <div className="text-[10px] text-blue-600 font-bold">Standard Access Level</div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {children}
      </body>
    </html>
  );
}
