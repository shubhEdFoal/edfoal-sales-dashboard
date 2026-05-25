'use client';

import {
  BarChart3,
  ChevronLeft,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Leads', icon: Users },
  { label: 'Sequences', icon: Mail },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activeNav?: string;
}

export function Sidebar({ activeNav = 'Dashboard' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-border bg-bg-surface transition-all duration-300 lg:flex',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center justify-end p-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-btn p-1.5 text-slate-400 transition-colors hover:bg-bg-base hover:text-white active:scale-95"
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
              'flex items-center gap-3 rounded-r-btn px-3 py-2.5 text-sm transition-colors',
              activeNav === label
                ? 'border-l-2 border-accent-blue bg-accent-blue/10 text-accent-blue'
                : 'border-l-2 border-transparent text-slate-400 hover:bg-bg-base/50 hover:text-slate-200'
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
