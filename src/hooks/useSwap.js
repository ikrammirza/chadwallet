'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets, useSignAndSendTransaction } from '@privy-io/react-auth/solana';
import { VersionedTransaction } from '@solana/web3.js';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase58(bytes) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = '';
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) result += ALPHABET[0];
  for (let i = digits.length - 1; i >= 0; i--) result += ALPHABET[digits[i]];
  return result;
}

export function useSwap() {
  const { user } = usePrivy();
  const { wallets, ready } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txSignature, setTxSignature] = useState(null);

  const wallet = wallets?.[0] ?? null;

  async function executeSwap({
    inputMint,
    outputMint,
    amountSol,
    decimals = 9,
    token,
    amountUsd,
  }) {
    if (!ready) throw new Error('Wallet not ready');
    if (!wallet) throw new Error('No Solana wallet found. Sign in to create one.');

    setLoading(true);
    setError(null);
    setTxSignature(null);

    try {
      const amountLamports = Math.floor(amountSol * Math.pow(10, decimals));

      const quoteRes = await fetch(
        `/api/swap/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}`
      );
      const quoteData = await quoteRes.json();
      if (!quoteRes.ok || quoteData.error) {
        throw new Error(quoteData.error || 'Failed to get quote');
      }

      const buildRes = await fetch('/api/swap/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: wallet.address,
        }),
      });
      const buildData = await buildRes.json();
      if (!buildRes.ok || buildData.error) {
        throw new Error(buildData.error || 'Failed to build transaction');
      }

      const txBytes = base64ToUint8Array(buildData.swapTransaction);
      const transaction = VersionedTransaction.deserialize(txBytes);

      const { signature: sigBytes } = await signAndSendTransaction({
        transaction: transaction.serialize(),
        wallet,
        chain: 'solana:mainnet',
      });

      const signature = uint8ArrayToBase58(sigBytes);
      setTxSignature(signature);

      if (user?.id && token) {
        await fetch('/api/trades/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            wallet_address: wallet.address,
            token_address: token.address,
            token_symbol: token.symbol,
            token_logo: token.logoURI || null,
            side: inputMint === SOL_MINT ? 'buy' : 'sell',
            amount_sol: amountSol,
            amount_usd: amountUsd || null,
            tx_signature: signature,
          }),
        });
      }

      return signature;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    executeSwap,
    loading,
    error,
    txSignature,
    walletReady: ready,
  };
}
