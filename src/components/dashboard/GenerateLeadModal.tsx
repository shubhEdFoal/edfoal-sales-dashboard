'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Loader2,
  PencilLine,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
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
  location: string;
  count: string;
  tone: EdfoalOutreachTone;
};

type Step = 'choose' | 'manual';

const INITIAL_STATE: FormState = {
  businessType: '',
  location: '',
  count: EDFOAL_ICP.defaultLeadCount,
  tone: EDFOAL_ICP.defaultTone,
};

const FIELD_CLS =
  'w-full rounded-btn border border-border bg-bg-deep px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue';

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

interface AutoPick {
  businessType: string;
  location: string;
  count: number;
  tone: EdfoalOutreachTone;
}

export function GenerateLeadModal({
  open,
  onClose,
  onGenerated,
}: GenerateLeadModalProps) {
  const [step, setStep] = useState<Step>('choose');
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [autoPick, setAutoPick] = useState<AutoPick | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('choose');
      setForm(INITIAL_STATE);
      setAutoPick(null);
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

  const submitToWebhook = useCallback(
    async (payload: {
      businessType: string;
      location: string;
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
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || data.ok === false) {
          setError(data.error ?? 'Generation failed.');
        } else {
          setSuccess(
            `Request sent. About ${payload.count} lead${
              payload.count === 1 ? '' : 's'
            } will appear in the dashboard in ~5 minutes once n8n posts them. Click Refresh to load.`
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

  const handleAuto = useCallback(() => {
    const pick: AutoPick = {
      businessType: pickRandom([...EDFOAL_ICP.targetCompanyTypes]),
      location: pickRandom([...EDFOAL_ICP.targetLocations]),
      count: randomInt(3, 8),
      tone: pickRandom([...EDFOAL_TONE_OPTIONS]),
    };
    setAutoPick(pick);
    void submitToWebhook(pick);
  }, [submitToWebhook]);

  const handleManualSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (form.businessType.trim() === '') {
        setError('Target company type is required (e.g. SaaS Startup, FinTech).');
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

      await submitToWebhook({
        businessType: form.businessType.trim(),
        location: form.location.trim(),
        count,
        tone: form.tone,
      });
    },
    [form, submitToWebhook]
  );

  const closeDisabled = submitting;
  const showAutoView = autoPick !== null;

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
                    {step === 'choose' && !showAutoView
                      ? 'Choose how to generate leads.'
                      : showAutoView
                        ? 'System-picked criteria \u2014 generating now.'
                        : 'Fill in the criteria and generate.'}
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

            <div className="space-y-0 border-b border-border">
              <div className="bg-accent-blue/5 px-6 py-3">
                <p className="text-xs text-slate-300">
                  <span className="font-medium text-accent-blue">EdFoal ICP:</span>{' '}
                  Prospecting{' '}
                  <span className="text-white">{EDFOAL_ICP.companyType}</span> buyers — e.g.{' '}
                  SaaS, FinTech, EdTech — not local retail (spa, salon, cafe, etc.).
                </p>
              </div>
              <div className="flex items-start gap-2 bg-accent-amber/5 px-6 py-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber" />
                <p className="text-xs text-slate-300">
                  <span className="font-medium text-accent-amber">Heads up:</span> Finding
                  leads takes at least <span className="font-mono font-semibold">5 minutes</span>.
                  New leads appear in the dashboard once n8n posts to{' '}
                  <span className="font-mono text-slate-400">/api/leads/ingest</span> — click
                  Refresh after ~5 minutes.
                </p>
              </div>
            </div>

            {step === 'choose' && !showAutoView && (
              <div className="space-y-3 p-6">
                <button
                  type="button"
                  onClick={handleAuto}
                  className="group flex w-full items-start gap-4 rounded-card border border-border bg-bg-deep/40 p-5 text-left transition-all hover:border-accent-amber/40 hover:bg-accent-amber/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-accent-amber/10 text-accent-amber">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      Auto pick everything
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Randomly picks an EdFoal ICP company type (e.g. SaaS, FinTech) and
                      Indian tech hub \u2014 then starts the search.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('manual')}
                  className="group flex w-full items-start gap-4 rounded-card border border-border bg-bg-deep/40 p-5 text-left transition-all hover:border-accent-blue/40 hover:bg-accent-blue/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-accent-blue/10 text-accent-blue">
                    <PencilLine className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      Fill in the details manually
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Choose which type of tech buyer to target, city, lead count, and
                      outreach tone.
                    </p>
                  </div>
                </button>
              </div>
            )}

            {showAutoView && (
              <div className="space-y-5 p-6">
                <div className="rounded-card border border-accent-amber/30 bg-accent-amber/5 p-4">
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-accent-amber">
                    Auto-selected criteria
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Target company type
                      </p>
                      <p className="text-white">{autoPick.businessType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Location
                      </p>
                      <p className="text-white">{autoPick.location}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Number of leads
                      </p>
                      <p className="font-mono text-white">{autoPick.count}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Outreach tone
                      </p>
                      <p className="text-white">{autoPick.tone}</p>
                    </div>
                  </div>
                </div>

                {submitting && (
                  <div className="flex items-center gap-2 rounded-btn border border-border bg-bg-deep px-3 py-2 text-sm text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin text-accent-amber" />
                    Sending request to the lead generator...
                  </div>
                )}
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

                <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPick(null);
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-btn border border-border px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-bg-deep hover:text-white disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <div className="flex gap-2">
                    {error && (
                      <button
                        type="button"
                        onClick={() => void submitToWebhook(autoPick)}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-btn bg-accent-amber px-4 py-2 text-sm font-medium text-bg-deep transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 disabled:opacity-60"
                      >
                        <Wand2 className="h-4 w-4" />
                        Retry
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={closeDisabled}
                      className="rounded-btn border border-border px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-bg-deep hover:text-white disabled:opacity-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 'manual' && !showAutoView && (
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
                  <FieldLabel label="City / market">
                    <input
                      type="text"
                      list="edfoal-icp-locations"
                      value={form.location}
                      onChange={(e) => update('location', e.target.value)}
                      placeholder="Bangalore, Noida, Mumbai..."
                      className={FIELD_CLS}
                    />
                    <datalist id="edfoal-icp-locations">
                      {EDFOAL_ICP.targetLocations.map((loc) => (
                        <option key={loc} value={loc} />
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

                <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('choose');
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-btn border border-border px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-bg-deep hover:text-white disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <div className="flex gap-2">
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
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
