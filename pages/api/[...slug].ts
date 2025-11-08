import type { NextApiRequest, NextApiResponse } from 'next';

export const config = { api: { bodyParser: false } };

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://sevengoldencowries-backend.onrender.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const parts = Array.isArray(req.query.slug) ? req.query.slug : [];
    const targetUrl = `${BACKEND}/api/${parts.join('/')}`;

    // Copy headers except host (drop undefined/array values)
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (k.toLowerCase() === 'host') continue;
      if (typeof v === 'string') headers[k] = v;
    }

    // Only read body for non-GET/HEAD
    let bodyBuffer: Buffer | undefined;
    if (req.method && !['GET', 'HEAD'].includes(req.method)) {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve) => {
        req.on('data', (c) => chunks.push(c as Buffer));
        req.on('end', () => resolve());
      });
      bodyBuffer = Buffer.concat(chunks);
    }

    // Build fetch init; omit body entirely for GET/HEAD to avoid type noise
    const init: RequestInit = {
      method: req.method,
      headers,
      // Node Buffers are not in DOM BodyInit types; cast for TS only
      ...(bodyBuffer ? ({ body: bodyBuffer } as unknown as RequestInit) : {}),
      // If body were a stream in Node 18+, duplex helps, but safe to omit when Buffer
      // @ts-ignore - 'duplex' is Undici-specific and harmless if ignored by runtime
      duplex: bodyBuffer ? 'half' : undefined,
    };

    const resp = await fetch(targetUrl, init);

    res.status(resp.status);
    // Pass through key headers (content-type, cache-control, location, etc.)
    const passthrough = ['content-type','cache-control','location','set-cookie','etag'];
    for (const h of passthrough) {
      const v = resp.headers.get(h);
      if (v) res.setHeader(h, v);
    }

    // Pipe body as text (covers JSON & text). Could stream if needed later.
    const text = await resp.text();
    res.send(text);
  } catch (err: any) {
    res.status(500).json({ error: 'proxy_failed', message: String(err?.message || err) });
  }
}
