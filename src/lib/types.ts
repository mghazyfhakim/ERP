// Shared domain types for Nexus ERP Suite

export type ModuleId =
  | 'dashboard'
  | 'sales'
  | 'inventory'
  | 'customers'
  | 'analytics'
  | 'settings'

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  description: string | null
  price: number
  cost: number
  stock: number
  reorderLevel: number
  supplier: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  type: 'individual' | 'business'
  status: 'active' | 'inactive' | 'vip'
  address: string | null
  city: string | null
  createdAt: string
  updatedAt: string
  totalSpent?: number
  ordersCount?: number
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentMethod = 'card' | 'cash' | 'transfer' | 'ewallet'

export interface OrderItem {
  id: string
  productId: string
  productName?: string
  productSku?: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName?: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  subtotal: number
  tax: number
  discount: number
  total: number
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

export interface Activity {
  id: string
  type: string
  title: string
  description: string
  actor: string
  meta: string | null
  createdAt: string
}

export interface Settings {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  currency: string
  currencySymbol: string
  language: string
  timezone: string
  taxRate: string
  lowStockAlerts: boolean
  orderNotifications: boolean
  weeklyReport: boolean
}

export interface DashboardStats {
  kpis: {
    revenue: number
    revenueDelta: number
    orders: number
    ordersDelta: number
    customers: number
    customersDelta: number
    avgOrderValue: number
    avgOrderDelta: number
  }
  revenueTrend: { month: string; revenue: number; orders: number }[]
  statusDistribution: { status: string; count: number; total: number }[]
  topProducts: { name: string; revenue: number; qty: number }[]
  lowStock: Product[]
  recentActivities: Activity[]
}

export interface AnalyticsData {
  revenueByCategory: { category: string; revenue: number }[]
  salesTrend: { date: string; revenue: number; orders: number }[]
  topCustomers: { name: string; totalSpent: number; orders: number }[]
  paymentBreakdown: { method: string; count: number; total: number }[]
  monthlyGrowth: { month: string; revenue: number; growth: number }[]
}
