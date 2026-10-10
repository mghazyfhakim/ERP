import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = (searchParams.get('range') || '6m') as '3m' | '6m' | '12m'
  const months = range === '3m' ? 3 : range === '12m' ? 12 : 6

  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1)

  const orders = await db.order.findMany({
    where: {
      status: { not: 'cancelled' },
      createdAt: { gte: startDate },
    },
    include: {
      items: { include: { product: { select: { category: true } } } },
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Revenue by category
  const catMap = new Map<string, number>()
  for (const o of orders) {
    for (const it of o.items) {
      const cat = it.product?.category || 'Other'
      catMap.set(cat, (catMap.get(cat) || 0) + it.total)
    }
  }
  const revenueByCategory = Array.from(catMap.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  // Sales trend (monthly buckets)
  const trendMap = new Map<string, { revenue: number; orders: number }>()
  for (let i = months - 1; i >= 0; i--) {
    const s = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(s)
    trendMap.set(label, { revenue: 0, orders: 0 })
  }
  for (const o of orders) {
    const s = new Date(o.createdAt)
    const label = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(s)
    const cur = trendMap.get(label) || { revenue: 0, orders: 0 }
    cur.revenue += o.total
    cur.orders += 1
    trendMap.set(label, cur)
  }
  const salesTrend = Array.from(trendMap.entries()).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    orders: v.orders,
  }))

  // Top customers
  const custMap = new Map<string, { name: string; totalSpent: number; orders: number }>()
  for (const o of orders) {
    const cur = custMap.get(o.customerId) || { name: o.customer?.name || 'Unknown', totalSpent: 0, orders: 0 }
    cur.totalSpent += o.total
    cur.orders += 1
    custMap.set(o.customerId, cur)
  }
  const topCustomers = Array.from(custMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 6)

  // Payment breakdown
  const payMap = new Map<string, { count: number; total: number }>()
  for (const o of orders) {
    const cur = payMap.get(o.paymentMethod) || { count: 0, total: 0 }
    cur.count += 1
    cur.total += o.total
    payMap.set(o.paymentMethod, cur)
  }
  const paymentBreakdown = Array.from(payMap.entries()).map(([method, v]) => ({
    method,
    count: v.count,
    total: v.total,
  }))

  // Monthly growth
  const monthlyGrowth = salesTrend.map((t, i) => {
    const prev = i > 0 ? salesTrend[i - 1].revenue : t.revenue
    const growth = prev > 0 ? ((t.revenue - prev) / prev) * 100 : 0
    return { month: t.date, revenue: t.revenue, growth }
  })

  return NextResponse.json({
    revenueByCategory,
    salesTrend,
    topCustomers,
    paymentBreakdown,
    monthlyGrowth,
  })
}
