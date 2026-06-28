'use client';

import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatPercent, toNum } from '@/lib/format';

export default function LeftPanel({ selectedToken, onSelectToken, preselectedAddress }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch('/api/tokens/trending');
        const data = await res.json();
        if (data?.data?.tokens) {
          const list = data.data.tokens;
          setTokens(list);

          if (preselectedAddress) {
            // Try to find the full token object from the list
            const match = list.find((t) => t.address === preselectedAddress);
            if (match) {
              onSelectToken(match);
            } else {
              // Token not in trending list — use minimal object, data loads from API
              onSelectToken({ address: preselectedAddress });
            }
          } else if (!selectedToken) {
            // No URL param — default to first token
            onSelectToken(list[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
    const interval = setInterval(fetchTrending, 60000);
    return () => clearInterval(interval);
  }, [preselectedAddress]);

  return (
    <div className="flex flex-col h-full border-r border-chad-border">
      <div className="p-4 border-b border-chad-border flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-chad-green" />
        <h2 className="font-bold text-sm">Trending</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading && (
          <div className="space-y-2 p-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-14 bg-chad-card rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {tokens.map((token) => {
          const isSelected = selectedToken?.address === token.address;
          const change = toNum(token.priceChange24hPercent);

          return (
            <button
              key={token.address}
              onClick={() => onSelectToken(token)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-b border-chad-border/50 hover:bg-chad-card transition-all text-left ${
                isSelected ? 'bg-chad-card border-l-2 border-l-chad-green' : ''
              }`}
            >
              {token.logoURI ? (
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-chad-border flex items-center justify-center text-xs font-bold text-chad-green flex-shrink-0">
                  {token.symbol?.[0]}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{token.symbol}</div>
                <div className="text-xs text-chad-muted truncate">{token.name}</div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className={`text-xs font-bold ${change >= 0 ? 'text-chad-green' : 'text-chad-red'}`}>
                  {change >= 0 ? '+' : ''}{formatPercent(change)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}