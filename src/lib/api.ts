// Lightweight API client + TanStack Query hooks for ERP modules
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  DashboardStats,
  Product,
  Customer,
  Order,
  OrderStatus,
  Activity,
  Settings,
  AnalyticsData,
} from './types'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

// ---- Dashboard ----
export function useDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => fetchJson<DashboardStats>('/api/dashboard'),
  })
}

// ---- Products ----
export function useProducts(filters?: { category?: string; status?: string; q?: string }) {
  const qs = new URLSearchParams()
  if (filters?.category && filters.category !== 'all') qs.set('category', filters.category)
  if (filters?.status && filters.status !== 'all') qs.set('status', filters.status)
  if (filters?.q) qs.set('q', filters.q)
  return useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: () => fetchJson<Product[]>(`/api/products?${qs.toString()}`),
  })
}

export function useRestockProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      fetchJson<Product>(`/api/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: amount }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

// ---- Customers ----
export function useCustomers(filters?: { q?: string; type?: string }) {
  const qs = new URLSearchParams()
  if (filters?.q) qs.set('q', filters.q)
  if (filters?.type && filters.type !== 'all') qs.set('type', filters.type)
  return useQuery<Customer[]>({
    queryKey: ['customers', filters],
    queryFn: () => fetchJson<Customer[]>(`/api/customers?${qs.toString()}`),
  })
}

export function useCustomerDetail(id: string | null) {
  return useQuery<Customer & { orders: Order[] }>({
    queryKey: ['customer', id],
    queryFn: () =>
      fetchJson<Customer & { orders: Order[] }>(`/api/customers/${id}`),
    enabled: !!id,
  })
}

// ---- Orders ----
export function useOrders(filters?: { status?: string; q?: string }) {
  const qs = new URLSearchParams()
  if (filters?.status && filters.status !== 'all') qs.set('status', filters.status)
  if (filters?.q) qs.set('q', filters.q)
  return useQuery<Order[]>({
    queryKey: ['orders', filters],
    queryFn: () => fetchJson<Order[]>(`/api/orders?${qs.toString()}`),
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      customerId: string
      items: { productId: string; quantity: number }[]
      paymentMethod?: string
    }) =>
      fetchJson<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      fetchJson<Order>(`/api/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ---- Activities ----
export function useActivities(limit = 10) {
  return useQuery<Activity[]>({
    queryKey: ['activities', limit],
    queryFn: () => fetchJson<Activity[]>(`/api/activities?limit=${limit}`),
  })
}

// ---- Analytics ----
export function useAnalytics(range: '6m' | '3m' | '12m' = '6m') {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', range],
    queryFn: () => fetchJson<AnalyticsData>(`/api/analytics?range=${range}`),
  })
}

// ---- Settings ----
export function useSettings() {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => fetchJson<Settings>('/api/settings'),
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Settings>) =>
      fetchJson<Settings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      qc.setQueryData(['settings'], data)
    },
  })
}
