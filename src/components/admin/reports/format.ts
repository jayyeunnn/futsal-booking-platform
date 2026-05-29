export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Compact rupiah for chart axes — e.g. 1.2 jt, 850 rb.
 * Falls back to plain rupiah for small amounts.
 */
export function formatRupiahShort(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) {
    return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
  }
  if (Math.abs(n) >= 1_000_000) {
    return `Rp ${(n / 1_000_000).toFixed(1)} jt`;
  }
  if (Math.abs(n) >= 1_000) {
    return `Rp ${Math.round(n / 1_000)} rb`;
  }
  return `Rp ${n}`;
}
