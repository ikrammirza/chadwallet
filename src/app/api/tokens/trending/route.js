import { getTrendingTokens } from '@/lib/tokenData';

export const revalidate = 60;

export async function GET() {
  try {
    const data = await getTrendingTokens();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message, data: { tokens: [] } }, { status: 500 });
  }
}
