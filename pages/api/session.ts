import type { NextApiRequest, NextApiResponse } from 'next';
import { setWalletCookie, clearWalletCookie, noStore } from '@/lib/cookies';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  noStore(res);
  if (req.method === 'POST') {
    try {
      const { wallet } = req.body || {};
      if (typeof wallet === 'string' && wallet.length > 10) {
        setWalletCookie(res, wallet);
        return res.status(200).json({ ok: true });
      }
    } catch {}
    return res.status(400).json({ ok: false });
  }
  if (req.method === 'DELETE') {
    clearWalletCookie(res);
    return res.status(200).json({ ok: true });
  }
  res.setHeader('Allow', 'POST, DELETE');
  return res.status(405).end('Method Not Allowed');
}
