'use client';

import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import Link from 'next/link';

export default function TradeNavbar() {
  const { login, logout, authenticated, user, ready } = usePrivy();

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-chad-black/90 backdrop-blur-md border-b border-chad-border flex-shrink-0 h-14">
      <Link href="/" prefetch={false} className="flex items-center gap-2 shrink-0">
        <Image src="/logo.png" alt="ChadWallet" width={28} height={28} className="rounded-lg" />
        <span className="font-bold text-lg text-white">
          Chad<span className="text-chad-green">Wallet</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {authenticated && (
          <span className="text-xs text-chad-muted hidden sm:block truncate max-w-[140px]">
            {user?.email?.address || user?.google?.email || 'Chad'}
          </span>
        )}
        {authenticated ? (
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 text-xs font-semibold border border-chad-border rounded-lg hover:border-chad-green hover:text-chad-green transition-all"
          >
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={() => ready && login()}
            disabled={!ready}
            className="px-4 py-1.5 text-xs font-bold bg-chad-green text-chad-black rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
