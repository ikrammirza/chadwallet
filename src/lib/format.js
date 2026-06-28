export function toNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function formatPercent(value, digits = 2) {
  return toNum(value).toFixed(digits);
}

export function formatUsd(value) {
  const n = toNum(value, NaN);
  if (!Number.isFinite(n)) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  if (n < 0.01) return `$${n.toFixed(8)}`;
  return `$${n.toFixed(4)}`;
}

export function formatPrice(value) {
  const n = toNum(value, NaN);
  if (!Number.isFinite(n)) return '—';
  if (n < 0.01) return `$${n.toFixed(8)}`;
  return `$${n.toFixed(4)}`;
}
