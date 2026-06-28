'use client';

import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const { login, logout, authenticated, user, ready } = usePrivy();

  function handleLogin() {
    if (!ready) return;
    login();
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-chad-black/90 backdrop-blur-md border-b border-chad-border h-[65px]">
      <Link href="/" prefetch={false} className="flex items-center gap-2 shrink-0">
        <Image src="/logo.png" alt="ChadWallet" width={32} height={32} className="rounded-lg" />
        <span className="font-bold text-lg sm:text-xl text-white">
          Chad<span className="text-chad-green">Wallet</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-chad-muted font-medium">
        <a href="#features" className="hover:text-chad-green transition-colors">Features</a>
        <a href="#download" className="hover:text-chad-green transition-colors">Download</a>
        <Link href="/trade" prefetch={false} className="hover:text-chad-green transition-colors">Trade</Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {authenticated ? (
          <>
            <span className="text-xs sm:text-sm text-chad-muted hidden md:block truncate max-w-[160px]">
              {user?.email?.address || user?.google?.email || 'Chad'}
            </span>
            <button
              type="button"
              onClick={logout}
              className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold border border-chad-border rounded-lg hover:border-chad-green hover:text-chad-green transition-all"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleLogin}
            disabled={!ready}
            className="px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-chad-green text-chad-black rounded-lg hover:opacity-90 transition-all glow-green disabled:opacity-50"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
