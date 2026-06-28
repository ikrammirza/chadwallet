import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="pb-16 pt-8 px-6 border-t border-chad-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="ChadWallet" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-white">
            Chad<span className="text-chad-green">Wallet</span>
          </span>
        </div>
        <p className="text-chad-muted text-sm">© 2026 ChadWallet. Built for the chads.</p>
        <div className="flex gap-6 text-sm text-chad-muted">
          <span className="hover:text-chad-green transition-colors cursor-default">Terms</span>
          <span className="hover:text-chad-green transition-colors cursor-default">Privacy</span>
          <Link href="/trade" prefetch={false} className="hover:text-chad-green transition-colors">Trade</Link>
        </div>
      </div>
    </footer>
  );
}