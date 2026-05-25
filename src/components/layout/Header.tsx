'use client';

import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NAV_LINKS = ['Dashboard', 'Leads', 'Analytics', 'Settings'] as const;
export type NavLink = (typeof NAV_LINKS)[number];

interface HeaderProps {
  activeNav: NavLink;
  onNavChange?: (nav: NavLink) => void;
}

export function Header({ activeNav, onNavChange }: HeaderProps) {
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

      <nav className="ml-auto hidden items-center gap-8 md:flex">
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
    </header>
  );
}
