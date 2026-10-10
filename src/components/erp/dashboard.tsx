'use client'

import {
  Wallet,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Activity as ActivityIcon,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useDashboard } from '@/lib/api'
import { useERPStore } from '@/lib/store'
import { KpiCard, StatusBadge, EmptyState } from './shared'
import {
  formatCompactCurrency,
  formatCurrency,
  formatRelativeTime,
} from '@/lib/format'
import { CHART_COLORS } from '@/lib/chart-config'

const ACTIVITY_ICON: Record<string, string> = {
  order_created: '🛒',
  payment_received: '💳',
  order_updated: '🚚',
  stock_low: '⚠️',
  customer_added: '👤',
  restock: '📦',
}

export function DashboardModule() {
  const { data, isLoading } = useDashboard()
  const { setActiveModule } = useERPStore()

  if (isLoading) return <DashboardSkeleton />

  const k = data?.kpis
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatCompactCurrency(k?.revenue || 0)}
          delta={k?.revenueDelta}
          icon={Wallet}
          tint="emerald"
          hint="vs bulan lalu"
        />
        <KpiCard
          label="Total Orders"
          value={String(k?.orders || 0)}
          delta={k?.ordersDelta}
          icon={ShoppingCart}
          tint="teal"
          hint="vs bulan lalu"
        />
        <KpiCard
          label="Customers"
          value={String(k?.customers || 0)}
          delta={k?.customersDelta}
          icon={Users}
          tint="violet"
          hint="vs bulan lalu"
        />
        <KpiCard
          label="Avg Order Value"
          value={formatCompactCurrency(k?.avgOrderValue || 0)}
          delta={k?.avgOrderDelta}
          icon={TrendingUp}
          tint="amber"
          hint="vs bulan lalu"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
              <CardDescription>6 bulan terakhir</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => setActiveModule('analytics')}
            >
              Detail <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.revenueTrend || []} margin={{ left: -8, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    tickFormatter={(v) => formatCompactCurrency(v)}
                    width={56}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Order Status</CardTitle>
            <CardDescription>Distribusi status order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.statusDistribution || []}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {(data?.statusDistribution || []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(data?.statusDistribution || []).map((s, i) => (
                <div key={s.status} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-[11px] capitalize text-muted-foreground">
                    {s.status}
                  </span>
                  <span className="ml-auto text-[11px] font-medium text-foreground">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Products by Revenue</CardTitle>
            <CardDescription>5 produk terlaris</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.topProducts || []}
                  layout="vertical"
                  margin={{ left: 8, right: 16 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCompactCurrency(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickLine={false}
                    axisLine={false}
                    width={140}
                    tickFormatter={(v: string) =>
                      v.length > 22 ? v.slice(0, 22) + '…' : v
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} fill="var(--chart-2)">
                    {(data?.topProducts || []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold">Low Stock Alert</CardTitle>
              <CardDescription>Perlu restock</CardDescription>
            </div>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="max-h-[240px] space-y-2 overflow-y-auto scrollbar-thin pr-1">
              {(data?.lowStock || []).length ? (
                data?.lowStock.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-md border border-border/60 p-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/12 text-amber-600">
                      <Package className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                        {p.stock}
                      </p>
                      <p className="text-[10px] text-muted-foreground">min {p.reorderLevel}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Package}
                  title="Stok aman"
                  description="Semua produk di atas reorder level."
                />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full text-xs"
              onClick={() => setActiveModule('inventory')}
            >
              Kelola Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <CardDescription>Aktivitas terbaru di tenant</CardDescription>
          </div>
          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {(data?.recentActivities || []).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/40"
              >
                <span className="mt-0.5 text-base leading-none">
                  {ACTIVITY_ICON[a.type] || '•'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground">{a.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {a.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {a.actor}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {formatRelativeTime(a.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
