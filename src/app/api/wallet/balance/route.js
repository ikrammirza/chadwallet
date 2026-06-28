export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) return Response.json({ error: 'Address required' }, { status: 400 });

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address],
      }),
    });

    const data = await res.json();

    // Alchemy returns lamports — convert to SOL
    const lamports = data?.result?.value || 0;
    const sol = lamports / 1e9;

    return Response.json({ sol, lamports });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}