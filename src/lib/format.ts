// Formatting utilities for Nexus ERP Suite

const currencyFormatters: Record<string, Intl.NumberFormat> = {}
const numberFormatter = new Intl.NumberFormat('id-ID')

export function getCurrencyFormatter(currency: string) {
  if (!currencyFormatters[currency]) {
    currencyFormatters[currency] = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    })
  }
  return currencyFormatters[currency]
}

export function formatCurrency(
  value: number,
  currency = 'IDR',
  symbol?: string
): string {
  if (symbol) {
    return `${symbol} ${numberFormatter.format(Math.round(value))}`
  }
  try {
    return getCurrencyFormatter(currency).format(value)
  } catch {
    return `Rp ${numberFormatter.format(Math.round(value))}`
  }
}

export function formatCompactCurrency(
  value: number,
  currency = 'IDR',
  symbol = 'Rp'
): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${symbol} ${(value / 1_000_000_000).toFixed(1)}M`
  if (abs >= 1_000_000) return `${symbol} ${(value / 1_000_000).toFixed(1)}jt`
  if (abs >= 1_000) return `${symbol} ${(value / 1_000).toFixed(0)}rb`
  return `${symbol} ${Math.round(value)}`
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(value: number, digits = 1): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

export function formatDate(date: string | Date, withTime = false): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
  if (withTime) {
    opts.hour = '2-digit'
    opts.minute = '2-digit'
  }
  return new Intl.DateTimeFormat('id-ID', opts).format(d)
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (sec < 60) return 'baru saja'
  if (min < 60) return `${min} menit lalu`
  if (hr < 24) return `${hr} jam lalu`
  if (day < 7) return `${day} hari lalu`
  return formatDate(d)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
