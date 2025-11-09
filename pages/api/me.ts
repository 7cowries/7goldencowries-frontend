import type { NextApiRequest, NextApiResponse } from 'next';
import { readWalletFromCookie } from '@/lib/getSession';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const wallet = readWalletFromCookie(req.headers.cookie || '');
  res.status(200).json({ ok:true, wallet: wallet ?? null });
}
