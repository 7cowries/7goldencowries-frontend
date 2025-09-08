const hits = new Map();

function bump(key, { limit = 10, windowMs = 60000 } = {}) {
  const now = Date.now();
  let entry = hits.get(key);
  if (!entry || now - entry.start >= windowMs) {
    entry = { start: now, count: 0 };
  }
  entry.count += 1;
  hits.set(key, entry);
  return entry.count <= limit;
}

module.exports = { bump };
