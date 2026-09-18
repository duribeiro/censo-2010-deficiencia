export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR")
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`
}

/** Signed percentage points, used in the comparison badges. */
export function formatPoints(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : ""
  return `${sign}${Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} p.p.`
}

/** Short population, for example "190,8 mi". */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mi`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`
  }
  return formatNumber(value)
}

export function share(part: number, total: number): number {
  return total === 0 ? 0 : (part / total) * 100
}
