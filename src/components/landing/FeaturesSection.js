'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, TrendingUp, Rocket, Users, Globe } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Lightning Fast',
    desc: 'Sub-second trades on Solana. Never miss a pump.',
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: 'Launch Your Meme',
    desc: 'Create and launch your own memecoin in seconds.',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Real-Time Charts',
    desc: 'Live candlestick charts powered by real on-chain data.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Non-Custodial',
    desc: 'Your keys, your coins. Always.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Community First',
    desc: 'Built by meme lovers, for meme lovers.',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Go Viral',
    desc: 'Share your wins. Built-in social tools.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Why <span className="text-chad-green">Chads</span> Choose Us
          </h2>
          <p className="text-chad-muted text-lg">Everything you need to win in the memecoin meta.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 hover:border-chad-green/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-chad-green/10 flex items-center justify-center text-chad-green mb-4 group-hover:bg-chad-green/20 transition-all">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-chad-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}