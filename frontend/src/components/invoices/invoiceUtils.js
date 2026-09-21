export function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

// 387000 -> $387K, 490000 -> $490K, 1_200_000 -> $1.2M
export function formatCompactMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export const STATUS_STYLES = {
  PAID: 'bg-emerald-500/15 text-emerald-400',
  PARTIAL: 'bg-amber-400/15 text-amber-400',
  UNPAID: 'bg-rose-500/15 text-rose-400',
}