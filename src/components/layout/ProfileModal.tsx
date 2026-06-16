'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, Loader2, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { userInitials } from '@/lib/auth/user-display';
import { GlowButton } from '@/components/ui/GlowButton';

export interface UserProfile {
  username: string;
  name: string;
  role: string;
}

interface ProfileModalProps {
  open: boolean;
  user: UserProfile | null;
  onClose: () => void;
}

const FIELD_CLS =
  'w-full rounded-btn border border-border bg-bg-deep px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue';

export function ProfileModal({ open, user, onClose }: ProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setSubmitting(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, submitting, onClose]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Failed to change password.');
        return;
      }

      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && user && (
        <motion.div
          key="profile-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !submitting && onClose()}
        >
          <motion.div
            key="profile-panel"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative mx-auto w-full max-w-md overflow-hidden rounded-card border border-border bg-bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue/20 text-sm font-semibold text-accent-blue">
                  {userInitials(user.name)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Profile</h2>
                  <p className="text-xs text-slate-400">Your account details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-btn border border-border text-slate-400 transition-colors hover:bg-bg-deep hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-btn border border-border bg-bg-deep/40 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  <UserRound className="h-3 w-3" />
                  Name
                </div>
                <p className="text-sm font-medium text-white">{user.name}</p>
              </div>

              <div className="rounded-btn border border-border bg-bg-deep/40 p-3">
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Role
                </div>
                <p className="text-sm font-medium text-white">{user.role}</p>
              </div>

              {!showChangePassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(true);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-btn border border-border bg-bg-deep/40 px-4 py-2.5 text-sm text-slate-200 transition-colors hover:border-accent-blue/40 hover:bg-accent-blue/5 hover:text-white"
                >
                  <KeyRound className="h-4 w-4 text-accent-blue" />
                  Change password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-3 rounded-card border border-border bg-bg-deep/30 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Change password
                  </p>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className={FIELD_CLS}
                    autoComplete="current-password"
                    required
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className={FIELD_CLS}
                    autoComplete="new-password"
                    required
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={FIELD_CLS}
                    autoComplete="new-password"
                    required
                  />
                  {error && (
                    <div className="rounded-btn border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-sm text-accent-red">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangePassword(false);
                        setError(null);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      disabled={submitting}
                      className="flex-1 rounded-btn border border-border px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-bg-deep hover:text-white disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <GlowButton
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save password'
                      )}
                    </GlowButton>
                  </div>
                </form>
              )}

              {success && (
                <div className="rounded-btn border border-accent-green/30 bg-accent-green/10 px-3 py-2 text-sm text-accent-green">
                  {success}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
