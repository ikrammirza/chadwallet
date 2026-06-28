'use client';

import { useState, useEffect } from 'react';

export function useTokenData(address) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchTokenData() {
      try {
        const res = await fetch(`/api/tokens/price?address=${address}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        console.error('Token data error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    fetchTokenData();
    const interval = setInterval(fetchTokenData, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [address]);

  return { data, loading };
}
