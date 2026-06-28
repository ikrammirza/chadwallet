'use client';

import { useEffect, useState } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-chad-black flex items-center justify-center">
        <div className="text-chad-green font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#00FF88',
          logo: '/logo.png',
        },
        loginMethods: ['google', 'apple'],
        embeddedWallets: {
          createOnLogin: 'all-users',
          requireUserPasswordOnCreate: false,
          solana: {
            createOnLogin: 'all-users',
          },
        },
        solanaClusters: [
          {
            name: 'mainnet-beta',
            rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL,
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
