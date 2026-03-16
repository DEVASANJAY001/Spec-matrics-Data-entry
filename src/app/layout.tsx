import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spec Matrix – Master Data Entry",
  description: "Modern professional industrial specification management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
                  <a href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all">Dashboard</a>
                  <a href="/explorer" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all">Data Explorer</a>
                  <a href="/entries" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all">Previous Entries</a>
                  <a href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all">New Entry</a>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                    Live Portal
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                  AD
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
