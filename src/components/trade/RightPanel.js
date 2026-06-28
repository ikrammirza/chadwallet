'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useSwap } from '@/hooks/useSwap';
import { useTradeHistory } from '@/hooks/useTradeHistory';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export default function RightPanel({ token, tokenData }) {
  const { authenticated, login } = usePrivy();
  const { balance: solBalance, address: walletAddress, loading: balanceLoading } = useWalletBalance();
  const { executeSwap, loading: swapLoading, error: swapError, txSignature } = useSwap();
  const { trades, loading: historyLoading, refetch } = useTradeHistory();
  const [tab, setTab] = useState('buy');
  const [amount, setAmount] = useState('');
  const [tokenBalance, setTokenBalance] = useState(null);
  const [solPrice, setSolPrice] = useState(150);
  const [toast, setToast] = useState(null);

  const price = tokenData?.price?.value;
  const QUICK_AMOUNTS = ['0.1', '0.5', '1', '5'];

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  }
 
  // Fetch SOL price
  useEffect(() => {
    async function fetchSolPrice() {
      try {
        const res = await fetch(`/api/tokens/price?address=${SOL_MINT}`);
        const data = await res.json();
        if (data?.price?.value) setSolPrice(data.price.value);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSolPrice();
  }, []);

  // Fetch token balance
  useEffect(() => {
    if (!walletAddress || !token?.address) { setTokenBalance(null); return; }

    async function fetchTokenBalance() {
      try {
        const res = await fetch(
          `/api/wallet/token-balance?wallet=${walletAddress}&mint=${token.address}`
        );
        const data = await res.json();
        setTokenBalance(data.uiAmount);
      } catch (err) {
        console.error(err);
      }
    }

    fetchTokenBalance();
  }, [walletAddress, token?.address]);

  async function handleTrade() {
    if (!authenticated) { login(); return; }
    if (!amount || !token) return;

    try {
      const inputMint = tab === 'buy' ? SOL_MINT : token.address;
      const outputMint = tab === 'buy' ? token.address : SOL_MINT;

      const signature = await executeSwap({
        inputMint,
        outputMint,
        amountSol: parseFloat(amount),
        decimals: tab === 'buy' ? 9 : tokenData?.overview?.decimals || 6,
        token,
        amountUsd: usdEstimate ? parseFloat(usdEstimate) : null,
      });

      showToast(`✅ ${tab === 'buy' ? 'Bought' : 'Sold'} ${token.symbol}!`, 'success');
      setAmount('');
      refetch();
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }
  const usdEstimate = amount && solPrice
    ? (parseFloat(amount) * solPrice).toFixed(2)
    : null;

  const insufficientBalance = tab === 'buy'
    ? solBalance !== null && parseFloat(amount || 0) > solBalance
    : tokenBalance !== null && parseFloat(amount || 0) > tokenBalance;

  return (
    <div className="flex flex-col h-full border-l border-chad-border">

      {/* Toast */}
      {toast && (
        <div className={`mx-4 mt-4 p-3 rounded-lg text-xs font-bold ${
          toast.type === 'success'
            ? 'bg-chad-green/20 text-chad-green border border-chad-green/30'
            : 'bg-chad-red/20 text-chad-red border border-chad-red/30'
        }`}>
          {toast.msg}
          {txSignature && (
            <a
              href={`https://solscan.io/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 underline opacity-80"
            >
              {txSignature.slice(0, 20)}...
            </a>
          )}
        </div>
      )}

      {/* Buy / Sell / History tabs */}
      <div className="flex border-b border-chad-border">
        {['buy', 'sell', 'history'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setAmount(''); if (t === 'history') refetch(); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
              tab === t
                ? t === 'buy'
                  ? 'text-chad-green border-b-2 border-chad-green'
                  : t === 'sell'
                  ? 'text-chad-red border-b-2 border-chad-red'
                  : 'text-white border-b-2 border-white'
                : 'text-chad-muted hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto no-scrollbar">

        {/* History tab */}
        {tab === 'history' && (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-chad-muted font-bold uppercase tracking-wider mb-2">
              Trade History
            </div>

            {historyLoading && (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-chad-card rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {!historyLoading && !authenticated && (
              <div className="text-center text-chad-muted text-sm py-8">
                Sign in to see your trade history.
              </div>
            )}

            {!historyLoading && authenticated && trades.length === 0 && (
              <div className="text-center text-chad-muted text-sm py-8">
                No trades yet. Make your first trade!
              </div>
            )}

            {trades.map((trade) => (
              <div key={trade.id} className="p-3 bg-chad-card rounded-lg border border-chad-border">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {trade.token_logo && (
                      <img
                        src={trade.token_logo}
                        alt={trade.token_symbol}
                        className="w-5 h-5 rounded-full"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span className="font-bold text-sm">{trade.token_symbol}</span>
                    <span className={`text-xs font-bold ${
                      trade.side === 'buy' ? 'text-chad-green' : 'text-chad-red'
                    }`}>
                      {trade.side === 'buy' ? '▲ BUY' : '▼ SELL'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold">{trade.amount_sol} SOL</div>
                    {trade.amount_usd && (
                      <div className="text-xs text-chad-muted">${trade.amount_usd.toFixed(2)}</div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-chad-muted">
                  <span>{new Date(trade.created_at).toLocaleDateString()} {new Date(trade.created_at).toLocaleTimeString()}</span>
                  {trade.tx_signature && (
                    <a
                      href={`https://solscan.io/tx/${trade.tx_signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-chad-green hover:underline"
                    >
                      View tx →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buy / Sell tab content */}
        {tab !== 'history' && (
          <>
            {/* Token info */}
            {token && (
              <div className="flex items-center gap-2 p-3 bg-chad-card rounded-lg">
                {token.logoURI && (
                  <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                )}
                <div className="flex-1">
                  <div className="font-bold text-sm">{token.symbol}</div>
                  {price && (
                    <div className="text-xs text-chad-muted font-mono">
                      ${price < 0.01 ? price.toFixed(8) : price.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wallet balance */}
            {authenticated && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-chad-muted">
                  {tab === 'buy' ? 'SOL Balance' : `${token?.symbol || 'Token'} Balance`}
                </span>
                <span className="font-mono font-bold text-chad-green">
                  {balanceLoading ? (
                    <span className="text-chad-muted">Loading...</span>
                  ) : tab === 'buy' ? (
                    solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '—'
                  ) : (
                    tokenBalance !== null ? `${tokenBalance.toFixed(4)} ${token?.symbol || ''}` : '—'
                  )}
                </span>
              </div>
            )}

            {/* Amount input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-chad-muted">
                  {tab === 'buy' ? 'Amount (SOL)' : `Amount (${token?.symbol || 'Token'})`}
                </label>
                {authenticated && tab === 'buy' && solBalance !== null && (
                  <button
                    onClick={() => setAmount(solBalance.toFixed(4))}
                    className="text-xs text-chad-green hover:underline"
                  >
                    Max
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-chad-card border rounded-lg px-4 py-3 text-white font-mono text-lg focus:outline-none transition-all ${
                    insufficientBalance
                      ? 'border-chad-red focus:border-chad-red'
                      : 'border-chad-border focus:border-chad-green'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-chad-muted text-sm font-bold">
                  {tab === 'buy' ? 'SOL' : token?.symbol || ''}
                </span>
              </div>
              {insufficientBalance && (
                <p className="text-chad-red text-xs mt-1">Insufficient balance</p>
              )}
            </div>

            {/* Quick amounts */}
            {tab === 'buy' ? (
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className="py-2 text-xs font-bold bg-chad-card border border-chad-border rounded-lg hover:border-chad-green hover:text-chad-green transition-all"
                  >
                    {a}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {['25%', '50%', '75%', '100%'].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      if (tokenBalance) {
                        setAmount((tokenBalance * parseInt(pct) / 100).toFixed(4));
                      }
                    }}
                    className="py-2 text-xs font-bold bg-chad-card border border-chad-border rounded-lg hover:border-chad-red hover:text-chad-red transition-all"
                  >
                    {pct}
                  </button>
                ))}
              </div>
            )}

            {/* USD estimate */}
            {usdEstimate && (
              <div className="text-xs text-chad-muted text-center">≈ ${usdEstimate} USD</div>
            )}

            {/* Trade button */}
            <button
              onClick={handleTrade}
              disabled={swapLoading || insufficientBalance}
              className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                tab === 'buy'
                  ? 'bg-chad-green text-chad-black hover:opacity-90 glow-green'
                  : 'bg-chad-red text-white hover:opacity-90'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {swapLoading
                ? 'Swapping...'
                : !authenticated
                ? 'Connect Wallet'
                : insufficientBalance
                ? 'Insufficient Balance'
                : `${tab === 'buy' ? 'Buy' : 'Sell'} ${token?.symbol || ''}`}
            </button>

            {/* Position */}
            {authenticated && token && (
              <div className="p-3 bg-chad-card rounded-lg border border-chad-border">
                <div className="text-xs text-chad-muted mb-3 font-bold uppercase tracking-wider">
                  Your Position
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-chad-muted">Holdings</span>
                    <span className="font-mono font-bold">
                      {tokenBalance !== null ? `${tokenBalance.toFixed(4)} ${token.symbol}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-chad-muted">Value</span>
                    <span className="font-mono font-bold text-chad-green">
                      {tokenBalance && price ? `$${(tokenBalance * price).toFixed(2)}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-chad-muted">SOL Balance</span>
                    <span className="font-mono font-bold">
                      {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : '—'}
                    </span>
                  </div>
                  {txSignature && (
                    <a
                      href={`https://solscan.io/tx/${txSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-chad-green underline mt-1"
                    >
                      Last tx: {txSignature.slice(0, 16)}...
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}