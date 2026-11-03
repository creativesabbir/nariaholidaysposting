'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, PlusCircle, History } from 'lucide-react';

export default function Navbar({ currentUser, isLoadingUser, onOpenUserModal }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center hover:opacity-95 transition-opacity">
              <img
                src="/logo.png"
                alt="Naria Holidays - Have a Nice Journey"
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Central Navigation: Create Post & History (Zero refresh between tabs) */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              href="/"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                pathname === '/'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Post</span>
            </Link>

            <Link
              href="/history"
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                pathname === '/history'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>
          </nav>

          {/* Active User Pill or Skeleton Loader (Zero Mock Data) */}
          <div className="flex items-center" suppressHydrationWarning>
            {isLoadingUser ? (
              /* Shimmering Skeleton Loader while session is fetching */
              <div className="flex items-center space-x-3 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/90 animate-pulse select-none">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="space-y-1.5 hidden sm:block">
                  <div className="w-20 h-2.5 bg-slate-200 rounded-full" />
                  <div className="w-28 h-2 bg-slate-200/70 rounded-full" />
                </div>
                <div className="w-3.5 h-3.5 bg-slate-200 rounded-full ml-1" />
              </div>
            ) : currentUser ? (
              /* Real Authenticated User Profile Pill */
              <button
                type="button"
                onClick={onOpenUserModal}
                className="flex items-center space-x-3 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition-all hover:border-slate-300 shadow-xs cursor-pointer group"
                title="Click to view profile or sign out"
              >
                <div className="relative">
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                    alt={currentUser?.name || "User"}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {currentUser?.name || "Member"}
                  </div>
                  {currentUser?.email && (
                    <div className="text-[11px] text-slate-500">
                      {currentUser.email}
                    </div>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-0.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
