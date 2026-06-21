'use client';

import { BarChart3, LayoutDashboard, LogOut, Users, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DASHBOARD_USER_NAME_STORAGE_KEY,
  getInitialsFromDisplayName,
} from '@/lib/auth/display-name';
import { cn } from '@/lib/utils';

export const NAV_LINKS = ['Dashboard', 'Leads', 'Analytics'] as const;
export type NavLink = (typeof NAV_LINKS)[number];

const NAV_ICONS: Record<NavLink, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Leads: Users,
  Analytics: BarChart3,
};

interface HeaderProps {
  activeNav: NavLink;
  displayName: string;
  onNavChange?: (nav: NavLink) => void;
}

export function Header({ activeNav, displayName, onNavChange }: HeaderProps) {
  const router = useRouter();
  const userInitials = getInitialsFromDisplayName(displayName);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.localStorage.removeItem(DASHBOARD_USER_NAME_STORAGE_KEY);
    router.replace('/login');
    router.refresh();
  }

  return (
    <aside className="sticky top-0 z-40 flex h-screen w-20 shrink-0 flex-col items-center border-r border-white/50 bg-white/55 px-3 py-5 shadow-[20px_0_80px_rgba(79,70,229,0.08)] backdrop-blur-[20px] sm:w-24">
      <div className="animate-float flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-600/20">
        <Zap className="h-6 w-6" />
      </div>

      <nav className="mt-10 flex flex-1 flex-col items-center gap-4">
        {NAV_LINKS.map((link) => {
          const isActive = activeNav === link;
          const Icon = NAV_ICONS[link];
          return (
            <button
              key={link}
              type="button"
              onClick={() => onNavChange?.(link)}
              aria-label={link}
              title={link}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ease-in-out active:scale-95',
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-white/40 text-slate-400 hover:-translate-y-1 hover:bg-white/75 hover:text-indigo-600 hover:shadow-lg hover:shadow-indigo-600/10'
              )}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-linear-to-br from-indigo-500 via-violet-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-600/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-600">
            {userInitials}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          aria-label="Logout"
          title="Logout"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/45 text-slate-400 transition-all hover:-translate-y-0.5 hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
