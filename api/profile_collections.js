import { loadProfileEffects } from '../lib/profile_data.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gunakan GET' });

  try {
    const items = loadProfileEffects();
    const collections = {};

    for (const it of items) {
      if (it.collection) {
        collections[it.collection] = (collections[it.collection] || 0) + 1;
      }
    }

    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      total: items.length,
      collections,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Gagal memuat data', detail: String(err.message || err) });
  }
}
