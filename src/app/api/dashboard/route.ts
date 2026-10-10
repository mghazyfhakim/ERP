import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date()
  const orders = await db.order.findMany({
    where: { status: { not: 'cancelled' } },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  // Compare last COMPLETE month vs the month before — avoids the misleading
  // "partial current month vs full last month" delta that plagues dashboards.
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59)

  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const revenueLast = orders.filter((o) => {
    const d = new Date(o.createdAt)
    return d >= lastMonthStart && d <= lastMonthEnd
  }).reduce((s, o) => s + o.total, 0)
  const revenuePrev = orders.filter((o) => {
    const d = new Date(o.createdAt)
    return d >= prevMonthStart && d <= prevMonthEnd
  }).reduce((s, o) => s + o.total, 0)
  const revenueDelta = revenuePrev > 0 ? ((revenueLast - revenuePrev) / revenuePrev) * 100 : revenueLast > 0 ? 100 : 0

  const ordersCount = orders.length
  const ordersLast = orders.filter((o) => {
    const d = new Date(o.createdAt)
    return d >= lastMonthStart && d <= lastMonthEnd
  }).length
  const ordersPrev = orders.filter((o) => {
    const d = new Date(o.createdAt)
    return d >= prevMonthStart && d <= prevMonthEnd
  }).length
  const ordersDelta = ordersPrev > 0 ? ((ordersLast - ordersPrev) / ordersPrev) * 100 : ordersLast > 0 ? 100 : 0

  const customers = await db.customer.count()
  const customersLast = await db.customer.count({
    where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
  })
  const customersPrev = await db.customer.count({
    where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } },
  })
  const customersDelta = customersPrev > 0 ? ((customersLast - customersPrev) / customersPrev) * 100 : customersLast > 0 ? 100 : 0

  const avgOrder = ordersCount > 0 ? revenue / ordersCount : 0
  const avgLast = ordersLast > 0 ? revenueLast / ordersLast : 0
  const avgPrev = ordersPrev > 0 ? revenuePrev / ordersPrev : 0
  const avgOrderDelta = avgPrev > 0 ? ((avgLast - avgPrev) / avgPrev) * 100 : 0

  // Revenue trend (6 months)
  const trend: { month: string; revenue: number; orders: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const s = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
    const monthOrders = orders.filter((o) => {
      const d = new Date(o.createdAt)
      return d >= s && d <= e
    })
    trend.push({
      month: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(s),
      revenue: monthOrders.reduce((sum, o) => sum + o.total, 0),
      orders: monthOrders.length,
    })
  }

  // Status distribution
  const allForStatus = await db.order.findMany({ select: { status: true, total: true } })
  const statusMap = new Map<string, { count: number; total: number }>()
  for (const o of allForStatus) {
    const cur = statusMap.get(o.status) || { count: 0, total: 0 }
    cur.count += 1
    cur.total += o.total
    statusMap.set(o.status, cur)
  }
  const statusDistribution = Array.from(statusMap.entries()).map(([status, v]) => ({
    status,
    count: v.count,
    total: v.total,
  }))

  // Top products
  const allItems = await db.orderItem.findMany({
    include: { product: { select: { name: true } } },
  })
  const productMap = new Map<string, { name: string; revenue: number; qty: number }>()
  for (const it of allItems) {
    const name = it.product?.name || 'Unknown'
    const cur = productMap.get(it.productId) || { name, revenue: 0, qty: 0 }
    cur.revenue += it.total
    cur.qty += it.quantity
    productMap.set(it.productId, cur)
  }
  const topProducts = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  // Low stock
  const lowStock = await db.product.findMany({
    where: { stock: { lte: db.product.fields.reorderLevel } },
    orderBy: { stock: 'asc' },
    take: 6,
  })

  // Recent activities
  const recentActivities = await db.activity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
  })

  return NextResponse.json({
    kpis: {
      revenue,
      revenueDelta,
      orders: ordersCount,
      ordersDelta,
      customers,
      customersDelta,
      avgOrderValue: avgOrder,
      avgOrderDelta,
    },
    revenueTrend: trend,
    statusDistribution,
    topProducts,
    lowStock,
    recentActivities,
  })
}
