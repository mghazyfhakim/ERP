// Zustand store for UI/navigation state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModuleId } from './types'

interface ERPState {
  activeModule: ModuleId
  sidebarCollapsed: boolean
  setActiveModule: (m: ModuleId) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
}

export const useERPStore = create<ERPState>()(
  persist(
    (set) => ({
      activeModule: 'dashboard',
      sidebarCollapsed: false,
      setActiveModule: (m) => set({ activeModule: m }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    }),
    {
      name: 'nexus-erp-ui',
      // Defer hydration until after mount so the first client render matches
      // the SSR output (defaults) — prevents a React hydration mismatch when
      // a persisted module/sidebar state differs from the server defaults.
      skipHydration: true,
      partialize: (s) => ({
        activeModule: s.activeModule,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    }
  )
)
