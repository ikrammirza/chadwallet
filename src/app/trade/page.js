import { Suspense } from 'react';
import TradeLayout from '@/components/trade/TradeLayout';

export const metadata = {
  title: 'Trade — ChadWallet',
};

export default function TradePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-chad-black items-center justify-center">
        <div className="text-chad-green font-bold animate-pulse">Loading...</div>
      </div>
    }>
      <TradeLayout />
    </Suspense>
  );
}