'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Loader2, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EDFOAL_ICP, EDFOAL_TONE_OPTIONS, type EdfoalOutreachTone } from '@/config/edfoal-icp';
import { cn } from '@/lib/utils';

interface GenerateLeadModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated?: () => void;
}

type FormState = {
  businessType: string;
  state: string;
  country: string;
  count: string;
  tone: EdfoalOutreachTone;
};

const INITIAL_STATE: FormState = {
  businessType: '',
  state: '',
  country: '',
  count: EDFOAL_ICP.defaultLeadCount,
  tone: EDFOAL_ICP.defaultTone,
};

const FIELD_CLS =
  'w-full rounded-btn border border-border bg-bg-deep px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue';

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export function GenerateLeadModal({
  open,
  onClose,
  onGenerated,
}: GenerateLeadModalProps) {
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

  const submitToApi = useCallback(
    async (payload: {
      businessType: string;
      state: string;
      country: string;
      count: number;
      tone: EdfoalOutreachTone;
    }) => {
      setError(null);
      setSuccess(null);
      setSubmitting(true);
      try {
        const res = await fetch('/api/generate-leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          requestID?: string | null;
          message?: string;
        };
        if (!res.ok || data.ok === false) {
          setError(data.error ?? 'Generation failed.');
        } else {
          setSuccess(
            data.message ??
              `Scraping started for ${payload.count} lead${
                payload.count === 1 ? '' : 's'
              }. Track progress in Lead generation status below.`
          );
          onGenerated?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error.');
      } finally {
        setSubmitting(false);
      }
    },
    [onGenerated]
  );

  const handleManualSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (form.businessType.trim() === '') {
        setError('Target company type is required (e.g. restaurant, CA firm).');
        return;
      }
      if (form.state.trim() === '') {
        setError('State / city is required.');
        return;
      }
      if (form.country.trim() === '') {
        setError('Country is required.');
        return;
      }
      const count = parseInt(form.count, 10);
      if (!Number.isFinite(count) || count <= 0) {
        setError('Number of leads must be a positive number.');
        return;
      }

      await submitToApi({
        businessType: form.businessType.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        count,
        tone: form.tone,
      });
    },
    [form, submitToApi]
  );

  const closeDisabled = submitting;

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
          onClick={() => !closeDisabled && onClose()}
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
                    Fill in the criteria and generate.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={closeDisabled}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-btn border border-border text-slate-400 transition-colors hover:bg-bg-deep hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-start gap-2 border-b border-border bg-accent-amber/5 px-6 py-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber" />
              <p className="text-xs text-slate-300">
                <span className="font-medium text-accent-amber">Heads up:</span> Finding leads
                takes a few minutes. Track the job in{' '}
                <span className="font-medium text-white">Lead generation status</span> on the
                dashboard — click Refresh when it completes to load new leads.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldLabel label="Target company type (ICP)">
                    <input
                      type="text"
                      list="edfoal-icp-types"
                      value={form.businessType}
                      onChange={(e) => update('businessType', e.target.value)}
                      placeholder="SaaS Startup, FinTech, EdTech..."
                      className={FIELD_CLS}
                      autoFocus
                    />
                    <datalist id="edfoal-icp-types">
                      {EDFOAL_ICP.targetCompanyTypes.map((type) => (
                        <option key={type} value={type} />
                      ))}
                    </datalist>
                  </FieldLabel>
                  <FieldLabel label="State / city">
                    <input
                      type="text"
                      list="edfoal-icp-states"
                      value={form.state}
                      onChange={(e) => update('state', e.target.value)}
                      placeholder="Delhi, Mumbai, London..."
                      className={FIELD_CLS}
                    />
                    <datalist id="edfoal-icp-states">
                      {EDFOAL_ICP.targetStates.map((state) => (
                        <option key={state} value={state} />
                      ))}
                    </datalist>
                  </FieldLabel>
                  <FieldLabel label="Country">
                    <input
                      type="text"
                      list="edfoal-icp-countries"
                      value={form.country}
                      onChange={(e) => update('country', e.target.value)}
                      placeholder="India, USA, UK..."
                      className={FIELD_CLS}
                    />
                    <datalist id="edfoal-icp-countries">
                      {EDFOAL_ICP.targetCountries.map((country) => (
                        <option key={country} value={country} />
                      ))}
                    </datalist>
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
                      onChange={(e) => update('tone', e.target.value as EdfoalOutreachTone)}
                      className={FIELD_CLS}
                    >
                      {EDFOAL_TONE_OPTIONS.map((t) => (
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
                    disabled={closeDisabled}
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
