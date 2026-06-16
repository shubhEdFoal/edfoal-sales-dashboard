'use client';

import { ChevronRight, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { LeadRequestDetailModal } from '@/components/dashboard/LeadRequestDetailModal';
import { RequestStatusBadge } from '@/components/dashboard/RequestStatusBadge';
import type { LeadGenerationRequest } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface StatusApiResponse {
  success?: boolean;
  total?: number;
  running?: number;
  requests?: LeadGenerationRequest[];
  error?: string;
}

function formatRelativeTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

interface LeadRequestStatusPanelProps {
  refreshKey?: number;
  className?: string;
}

const PANEL_HEIGHT = 'h-[400px]';

export function LeadRequestStatusPanel({
  refreshKey = 0,
  className,
}: LeadRequestStatusPanelProps) {
  const [requests, setRequests] = useState<LeadGenerationRequest[]>([]);
  const [runningCount, setRunningCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const loadStatus = useCallback(async (options?: { silent?: boolean }) => {
    if (options?.silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/status?_=${Date.now()}`, { cache: 'no-store' });
      const data = (await res.json()) as StatusApiResponse;

      if (!res.ok || !data.requests) {
        throw new Error(data.error ?? 'Failed to load generation status');
      }

      setRequests(data.requests);
      setRunningCount(data.running ?? data.requests.filter((r) => r.isRunning).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load generation status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus, refreshKey]);

  useEffect(() => {
    if (runningCount <= 0) return;

    const interval = setInterval(() => {
      void loadStatus({ silent: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [runningCount, loadStatus]);

  return (
    <>
      <section
        className={cn(
          'flex flex-col overflow-hidden rounded-card border border-border bg-bg-surface p-5',
          PANEL_HEIGHT,
          className
        )}
      >
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-amber" />
              <h2 className="text-lg font-semibold text-white">Lead generation status</h2>
              {runningCount > 0 && (
                <span className="rounded-full bg-accent-amber/15 px-2 py-0.5 text-xs font-medium text-accent-amber">
                  {runningCount} running
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Active and recent lead-finding jobs — click a row for details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadStatus({ silent: true })}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-btn border border-border px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-bg-deep hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {error && (
            <div className="mb-3 shrink-0 rounded-btn border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-sm text-accent-red">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-accent-blue" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-btn border border-dashed border-border bg-bg-deep/30 px-4 py-8 text-center text-sm text-slate-500">
              No lead generation requests yet. Use Generate Lead to start a job.
            </div>
          ) : (
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
              {requests.map((request) => (
              <button
                key={request.requestID}
                type="button"
                onClick={() => setSelectedRequestId(request.requestID)}
                className="flex w-full items-center gap-3 rounded-btn border border-border bg-bg-deep/30 px-4 py-3 text-left transition-colors hover:border-accent-blue/40 hover:bg-bg-deep/60"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-white">
                      {request.query || `${request.businessType} · ${request.state}`}
                    </p>
                    <RequestStatusBadge
                      status={request.status}
                      isRunning={request.isRunning}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {request.businessType} · {request.state}, {request.country} ·{' '}
                    {request.inserted}/{request.numberOfLeads} leads ·{' '}
                    {formatRelativeTime(request.startedAt)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
              </button>
            ))}
            </div>
          )}
        </div>
      </section>

      <LeadRequestDetailModal
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
      />
    </>
  );
}
