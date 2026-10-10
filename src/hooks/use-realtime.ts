'use client'

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useERPStore } from '@/lib/store'

const ACTIVITY_ICON: Record<string, string> = {
  order_created: '🛒',
  payment_received: '💳',
  order_updated: '🚚',
  stock_low: '⚠️',
  customer_added: '👤',
  restock: '📦',
}

const ACTIVITY_TONE: Record<string, 'success' | 'info' | 'warning'> = {
  order_created: 'success',
  payment_received: 'success',
  order_updated: 'info',
  stock_low: 'warning',
  customer_added: 'info',
}

/**
 * Connects to the Nexus ERP realtime mini-service (socket.io on port 3003
 * via Caddy XTransformPort). Invalidates relevant query caches and surfaces
 * a toast whenever a live business event arrives so the dashboard feels alive.
 */
export function useRealtimeActivity() {
  const qc = useQueryClient()
  const { activeModule } = useERPStore()

  useEffect(() => {
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      timeout: 10000,
    })

    socket.on('connect', () => {
      console.log('[nexus-realtime] connected')
    })

    // Silently tolerate a down realtime service — the app is fully functional
    // without realtime; this channel is an enhancement that lights up only
    // when the socket.io mini-service is reachable.
    socket.on('connect_error', () => {})
    socket.on('disconnect', () => {})

    socket.on('activity', (event: { type: string; title: string; description: string; actor: string }) => {
      // Refresh the data that the event affects
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['activities'] })
      if (activeModule === 'sales') qc.invalidateQueries({ queryKey: ['orders'] })
      if (activeModule === 'inventory') qc.invalidateQueries({ queryKey: ['products'] })
      if (activeModule === 'customers') qc.invalidateQueries({ queryKey: ['customers'] })

      const icon = ACTIVITY_ICON[event.type] || '•'
      const tone = ACTIVITY_TONE[event.type] || 'info'
      const fn = tone === 'success' ? toast.success : tone === 'warning' ? toast.warning : toast.info
      fn(`${icon} ${event.title}`, {
        description: `${event.description} · ${event.actor}`,
        duration: 5000,
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [qc, activeModule])
}
