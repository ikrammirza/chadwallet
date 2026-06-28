'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';

export function useWalletBalance() {
  const { authenticated } = usePrivy();
  const { wallets, ready } = useWallets();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const wallet = wallets?.find(
    (w) => w.chainType === 'solana' || w.type === 'solana'
  );
  const address = wallet?.address;

  useEffect(() => {
    if (!authenticated || !ready || !address) {
      setBalance(null);
      return;
    }

    async function fetchBalance() {
      setLoading(true);
      try {
        const res = await fetch(`/api/wallet/balance?address=${address}`);
        const data = await res.json();
        setBalance(data.sol);
      } catch (err) {
        console.error('Balance fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 20000);
    return () => clearInterval(interval);
  }, [authenticated, ready, address]);

  return { balance, address, loading, ready };
}