# eatrovert_ — Personal Landing Page

Situs personal branding ala "slide deck interaktif" untuk **@eatrovert_** (mukbang & food creator).
Kerangka interaksi terinspirasi milo.gg; identitas visual: hitam + grid, font Roboto/Roboto Mono, aksen tomat.

**Stack:** Next.js 16 · TypeScript · Tailwind 4 · **100% statis, tanpa backend** — deploy gratis di Vercel.

## Struktur penting

| File | Isi |
|---|---|
| `app/content.ts` | **SEMUA KONTEN** — slide, sticker, link sosmed, warna tema |
| `app/components/Experience.tsx` | Kanvas utama: drag = pan, scroll = slide, pinch/ctrl+scroll = zoom |
| `app/components/Deck.tsx` | Deck slide (tumpukan kartu + pagination + CTA) |
| `app/components/Typewriter.tsx` | Efek ketik per slide (sekali main per slide) |
| `app/components/StickerBoard.tsx` | Sticker drag smooth (transform compositor-only) + badge lapar + bubble dialog |
| `app/layout.tsx` | SEO: metadata, OG, JSON-LD Person/ProfilePage |
| `public/og.png` | Gambar share (1200×630) — sumbernya `public/og-source.html` |

## Pola "content-as-behavior" (sticker)

Perilaku klik sticker ditentukan **keyword di `name`** / field opsional (di `content.ts`):
- mengandung `ramen` → +1 Lapar (badge muncul saat hover sticker ramen)
- `youtube` / `instagram` / `tiktok` / `whatsapp` / `threads` → buka link platform masing-masing (logo asli transparan di `public/stickers/`)
- mengandung `headset` → play/pause lagu Novo Amor (YouTube IFrame API, daftar lagu di `TRACKS`)
- mengandung `lotso` → audio dialog Toy Story + bubble text di atasnya
- punya field `bubbles` → bubble text acak di atas sticker (mascot)

Nambah sticker fungsional = nambah 1 baris di `STICKERS`.

## Mengubah konten

1. Edit `app/content.ts` (slide/sticker/link/warna).
2. `pnpm build` → push ke GitHub → Vercel deploy otomatis.
3. Foto asli untuk sticker: upload ke `public/`, lalu ganti emoji dengan `<img>` di `StickerBoard` (slot sudah disiapkan secara konsep — tinggal render `s.image` bila ada).

## Jalankan lokal

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build && pnpm start   # produksi
```

## Deploy (Vercel, tanpa backend)

1. Push repo ini ke GitHub.
2. [vercel.com/new](https://vercel.com/new) → import repo → framework: Next.js (auto) → Deploy.
3. Custom domain: Project → Settings → Domains → tambahkan `eatrovert.my.id`.
4. Di registrar domain: A record `@` → `76.76.76.76`, atau CNAME `www` → `cname.vercel-dns.com`.
5. Selesai — setiap push ke branch utama = deploy otomatis.

## Batas MVP (tanpa backend)

- Counter lapar & posisi sticker = **per device** (localStorage) — total tampil sebagai badge di sticker ramen saat di-hover.
- Tidak ada realtime multiplayer (kursor live, arrivals) — menunggu fase 2 (Supabase Realtime/PartyKit bila diinginkan).
- Tidak ada admin editor — konten via `content.ts`.

Riset & blueprint lengkap: [docs/milo-gg-deep-dive.md](docs/milo-gg-deep-dive.md)
