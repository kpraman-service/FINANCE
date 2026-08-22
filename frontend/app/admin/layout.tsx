'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser()
      .then((usr) => {
        setUser(usr);
        if (!usr.roles?.includes('Admin')) {
          window.location.href = '/';
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center text-amber-400 font-semibold">
        Verifying Admin Credentials...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
