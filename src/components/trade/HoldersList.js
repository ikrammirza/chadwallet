'use client';

import { useState, useEffect } from 'react';

function shortAddr(addr) {
  if (!addr) return '—';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) return '—';
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`;
  return amount.toFixed(2);
}

export default function HoldersList({ address }) {
  const [holders, setHolders] = useState([]);

  useEffect(() => {
    if (!address) return;

    async function fetchHolders() {
      try {
        const res = await fetch(`/api/tokens/holders?address=${address}`);
        const json = await res.json();
        if (json?.data?.items) setHolders(json.data.items);
      } catch (err) {
        console.error(err);
      }
    }

    fetchHolders();
  }, [address]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-chad-border">
        <h3 className="text-sm font-bold">Top Holders</h3>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-3 px-3 py-2 text-xs text-chad-muted border-b border-chad-border sticky top-0 bg-chad-dark">
          <span># Wallet</span>
          <span className="text-right">Amount</span>
          <span className="text-right">%</span>
        </div>

        {holders.length === 0 && (
          <div className="p-6 text-center text-chad-muted text-sm">Loading holders...</div>
        )}

        {holders.map((h, i) => (
          <div
            key={h.address}
            className="grid grid-cols-3 px-3 py-2 text-xs border-b border-chad-border/50 hover:bg-chad-card transition-all"
          >
            <span className="text-chad-muted font-mono">{i + 1}. {shortAddr(h.address)}</span>
            <span className="text-right font-mono">{formatAmount(h.uiAmount)}</span>
            <span className="text-right text-chad-green font-bold">
              {h.percentage?.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
