'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

const INTERVALS = ['1m', '5m', '15m', '1H', '4H', '1D'];
const CHART_HEIGHT = 280;

export default function PriceChart({ address }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const [activeInterval, setActiveInterval] = useState('15m');
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!address || !containerRef.current) return;

    let destroyed = false;
    const container = containerRef.current;

    function waitForSize(el, cb) {
      if (el.clientWidth > 0) {
        cb();
        return;
      }
      const ro = new ResizeObserver(() => {
        if (el.clientWidth > 0) {
          ro.disconnect();
          cb();
        }
      });
      ro.observe(el);
    }

    waitForSize(container, () => {
      if (destroyed) return;

      const chart = createChart(container, {
        width: container.clientWidth,
        height: CHART_HEIGHT,
        layout: {
          background: { color: '#111111' },
          textColor: '#8A8A8A',
        },
        grid: {
          vertLines: { color: '#1A1A1A' },
          horzLines: { color: '#1A1A1A' },
        },
        timeScale: { timeVisible: true, borderColor: '#2A2A2A' },
        rightPriceScale: { borderColor: '#2A2A2A' },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#00FF88',
        downColor: '#FF4444',
        borderUpColor: '#00FF88',
        borderDownColor: '#FF4444',
        wickUpColor: '#00FF88',
        wickDownColor: '#FF4444',
      });

      chartRef.current = chart;
      seriesRef.current = series;

      async function loadData() {
        setLoading(true);
        setEmpty(false);

        try {
          const res = await fetch(`/api/tokens/ohlcv?address=${address}&type=${activeInterval}`);
          const json = await res.json();

          const candles = (json?.data?.items || [])
            .map((item) => ({
              time: item.unixTime,
              open: Number(item.o),
              high: Number(item.h),
              low: Number(item.l),
              close: Number(item.c),
            }))
            .filter(
              (c) =>
                c.time &&
                Number.isFinite(c.open) &&
                Number.isFinite(c.high) &&
                Number.isFinite(c.low) &&
                Number.isFinite(c.close)
            )
            .sort((a, b) => a.time - b.time);

          if (destroyed) return;

          if (candles.length) {
            series.setData(candles);
            chart.timeScale().fitContent();
            setEmpty(false);
          } else {
            series.setData([]);
            setEmpty(true);
          }
        } catch (err) {
          console.error('Chart load error:', err);
          if (!destroyed) setEmpty(true);
        } finally {
          if (!destroyed) setLoading(false);
        }
      }

      loadData();

      const resizeObserver = new ResizeObserver(() => {
        if (container && chartRef.current) {
          chartRef.current.applyOptions({ width: container.clientWidth });
        }
      });
      resizeObserver.observe(container);

      chartRef.current._resizeObserver = resizeObserver;
      chartRef.current._loadData = loadData;
    });

    return () => {
      destroyed = true;
      if (chartRef.current) {
        chartRef.current._resizeObserver?.disconnect();
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
    };
  }, [address, activeInterval]);

  return (
    <div className="flex flex-col w-full bg-chad-dark">
      <div className="flex gap-1 p-2 sm:p-3 border-b border-chad-border overflow-x-auto no-scrollbar">
        {INTERVALS.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveInterval(i)}
            className={`px-3 py-1 text-xs font-bold rounded shrink-0 ${
              activeInterval === i
                ? 'bg-chad-green text-chad-black'
                : 'text-chad-muted hover:text-white'
            }`}
          >
            {i}
          </button>
        ))}
      </div>

      <div className="relative" style={{ height: CHART_HEIGHT }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-chad-muted text-sm z-10 bg-chad-dark">
            Loading chart...
          </div>
        )}
        {!loading && empty && (
          <div className="absolute inset-0 flex items-center justify-center text-chad-muted text-sm z-10 bg-chad-dark">
            No chart data available
          </div>
        )}
        <div ref={containerRef} className="w-full" style={{ height: CHART_HEIGHT }} />
      </div>
    </div>
  );
}
