import fs from 'node:fs';
import path from 'node:path';

let cache = null;

export function loadProfileEffects() {
  if (cache) return cache;
  
  const file = path.join(process.cwd(), 'data', 'profile_effects.json');
  // Baca dan parse JSON
  cache = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  return cache;
}

export function filterProfileEffects(items, { collection, q }) {
  const col = collection?.toLowerCase();
  const query = q?.toLowerCase();

  return items.filter((it) => {
    if (col && !it.collection.toLowerCase().includes(col)) return false;
    if (query) {
      const hay = [it.name, it.collection, it.item_id].join(' ').toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}
