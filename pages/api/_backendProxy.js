const BACKEND = process.env.BACKEND_ORIGIN || 'https://sevengoldencowries-backend.onrender.com';

module.exports = async function backendProxy(req, res, basePath) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug.join('/') : '';
  const url = `${BACKEND}${basePath}${slug ? '/' + slug : ''}`;

  // Clone incoming headers (strip hop-by-hop / auto headers)
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    const key = k.toLowerCase();
    if (['host','connection','content-length'].includes(key)) continue;
    headers[key] = Array.isArray(v) ? v.join(',') : v;
  }
  if (req.headers.cookie) headers['cookie'] = req.headers.cookie;

  const init = { method: req.method, headers };
  if (!['GET','HEAD'].includes(req.method)) {
    // If body is already a string, pass through; else JSON-encode
    const isString = typeof req.body === 'string';
    init.body = isString ? req.body : JSON.stringify(req.body ?? {});
    if (!headers['content-type']) headers['content-type'] = 'application/json';
  }

  const r = await fetch(url, init);

  // Forward Set-Cookie (single header expected here)
  const setCookie = r.headers.get('set-cookie');
  if (setCookie) res.setHeader('Set-Cookie', setCookie);

  // Forward content-type and status
  const contentType = r.headers.get('content-type') || 'application/octet-stream';
  res.status(r.status);
  res.setHeader('content-type', contentType);

  const buf = Buffer.from(await r.arrayBuffer());
  res.send(buf);
};
