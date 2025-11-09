import type { NextApiRequest, NextApiResponse } from 'next';

const COOKIE = 'gc_wallet';
const MAX_AGE_DAYS = 30;

function cookieString(name: string, value: string, opts: {
  maxAge?: number; path?: string; httpOnly?: boolean; sameSite?: 'Lax'|'Strict'|'None'; secure?: boolean;
}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${opts.path ?? '/'}`,
    `SameSite=${opts.sameSite ?? 'Lax'}`
  ];
  if (opts.httpOnly !== false) parts.push('HttpOnly');
  if (opts.secure !== false) parts.push('Secure');
  if (opts.maxAge) {
    parts.push(`Max-Age=${opts.maxAge}`);
  }
  return parts.join('; ');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const wallet = (req.body?.wallet ?? '').toString().trim();
    if (!wallet) return res.status(400).json({ ok:false, error:'wallet required' });
    res.setHeader('Set-Cookie', cookieString(COOKIE, wallet, {
      maxAge: 60*60*24*MAX_AGE_DAYS,
      sameSite: 'Lax',
      secure: true,
      httpOnly: true,
      path: '/'
    }));
    return res.status(200).json({ ok:true });
  }

  if (req.method === 'DELETE') {
    // expire immediately
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`);
    return res.status(200).json({ ok:true });
  }

  return res.status(405).json({ ok:false, error:'method not allowed' });
}
