'use client';

import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { formatPercent, toNum } from '@/lib/format';

export default function HeroSection() {
  const { login, authenticated } = usePrivy();
  const [stats, setStats] = useState({
    tokens: '—',
    volume: '—',
    topGainer: '—',
  });

  function handleLogin() {
    try {
      login();
    } catch (err) {
      console.error('Login error:', err);
    }
  }

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/tokens/trending');
        const data = await res.json();
        const tokens = data?.data?.tokens || [];
        if (tokens.length) {
          const totalVolume = tokens.reduce((sum, t) => sum + toNum(t.volume24hUSD), 0);
          const topGainer = [...tokens].sort(
            (a, b) => toNum(b.priceChange24hPercent) - toNum(a.priceChange24hPercent)
          )[0];
          setStats({
            tokens: `${tokens.length}+`,
            volume: totalVolume >= 1e6
              ? `$${(totalVolume / 1e6).toFixed(1)}M`
              : `$${(totalVolume / 1e3).toFixed(0)}K`,
            topGainer: topGainer
              ? `${topGainer.symbol} +${formatPercent(topGainer.priceChange24hPercent, 0)}%`
              : '—',
          });
        }
      } catch {
        // keep defaults
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="min-h-[calc(100vh-65px-88px)] flex flex-col items-center justify-center text-center px-6 pt-14 pb-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chad-green/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-chad-yellow/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-chad-green/30 bg-chad-green/10 text-chad-green text-sm font-semibold mb-6"
      >
        <span className="w-2 h-2 rounded-full bg-chad-green animate-pulse-green" />
        Live Memecoin Trading on Solana
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-7xl font-black leading-tight mb-6 max-w-4xl"
      >
        Launch Your Meme.{' '}
        <span className="text-chad-green text-glow">Go Viral.</span>
        <br />
        Realize Dreams.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg md:text-xl text-chad-muted max-w-2xl mb-10 leading-relaxed"
      >
        ChadWallet is the best memecoin trading app. Trade, launch, and go viral —
        all powered by Solana&apos;s lightning-fast blockchain.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 mb-16"
      >
        {authenticated ? (
          <Link
            href="/trade"
            prefetch={false}
            className="px-8 py-4 bg-chad-green text-chad-black font-bold text-lg rounded-xl hover:opacity-90 transition-all glow-green"
          >
            Start Trading →
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleLogin}
            className="px-8 py-4 bg-chad-green text-chad-black font-bold text-lg rounded-xl hover:opacity-90 transition-all glow-green"
          >
            Get Started Free →
          </button>
        )}
        <a
          href="#download"
          className="px-8 py-4 border border-chad-border text-white font-bold text-lg rounded-xl hover:border-chad-green hover:text-chad-green transition-all no-underline"
        >
          Download App
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-3 gap-8 md:gap-16"
      >
        {[
          { label: 'Trending Tokens', value: stats.tokens },
          { label: '24h Volume', value: stats.volume },
          { label: 'Top Gainer', value: stats.topGainer },
        ].map((stat) => (
          <div key={stat.label} className="text-center min-w-0">
            <div className="text-lg sm:text-xl md:text-3xl font-black text-chad-green truncate px-1">
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-chad-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
