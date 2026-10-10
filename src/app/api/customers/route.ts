import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Customer } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const type = searchParams.get('type')

  const where: Record<string, unknown> = {}
  if (type && type !== 'all') where.type = type
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { company: { contains: q } },
      { phone: { contains: q } },
    ]
  }

  const customers = await db.customer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      orders: { select: { total: true, status: true } },
    },
  })

  const result: Customer[] = customers.map((c) => {
    const validOrders = c.orders.filter((o) => o.status !== 'cancelled')
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      type: c.type as 'individual' | 'business',
      status: c.status as 'active' | 'inactive' | 'vip',
      address: c.address,
      city: c.city,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      totalSpent: validOrders.reduce((s, o) => s + o.total, 0),
      ordersCount: c.orders.length,
    }
  })

  return NextResponse.json(result)
}
