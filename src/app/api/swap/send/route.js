export async function POST(request) {
  const body = await request.json();
  const { signedTransaction } = body;

  if (!signedTransaction) {
    return Response.json({ error: 'Missing signed transaction' }, { status: 400 });
  }

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [
          signedTransaction,
          { encoding: 'base64', preflightCommitment: 'confirmed' },
        ],
      }),
    });

    const data = await res.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    return Response.json({ signature: data.result });
  } catch (error) {
    return Response.json({ error: 'Failed to send transaction' }, { status: 500 });
  }
}