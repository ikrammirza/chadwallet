import { getSupabase } from '@/lib/supabase';

export async function POST(request) {
  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ error: 'Database not configured' }, { status: 503 });
  }

  const body = await request.json();
  const {
    user_id,
    wallet_address,
    token_address,
    token_symbol,
    token_logo,
    side,
    amount_sol,
    amount_usd,
    tx_signature,
  } = body;

  if (!user_id || !wallet_address || !token_address || !side || !amount_sol) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from('trades').insert([{
      user_id,
      wallet_address,
      token_address,
      token_symbol,
      token_logo,
      side,
      amount_sol,
      amount_usd,
      tx_signature,
    }]).select().single();

    if (error) throw error;

    return Response.json({ trade: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
