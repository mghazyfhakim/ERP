'use client'

import { useState } from 'react'
import {
  Building2,
  Globe,
  Bell,
  Palette,
  Save,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useSettings, useUpdateSettings } from '@/lib/api'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Settings } from '@/lib/types'

const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah (Rp)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' },
]
const LANGUAGES = [
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
]

export function SettingsModule() {
  const { data, isLoading } = useSettings()
  const update = useUpdateSettings()
  // Local edits overlay on top of server data — no effect syncing required.
  const [edits, setEdits] = useState<Partial<Settings>>({})

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  const form: Settings = { ...data, ...edits }

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setEdits((prev) => ({ ...prev, [key]: value }))
  }

  const save = () => {
    update.mutate(edits, {
      onSuccess: () => {
        toast.success('Pengaturan tersimpan')
        setEdits({})
      },
      onError: (e) => toast.error('Gagal menyimpan', { description: e.message }),
    })
  }

  return (
    <div className="space-y-6">
      {/* Company Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-600">
              <Building2 className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">Company Profile</CardTitle>
              <CardDescription>Identitas tenant & informasi perusahaan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Nama Perusahaan</Label>
            <Input
              value={form.companyName}
              onChange={(e) => set('companyName', e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email Finance</Label>
            <Input
              type="email"
              value={form.companyEmail}
              onChange={(e) => set('companyEmail', e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Telepon</Label>
            <Input
              value={form.companyPhone}
              onChange={(e) => set('companyPhone', e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Tax Rate (%)</Label>
            <Input
              type="number"
              value={form.taxRate}
              onChange={(e) => set('taxRate', e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs">Alamat</Label>
            <Input
              value={form.companyAddress}
              onChange={(e) => set('companyAddress', e.target.value)}
              className="h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/12 text-teal-600">
              <Globe className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">Localization</CardTitle>
              <CardDescription>Mata uang, bahasa & zona waktu</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Currency</Label>
            <Select
              value={form.currency}
              onValueChange={(v) => {
                const c = CURRENCIES.find((x) => x.code === v)
                if (c) {
                  set('currency', c.code)
                  set('currencySymbol', c.symbol)
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Language</Label>
            <Select
              value={form.language}
              onValueChange={(v) => set('language', v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Timezone</Label>
            <Input value={form.timezone} onChange={(e) => set('timezone', e.target.value)} className="h-9" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/12 text-amber-600">
              <Bell className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
              <CardDescription>Preferensi notifikasi otomatis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            { key: 'lowStockAlerts' as const, label: 'Low stock alerts', desc: 'Notif saat produk di bawah reorder level' },
            { key: 'orderNotifications' as const, label: 'Order notifications', desc: 'Notif order baru & perubahan status' },
            { key: 'weeklyReport' as const, label: 'Weekly report', desc: 'Ringkasan performa tiap Senin' },
          ].map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2.5"
            >
              <div>
                <p className="text-xs font-medium text-foreground">{row.label}</p>
                <p className="text-[11px] text-muted-foreground">{row.desc}</p>
              </div>
              <Switch
                checked={form[row.key]}
                onCheckedChange={(v) => set(row.key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Appearance & Security */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/12 text-violet-600">
                <Palette className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
                <CardDescription>Tema tampilan aplikasi</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium text-foreground">Dark / Light mode</p>
                <p className="text-[11px] text-muted-foreground">Toggle tema sistem</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold">Plan & Security</CardTitle>
                <CardDescription>Tenant subscription & access</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-md bg-brand-gradient p-3 text-white">
              <div>
                <p className="text-xs font-semibold">Nexus Pro</p>
                <p className="text-[11px] text-white/80">Enterprise · Multi-tenant</p>
              </div>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                Active
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span>API Keys</span>
                <span className="text-foreground">3 active</span>
              </div>
              <div className="flex justify-between">
                <span>Team members</span>
                <span className="text-foreground">12 seats</span>
              </div>
              <div className="flex justify-between">
                <span>2FA</span>
                <span className="text-emerald-600">Enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-3 flex justify-end gap-2 rounded-lg border border-border bg-background/80 p-3 backdrop-blur-md">
        <Button variant="outline" onClick={() => setEdits({})}>
          Reset
        </Button>
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1 h-4 w-4" />
          )}
          Simpan Perubahan
        </Button>
      </div>
    </div>
  )
}
