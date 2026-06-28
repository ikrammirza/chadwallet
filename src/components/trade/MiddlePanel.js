'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import TokenInfo from './TokenInfo';
import LiveTrades from './LiveTrades';
import HoldersList from './HoldersList';

const PriceChart = dynamic(() => import('./PriceChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[328px] flex items-center justify-center text-chad-muted text-sm bg-chad-dark border-b border-chad-border">
      Loading chart...
    </div>
  ),
});

const TABS = ['Trades', 'Holders'];

export default function MiddlePanel({ token, tokenData }) {
  const [activeTab, setActiveTab] = useState('Trades');
  const loading = !tokenData && !!token?.address;

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      <TokenInfo data={tokenData} loading={loading} />

      <div className="border-b border-chad-border bg-chad-dark shrink-0">
        {token?.address ? (
          <PriceChart key={token.address} address={token.address} />
        ) : (
          <div className="h-[328px] flex items-center justify-center text-chad-muted text-sm">
            Select a token to view chart
          </div>
        )}
      </div>

      <div className="flex border-b border-chad-border flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-bold transition-all ${
              activeTab === tab
                ? 'text-chad-green border-b-2 border-chad-green'
                : 'text-chad-muted hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'Trades' && token && <LiveTrades address={token.address} />}
        {activeTab === 'Holders' && token && <HoldersList address={token.address} />}
        {!token && (
          <div className="h-full flex items-center justify-center text-chad-muted text-sm">
            Select a token
          </div>
        )}
      </div>
    </div>
  );
}
