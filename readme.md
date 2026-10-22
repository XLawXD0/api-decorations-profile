# Discord Decoration API

API kecil (Vercel serverless) yang menyajikan data avatar decoration dari
https://discord-decoration.art/discord_avatar_decoration

Data diambil langsung dari situs (di-cache 6 jam). Kalau scraping gagal atau hasilnya
tidak wajar, API otomatis memakai `data/decorations.json` (data bawaan, belum lengkap:
kategori "Aesthetic & Vibe" kurang sekitar 60 entri).

## Endpoint

### GET /api/decorations

| Parameter    | Keterangan                                                        |
|--------------|-------------------------------------------------------------------|
| `category`   | Filter kategori, cocok sebagian (mis. `gaming`, `anime`)          |
| `collection` | Filter koleksi (mis. `quests`, `street fighter`)                  |
| `q`          | Cari di nama, deskripsi, koleksi                                  |
| `page`       | Halaman, default 1                                                |
| `limit`      | Item per halaman, default 50, maks 1000                           |
| `file`       | Ambil satu dekorasi, mis. `file=trick_pumpkin.png`                |
| `source`     | `auto` (default), `live` (wajib live, error jika gagal), `bundled`|

Contoh: `/api/decorations?category=gaming&collection=street&limit=20`

Respons:

```json
{
  "source": "live",
  "total": 8,
  "page": 1,
  "limit": 50,
  "pages": 1,
  "data": [
    {
      "name": "Ryu",
      "aliases": [],
      "file": "ryu.png",
      "image_url": "https://discord-decoration.art/decorations/ryu.png",
      "categories": ["Gaming"],
      "collections": ["Street Fighter"],
      "description": "..."
    }
  ]
}
```

Bidang `source` menunjukkan asal data: `live`, `live (cached)`, atau `bundled`.
Kalau `bundled`, bidang `fallback_reason` menjelaskan kenapa scraping tidak dipakai.

### GET /api/categories

Daftar kategori dan koleksi beserta jumlah dekorasinya.

## Deploy

1. Taruh folder ini di repo GitHub, lalu di vercel.com pilih **Add New > Project** dan import repo-nya.
   Framework pilih **Other**, lalu **Deploy**.
2. Atau lewat CLI: `npm i -g vercel`, lalu `vercel --prod` di folder ini.

## Uji lokal

```
npm install
npx vercel dev
```

## Catatan

- Data milik situs sumber dan pembuat dekorasinya; pakai seperlunya dan jangan membanjiri situs
  dengan permintaan (cache 6 jam sudah membantu).
- Jika struktur HTML situs berubah, sesuaikan fungsi `parse()` di `lib/scrape.js`.
