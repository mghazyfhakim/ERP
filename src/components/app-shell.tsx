'use client'

import { useERPStore } from '@/lib/store'
import { SidebarNav } from '@/components/sidebar-nav'
import { Topbar } from '@/components/topbar'
import { Footer } from '@/components/footer'
import { DashboardModule } from '@/components/erp/dashboard'
import { SalesModule } from '@/components/erp/sales'
import { InventoryModule } from '@/components/erp/inventory'
import { CustomersModule } from '@/components/erp/customers'
import { AnalyticsModule } from '@/components/erp/analytics'
import { SettingsModule } from '@/components/erp/settings'
import { AnimatePresence, motion } from 'framer-motion'
import { useRealtimeActivity } from '@/hooks/use-realtime'
import { useEffect } from 'react'

export function AppShell() {
  const { activeModule } = useERPStore()
  useRealtimeActivity()

  // Rehydrate persisted UI state (module + sidebar) AFTER mount so the first
  // client render matches SSR (defaults) — avoids hydration mismatch.
  useEffect(() => {
    useERPStore.persist?.rehydrate?.()
  }, [])

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - hidden on small screens, replace with mobile sheet later */}
      <div className="hidden md:flex md:shrink-0">
        <SidebarNav />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {activeModule === 'dashboard' && <DashboardModule />}
              {activeModule === 'sales' && <SalesModule />}
              {activeModule === 'inventory' && <InventoryModule />}
              {activeModule === 'customers' && <CustomersModule />}
              {activeModule === 'analytics' && <AnalyticsModule />}
              {activeModule === 'settings' && <SettingsModule />}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  )
}
