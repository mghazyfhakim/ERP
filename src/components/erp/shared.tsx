'use client'

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCompactCurrency, formatPercent } from '@/lib/format'

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tint = 'emerald',
  hint,
}: {
  label: string
  value: string
  delta?: number
  icon: LucideIcon
  tint?: 'emerald' | 'teal' | 'amber' | 'rose' | 'violet'
  hint?: string
}) {
  const tints: Record<string, string> = {
    emerald: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
    teal: 'bg-teal-500/12 text-teal-600 dark:text-teal-400',
    amber: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/12 text-rose-600 dark:text-rose-400',
    violet: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
  }
  const positive = (delta ?? 0) >= 0
  return (
    <Card className="kpi-shine relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              tints[tint]
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
        {(delta !== undefined || hint) && (
          <div className="mt-3 flex items-center gap-2">
            {delta !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                  positive
                    ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/12 text-rose-600 dark:text-rose-400'
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {formatPercent(delta)}
              </span>
            )}
            {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-500/12 text-amber-700 dark:text-amber-300',
  paid: 'bg-teal-500/12 text-teal-700 dark:text-teal-300',
  shipped: 'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300',
  delivered: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-rose-500/12 text-rose-700 dark:text-rose-300',
  active: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  inactive: 'bg-muted text-muted-foreground',
  vip: 'bg-violet-500/12 text-violet-700 dark:text-violet-300',
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
        STATUS_STYLE[status] || 'bg-muted text-muted-foreground'
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
