'use client';

import {
  BarChart3,
  ChevronLeft,
  LayoutDashboard,
  Mail,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Leads', icon: Users },
  { label: 'Sequences', icon: Mail },
  { label: 'Analytics', icon: BarChart3 },
];

interface SidebarProps {
  activeNav?: string;
}

export function Sidebar({ activeNav = 'Dashboard' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-white/50 bg-white/55 shadow-[20px_0_80px_rgba(79,70,229,0.08)] backdrop-blur-[20px] transition-all duration-300 lg:flex',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center justify-end p-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-2xl p-1.5 text-slate-400 transition-colors hover:bg-white/70 hover:text-indigo-600 active:scale-95"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 pb-4">
        {navItems.map(({ label, icon: Icon }) => (
          <a
            key={label}
            href="#"
            className={cn(
              'flex items-center gap-3 rounded-r-2xl px-3 py-2.5 text-sm font-semibold transition-colors',
              activeNav === label
                ? 'border-l-2 border-indigo-600 bg-indigo-50 text-indigo-600'
                : 'border-l-2 border-transparent text-slate-400 hover:bg-white/70 hover:text-indigo-600'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
}
