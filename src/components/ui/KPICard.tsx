'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber';
  delta?: string;
  index?: number;
}

const colorMap = {
  blue: {
    iconBg: 'bg-accent-blue/10',
    iconText: 'text-accent-blue',
    delta: 'bg-accent-blue/10 text-accent-blue',
  },
  green: {
    iconBg: 'bg-accent-green/10',
    iconText: 'text-accent-green',
    delta: 'bg-accent-green/10 text-accent-green',
  },
  amber: {
    iconBg: 'bg-accent-amber/10',
    iconText: 'text-accent-amber',
    delta: 'bg-accent-amber/10 text-accent-amber',
  },
};

export function KPICard({ label, value, icon: Icon, color, delta, index = 0 }: KPICardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-card border border-border bg-bg-surface p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn('flex h-10 w-10 items-center justify-center rounded-btn', colors.iconBg)}
        >
          <Icon className={cn('h-5 w-5', colors.iconText)} />
        </div>
        {delta && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider',
              colors.delta
            )}
          >
            {delta}
          </span>
        )}
      </div>

      <p className="text-4xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </motion.div>
  );
}
