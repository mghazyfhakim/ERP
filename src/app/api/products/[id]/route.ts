import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const stock = Number(body.stock)

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const newStock = existing.stock + stock
  const updated = await db.product.update({
    where: { id },
    data: { stock: newStock },
  })

  // If restocked above reorder, log activity
  if (stock !== 0) {
    await db.activity.create({
      data: {
        type: 'restock',
        title: 'Inventory restocked',
        description: `${existing.name} stock ${stock > 0 ? 'increased' : 'reduced'} by ${Math.abs(stock)} → ${newStock} units`,
        actor: 'Inventory Manager',
        meta: JSON.stringify({ productId: id, delta: stock, newStock }),
      },
    })
  }

  return NextResponse.json(updated)
}
