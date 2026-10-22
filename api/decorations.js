import { loadData, filterItems } from '../lib/data.js';

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET' });

  const query = req.query || {};
  const mode = ['auto', 'live', 'bundled'].includes(first(query.source)) ? first(query.source) : 'auto';
  const page = Math.max(1, parseInt(first(query.page), 10) || 1);
  const limit = Math.min(1000, Math.max(1, parseInt(first(query.limit), 10) || 50));
  const slug = first(query.file);

  let result;
  try {
    result = await loadData(mode);
  } catch (err) {
    return res.status(502).json({ error: 'Gagal mengambil data live', detail: String(err.message || err) });
  }

  // Detail satu dekorasi: /api/decorations?file=trick_pumpkin.png
  if (slug) {
    const hit = result.items.find((it) => it.file === slug || it.file === `${slug}.png`);
    if (!hit) return res.status(404).json({ error: 'Dekorasi tidak ditemukan', file: slug });
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({ source: result.source, data: hit });
  }

  const filtered = filterItems(result.items, {
    category: first(query.category),
    collection: first(query.collection),
    q: first(query.q),
  });
  const start = (page - 1) * limit;

  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).json({
    source: result.source,
    ...(result.fallbackReason ? { fallback_reason: result.fallbackReason } : {}),
    total: filtered.length,
    page,
    limit,
    pages: Math.max(1, Math.ceil(filtered.length / limit)),
    data: filtered.slice(start, start + limit),
  });
}
