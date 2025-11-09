import type { NextApiRequest, NextApiResponse } from 'next';
import cookie from 'cookie';

const NAME = 'gc_wallet';

export function readWalletCookie(req: NextApiRequest): string | null {
  const raw = req.headers.cookie || '';
  const parsed = cookie.parse(raw);
  const v = parsed[NAME];
  return (typeof v === 'string' && v.length > 10) ? v : null;
}

/** Set wallet cookie for apex + subdomains */
export function setWalletCookie(res: NextApiResponse, wallet: string) {
  const domain = process.env.COOKIE_DOMAIN || '.7goldencowries.com';
  res.setHeader('Set-Cookie',
    cookie.serialize(NAME, wallet, {
      domain,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30d
    })
  );
}

/** Clear the wallet cookie */
export function clearWalletCookie(res: NextApiResponse) {
  const domain = process.env.COOKIE_DOMAIN || '.7goldencowries.com';
  res.setHeader('Set-Cookie',
    cookie.serialize(NAME, '', {
      domain,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 0,
    })
  );
}

/** Make an API route response non-cacheable */
export function noStore(res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}
