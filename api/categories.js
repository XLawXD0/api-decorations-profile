import { loadData } from '../lib/data.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET' });

  const raw = Array.isArray(req.query?.source) ? req.query.source[0] : req.query?.source;
  const mode = ['auto', 'live', 'bundled'].includes(raw) ? raw : 'auto';

  let result;
  try {
    result = await loadData(mode);
  } catch (err) {
    return res.status(502).json({ error: 'Gagal mengambil data live', detail: String(err.message || err) });
  }

  const categories = {};
  const collections = {};
  for (const it of result.items) {
    for (const c of it.categories) categories[c] = (categories[c] || 0) + 1;
    for (const c of it.collections) collections[c] = (collections[c] || 0) + 1;
  }

  res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).json({
    source: result.source,
    total: result.items.length,
    categories,
    collections,
  });
}
