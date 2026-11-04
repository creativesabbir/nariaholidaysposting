'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';
import UserSwitcherModal from './UserSwitcherModal';

function AppContent({ children }) {
  const pathname = usePathname();
  const { currentUser, isLoadingUser, isUserModalOpen, setIsUserModalOpen, updateUser } = useAuth();

  // On Login or Admin pages: do not show public shared navbar
  const isAuthOrAdmin = pathname === '/login' || pathname.startsWith('/admin');

  if (isAuthOrAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-800">
      {/* Persistent Shared Navbar - Never unmounts between / and /history */}
      <Navbar
        currentUser={currentUser}
        isLoadingUser={isLoadingUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
      />

      {/* Main Page Area */}
      <div className="flex-1">
        {children}
      </div>

      {/* Shared Persistent Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
        <p>
          Powered by -{' '}
          <a
            href="https://goaivisibility.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-600 hover:text-blue-600 transition-colors no-underline"
          >
            goAI Visibility Agency
          </a>
        </p>
      </footer>

      {/* Shared User Profile Modal with ImgBB upload */}
      <UserSwitcherModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={updateUser}
      />
    </div>
  );
}

export default function SharedLayout({ children }) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}

