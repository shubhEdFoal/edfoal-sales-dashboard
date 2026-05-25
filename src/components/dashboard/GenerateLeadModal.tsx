'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GenerateLeadModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated?: () => void;
}

type FormState = {
  businessType: string;
  location: string;
  count: string;
  tone: 'Aggressive' | 'Friendly' | 'Professional' | 'Casual';
};

const TONE_OPTIONS: FormState['tone'][] = [
  'Aggressive',
  'Friendly',
  'Professional',
  'Casual',
];

const INITIAL_STATE: FormState = {
  businessType: '',
  location: '',
  count: '5',
  tone: 'Professional',
};

const FIELD_CLS =
  'w-full rounded-btn border border-border bg-bg-deep px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue';

function FieldLabel({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
        {hint && <span className="ml-1 text-slate-600">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function GenerateLeadModal({ open, onClose, onGenerated }: GenerateLeadModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(INITIAL_STATE);
      setError(null);
      setSuccess(null);
      setSubmitting(false);
    }
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

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      if (form.businessType.trim() === '') {
        setError('Business type is required.');
        return;
      }
      if (form.location.trim() === '') {
        setError('Location is required.');
        return;
      }
      const count = parseInt(form.count, 10);
      if (!Number.isFinite(count) || count <= 0) {
        setError('Number of leads must be a positive number.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await fetch('/api/generate-leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessType: form.businessType.trim(),
            location: form.location.trim(),
            count,
            tone: form.tone,
          }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || data.ok === false) {
          setError(data.error ?? 'Generation failed.');
        } else {
          setSuccess(
            `Generation request sent. The workflow will populate ${count} lead${
              count === 1 ? '' : 's'
            } in your sheet shortly. Click Refresh in a minute.`
          );
          onGenerated?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error.');
      } finally {
        setSubmitting(false);
      }
    },
    [form, onGenerated]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="gen-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !submitting && onClose()}
        >
          <motion.div
            key="gen-panel"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-border bg-bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-bg-surface/95 px-6 py-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-accent-amber/10">
                  <Sparkles className="h-5 w-5 text-accent-amber" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Generate leads</h2>
                  <p className="text-xs text-slate-400">
                    Trigger the n8n workflow to find leads matching your criteria.
                  </p>
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

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldLabel label="Business type">
                  <input
                    type="text"
                    value={form.businessType}
                    onChange={(e) => update('businessType', e.target.value)}
                    placeholder="School, Cafe, Clinic..."
                    className={FIELD_CLS}
                    autoFocus
                  />
                </FieldLabel>
                <FieldLabel label="Location">
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="Noida, Bangalore..."
                    className={FIELD_CLS}
                  />
                </FieldLabel>
                <FieldLabel label="Number of leads">
                  <input
                    type="number"
                    min={1}
                    value={form.count}
                    onChange={(e) => update('count', e.target.value)}
                    className={FIELD_CLS}
                  />
                </FieldLabel>
                <FieldLabel label="Outreach tone">
                  <select
                    value={form.tone}
                    onChange={(e) => update('tone', e.target.value as FormState['tone'])}
                    className={FIELD_CLS}
                  >
                    {TONE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
              </div>

              {error && (
                <div className="rounded-btn border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-sm text-accent-red">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-btn border border-accent-green/30 bg-accent-green/10 px-3 py-2 text-sm text-accent-green">
                  {success}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-btn border border-border px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-bg-deep hover:text-white disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting || success !== null}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-btn bg-accent-amber px-4 py-2 text-sm font-medium text-bg-deep transition-all',
                    submitting || success !== null
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95'
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
