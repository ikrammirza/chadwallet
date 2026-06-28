'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export function useTradeHistory() {
  const { user, authenticated } = usePrivy();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchHistory() {
    if (!authenticated || !user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trades/history?user_id=${user.id}`);
      const data = await res.json();
      if (data.trades) setTrades(data.trades);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, [authenticated, user?.id]);

  return { trades, loading, refetch: fetchHistory };
}