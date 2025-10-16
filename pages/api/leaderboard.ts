import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sevengoldencowries-backend.onrender.com';
  const url = `${BACKEND}/api/leaderboard`;

  try {
    const r = await fetch(url, { headers: { accept: 'application/json' } });
    if (r.ok) {
      const data = await r.json();
      return res.status(200).json(data);
    }
  } catch (_) {
    // ignore and fall through to stub
  }

  // Soft fallback – prevents 404 noise in the UI
  res.status(200).json({
    items: [],
    message: 'leaderboard-coming-soon',
  });
}
