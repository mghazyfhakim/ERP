import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Settings } from '@/lib/types'

export const dynamic = 'force-dynamic'

const DEFAULTS: Settings = {
  companyName: 'Nexus ERP Suite',
  companyEmail: 'finance@nexus-erp.com',
  companyPhone: '+62 21 5550 1234',
  companyAddress: 'Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190',
  currency: 'IDR',
  currencySymbol: 'Rp',
  language: 'id',
  timezone: 'Asia/Jakarta',
  taxRate: '11',
  lowStockAlerts: true,
  orderNotifications: true,
  weeklyReport: true,
}

const BOOLEAN_KEYS: (keyof Settings)[] = [
  'lowStockAlerts',
  'orderNotifications',
  'weeklyReport',
]

export async function GET() {
  const rows = await db.setting.findMany()
  const map = new Map(rows.map((r) => [r.key, r.value]))

  const result = { ...DEFAULTS } as Record<string, unknown>
  for (const key of Object.keys(DEFAULTS)) {
    if (map.has(key)) {
      const raw = map.get(key)!
      if (BOOLEAN_KEYS.includes(key as keyof Settings)) {
        result[key] = raw === 'true'
      } else {
        result[key] = raw
      }
    }
  }
  return NextResponse.json(result)
}

export async function PUT(req: Request) {
  const body = (await req.json()) as Partial<Settings>

  for (const [key, value] of Object.entries(body)) {
    const stored = typeof value === 'boolean' ? String(value) : String(value ?? '')
    const existing = await db.setting.findUnique({ where: { key } })
    if (existing) {
      await db.setting.update({ where: { key }, data: { value: stored } })
    } else {
      await db.setting.create({ data: { key, value: stored } })
    }
  }

  // Return fresh full settings
  return GET()
}
