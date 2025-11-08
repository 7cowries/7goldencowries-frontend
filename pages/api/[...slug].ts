import type { NextApiRequest, NextApiResponse } from 'next';

export const config = { api: { bodyParser: false } };

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://sevengoldencowries-backend.onrender.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const parts = Array.isArray(req.query.slug) ? req.query.slug : [];
    const targetUrl = `${BACKEND}/api/${parts.join('/')}`;

    // Copy headers except "host" (and anything undefined/array)
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (k.toLowerCase() === 'host') continue;
      if (typeof v === 'string') headers[k] = v;
    }

    // Read body if needed (since bodyParser is disabled)
    let body: Buffer | undefined;
    if (req.method && !['GET', 'HEAD'].includes(req.method)) {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve) => {
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve());
      });
      body = Buffer.concat(chunks);
    }

    const resp = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Pass through status and key headers
    res.status(resp.status);
    const ct = resp.headers.get('content-type');
    if (ct) res.setHeader('content-type', ct);
    const cc = resp.headers.get('cache-control');
    if (cc) res.setHeader('cache-control', cc);

    const text = await resp.text();
    res.send(text);
  } catch (err: any) {
    res.status(500).json({ error: 'proxy_failed', message: String(err?.message || err) });
  }
}
