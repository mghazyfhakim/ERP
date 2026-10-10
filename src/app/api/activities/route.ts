import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') || 10)

  const activities = await db.activity.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return NextResponse.json(
    activities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      actor: a.actor,
      meta: a.meta,
      createdAt: a.createdAt.toISOString(),
    }))
  )
}
