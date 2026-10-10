import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background/60">
      <div className="flex flex-col items-center justify-between gap-2 px-4 py-3 text-[11px] text-muted-foreground sm:flex-row md:px-6">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-foreground">Nexus ERP Suite</span>
          <span className="text-muted-foreground/60">·</span>
          <span>v1.4.2 · Build enterprise</span>
          <span className="hidden items-center gap-1 sm:flex">
            <span className="text-muted-foreground/60">·</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>© 2025 Nexus ERP</span>
          <span className="text-muted-foreground/60">·</span>
          <span className="flex items-center gap-1">
            Dibuat dengan <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> untuk ERP modern
          </span>
        </div>
      </div>
    </footer>
  )
}
