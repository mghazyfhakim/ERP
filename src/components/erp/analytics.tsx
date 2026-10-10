'use client'

import { useState } from 'react'
import {
  BarChart3,
  Wallet,
  TrendingUp,
  CreditCard,
  Users,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAnalytics } from '@/lib/api'
import { CHART_COLORS, STATUS_COLOR } from '@/lib/chart-config'
import { formatCompactCurrency, formatCurrency, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Range = '3m' | '6m' | '12m'

const tooltipStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
}

export function AnalyticsModule() {
  const [range, setRange] = useState<Range>('6m')
  const { data, isLoading } = useAnalytics(range)

  const totalRevenue = data?.salesTrend.reduce((s, t) => s + t.revenue, 0) || 0
  const totalOrders = data?.salesTrend.reduce((s, t) => s + t.orders, 0) || 0
  const avgGrowth =
    data?.monthlyGrowth && data.monthlyGrowth.length > 1
      ? data.monthlyGrowth.slice(1).reduce((s, m) => s + m.growth, 0) / (data.monthlyGrowth.length - 1)
      : 0

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            Business Analytics
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Insight performa bisnis berdasarkan data transaksi
          </p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 bulan</SelectItem>
            <SelectItem value="6m">6 bulan</SelectItem>
            <SelectItem value="12m">12 bulan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat label="Revenue (range)" value={formatCurrency(totalRevenue)} icon={Wallet} tint="emerald" />
        <MiniStat label="Total Orders" value={String(totalOrders)} icon={CreditCard} tint="teal" />
        <MiniStat label="Avg Growth" value={formatPercent(avgGrowth)} icon={TrendingUp} tint="violet" />
      </div>

      {isLoading || !data ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* Sales trend + monthly growth */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Sales Trend</CardTitle>
                <CardDescription>Revenue & jumlah order per periode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.salesTrend} margin={{ left: -8, right: 8, top: 8 }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatCompactCurrency(v)}
                        width={56}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number, name: string) =>
                          name === 'revenue'
                            ? [formatCurrency(value), 'Revenue']
                            : [value, 'Orders']
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--chart-2)"
                        strokeWidth={2.5}
                        fill="url(#trendGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Monthly Growth</CardTitle>
                <CardDescription>Pertumbuhan revenue MoM</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.monthlyGrowth} margin={{ left: -8, right: 8, top: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v.toFixed(0)}%`}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number) => [formatPercent(v), 'Growth']}
                      />
                      <Line
                        type="monotone"
                        dataKey="growth"
                        stroke="var(--chart-5)"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: 'var(--chart-5)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by category + payment breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Revenue by Category</CardTitle>
                <CardDescription>Kontribusi tiap kategori produk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueByCategory} margin={{ left: -8, right: 8, top: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-12}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatCompactCurrency(v)}
                        width={56}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                      />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                        {data.revenueByCategory.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Payment Methods</CardTitle>
                <CardDescription>Distribusi metode bayar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.paymentBreakdown}
                        dataKey="total"
                        nameKey="method"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                      >
                        {data.paymentBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number) => formatCurrency(v)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5">
                  {data.paymentBreakdown.map((p, i) => (
                    <div key={p.method} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="capitalize text-muted-foreground">{p.method}</span>
                      <span className="ml-auto font-medium text-foreground">{p.count}</span>
                      <span className="w-20 text-right text-muted-foreground">
                        {formatCompactCurrency(p.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top customers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Top Customers</CardTitle>
              <CardDescription>Pelanggan dengan spending tertinggi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.topCustomers.map((c, i) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-3 rounded-md border border-border/60 p-3"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                      #{i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.orders} order</p>
                    </div>
                    <span className="text-right text-xs font-semibold text-foreground">
                      {formatCompactCurrency(c.totalSpent)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function MiniStat({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string
  value: string
  icon: typeof Wallet
  tint: 'emerald' | 'teal' | 'violet'
}) {
  const tints: Record<string, string> = {
    emerald: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
    teal: 'bg-teal-500/12 text-teal-600 dark:text-teal-400',
    violet: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
  }
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
        </div>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tints[tint]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
      <Skeleton className="h-48" />
    </div>
  )
}
