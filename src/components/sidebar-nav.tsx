'use client'

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { useERPStore } from '@/lib/store'
import type { ModuleId } from '@/lib/types'
import { BrandMark } from '@/components/brand-mark'
import { cn } from '@/lib/utils'

interface NavItem {
  id: ModuleId
  label: string
  icon: LucideIcon
  description: string
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Operasional',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Ringkasan KPI' },
      { id: 'sales', label: 'Sales', icon: ShoppingCart, description: 'Order & transaksi' },
      { id: 'inventory', label: 'Inventory', icon: Package, description: 'Stok barang' },
      { id: 'customers', label: 'Customers', icon: Users, description: 'CRM pelanggan' },
    ],
  },
  {
    group: 'Insight & Sistem',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Analitik bisnis' },
      { id: 'settings', label: 'Settings', icon: Settings, description: 'Konfigurasi tenant' },
    ],
  },
]

export function SidebarNav() {
  const { activeModule, setActiveModule, sidebarCollapsed } = useERPStore()

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-sidebar-border bg-sidebar',
        sidebarCollapsed ? 'w-[72px]' : 'w-[244px]'
      )}
    >
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
        <BrandMark collapsed={sidebarCollapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {NAV.map((section) => (
          <div key={section.group} className="mb-5">
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.group}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = activeModule === item.id
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    title={item.label}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                      sidebarCollapsed && 'justify-center'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0',
                        active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {!sidebarCollapsed && (
                      <span className="flex flex-col leading-tight">
                        {item.label}
                        <span className="text-[10px] font-normal text-muted-foreground/80">
                          {item.description}
                        </span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-brand-gradient p-3 text-white">
            <p className="text-xs font-semibold">Nexus Pro</p>
            <p className="mt-0.5 text-[11px] text-white/80">
              Multi-tenant enterprise plan aktif
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
