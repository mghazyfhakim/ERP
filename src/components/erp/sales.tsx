'use client'

import { useMemo, useState } from 'react'
import { Search, Plus, ShoppingCart, Package, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useOrders, useCustomers, useProducts, useCreateOrder, useUpdateOrderStatus } from '@/lib/api'
import { StatusBadge, EmptyState } from './shared'
import { formatCurrency, formatDate } from '@/lib/format'
import type { OrderStatus } from '@/lib/types'

const STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

export function SalesModule() {
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const { data: orders, isLoading } = useOrders({ status, q })
  const [createOpen, setCreateOpen] = useState(false)

  const totalRevenue = useMemo(
    () => orders?.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0) || 0,
    [orders]
  )
  const pendingCount = orders?.filter((o) => o.status === 'pending').length || 0
  const deliveredCount = orders?.filter((o) => o.status === 'delivered').length || 0

  return (
    <div className="space-y-6">
      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Total Order" value={String(orders?.length || 0)} icon={ShoppingCart} tint="emerald" />
        <MiniStat label="Revenue (valid)" value={formatCurrency(totalRevenue)} icon={Package} tint="teal" />
        <MiniStat label="Pending" value={String(pendingCount)} icon={Package} tint="amber" />
        <MiniStat label="Delivered" value={String(deliveredCount)} icon={Package} tint="violet" />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Order Transactions</CardTitle>
            <p className="text-[11px] text-muted-foreground">Kelola & lacak semua order</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari order #"
                className="h-9 w-40 pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders?.length ? (
            <div className="max-h-[560px] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] uppercase">Order #</TableHead>
                    <TableHead className="text-[11px] uppercase">Customer</TableHead>
                    <TableHead className="hidden text-[11px] uppercase sm:table-cell">Tanggal</TableHead>
                    <TableHead className="hidden text-[11px] uppercase sm:table-cell">Items</TableHead>
                    <TableHead className="text-right text-[11px] uppercase">Total</TableHead>
                    <TableHead className="text-[11px] uppercase">Status</TableHead>
                    <TableHead className="text-right text-[11px] uppercase">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} className="text-sm">
                      <TableCell className="font-medium text-foreground">
                        {o.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{o.customerName}</span>
                          <span className="text-[10px] capitalize text-muted-foreground">
                            {o.paymentMethod}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                        {formatDate(o.createdAt, true)}
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                        {o.items.length} item
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(o.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusSelect orderId={o.id} current={o.status as OrderStatus} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="Tidak ada order"
              description="Coba ubah filter atau buat order baru."
            />
          )}
        </CardContent>
      </Card>
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
  icon: typeof ShoppingCart
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

function StatusSelect({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const update = useUpdateOrderStatus()
  return (
    <Select
      value={current}
      onValueChange={(v) => {
        update.mutate(
          { id: orderId, status: v as OrderStatus },
          {
            onSuccess: () => toast.success(`Order diperbarui → ${v}`),
            onError: (e) => toast.error('Gagal memperbarui', { description: e.message }),
          }
        )
      }}
    >
      <SelectTrigger className="h-7 w-28 text-[11px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs capitalize">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function CreateOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { data: customers } = useCustomers()
  const { data: products } = useProducts()
  const create = useCreateOrder()

  const [customerId, setCustomerId] = useState('')
  const [payment, setPayment] = useState('card')
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 },
  ])
  const [query, setQuery] = useState('')

  const filteredProducts = useMemo(
    () => (products || []).filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  )

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const p = products?.find((x) => x.id === it.productId)
      return sum + (p ? p.price * it.quantity : 0)
    }, 0)
  }, [items, products])

  const submit = () => {
    const validItems = items.filter((i) => i.productId && i.quantity > 0)
    if (!customerId || validItems.length === 0) {
      toast.error('Lengkapi customer & minimal 1 item')
      return
    }
    create.mutate(
      { customerId, items: validItems, paymentMethod: payment },
      {
        onSuccess: () => {
          toast.success('Order berhasil dibuat')
          onOpenChange(false)
          setCustomerId('')
          setItems([{ productId: '', quantity: 1 }])
        },
        onError: (e) => toast.error('Gagal membuat order', { description: e.message }),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1.5">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buat Order Baru</DialogTitle>
          <DialogDescription>Pilih customer & tambahkan item produk ke order.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Pilih customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.company ? `· ${c.company}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Metode Pembayaran</Label>
            <Select value={payment} onValueChange={setPayment}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="ewallet">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Items</Label>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px]"
              onClick={() => setItems([...items, { productId: '', quantity: 1 }])}
            >
              <Plus className="h-3 w-3" /> Tambah
            </Button>
          </div>
          {items.map((it, idx) => {
            const p = products?.find((x) => x.id === it.productId)
            return (
              <div key={idx} className="flex items-center gap-2">
                <Select
                  value={it.productId}
                  onValueChange={(v) => {
                    const next = [...items]
                    next[idx] = { ...next[idx], productId: v }
                    setItems(next)
                  }}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} · {formatCurrency(p.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) => {
                    const next = [...items]
                    next[idx] = { ...next[idx], quantity: Number(e.target.value) || 1 }
                    setItems(next)
                  }}
                  className="h-9 w-16"
                />
                <span className="w-28 text-right text-xs font-medium">
                  {p ? formatCurrency(p.price * it.quantity) : '-'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  disabled={items.length === 1}
                >
                  ×
                </Button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2">
          <span className="text-xs text-muted-foreground">Total (incl. PPN 11%)</span>
          <span className="text-base font-semibold text-foreground">
            {formatCurrency(total * 1.11)}
          </span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Simpan Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
