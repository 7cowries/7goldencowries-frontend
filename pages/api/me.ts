import type { NextApiRequest, NextApiResponse } from 'next';
import { readWalletCookie, noStore } from '@/lib/cookies';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  noStore(res);
  const wallet = readWalletCookie(req);
  return res.status(200).json({ wallet: wallet || null });
}
