'use client';

import { Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserMenu } from '@/components/layout/UserMenu';
import { cn } from '@/lib/utils';

export const NAV_LINKS = ['Dashboard', 'Leads', 'Analytics'] as const;
export type NavLink = (typeof NAV_LINKS)[number];

interface HeaderProps {
  activeNav: NavLink;
  onNavChange?: (nav: NavLink) => void;
}

export function Header({ activeNav, onNavChange }: HeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center border-b border-border bg-bg-base/90 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-accent-blue/10">
          <Zap className="h-5 w-5 text-accent-blue" />
        </div>
        <div>
          <p className="font-bold text-white">EdFoal</p>
          <p className="font-mono text-xs text-slate-400">Sale Agents</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4 md:gap-8">
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeNav === link;
            return (
              <button
                key={link}
                type="button"
                onClick={() => onNavChange?.(link)}
                className={cn(
                  'relative text-sm transition-colors',
                  isActive ? 'text-accent-blue' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {link}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-blue" />
                )}
              </button>
            );
          })}
        </nav>

        <UserMenu onLogout={() => void handleLogout()} loggingOut={loggingOut} />
      </div>
    </header>
  );
}
