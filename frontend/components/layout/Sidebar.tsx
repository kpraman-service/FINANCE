import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  PieChart,
  Target,
  BarChart3,
  FileSpreadsheet,
  Settings,
  Shield,
  Users,
  Bell,
  History
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isAdmin } = useAuthStore();

  const userNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Income', href: '/income', icon: ArrowUpRight },
    { name: 'Expenses', href: '/expenses', icon: ArrowDownLeft },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Budgets', href: '/budget', icon: PieChart },
    { name: 'Savings Goals', href: '/savings', icon: Target },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminNavigation = [
    { name: 'Admin Overview', href: '/admin', icon: Shield },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'All Transactions', href: '/admin/transactions', icon: Receipt },
    { name: 'Categories', href: '/admin/categories', icon: PieChart },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  const currentNav = pathname.startsWith('/admin') ? adminNavigation : userNavigation;

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            {pathname.startsWith('/admin') ? 'Admin Control' : 'Navigation'}
          </div>
          <nav className="space-y-1">
            {currentNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {isAdmin && !pathname.startsWith('/admin') && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <p className="font-semibold mb-1">Admin Access Granted</p>
            <p className="text-[11px] text-amber-400/80 mb-2">Switch to the admin portal to manage platform users and settings.</p>
            <Link href="/admin" className="text-amber-300 font-bold underline hover:text-amber-200">
              Open Admin Portal &rarr;
            </Link>
          </div>
        )}
      </div>

      <div className="px-3 py-2 text-xs text-slate-500 border-t border-slate-800/80">
        Finance Manager v1.0.0
      </div>
    </aside>
  );
};
