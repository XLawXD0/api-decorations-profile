# Discord Decoration & Profile Effects API

API kecil (Vercel serverless) yang menyajikan data **Avatar Decoration** dan **Profile Effects** dari Discord.

- **Avatar Decoration**: Data diambil langsung dari [discord-decoration.art](https://discord-decoration.art/discord_avatar_decoration) (di-cache 6 jam). Jika scraping gagal, API otomatis memakai `data/decorations.json` (data bawaan).
- **Profile Effects**: Data disajikan langsung dari file bawaan `data/profile_effects.json`.

## Endpoint

### 1. GET /api/decorations (Avatar Decorations)

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

### 2. GET /api/categories (Kategori Avatar Decoration)

Daftar kategori dan koleksi beserta jumlah dekorasinya.

---

### 3. GET /api/profile_effects (Profile Effects)

| Parameter    | Keterangan                                                        |
|--------------|-------------------------------------------------------------------|
| `collection` | Filter koleksi (mis. `anime`, `dead by daylight`)                 |
| `q`          | Cari di nama, koleksi, atau `item_id`                             |
| `page`       | Halaman, default 1                                                |
| `limit`      | Item per halaman, default 50, maks 1000                           |
| `item_id`    | Ambil satu profile effect, mis. `item_id=1559633476419059792`     |

Contoh: `/api/profile_effects?collection=anime&limit=5`

**Respons Profile Effects:**
```json
{
  "total": 1,
  "page": 1,
  "limit": 50,
  "pages": 1,
  "data": [
    {
      "name": "Halloween Forever",
      "collection": "The Nightmare Before Christmas",
      "price_original": "8.99",
      "price_sale": "6.99",
      "orbs": "",
      "item_id": "1559633476419059792",
      "item_url": "https://dripcord.me/item/1559633476419059792/",
      "image_url": "https://cdn.discordapp.com/media/v1/collectibles-shop/7e89bda86fea9e7265ff5afc49072bb41b68bfce070eaa6cd94b7db9de2efef7",
      "page": "1"
    }
  ]
}
