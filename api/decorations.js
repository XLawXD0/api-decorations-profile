import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

let cache = null;

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!cache) {
      const csvPath = path.join(process.cwd(), 'data', 'decorations.csv');
      const raw = fs.readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '');
      cache = parse(raw, { columns: true, skip_empty_lines: true, trim: true });
    }
    let data = cache;

    const { file, name, category, collection, q, limit, offset, random } = req.query;

    if (file) {
      const t = String(file).toLowerCase();
      data = data.filter(d => d.file.toLowerCase() === t || d.file.toLowerCase().replace(/\.png$/, '') === t);
    }
    if (name) {
      const n = String(name).toLowerCase();
      data = data.filter(d => d.name.toLowerCase().includes(n));
    }
    if (category) {
      const c = String(category).toLowerCase();
      data = data.filter(d => d.categories.toLowerCase().split(';').some(x => x.trim().includes(c)));
    }
    if (collection) {
      const c = String(collection).toLowerCase();
      data = data.filter(d => d.collections.toLowerCase().split(';').some(x => x.trim().includes(c)));
    }
    if (q) {
      const qq = String(q).toLowerCase();
      data = data.filter(d => d.name.toLowerCase().includes(qq) || (d.description || '').toLowerCase().includes(qq));
    }

    if (random === 'true' || random === '1') {
      if (data.length === 0) return res.status(404).json({ error: 'No decorations found' });
      return res.status(200).json(data[Math.floor(Math.random() * data.length)]);
    }

    const total = data.length;
    const off = Math.max(0, parseInt(offset, 10) || 0);
    const lim = Math.min(1000, Math.max(0, parseInt(limit, 10) || total));

    res.status(200).json({
      total,
      count: Math.min(lim, Math.max(0, total - off)),
      offset: off,
      data: data.slice(off, off + lim)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load decorations', detail: err.message });
  }
}
