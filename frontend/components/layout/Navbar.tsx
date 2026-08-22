'use client';

import { useAuthStore } from '../../store/authStore';
import { LogOut, User, Shield } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-200">
          Welcome, <span className="text-blue-400">{user?.first_name || user?.username || 'User'}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {user?.roles?.includes('admin') && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </span>
        )}

        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            {user?.first_name ? user.first_name[0] : <User className="w-4 h-4" />}
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
