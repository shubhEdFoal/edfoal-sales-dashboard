'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type {
  CampaignHealth,
  EmailStyle,
  Lead,
  LeadStatus,
} from '@/data/leads';
import { EDFOAL_ICP } from '@/config/edfoal-icp';
import { cn } from '@/lib/utils';

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => Promise<{ ok: boolean; error?: string }>;
}

type FormState = {
  businessName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  status: LeadStatus;
  emailStyle: EmailStyle;
  campaignHealth: CampaignHealth;
  targetSegment: string;
  followUpDay: string;
  shouldContinue: boolean;
};

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'SENT', label: 'Sent' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'MEETING_BOOKED', label: 'Meeting Booked' },
  { value: 'NO_RESPONSE', label: 'No Response' },
  { value: 'QUALIFIED', label: 'Qualified' },
];

const STYLE_OPTIONS: EmailStyle[] = [
  'Story-based',
  'Professional',
  'Casual',
  'Value-led',
];

const HEALTH_OPTIONS: CampaignHealth[] = ['GREEN', 'YELLOW', 'RED'];

const INITIAL_STATE: FormState = {
  businessName: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  status: 'SENT',
  emailStyle: 'Professional',
  campaignHealth: 'YELLOW',
  targetSegment: '',
  followUpDay: '0',
  shouldContinue: true,
};

const FIELD_CLS =
  'w-full rounded-btn border border-border bg-bg-deep px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue';

function FieldLabel({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
        {required && <span className="ml-1 text-accent-red">*</span>}
      </span>
      {children}
    </label>
  );
}

function buildLead(form: FormState): Lead {
  const status = form.status;
  const responded = status !== 'SENT' && status !== 'NO_RESPONSE';
  const replied = status === 'REPLIED' || status === 'MEETING_BOOKED';
  const followUpDay = parseInt(form.followUpDay, 10);

  return {
    id: `new-${Date.now()}`,
    businessName: form.businessName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    website: form.website.trim(),
    address: form.address.trim(),
    status,
    sentId: '',
    emailStyle: form.emailStyle,
    responded,
    replied,
    timestamp: new Date().toISOString(),
    campaignHealth: form.campaignHealth,
    shouldContinue: form.shouldContinue,
    targetSegment: form.targetSegment.trim(),
    followUpDay: Number.isFinite(followUpDay) ? followUpDay : 0,
  };
}

export function AddLeadModal({ open, onClose, onSave }: AddLeadModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(INITIAL_STATE);
      setError(null);
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

      if (form.businessName.trim() === '') {
        setError('Business name is required.');
        return;
      }
      if (form.email.trim() === '') {
        setError('Email is required.');
        return;
      }

      setSubmitting(true);
      const result = await onSave(buildLead(form));
      setSubmitting(false);

      if (result.ok) {
        onClose();
      } else {
        setError(result.error ?? 'Save failed.');
      }
    },
    [form, onSave, onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="add-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !submitting && onClose()}
        >
          <motion.div
            key="add-panel"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card border border-border bg-bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-bg-surface/95 px-6 py-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-accent-blue/10">
                  <Plus className="h-5 w-5 text-accent-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Add new lead</h2>
                  <p className="text-xs text-slate-400">
                    The lead will be saved in the dashboard immediately.
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
                <FieldLabel label="Business name" required>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => update('businessName', e.target.value)}
                    placeholder="Acme Inc"
                    className={FIELD_CLS}
                    autoFocus
                  />
                </FieldLabel>
                <FieldLabel label="Email" required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="founder@acme.com"
                    className={FIELD_CLS}
                  />
                </FieldLabel>
                <FieldLabel label="Phone">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+91 98xxx xxxxx"
                    className={FIELD_CLS}
                  />
                </FieldLabel>
                <FieldLabel label="Website">
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => update('website', e.target.value)}
                    placeholder="acme.com"
                    className={FIELD_CLS}
                  />
                </FieldLabel>
                <FieldLabel label="Address">
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="City, Country"
                    className={FIELD_CLS}
                  />
                </FieldLabel>
                <FieldLabel label="Target segment">
                  <input
                    type="text"
                    value={form.targetSegment}
                    onChange={(e) => update('targetSegment', e.target.value)}
                    placeholder={EDFOAL_ICP.targetSegmentExamples.join(', ')}
                    className={FIELD_CLS}
                  />
                </FieldLabel>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FieldLabel label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => update('status', e.target.value as LeadStatus)}
                    className={FIELD_CLS}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                <FieldLabel label="Email style">
                  <select
                    value={form.emailStyle}
                    onChange={(e) => update('emailStyle', e.target.value as EmailStyle)}
                    className={FIELD_CLS}
                  >
                    {STYLE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                <FieldLabel label="Campaign health">
                  <select
                    value={form.campaignHealth}
                    onChange={(e) =>
                      update('campaignHealth', e.target.value as CampaignHealth)
                    }
                    className={FIELD_CLS}
                  >
                    {HEALTH_OPTIONS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </FieldLabel>
                <FieldLabel label="Follow-up day">
                  <input
                    type="number"
                    min={0}
                    value={form.followUpDay}
                    onChange={(e) => update('followUpDay', e.target.value)}
                    className={FIELD_CLS}
                  />
                </FieldLabel>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.shouldContinue}
                  onChange={(e) => update('shouldContinue', e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-border bg-bg-deep accent-accent-blue"
                />
                Continue outreach to this lead
              </label>

              {error && (
                <div className="rounded-btn border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-sm text-accent-red">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-btn border border-border px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-bg-deep hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-btn bg-accent-blue px-4 py-2 text-sm font-medium text-white transition-all',
                    submitting
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95'
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Save lead
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
