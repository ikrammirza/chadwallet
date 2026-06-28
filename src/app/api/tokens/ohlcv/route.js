import { getTokenOhlcv } from '@/lib/tokenData';

export const revalidate = 60;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const type = searchParams.get('type') || '15m';

  if (!address) return Response.json({ error: 'Address required' }, { status: 400 });

  try {
    const data = await getTokenOhlcv(address, type);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
