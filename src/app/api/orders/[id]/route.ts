import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const status = body.status as string

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const existing = await db.order.findUnique({ where: { id }, include: { customer: true } })
  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updated = await db.order.update({
    where: { id },
    data: { status },
  })

  await db.activity.create({
    data: {
      type: status === 'paid' ? 'payment_received' : 'order_updated',
      title: status === 'paid' ? 'Payment received' : 'Order status updated',
      description: `Order ${existing.orderNumber} (${existing.customer?.name}) → ${status}`,
      actor: 'Operations',
      meta: JSON.stringify({ orderId: id, from: existing.status, to: status }),
    },
  })

  return NextResponse.json(updated)
}
