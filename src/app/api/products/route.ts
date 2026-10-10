import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const q = searchParams.get('q')

  const where: Record<string, unknown> = {}
  if (category && category !== 'all') where.category = category
  if (status && status !== 'all') where.status = status
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { supplier: { contains: q } },
    ]
  }

  const products = await db.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}
