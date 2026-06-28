'use client';

import { formatPercent, formatPrice, formatUsd, toNum } from '@/lib/format';

export default function TokenInfo({ data, loading }) {
  const overview = data?.overview;
  const price = data?.price?.value;
  const changeNum = toNum(overview?.priceChange24hPercent, NaN);

  if (loading && !data) {
    return (
      <div className="p-4 space-y-3 animate-pulse border-b border-chad-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-chad-card" />
          <div className="space-y-2">
            <div className="h-5 bg-chad-card rounded w-32" />
            <div className="h-4 bg-chad-card rounded w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-chad-card rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-chad-border bg-chad-black">
      <div className="flex items-center gap-3 mb-3">
        {overview?.logoURI ? (
          <img
            src={overview.logoURI}
            alt={overview.symbol}
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-chad-border flex items-center justify-center text-chad-green font-bold flex-shrink-0">
            {overview?.symbol?.[0] || '?'}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-black truncate">{overview?.name || '—'}</h1>
            <span className="text-chad-muted text-sm font-mono">{overview?.symbol || ''}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xl sm:text-2xl font-black font-mono tabular-nums">
              {formatPrice(price)}
            </span>
            {Number.isFinite(changeNum) && (
              <span className={`text-sm font-bold tabular-nums ${changeNum >= 0 ? 'text-chad-green' : 'text-chad-red'}`}>
                {changeNum >= 0 ? '+' : ''}{formatPercent(changeNum)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Market Cap', value: formatUsd(overview?.mc) },
          { label: '24h Volume', value: formatUsd(overview?.v24hUSD) },
          { label: 'Liquidity', value: formatUsd(overview?.liquidity) },
          { label: 'Holders', value: overview?.holder ? overview.holder.toLocaleString() : '—' },
        ].map((s) => (
          <div key={s.label} className="bg-chad-card rounded-lg p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs text-chad-muted mb-1">{s.label}</div>
            <div className="font-bold font-mono text-xs sm:text-sm tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
