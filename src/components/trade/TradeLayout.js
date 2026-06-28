'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LeftPanel from './LeftPanel';
import MiddlePanel from './MiddlePanel';
import RightPanel from './RightPanel';
import TradeNavbar from './TradeNavbar';
import TokenBanner from '@/components/landing/TokenBanner';
import { useTokenData } from '@/hooks/useTokenData';

const PANELS = [
  { id: 'trending', label: 'Trending' },
  { id: 'chart', label: 'Chart' },
  { id: 'trade', label: 'Trade' },
];

export default function TradeLayout() {
  const [selectedToken, setSelectedToken] = useState(null);
  const [mobilePanel, setMobilePanel] = useState('chart');

  const { data: tokenData } = useTokenData(selectedToken?.address);

  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenAddress = searchParams.get('token');

    if (tokenAddress) {
      setSelectedToken((prev) =>
        prev?.address === tokenAddress
          ? prev
          : { address: tokenAddress }
      );
    }
  }, [searchParams]);


  return (
    <div className="flex flex-col h-screen bg-chad-black overflow-hidden">

      <TradeNavbar />

      <div className="flex-shrink-0">
        <TokenBanner variant="inline" />
      </div>

      {/* Mobile tabs */}
      <div className="flex md:hidden border-b border-chad-border flex-shrink-0">

        {PANELS.map((p) => (
          <button
            key={p.id}
            onClick={() => setMobilePanel(p.id)}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              mobilePanel === p.id
                ? 'text-chad-green border-b-2 border-chad-green'
                : 'text-chad-muted'
            }`}
          >
            {p.label}
          </button>
        ))}

      </div>

      {/* Main panels */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">


        {/* LEFT PANEL */}
        <div
          className={`${
            mobilePanel === 'trending'
              ? 'flex'
              : 'hidden'
          }
          md:flex
          w-full
          md:w-[280px]
          lg:w-[300px]
          shrink-0
          h-full
          overflow-hidden`}
        >

          <LeftPanel

            selectedToken={selectedToken}

            onSelectToken={(token) => {
              setSelectedToken(token);
              setMobilePanel('chart');
            }}

            preselectedAddress={
              searchParams.get('token')
            }

          />

        </div>

        {/* MIDDLE PANEL */}
        <div
          className={`${
            mobilePanel === 'chart'
              ? 'flex'
              : 'hidden'
          }
          md:flex
          flex-1
          min-w-0
          h-full
          overflow-hidden`}
        >

          <div className="
            flex-1
            min-w-0
            h-full
            overflow-hidden
            border-l
            border-[#2A2A2A]
          ">

            <MiddlePanel

              token={selectedToken}

              tokenData={tokenData}

            />

          </div>

        </div>


        {/* RIGHT PANEL */}
        <div
          className={`${
            mobilePanel === 'trade'
              ? 'flex'
              : 'hidden'
          }
          md:flex
          w-full
          md:w-[320px]
          lg:w-[340px]
          shrink-0
          h-full
          overflow-hidden`}
        >

          <RightPanel

            token={selectedToken}

            tokenData={tokenData}

          />

        </div>

      </div>

    </div>
  );
}
