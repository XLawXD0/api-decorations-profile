export const SOURCE_URL = 'https://discord-decoration.art/discord_avatar_decoration';
const BASE = 'https://discord-decoration.art';
const CATEGORY_RE = /^(.*?)\s*\((\d+)\s+decorations?\)\s*$/i;

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

/**
 * Parse halaman galeri menjadi daftar dekorasi unik.
 * Pola halaman: <h2>Kategori (N decorations)</h2>, lalu per item:
 * <img src=".../decorations/xxx.png"> <h3>Nama</h3> <p>Koleksi</p> <p>Deskripsi</p>
 * Dekorasi yang muncul di beberapa kategori digabung berdasarkan nama file.
 */
export async function parse(html) {
  const cheerio = await import('cheerio'); // dimuat saat dibutuhkan agar mode data bawaan tetap jalan tanpa scraping
  const $ = cheerio.load(html);
  const items = new Map();
  let category = '';
  let cur = null;

  const finalize = () => {
    if (!cur || !cur.slug) return;
    const rec =
      items.get(cur.slug) ||
      {
        name: cur.name,
        aliases: [],
        file: cur.slug,
        image_url: cur.image_url,
        categories: [],
        collections: [],
        description: '',
      };
    if (cur.name && cur.name !== rec.name && !rec.aliases.includes(cur.name)) rec.aliases.push(cur.name);
    if (cur.category && !rec.categories.includes(cur.category)) rec.categories.push(cur.category);
    if (cur.collection && !rec.collections.includes(cur.collection)) rec.collections.push(cur.collection);
    if (cur.description && !rec.description) rec.description = cur.description;
    items.set(cur.slug, rec);
  };

  $('h2, img, h3, p').each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const $el = $(el);

    if (tag === 'h2') {
      finalize();
      cur = null;
      const m = CATEGORY_RE.exec(clean($el.text()));
      if (m) category = m[1].trim();
      return;
    }

    if (tag === 'img') {
      const src = $el.attr('src') || '';
      if (!src.includes('/decorations/')) return;
      finalize();
      const slug = src.split('/').pop().split('?')[0];
      cur = {
        slug,
        image_url: src.startsWith('http') ? src : BASE + src,
        name: clean($el.attr('alt')),
        category,
        collection: '',
        description: '',
        gotName: false,
        texts: 0,
      };
      return;
    }

    if (!cur) return;
    const text = clean($el.text());

    if (tag === 'h3') {
      if (!cur.gotName && text) {
        cur.name = text;
        cur.gotName = true;
      }
      return;
    }

    if (tag === 'p' && text && !/^(click|tap) to preview/i.test(text) && cur.texts < 2) {
      if (cur.texts === 0) cur.collection = text;
      else cur.description = text;
      cur.texts += 1;
    }
  });

  finalize();
  return [...items.values()];
}

export async function scrapeLive({ timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(SOURCE_URL, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; decoration-api/1.0)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} saat mengambil ${SOURCE_URL}`);
    return parse(await res.text());
  } finally {
    clearTimeout(timer);
  }
}
