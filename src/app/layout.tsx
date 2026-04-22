"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  X,
  LayoutDashboard,
  FileSearch,
  History,
  PlusCircle,
  ClipboardCheck,
  Printer,
  LogOut,
  Settings,
  ShieldCheck,
  User as UserIcon,
  CircleUser
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthPage = ['/login', '/admin-signup'].includes(pathname);

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const allLinks = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Spec Check List', href: '/checklist', icon: ClipboardCheck },
    { name: 'Inspection Logs', href: '/inspections', icon: History },
    { name: 'Travel Card', href: '/travel-cards', icon: Printer },
    { name: 'Master Data', href: '/entries', icon: FileSearch },
    { name: 'New Entry', href: '/master', icon: PlusCircle },
  ];

  // Filter links based on user role and restrictions
  const navLinks = allLinks.filter(link => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    // For workers, check restrictedPages
    return !user.restrictedPages?.some((p: string) => link.href.startsWith(p));
  });

  return (
    <html lang="en">
      <head>
        <title>Spec Matrix</title>
        <meta name="description" content="Spec Matrix Data Entry Application" />
        <link rel="icon" href="/stellantis-logo.png" />
      </head>
      <body className={`${inter.className} antialiased selection:bg-blue-100 selection:text-blue-900 bg-[#f8fafc]`}>
        <Toaster position="top-right" />
        {isAuthPage ? (
          <main>{children}</main>
        ) : (
          <>
            <nav className="sticky top-0 z-[60] w-full border-b border-slate-200 bg-white print:hidden shadow-sm">
              <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
                <div className="flex justify-between h-14 items-center">
                  <div className="flex items-center gap-6">
                    <a href="/" className="flex items-center gap-3 group cursor-pointer border-r border-slate-100 pr-6 mr-2">
                      <div className="w-16 h-9 overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center p-1">
                        <img src="/stellantis-logo.png" alt="Stellantis Logo" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-sm font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">Spec Matrix</span>
                    </a>

                    <div className="hidden lg:flex items-center gap-0.5">
                      {navLinks.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest whitespace-nowrap ${pathname === link.href
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                          {link.name}
                        </a>
                      ))}

                      {user?.role === 'admin' && (
                        <a
                          href="/admin/workers"
                          className={`ml-2 px-3 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${pathname.startsWith('/admin')
                            ? 'text-indigo-600 bg-indigo-50 border border-indigo-100'
                            : 'text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Admin Panel
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
                        {user?.role === 'admin' ? 'Admin Live' : 'Worker Live'}
                        {user?.name && <span className="opacity-40 font-bold">•</span>}
                        {user?.name && <span className="text-blue-900 drop-shadow-sm">{user.name}</span>}
                      </span>
                    </div>

                    <div className="relative group">
                      <button
                        className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-white hover:shadow-md transition-all"
                      >
                        {user ? user.name.charAt(0).toUpperCase() : '??'}
                      </button>

                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 hidden group-hover:block overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/30">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                          <p className="font-bold text-slate-900 truncate">{user?.name || 'Loading...'}</p>
                          <p className="text-[10px] font-medium text-slate-500 truncate">{user?.userId}</p>
                        </div>
                        <div className="p-2">
                          <a href={user?.role === 'admin' ? "/admin/profile" : "/profile"} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                            <UserIcon className="w-4 h-4" /> Profile Settings
                          </a>
                          {user?.role === 'admin' && (
                            <a href="/admin/workers" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors">
                              <Settings className="w-4 h-4" /> User Management
                            </a>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </nav>

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
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 bottom-0 w-[280px] bg-white z-[101] md:hidden shadow-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-500 pb-1">
                        Navigation
                      </span>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {user?.role === 'admin' && (
                        <a
                          href="/admin/workers"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-4 p-4 rounded-2xl text-indigo-600 bg-indigo-50 transition-all font-bold mb-4 shadow-sm shadow-indigo-100"
                        >
                          <ShieldCheck className="w-5 h-5" />
                          Admin Control
                        </a>
                      )}
                      {navLinks.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${pathname === link.href
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                          <link.icon className="w-5 h-5" />
                          {link.name}
                        </a>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold mt-8 border border-red-50"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </div>

                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <main className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}
