'use client';

import { useTrades } from '@/hooks/useTrades';

function shortAddr(addr) {
  if (!addr) return '—';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function timeAgo(ts) {
  const diff = Date.now() / 1000 - ts;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function LiveTrades({ address }) {
  const trades = useTrades(address);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-chad-border">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-chad-green animate-pulse-green" />
          Live Trades
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="grid grid-cols-4 px-3 py-2 text-xs text-chad-muted border-b border-chad-border sticky top-0 bg-chad-dark">
          <span>Wallet</span>
          <span>Type</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Time</span>
        </div>

        {trades.length === 0 && (
          <div className="p-6 text-center text-chad-muted text-sm">Loading trades...</div>
        )}

        {trades.map((trade, i) => {
          const isBuy = trade.side === 'buy';

          // Use from/to fields from BirdEye response
          const solSide = isBuy ? trade.from : trade.to;
          const usdValue = solSide?.uiAmount * solSide?.price || 0;

          // Token amount received/sent
          const tokenSide = isBuy ? trade.to : trade.from;
          const tokenAmount = tokenSide?.uiAmount || 0;
          const tokenSymbol = tokenSide?.symbol || '';

          return (
            <div
              key={`${trade.txHash}-${i}`}
              className="grid grid-cols-4 px-3 py-2 text-xs border-b border-chad-border/50 hover:bg-chad-card transition-all"
            >
              {/* Wallet */}
              <span className="text-chad-muted font-mono">
                {shortAddr(trade.owner)}
              </span>

              {/* Type */}
              <span className={`font-bold ${isBuy ? 'text-chad-green' : 'text-chad-red'}`}>
                {isBuy ? '▲ BUY' : '▼ SELL'}
              </span>

              {/* Amount */}
              <div className="text-right font-mono">
                <div className={isBuy ? 'text-chad-green' : 'text-chad-red'}>
                  {usdValue >= 1000
                    ? `$${(usdValue / 1000).toFixed(1)}K`
                    : `$${usdValue.toFixed(2)}`}
                </div>
                <div className="text-chad-muted text-[10px]">
                  {tokenAmount >= 1e6
                    ? `${(tokenAmount / 1e6).toFixed(2)}M`
                    : tokenAmount >= 1000
                    ? `${(tokenAmount / 1000).toFixed(2)}K`
                    : tokenAmount.toFixed(2)}{' '}
                  {tokenSymbol}
                </div>
              </div>

              {/* Time */}
              <span className="text-right text-chad-muted">
                {timeAgo(trade.blockUnixTime)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}