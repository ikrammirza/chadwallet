'use client';

import { useState, useEffect } from 'react';

export function useTrades(address) {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (!address) return;

    async function fetchTrades() {
      try {
        const res = await fetch(`/api/tokens/trades?address=${address}`);
        const json = await res.json();

        // BirdEye returns items under data.items or data.trades
        const items = json?.data?.items || json?.data?.trades || [];
        setTrades(items);
      } catch (err) {
        console.error(err);
      }
    }

    fetchTrades();
    const interval = setInterval(fetchTrades, 30000);
    return () => clearInterval(interval);
  }, [address]);

  return trades;
}