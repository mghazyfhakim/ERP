'use client'

import { useMemo, useState } from 'react'
import { Search, Users, Crown, Building2, User as UserIcon, Mail, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCustomers, useCustomerDetail } from '@/lib/api'
import { StatusBadge, EmptyState } from './shared'
import { formatCurrency, formatDate, initials } from '@/lib/format'
import { cn } from '@/lib/utils'

export function CustomersModule() {
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data: customers, isLoading } = useCustomers({ q, type })

  const totalSpent = useMemo(
    () => customers?.reduce((s, c) => s + (c.totalSpent || 0), 0) || 0,
    [customers]
  )
  const vipCount = customers?.filter((c) => c.status === 'vip').length || 0
  const businessCount = customers?.filter((c) => c.type === 'business').length || 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Customer" value={String(customers?.length || 0)} icon={Users} tint="violet" />
        <StatCard label="VIP" value={String(vipCount)} icon={Crown} tint="amber" />
        <StatCard label="Business" value={String(businessCount)} icon={Building2} tint="teal" />
        <StatCard label="Lifetime Value" value={formatCurrency(totalSpent)} icon={Users} tint="emerald" />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Customer Database</CardTitle>
            <p className="text-[11px] text-muted-foreground">CRM pelanggan & riwayat transaksi</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / email"
                className="h-9 w-44 pl-9"
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua tipe</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : customers?.length ? (
            <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase">Customer</TableHead>
                    <TableHead className="hidden text-[11px] uppercase md:table-cell">Tipe</TableHead>
                    <TableHead className="hidden text-[11px] uppercase lg:table-cell">Kota</TableHead>
                    <TableHead className="text-right text-[11px] uppercase">Orders</TableHead>
                    <TableHead className="text-right text-[11px] uppercase">Total Spent</TableHead>
                    <TableHead className="text-[11px] uppercase">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer text-sm hover:bg-accent/40"
                      onClick={() => setSelectedId(c.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback
                              className={cn(
                                'text-[10px] font-semibold',
                                c.status === 'vip'
                                  ? 'bg-violet-500/15 text-violet-600'
                                  : 'bg-brand-gradient text-white'
                              )}
                            >
                              {initials(c.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">{c.name}</span>
                            <span className="text-[10px] text-muted-foreground">{c.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          {c.type === 'business' ? (
                            <Building2 className="h-3 w-3" />
                          ) : (
                            <UserIcon className="h-3 w-3" />
                          )}
                          {c.type}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                        {c.city || '-'}
                      </TableCell>
                      <TableCell className="text-right text-xs">{c.ordersCount || 0}</TableCell>
                      <TableCell className="text-right text-xs font-medium">
                        {formatCurrency(c.totalSpent || 0)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Tidak ada customer"
              description="Ubah filter untuk melihat hasil lain."
            />
          )}
        </CardContent>
      </Card>

      <CustomerDetailSheet id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string
  value: string
  icon: typeof Users
  tint: 'emerald' | 'teal' | 'amber' | 'violet'
}) {
  const tints: Record<string, string> = {
    emerald: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
    teal: 'bg-teal-500/12 text-teal-600 dark:text-teal-400',
    amber: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
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

function CustomerDetailSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading } = useCustomerDetail(id)
  const open = !!id

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto scrollbar-thin">
        {isLoading || !data ? (
          <div className="space-y-3 p-1">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback
                    className={cn(
                      'text-sm font-semibold',
                      data.status === 'vip'
                        ? 'bg-violet-500/15 text-violet-600'
                        : 'bg-brand-gradient text-white'
                    )}
                  >
                    {initials(data.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-base">{data.name}</SheetTitle>
                  <SheetDescription className="flex items-center gap-2 text-xs">
                    <StatusBadge status={data.status} /> · {data.type}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{data.email}</span>
              </div>
              {data.phone && (
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{data.phone}</span>
                </div>
              )}
              {data.address && (
                <div className="flex items-start gap-2 text-xs">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {data.address}
                    {data.city ? `, ${data.city}` : ''}
                  </span>
                </div>
              )}
              {data.company && (
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{data.company}</span>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Orders</p>
                <p className="text-lg font-semibold text-foreground">{data.orders.length}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lifetime Value</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(
                    data.orders
                      .filter((o) => o.status !== 'cancelled')
                      .reduce((s, o) => s + o.total, 0)
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold text-foreground">Riwayat Order</p>
              <div className="space-y-2">
                {data.orders.length ? (
                  data.orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-md border border-border/60 p-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground">{o.orderNumber}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(o.createdAt, true)} · {o.items.length} item
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={o.status} />
                        <span className="text-xs font-medium">{formatCurrency(o.total)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    Belum ada riwayat order
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
