'use client';

import { useEffect, useState } from 'react';
import { formatPercent, toNum } from '@/lib/format';

function TokenTicker({ tokens, direction = 'left', speed = 30 }) {
  const doubled = [...tokens, ...tokens];

  return (
    <div className="overflow-hidden w-full bg-chad-dark/95 border-y border-chad-border py-2.5">
      <div
        className={`flex gap-8 w-max ${
          direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'
        }`}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((token, i) => {
          const change = toNum(token.priceChange24hPercent);
          const href = `/trade?token=${encodeURIComponent(token.address)}`;

          return (
            <a
              key={`${token.address}-${i}`}
              href={href}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-chad-card transition-colors whitespace-nowrap group no-underline"
            >
              {token.logoURI ? (
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-5 h-5 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-chad-border flex items-center justify-center text-[10px] font-bold text-chad-green">
                  {token.symbol?.[0] || '?'}
                </div>
              )}
              <span className="text-sm font-semibold text-white group-hover:text-chad-green transition-colors">
                {token.symbol}
              </span>
              <span
                className={`text-xs font-mono font-bold tabular-nums ${
                  change >= 0 ? 'text-chad-green' : 'text-chad-red'
                }`}
              >
                {change >= 0 ? '+' : ''}
                {formatPercent(change)}%
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function TokenBanner({ variant = 'landing' }) {
  const [tokens, setTokens] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchTokens() {
      try {
        const res = await fetch('/api/tokens/trending');
        const data = await res.json();
        if (!cancelled && data?.data?.tokens?.length) {
          setTokens(data.data.tokens);
        }
      } catch (err) {
        console.error('Banner fetch error:', err);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    fetchTokens();
    const interval = setInterval(fetchTokens, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!ready || !tokens.length) {
    return (
      <div className="w-full bg-chad-dark border-y border-chad-border py-2.5 h-11">
        <div className="h-full bg-chad-card/40 animate-pulse rounded-sm mx-4" />
      </div>
    );
  }

  if (variant === 'inline') {
    return <TokenTicker tokens={tokens} direction="left" speed={35} />;
  }

  return (
    <>
      <div className="fixed top-[65px] left-0 right-0 z-40">
        <TokenTicker tokens={tokens} direction="left" speed={35} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <TokenTicker tokens={tokens} direction="right" speed={40} />
      </div>
    </>
  );
}
