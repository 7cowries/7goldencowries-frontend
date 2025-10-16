import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
    || 'https://sevengoldencowries-backend.onrender.com';
  try {
    const r = await fetch(`${base}/api/leaderboard`, { next: { revalidate: 60 } as any });
    if (r.ok) return res.status(200).json(await r.json());
  } catch {}
  return res.status(200).json([]); // graceful fallback
}
