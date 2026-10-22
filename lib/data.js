import fs from 'node:fs';
import path from 'node:path';
import { scrapeLive } from './scrape.js';

const TTL_MS = 6 * 60 * 60 * 1000; // cache data live selama 6 jam per instance
const MIN_LIVE_ITEMS = 500; // di bawah ini hasil scrape dianggap tidak wajar

let liveCache = null; // { items, at }
let bundledCache = null;

function bundled() {
  if (!bundledCache) {
    const file = path.join(process.cwd(), 'data', 'decorations.json');
    bundledCache = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return bundledCache;
}

/**
 * mode: 'auto' (live, fallback ke data bawaan), 'live' (hanya live), 'bundled' (hanya data bawaan)
 * Mengembalikan { items, source, fallbackReason? }
 */
export async function loadData(mode = 'auto') {
  if (mode === 'bundled') return { items: bundled(), source: 'bundled' };

  if (liveCache && Date.now() - liveCache.at < TTL_MS) {
    return { items: liveCache.items, source: 'live (cached)' };
  }

  try {
    const items = await scrapeLive();
    if (items.length < MIN_LIVE_ITEMS) {
      throw new Error(`hasil scrape hanya ${items.length} item (minimal ${MIN_LIVE_ITEMS})`);
    }
    liveCache = { items, at: Date.now() };
    return { items, source: 'live' };
  } catch (err) {
    if (mode === 'live') throw err;
    return { items: bundled(), source: 'bundled', fallbackReason: String(err.message || err) };
  }
}

export function filterItems(items, { category, collection, q }) {
  const has = (list, needle) => list.some((v) => v.toLowerCase().includes(needle));
  const cat = category?.toLowerCase();
  const col = collection?.toLowerCase();
  const query = q?.toLowerCase();
  return items.filter((it) => {
    if (cat && !has(it.categories, cat)) return false;
    if (col && !has(it.collections, col)) return false;
    if (query) {
      const hay = [it.name, ...it.aliases, it.description, ...it.collections, it.file].join(' ').toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}
