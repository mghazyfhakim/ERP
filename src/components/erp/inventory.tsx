'use client'

import { useMemo, useState } from 'react'
import { Search, Package, AlertTriangle, TrendingUp, Boxes, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useProducts, useRestockProduct } from '@/lib/api'
import { EmptyState } from './shared'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Electronics', 'Apparel', 'Home & Living', 'Office', 'Grocery', 'Sports']

export function InventoryModule() {
  const [category, setCategory] = useState('all')
  const [q, setQ] = useState('')
  const { data: products, isLoading } = useProducts({ category, q })

  const stats = useMemo(() => {
    const list = products || []
    const totalUnits = list.reduce((s, p) => s + p.stock, 0)
    const totalValue = list.reduce((s, p) => s + p.stock * p.cost, 0)
    const low = list.filter((p) => p.stock <= p.reorderLevel).length
    return { totalUnits, totalValue, low, count: list.length }
  }, [products])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Produk" value={String(stats.count)} icon={Boxes} tint="emerald" />
        <StatCard label="Total Unit" value={formatNumber(stats.totalUnits)} icon={Package} tint="teal" />
        <StatCard
          label="Nilai Inventory"
          value={formatCurrency(stats.totalValue)}
          icon={TrendingUp}
          tint="violet"
        />
        <StatCard
          label="Low Stock"
          value={String(stats.low)}
          icon={AlertTriangle}
          tint="amber"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Inventory Catalog</CardTitle>
            <p className="text-[11px] text-muted-foreground">Kelola stok produk & supplier</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari produk / SKU"
                className="h-9 w-44 pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua kategori</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : products?.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="Tidak ada produk"
              description="Ubah filter atau tambahkan produk baru."
            />
          )}
        </CardContent>
      </Card>
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
  icon: typeof Package
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

function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(10)
  const restock = useRestockProduct()

  const stockPct = Math.min(100, (product.stock / (product.reorderLevel * 3 || 1)) * 100)
  const isLow = product.stock <= product.reorderLevel
  const isCritical = product.stock <= Math.ceil(product.reorderLevel / 2)
  const margin = ((product.price - product.cost) / product.price) * 100

  return (
    <div className="group relative flex flex-col rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
          <p className="text-[10px] text-muted-foreground">{product.sku}</p>
        </div>
        {isLow && (
          <Badge variant="outline" className={cn('shrink-0 border-0', isCritical ? 'bg-rose-500/12 text-rose-600' : 'bg-amber-500/12 text-amber-600')}>
            {isCritical ? 'Critical' : 'Low'}
          </Badge>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px]">{product.category}</Badge>
        <span className="truncate text-[10px] text-muted-foreground">{product.supplier}</span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">{formatCurrency(product.price)}</p>
          <p className="text-[10px] text-muted-foreground">Margin {margin.toFixed(0)}%</p>
        </div>
        <div className="text-right">
          <p className={cn('text-base font-semibold', isLow ? 'text-rose-600' : 'text-foreground')}>
            {product.stock}
          </p>
          <p className="text-[10px] text-muted-foreground">unit stok</p>
        </div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: `${Math.max(8, stockPct)}%` }}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-3 h-8 text-xs"
        onClick={() => setOpen(true)}
      >
        Restock
      </Button>

      <RestockDialog
        open={open}
        onOpenChange={setOpen}
        product={product}
        amount={amount}
        setAmount={setAmount}
        onConfirm={() => {
          restock.mutate(
            { id: product.id, amount },
            {
              onSuccess: () => {
                toast.success(`${product.name} restock +${amount} unit`)
                setOpen(false)
              },
              onError: (e) => toast.error('Gagal restock', { description: e.message }),
            }
          )
        }}
        pending={restock.isPending}
      />
    </div>
  )
}

function RestockDialog({
  open,
  onOpenChange,
  product,
  amount,
  setAmount,
  onConfirm,
  pending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  product: Product
  amount: number
  setAmount: (n: number) => void
  onConfirm: () => void
  pending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restock {product.name}</DialogTitle>
          <DialogDescription>
            Stok saat ini: {product.stock} · Reorder level: {product.reorderLevel}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label className="text-xs">Jumlah Restock</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="h-9"
            />
            <Button variant="outline" size="sm" className="h-9" onClick={() => setAmount(product.reorderLevel)}>
              Reorder qty
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Stok setelah restock: <span className="font-medium text-foreground">{product.stock + amount}</span> unit
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={pending || amount <= 0}>
            {pending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Konfirmasi Restock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
