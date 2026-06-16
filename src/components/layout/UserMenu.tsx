'use client';

import { LogOut, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ProfileModal, type UserProfile } from '@/components/layout/ProfileModal';
import { userInitials } from '@/lib/auth/user-display';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  onLogout: () => void;
  loggingOut?: boolean;
}

export function UserMenu({ onLogout, loggingOut = false }: UserMenuProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as UserProfile;
        if (!cancelled && data.username) {
          setUser(data);
        }
      } catch {
        // ignore
      }
    }

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  if (!user) return null;

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={`Open menu for ${user.name}`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full bg-accent-blue/20 text-xs font-semibold text-accent-blue transition-all hover:bg-accent-blue/30 hover:ring-2 hover:ring-accent-blue/40 active:scale-95',
            menuOpen && 'ring-2 ring-accent-blue/50'
          )}
        >
          {userInitials(user.name)}
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-card border border-border bg-bg-surface py-1 shadow-xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setProfileOpen(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-bg-deep hover:text-white"
            >
              <UserRound className="h-4 w-4 text-accent-blue" />
              Profile
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-accent-red/10 hover:text-accent-red disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {loggingOut ? 'Signing out...' : 'Logout'}
            </button>
          </div>
        )}
      </div>

      <ProfileModal
        open={profileOpen}
        user={user}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
