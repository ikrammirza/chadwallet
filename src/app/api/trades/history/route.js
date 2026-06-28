import { getSupabase } from '@/lib/supabase';

export async function GET(request) {
  const supabase = getSupabase();
  if (!supabase) {
    return Response.json({ trades: [] });
  }

  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get('user_id');

  if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });

  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return Response.json({ trades: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
