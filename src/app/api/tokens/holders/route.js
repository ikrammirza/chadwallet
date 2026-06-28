import { getTokenHolders } from '@/lib/tokenData';

export const revalidate = 120;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) return Response.json({ error: 'Address required' }, { status: 400 });

  try {
    const data = await getTokenHolders(address);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
