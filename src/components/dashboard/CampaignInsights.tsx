'use client';

import { AlertTriangle, ArrowRight, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';

interface CampaignInsightsProps {
  leadCount: number;
  responseRate: number;
}

const STATIC_INSIGHTS = {
  header: '🟡 EARLY-STAGE HEALTHY — UNVALIDATED',
  body: 'Your outreach campaign is showing promising early signals. Focus on converting replied leads and re-engaging no-response accounts before scaling volume.',
  recommendations: [
    {
      icon: Target,
      color: 'text-accent-blue',
      text: 'Prioritize the 3 replied leads for follow-up sequences within 24 hours.',
    },
    {
      icon: TrendingUp,
      color: 'text-accent-green',
      text: 'A/B test Value-led vs Story-based styles — both show engagement in early data.',
    },
    {
      icon: AlertTriangle,
      color: 'text-accent-amber',
      text: 'Pause outreach on 2 RED health leads to protect sender reputation.',
    },
    {
      icon: Lightbulb,
      color: 'text-accent-blue',
      text: 'Increase daily send volume by 20% once response rate holds above 40% for 5 days.',
    },
  ],
};

export function CampaignInsights({ leadCount, responseRate }: CampaignInsightsProps) {
  const tags = [`n=${leadCount} leads`, `${responseRate}% response rate`];

  return (
    <aside className="rounded-card border border-border bg-bg-surface p-6 lg:sticky lg:top-24 lg:self-start">
      <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-slate-400">
        AI Campaign Insights
      </h2>
      <p className="mb-4 font-mono text-xs font-semibold text-accent-amber">
        {STATIC_INSIGHTS.header}
      </p>

      <p className="mb-4 text-sm leading-relaxed text-slate-300">{STATIC_INSIGHTS.body}</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-bg-deep px-3 py-1 font-mono text-xs text-slate-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <ul className="mb-6 space-y-3">
        {STATIC_INSIGHTS.recommendations.map((rec) => (
          <li key={rec.text} className="flex gap-3 text-sm text-slate-300">
            <rec.icon className={`mt-0.5 h-4 w-4 shrink-0 ${rec.color}`} />
            <span>{rec.text}</span>
          </li>
        ))}
      </ul>

      <GlowButton variant="ghost" className="w-full justify-between">
        View Full Analysis
        <ArrowRight className="h-4 w-4" />
      </GlowButton>
    </aside>
  );
}
