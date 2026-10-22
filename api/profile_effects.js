import { loadProfileEffects, filterProfileEffects } from '../lib/profile_data.js';

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET' });

  const query = req.query || {};
  const page = Math.max(1, parseInt(first(query.page), 10) || 1);
  const limit = Math.min(1000, Math.max(1, parseInt(first(query.limit), 10) || 50));
  const itemId = first(query.item_id);

  try {
    const items = loadProfileEffects();

    // Detail satu efek: /api/profile_effects?item_id=1559633476419059792
    if (itemId) {
      const hit = items.find((it) => it.item_id === itemId);
      if (!hit) return res.status(404).json({ error: 'Profile effect tidak ditemukan', item_id: itemId });
      
      res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
      return res.status(200).json({ data: hit });
    }

    // Filter dan Pagination
    const filtered = filterProfileEffects(items, {
      collection: first(query.collection),
      q: first(query.q),
    });
    
    const start = (page - 1) * limit;

    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      total: filtered.length,
      page,
      limit,
      pages: Math.max(1, Math.ceil(filtered.length / limit)),
      data: filtered.slice(start, start + limit),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Gagal memuat data profile effects', detail: String(err.message || err) });
  }
      }
