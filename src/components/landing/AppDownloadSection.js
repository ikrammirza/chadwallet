'use client';

import { motion } from 'framer-motion';
import { Apple, Smartphone } from 'lucide-react';

export default function AppDownloadSection() {
  return (
    <section id="download" className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Trade on the <span className="text-chad-green">Go</span>
          </h2>
          <p className="text-chad-muted text-lg mb-12">
            Download ChadWallet and never miss a moon shot.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="https://apps.apple.com/us/app/chadwallet/id6757367474"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-8 py-4 bg-chad-card border border-chad-border rounded-2xl hover:border-chad-green transition-all group"
          >
            <Apple className="w-8 h-8 text-chad-green" />
            <div className="text-left">
              <div className="text-xs text-chad-muted">Download on the</div>
              <div className="font-bold text-lg">App Store</div>
            </div>
          </a>

          <a
            href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-8 py-4 bg-chad-card border border-chad-border rounded-2xl hover:border-chad-green transition-all group"
          >
            <Smartphone className="w-8 h-8 text-chad-green" />
            <div className="text-left">
              <div className="text-xs text-chad-muted">Get it on</div>
              <div className="font-bold text-lg">Google Play</div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
