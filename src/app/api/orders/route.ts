import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const q = searchParams.get('q')

  const where: Record<string, unknown> = {}
  if (status && status !== 'all') where.status = status
  if (q) {
    where.OR = [{ orderNumber: { contains: q } }]
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true, company: true } },
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
  })

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerId: o.customerId,
      customerName: o.customer.name,
      status: o.status,
      paymentMethod: o.paymentMethod,
      subtotal: o.subtotal,
      tax: o.tax,
      discount: o.discount,
      total: o.total,
      notes: o.notes,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.product?.name || null,
        productSku: it.product?.sku || null,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total,
      })),
    }))
  )
}

export async function POST(req: Request) {
  const body = await req.json()
  const { customerId, items, paymentMethod = 'card' } = body as {
    customerId: string
    items: { productId: string; quantity: number }[]
    paymentMethod?: string
  }

  if (!customerId || !items?.length) {
    return NextResponse.json({ error: 'customerId and items are required' }, { status: 400 })
  }

  // Fetch products and verify stock
  const productIds = items.map((i) => i.productId)
  const products = await db.product.findMany({ where: { id: { in: productIds } } })
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Some products not found' }, { status: 400 })
  }

  const orderItems = items.map((i) => {
    const p = products.find((pr) => pr.id === i.productId)!
    return {
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: p.price,
      total: p.price * i.quantity,
    }
  })
  const subtotal = orderItems.reduce((s, it) => s + it.total, 0)
  const tax = Math.round(subtotal * 0.11)
  const discount = 0
  const total = subtotal + tax - discount

  // Generate order number
  const count = await db.order.count()
  const orderNumber = `ORD-${1000 + count + 1}`

  const customer = await db.customer.findUnique({ where: { id: customerId } })

  const [order] = await db.$transaction([
    db.order.create({
      data: {
        orderNumber,
        customerId,
        status: 'pending',
        paymentMethod,
        subtotal,
        tax,
        discount,
        total,
        items: { create: orderItems },
      },
    }),
    // decrement stock
    ...items.map((i) =>
      db.product.update({
        where: { id: i.productId },
        data: { stock: { decrement: i.quantity } },
      })
    ),
    db.activity.create({
      data: {
        type: 'order_created',
        title: 'New order created',
        description: `Order ${orderNumber} placed by ${customer?.name || 'customer'} — total Rp ${total.toLocaleString('id-ID')}`,
        actor: 'Sales Team',
        meta: JSON.stringify({ orderNumber, customerId, total }),
      },
    }),
  ])

  return NextResponse.json(order)
}
