'use client'

import { Boxes } from 'lucide-react'

export function BrandMark({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-sm">
        <Boxes className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Nexus ERP
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Suite
          </span>
        </div>
      )}
    </div>
  )
}
