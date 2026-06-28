import { toNum } from './format';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

const OHLCV_MAP = {
  '1m': { timeframe: 'minute', aggregate: 1 },
  '5m': { timeframe: 'minute', aggregate: 5 },
  '15m': { timeframe: 'minute', aggregate: 15 },
  '1H': { timeframe: 'hour', aggregate: 1 },
  '4H': { timeframe: 'hour', aggregate: 4 },
  '1D': { timeframe: 'day', aggregate: 1 },
};

const OHLCV_LIMITS = {
  '1m': 180,
  '5m': 144,
  '15m': 96,
  '1H': 168,
  '4H': 180,
  '1D': 90,
};

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    next: options.next,
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

function pickBestSolPair(pairs = []) {
  const solPairs = pairs.filter(
    (p) => p.quoteToken?.address === SOL_MINT || p.baseToken?.address === SOL_MINT
  );
  const list = solPairs.length ? solPairs : pairs;
  return list.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
}

function pairToToken(pair) {
  if (!pair) return null;
  const isBaseSol = pair.baseToken?.address === SOL_MINT;
  const token = isBaseSol ? pair.quoteToken : pair.baseToken;
  const priceUsd = parseFloat(pair.priceUsd || 0);
  const change = pair.priceChange?.h24 ?? 0;

  return {
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    logoURI: pair.info?.imageUrl || null,
    price: priceUsd,
    priceChange24hPercent: toNum(change),
    volume24hUSD: pair.volume?.h24 || 0,
    mc: pair.marketCap || pair.fdv || 0,
    liquidity: pair.liquidity?.usd || 0,
    pairAddress: pair.pairAddress,
    decimals: 6,
  };
}

async function fetchBirdEyeTrending() {
  if (!process.env.BIRDEYE_API_KEY) return null;
  try {
    const data = await fetchJson(
      'https://public-api.birdeye.so/defi/token_trending?sort_by=volume24hUSD&sort_type=desc&offset=0&limit=20',
      {
        headers: { 'X-API-KEY': process.env.BIRDEYE_API_KEY, 'x-chain': 'solana' },
        next: { revalidate: 120 },
      }
    );
    if (data?.success && data?.data?.tokens?.length) return data;
  } catch {
    // fall through
  }
  return null;
}

async function fetchGeckoTrending() {
  const json = await fetchJson(
    'https://api.geckoterminal.com/api/v2/networks/solana/trending_pools?include=base_token',
    { next: { revalidate: 60 } }
  );

  const tokenMap = {};
  for (const item of json.included || []) {
    if (item.type === 'token') {
      tokenMap[item.id] = item.attributes;
    }
  }

  const tokens = (json.data || []).map((pool) => {
    const attrs = pool.attributes;
    const tokenId = pool.relationships?.base_token?.data?.id;
    const token = tokenMap[tokenId] || {};
    const change = attrs.price_change_percentage?.h24 ?? 0;

    return {
      address: token.address,
      symbol: token.symbol || attrs.name?.split('/')[0]?.trim() || '???',
      name: token.name || attrs.name || 'Unknown',
      logoURI: token.image_url || null,
      price: parseFloat(attrs.base_token_price_usd || 0),
      priceChange24hPercent: toNum(change),
      volume24hUSD: attrs.volume_usd?.h24 || 0,
      mc: parseFloat(attrs.market_cap_usd || attrs.fdv_usd || 0),
      liquidity: parseFloat(attrs.reserve_in_usd || 0),
      pairAddress: attrs.address,
      decimals: 6,
    };
  }).filter((t) => t.address);

  return { success: true, data: { tokens } };
}

async function fetchDexScreenerTrending() {
  const boosts = await fetchJson('https://api.dexscreener.com/token-boosts/top/v1', {
    next: { revalidate: 60 },
  });

  const solanaBoosts = (Array.isArray(boosts) ? boosts : []).filter((b) => b.chainId === 'solana');
  const addresses = [...new Set(solanaBoosts.map((b) => b.tokenAddress))].slice(0, 20);

  if (!addresses.length) return null;

  const chunks = [];
  for (let i = 0; i < addresses.length; i += 10) {
    chunks.push(addresses.slice(i, i + 10).join(','));
  }

  const tokens = [];
  for (const chunk of chunks) {
    const data = await fetchJson(`https://api.dexscreener.com/latest/dex/tokens/${chunk}`, {
      next: { revalidate: 60 },
    });
    for (const addr of chunk.split(',')) {
      const pairs = (data.pairs || []).filter((p) =>
        p.baseToken?.address === addr || p.quoteToken?.address === addr
      );
      const token = pairToToken(pickBestSolPair(pairs));
      if (token) tokens.push(token);
    }
  }

  return { success: true, data: { tokens } };
}

function normalizeToken(token) {
  return {
    ...token,
    priceChange24hPercent: toNum(token.priceChange24hPercent),
    volume24hUSD: toNum(token.volume24hUSD),
    price: toNum(token.price),
  };
}

export async function getTrendingTokens() {
  const birdEye = await fetchBirdEyeTrending();
  if (birdEye?.data?.tokens) {
    return {
      ...birdEye,
      data: { tokens: birdEye.data.tokens.map(normalizeToken) },
    };
  }

  try {
    const data = await fetchGeckoTrending();
    return data;
  } catch {
    try {
      return await fetchDexScreenerTrending();
    } catch (err) {
      return { success: false, error: err.message, data: { tokens: [] } };
    }
  }
}

export async function getDexPair(address) {
  const data = await fetchJson(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
    next: { revalidate: 30 },
  });
  const pairs = (data.pairs || []).filter(
    (p) => p.baseToken?.address === address || p.quoteToken?.address === address
  );
  return pickBestSolPair(pairs);
}

async function fetchBirdEyePrice(address) {
  if (!process.env.BIRDEYE_API_KEY) return null;
  try {
    const [overviewRes, priceRes] = await Promise.all([
      fetch(`https://public-api.birdeye.so/defi/token_overview?address=${address}`, {
        headers: { 'X-API-KEY': process.env.BIRDEYE_API_KEY, 'x-chain': 'solana' },
        next: { revalidate: 60 },
      }),
      fetch(`https://public-api.birdeye.so/defi/price?address=${address}`, {
        headers: { 'X-API-KEY': process.env.BIRDEYE_API_KEY, 'x-chain': 'solana' },
        next: { revalidate: 30 },
      }),
    ]);
    const overview = await overviewRes.json();
    const price = await priceRes.json();
    if (overview?.data && price?.data) {
      return { overview: overview.data, price: price.data };
    }
  } catch {
    // fall through
  }
  return null;
}

export async function getTokenPrice(address) {
  const birdEye = await fetchBirdEyePrice(address);
  if (birdEye) return birdEye;

  const pair = await getDexPair(address);
  if (!pair) return { overview: null, price: null };

  const isBaseSol = pair.baseToken?.address === SOL_MINT;
  const token = isBaseSol ? pair.quoteToken : pair.baseToken;
  const priceUsd = parseFloat(pair.priceUsd || 0);

  return {
    overview: {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      logoURI: pair.info?.imageUrl || null,
      price: priceUsd,
      priceChange24hPercent: toNum(pair.priceChange?.h24),
      mc: pair.marketCap || pair.fdv || 0,
      v24hUSD: pair.volume?.h24 || 0,
      liquidity: pair.liquidity?.usd || 0,
      holder: null,
      decimals: 6,
    },
    price: { value: priceUsd },
  };
}

export async function getTokenOhlcv(address, type = '15m') {
  const cfg = OHLCV_MAP[type] || OHLCV_MAP['15m'];
  const limit = OHLCV_LIMITS[type] || 96;

  if (process.env.BIRDEYE_API_KEY) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const from = now - 60 * 60 * 24 * 7;
      const res = await fetch(
        `https://public-api.birdeye.so/defi/ohlcv?address=${address}&type=${type}&time_from=${from}&time_to=${now}`,
        {
          headers: { 'X-API-KEY': process.env.BIRDEYE_API_KEY, 'x-chain': 'solana' },
          next: { revalidate: 60 },
        }
      );
      const data = await res.json();
      if (data?.success && data?.data?.items?.length) return data;
    } catch {
      // fall through
    }
  }

  const pair = await getDexPair(address);
  if (!pair?.pairAddress) {
    return { success: false, data: { items: [] } };
  }

  const json = await fetchJson(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/${pair.pairAddress}/ohlcv/${cfg.timeframe}?aggregate=${cfg.aggregate}&limit=${limit}`,
    { next: { revalidate: 60 } }
  );

  const items = (json.data?.attributes?.ohlcv_list || [])
    .map((row) => {
      const parts = String(row).trim().split(/\s+/);
      const [time, o, h, l, c] = parts.map(Number);
      return { unixTime: time, o, h, l, c };
    })
    .filter((item) => item.unixTime && Number.isFinite(item.o))
    .sort((a, b) => a.unixTime - b.unixTime);

  return { success: true, data: { items } };
}

async function fetchBirdEyeTrades(address) {
  if (!process.env.BIRDEYE_API_KEY) return null;
  try {
    const res = await fetch(
      `https://public-api.birdeye.so/defi/txs/token?address=${address}&tx_type=swap&limit=20`,
      {
        headers: { 'X-API-KEY': process.env.BIRDEYE_API_KEY, 'x-chain': 'solana' },
        next: { revalidate: 15 },
      }
    );
    const data = await res.json();
    if (data?.data?.items?.length) return data;
  } catch {
    // fall through
  }
  return null;
}

export async function getTokenTrades(address) {
  const birdEye = await fetchBirdEyeTrades(address);
  if (birdEye) return birdEye;

  const pair = await getDexPair(address);
  if (!pair?.pairAddress) return { data: { items: [] } };

  const json = await fetchJson(
    `https://api.geckoterminal.com/api/v2/networks/solana/pools/${pair.pairAddress}/trades`,
    { next: { revalidate: 15 } }
  );

  const items = (json.data || []).map((trade) => {
    const a = trade.attributes;
    const isBuy = a.kind === 'buy';
    const blockUnixTime = Math.floor(new Date(a.block_timestamp).getTime() / 1000);

    return {
      txHash: a.tx_hash,
      owner: a.tx_from_address,
      side: isBuy ? 'buy' : 'sell',
      blockUnixTime,
      from: {
        symbol: isBuy ? 'SOL' : pair.baseToken?.symbol,
        uiAmount: parseFloat(isBuy ? a.from_token_amount : a.from_token_amount),
        price: parseFloat(a.price_from_in_usd || 0),
      },
      to: {
        symbol: isBuy ? pair.baseToken?.symbol : 'SOL',
        uiAmount: parseFloat(a.to_token_amount),
        price: parseFloat(a.price_to_in_usd || 0),
      },
    };
  });

  return { data: { items } };
}

async function fetchBirdEyeHolders(address) {
  if (!process.env.BIRDEYE_API_KEY) return null;
  try {
    const res = await fetch(
      `https://public-api.birdeye.so/defi/token_holder?address=${address}&limit=10`,
      {
        headers: { 'X-API-KEY': process.env.BIRDEYE_API_KEY, 'x-chain': 'solana' },
        next: { revalidate: 120 },
      }
    );
    const data = await res.json();
    if (data?.data?.items?.length) return data;
  } catch {
    // fall through
  }
  return null;
}

export async function getTokenHolders(address) {
  const birdEye = await fetchBirdEyeHolders(address);
  if (birdEye) return birdEye;

  const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL;
  if (!rpcUrl) return { data: { items: [] } };

  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenLargestAccounts',
      params: [address],
    }),
    next: { revalidate: 120 },
  });

  const json = await res.json();
  const accounts = json.result?.value || [];
  const total = accounts.reduce((sum, a) => sum + (a.uiAmount || 0), 0);

  const items = accounts.slice(0, 10).map((a) => ({
    address: a.address,
    uiAmount: a.uiAmount,
    percentage: total > 0 ? (a.uiAmount / total) * 100 : 0,
  }));

  return { data: { items } };
}
