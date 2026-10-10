'use client'

import { Search, Bell, PanelLeft, Plus, ChevronDown, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useERPStore } from '@/lib/store'
import { useDashboard, useActivities } from '@/lib/api'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'

const ACTIVITY_COLORS: Record<string, string> = {
  order_created: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  payment_received: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  order_updated: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  stock_low: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  customer_added: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  restock: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
}

export function Topbar() {
  const { toggleSidebar, activeModule } = useERPStore()
  const dashboardQuery = useDashboard()
  const activitiesQuery = useActivities(8)

  const lowStockCount = dashboardQuery.data?.lowStock?.length || 0
  const notificationCount = (lowStockCount > 0 ? 1 : 0) + (activitiesQuery.data?.length ? 1 : 0)
  const [query, setQuery] = useState('')

  const title = useMemo(() => {
    const map: Record<string, string> = {
      dashboard: 'Dashboard',
      sales: 'Sales & Orders',
      inventory: 'Inventory',
      customers: 'Customer CRM',
      analytics: 'Analytics',
      settings: 'Settings',
    }
    return map[activeModule] || 'Dashboard'
  }, [activeModule])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-9 w-9 text-muted-foreground"
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      <div className="flex flex-col">
        <h1 className="text-base font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        <p className="hidden text-[11px] text-muted-foreground sm:block">
          Nexus ERP Suite — tenant workspace
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari order, produk, customer…"
            className="h-9 w-56 pl-9 lg:w-72"
          />
        </div>

        <Button size="sm" className="hidden h-9 gap-1.5 sm:flex">
          <Plus className="h-4 w-4" />
          New Order
        </Button>

        <ThemeToggle />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Notifikasi</p>
              <Badge variant="secondary" className="text-[10px]">
                {activitiesQuery.data?.length || 0} baru
              </Badge>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {activitiesQuery.isLoading ? (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                  Memuat…
                </p>
              ) : activitiesQuery.data?.length ? (
                activitiesQuery.data.slice(0, 6).map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 border-b px-4 py-2.5 last:border-0 hover:bg-accent/40"
                  >
                    <span
                      className={cn(
                        'mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                        ACTIVITY_COLORS[a.type] || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {a.actor.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {a.title}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {a.description}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {formatRelativeTime(a.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                  Tidak ada notifikasi
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border border-border bg-background px-1.5 py-1 pr-2 transition-colors hover:bg-accent/50">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-brand-gradient text-[11px] font-semibold text-white">
                  NA
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Nexus Admin</span>
                <span className="text-[11px] text-muted-foreground">
                  admin@nexus-erp.com
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profil & Preferensi</DropdownMenuItem>
            <DropdownMenuItem>Akses & Tim</DropdownMenuItem>
            <DropdownMenuItem>Integrasi API</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-rose-600 focus:text-rose-600">
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
