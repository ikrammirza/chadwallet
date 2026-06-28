export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const mint = searchParams.get('mint');

  if (!wallet || !mint) return Response.json({ error: 'wallet and mint required' }, { status: 400 });

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          wallet,
          { mint },
          { encoding: 'jsonParsed' },
        ],
      }),
    });

    const data = await res.json();
    const accounts = data?.result?.value || [];

    if (!accounts.length) return Response.json({ amount: 0, uiAmount: 0 });

    const tokenAmount = accounts[0]?.account?.data?.parsed?.info?.tokenAmount;
    return Response.json({
      amount: tokenAmount?.amount || 0,
      uiAmount: tokenAmount?.uiAmount || 0,
      decimals: tokenAmount?.decimals || 0,
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch token balance' }, { status: 500 });
  }
}