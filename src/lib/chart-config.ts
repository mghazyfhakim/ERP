// Chart color palette — derived from CSS variables, avoiding blue/indigo
export const CHART_COLORS = [
  'var(--chart-1)', // emerald
  'var(--chart-2)', // teal
  'var(--chart-3)', // amber
  'var(--chart-4)', // orange-red
  'var(--chart-5)', // pink-rose
]

export const CHART_COLOR_HEX = ['#10b981', '#14b8a6', '#f59e0b', '#f43f5e', '#ec4899']

export const STATUS_COLOR: Record<string, string> = {
  pending: 'var(--chart-3)',
  paid: 'var(--chart-2)',
  shipped: '#06b6d4',
  delivered: 'var(--chart-1)',
  cancelled: 'var(--chart-4)',
}
