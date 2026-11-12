# Deep Dive: milo.gg — Anatomi & Pola Kerja

> Target: `https://milo.gg` — landing page personal "Milo AI"
> Metode analisis: raw HTML shell, bundle JS (583 KB) & CSS (75 KB) di-decompile dan di-mapping.
> Catatan: item bertanda *(inferensi)* diturunkan dari kode, bukan dari dokumentasi resmi.

---

## 1. Apa Sebenarnya milo.gg

**Konsep:** Bukan landing page "scroll ke bawah" biasa. Ini adalah **personal landing page yang dibangun seperti game / deck interaktif** — perpaduan antara link-in-bio (Linktree premium), slide deck (Instagram Stories), dan playground interaktif.

**Tujuan bisnis:** Personal branding seorang growth advisor → funnel ke (1) brand deal, (2) advisory call, (3) event hosting. Semua interaksi "bermain" di halaman ini ujungnya adalah **booking** dan **kontak**.

**Copy style:** First-person, kasual, berani. "Yo, I'm Milo." Angka-angka flex: "5 exits, $10m raised". Satu slide = satu pesan. Nol paragraph panjang.

---

## 2. Arsitektur Teknis (Terrekonstruksi dari Kode)

```
┌─────────────────────────────────────────────────────────┐
│                        milo.gg                          │
├─────────────────────────────────────────────────────────┤
│  FRONTEND — React SPA (Vite build)                      │
│  ├─ React + React Router (SPA shell HTML 6KB)           │
│  ├─ motion (framer-motion) → animasi fisik              │
│  ├─ Radix UI → komponen aksesibel (dropdown, dialog)    │
│  ├─ lucide-react → ikon                                 │
│  ├─ Web Audio API → sound effect klik                   │
│  └─ localStorage cache + TTL (offline-first feel)       │
│                                                         │
│  BACKEND — FastAPI (platform Databutton) *(inferensi)*  │
│  ├─ /routes/* = semua endpoint API                      │
│  ├─ Image upload & serve (sticker, settings, OG)        │
│  ├─ CRUD konten via admin editor                        │
│  └─ Counter & list (aura, hot takes, thumbs up)         │
│                                                         │
│  TRACKING                                               │
│  ├─ Snitcher → identifikasi perusahaan B2B yang mampir  │
│  └─ Custom events: slide_view, sticker_click, cta_click,│
│     booking_done, email_sent, aura_click, thumbs_up     │
└─────────────────────────────────────────────────────────┘
```

**Bukti stack (dari bundle):**

| Bukti di kode | Kesimpulan |
|---|---|
| `<div id="root">` + 1 file `/assets/index-*.js` + `/assets/index-*.css` | SPA React, dibundel Vite |
| `path:"/"`, `path:"/auth/*"`, `path:"/admin"` dll | React Router |
| `motion`, animasi `isFalling/isFlying/isBouncing` | framer-motion |
| `radix-ui.com` di bundle | Radix UI primitives |
| `@databutton.io` + endpoint semua di prefix `/routes/` | Backend dibuat di **Databutton** (AI app builder yang menghasilkan FastAPI + React) *(inferensi kuat)* |
| `@bluetheory.co` | Studio/dev yang terlibat pembangunan *(inferensi)* |
| `luma.com/user/Milo`, `calendly.com` | Integrasi events & booking |
| `/sounds/click1.m4a` + `AudioContext` | UI sound design |

---

## 3. Route Map

```
/               → Landing utama (slide deck + sticker board)
/auth/*         → Login owner (magic link / OAuth)
/auth/redirect  → Callback auth
/admin          → Dashboard admin
/admin-editor   → Editor konten (edit slide, upload sticker)
admin-editor    → alias /admineditor
/book           → Pilih jenis meeting
/book/:type     → Detail booking
/call           → Pilih jenis call
/call/:type     → Detail call
/dive           → Halaman "deep dive" tambahan
/dive/*         → Subhalaman dive
/_healthz       → Health check
```

**Pola:** satu halaman publik untuk pengunjung (`/`), sisanya menganggap pengunjung cukup jenuh oleh satu dunia — halaman lain semuanya funnel ke booking.

---

## 4. API Surface (endpoint yang di-call frontend)

Dibaca langsung dari API client di bundle. Endpoint `/routes/*` butuh session — server membalas SPA shell kalau dipanggil anonim (itu perilaku auth-gate, bukan kebocoran data).

| Endpoint | Method | Fungsi |
|---|---|---|
| `/routes/settings/batch` | GET/PUT | Baca/simpan konfigurasi halaman (nama, bio, tema) |
| `/routes/settings/upload` | POST | Upload gambar settings (avatar, OG image, favicon) |
| `/api/settings/share/og.jpg?v=…` | GET | Serve OG image dinamis (cache-buster per versi) |
| `/api/settings/image/<uuid>` | GET | Serve gambar yang diupload owner |
| `/routes/slides` | GET | List slide landing page |
| `/routes/admin/slides` | GET/POST/PUT/DELETE | CRUD slide (khusus owner) |
| `/routes/stickers/upload` | POST (FormData) | Upload sticker |
| `/routes/stickers/list` | GET | List sticker board |
| `/routes/stickers/save` | POST (JSON) | Simpan posisi/state sticker |
| `/routes/stickers/image/<file>` | GET | Serve gambar sticker |
| `/routes/stickers/whatsapp` | GET | Share-link sticker ke WhatsApp |
| `/routes/stickers/linkedin` | GET | Share-link sticker ke LinkedIn |
| `/routes/stickers/email` | GET | Share sticker via email |
| `/routes/aura` | GET | Ambil total aura counter |
| `/routes/aura/increment` | POST | +1 aura (dipanggil saat visitor klik) |
| `/routes/hot_takes/create` | POST | Visitor submit hot take |
| `/routes/hot_takes/list` | GET | List hot takes |
| `/routes/hot_takes/:id` | DELETE | Moderator hapus hot take |
| `/routes/thumbs_up/list` | GET | List reaksi thumbs up |
| `/routes/send` | POST | Kirim pesan (form kontak → "Message Sent") |

**Pola penting:** frontend + backend berdekatan, kontrak API ramping (REST biasa, JSON/FormData), semua aset gambar lewat endpoint sendiri, dan **semua aksi pengunjung jadi event analitik**.

---

## 5. Data Model *(inferensi dari state & cache keys di kode)*

```
Settings     { name, bio, avatar, og_image, favicon, tema }
Slide        { id, slug?, order, heading, body, media?, cta_url? }
Sticker      { id, name, image, posisi(x,y), layer, aura_triggers? }
AuraCount    { count: number }               ← satu angka global
HotTake      { id, text, author?, created_at }
ThumbsUp     { id, ref?, timestamp }
Message      { text?, email?, source_page }
```

---

## 6. Pola Kerja Frontend — Detail yang Bikin Situs Ini "Hidup"

### 6.1 Slide Deck sebagai Landing Page
- Konten personal dipecah per slide (dari `<noscript>`: Intro → Experience → Fractional → Background → Growth → Skills → Future/Events → Call → Contact).
- Satu slide = satu pesan + satu CTA potensial. Navigasi seperti stories.
- Slide ditarik dari API, dicache `localStorage` dengan **TTL 5 menit** (`milo_slides_cache_v2`) → edit konten admin muncul cepat, tapi pengunjung repeat tidak bayar biaya fetch.

### 6.2 Sticker Board Interaktif — sebenarnya multiplayer canvas live (fitur paling khas)

Board sticker milo.gg bukan sekadar dekorasi interaktif — ini **kanvas multiplayer real-time ala Figma**. Terbukti dari protokol WebSocket di bundle:

**Protokol realtime (pesan yang dikirim client):**

| Pesan `t:` | Isi | Fungsi |
|---|---|---|
| `cur` | x, y, z (scale) | Posisi kursor visitor lain terlihat live (throttle 500ms, hanya saat gerak >2%) |
| `grab` / `ungrab` | id sticker, posisi | Menunjukkan siapa sedang "menggenggam" sticker (ala Figma multiplayer) |
| `stk` | id, x, y, **hx, hy (home position), final** | Gerakan sticker broadcast live ke semua viewer; `final:true` saat dilepas |
| `stk_reset` | id, x, y | (dari server) balikkan sticker ke posisi semula |
| `clk` | id sticker | Klik visitor lain "di-replay" di layarmu |
| `prs` | d (down/up), s (sticker id) | Press-state sync → sticker milik orang lain tampak "terpencet" (`isRemotePressed`) |
| `say` | text | Kursor visitor lain bisa "bicara" (speech bubble di atas kursor) |
| `sp` / `se` / `erase` | stroke points | **Dinding gambar bersama** — semua orang menggambar di canvas yang sama |
| `ping` | — | Keepalive tiap 25 detik |

**Detail "geser → balik sendiri":**
- Saat dilepas, sticker **tidak permanen**. Pesan `stk` membawa koordinat baru **plus koordinat home (`hx`,`hy`)** — tujuannya jelas: agar bisa direstore.
- `stk_reset` **hanya ada di sisi receiver; client tidak pernah mengirimnya** → reset dilakukan **server** (policy timeout server-side; waktu persisnya tidak terbaca dari bundle client, tapi pola home-position + handler reset-nya eksplisit).
- Saat reconnect/reload, pesan `welcome` dari server berisi daftar sticker yang "sedang dipindah"; sisanya **otomatis snap balik ke posisi home**.
- **Satu-satunya cara mengubah layout permanen: admin klik "save"** (`POST /routes/stickers/save`) yang menimpa posisi home di backend + cache localStorage. Visitor = mengatur ulang sementara, owner = menentukan kondisi asli.

**Detail lain yang bikin board terasa hidup (semua terverifikasi di kode):**
- **Entrance staggered:** sticker muncul satu per satu (delay 50ms per sticker), lalu event `stickers-settled` setelah 700ms.
- **Idle wiggle:** kalau halaman diam ≥10 detik, **sticker acak bergoyang 1 detik** untuk menarik perhatian.
- **Long-press 3 detik** pada sticker yang punya konten → memunculkan **speech bubble berisi pesan** dari pool acak (`milo_bag_<kategori>` di localStorage, tidak mengulang pesan terakhir).
- **Gyroscope:** di mobile, kemiringan HP menggerakkan kursor (`deviceorientation`) — kursor tetap "hidup" tanpa menyentuh layar.
- State animasi per sticker: walking, spinning, fast-spinning, record-spinning, wiggling, falling, flying, bouncing, remote-pressed.
- **Nama sticker = konfigurasi perilaku** (keyword matching pada nama file):
  - mengandung `"guestbook"` / `"guest book"` → buka Guestbook
  - mengandung `"polaroid"` / `"camera"` → buka view kamera/polaroid
  - mengandung `"thumb"` / `"like"` → +1 aura: partikel melayang di posisi kursor (offset random ±50px), feedback 300ms, badge counter aura tampil saat hover
- Tidak ada field config eksplisit — admin cukup menamai file `guestbook.png` dan otomatis jadi tombol fungsional. Pola "content-as-behavior": nol maintenance, konten baru = fitur baru.
- Loop viral: sticker bisa di-share ke WhatsApp / LinkedIn / email via link yang digenerate backend.

### 6.3 Aura Counter (gamifikasi sederhana yang efektif)
- Satu tombol: klik → POST increment → angka global naik → feedback visual 3 detik (setTimeout 3s) → refetch tiap 3s.
- Psikologi: "kaum orang meninggalkan jejak satu klik" — visitor merasa berpartisipasi, owner dapat metrik engagement organik.

### 6.4 Hot Takes + Guestbook (UGC)
- Visitor bisa submit konten (hot take) → tampil di list → owner bisa hapus (moderasi).
- Guestbook menyediakan ruang "tinggalkan pesan" → social proof + interaksi dua arah.
- Cache list `milo_hot_takes_cache` TTL **1 jam**.

### 6.5 Sound Design (jarang dipikirkan orang)
- `AudioContext` + pre-load `/sounds/click1.m4a`, `click2.m4a` → setiap interaksi punya bunyi klik taktil.
- Kombinasi animasi + suara = rasa "app", bukan "web statis". Effort kecil, dampak persepsi besar.

### 6.6 Strategi Cache Berlapis
```
slides      → localStorage, TTL 5 menit
hot takes   → localStorage, TTL 1 jam
stickers    → localStorage (milo_stickers_cache)
aura        → poll tiap 3 detik (dinamis)
```
Halaman terasa instan (cache-first), tetap segar (TTL pendek), dan data live (polling untuk counter).

### 6.7 SEO & Sharing untuk SPA
SPA = SEO lemah. Milo menambalnya dengan tiga lapis:
1. **`<noscript>` SEO fallback** — seluruh konten slide ditulis ulang sebagai HTML statis untuk crawler.
2. **JSON-LD lengkap** — `@type: Person` + `ProfilePage` + `WebSite` (nama, nationality, knowsAbout, sameAs LinkedIn).
3. **OG image dinamis dari backend** (`/api/settings/share/og.jpg?v=<hash>`) — gambar share Twitter/LinkedIn selalu versi terbaru.

### 6.8 Analytics两层
- **Snitcher** (B2B visitor identification): tau **perusahaan mana** yang mampir ke halaman → untuk follow-up sales. Ini pilihan cerdas karena target bisnisnya adalah brand deal & advisory, bukan konsumen massal.
- **Event tracking granular**: `slide_view`, `sticker_click`, `cta_click`, `booking_done`, `email_sent`, `aura_click`, `thumbs_up` → funnel dari main → book meeting terukur penuh.

### 6.9 Bukti Visual — Screenshot Live (browser)

Diverifikasi langsung via screenshot halaman live, semua cocok dengan analisis kode:

**Wujud visual keseluruhan:**
- Background **hitam dengan grid kertas grafik** (garis tipis abu-abu) — estetika terminal/blueprint.
- **Sticker-bomb aesthetic**: puluhan sticker menutupi kanvas — phone booth London merah, sign "MILO AI" pixel, pesawat, matahari, sneaker, kamera polaroid, sepeda, bendera US, MacBook, LEGO, thumbs up, headphone (→ radio!), botol air, bor, Hollywood star, foto keluarga & pernikahan, anjing chihuahua (→ "marlie"), doodle kuning. Semua foto asli, bukan ilustrasi — personal dan autentik.
- Tipografi **monospace putih** di atas hitam; teks slide di-ketik dengan **kursor berkedip** (terlihat mid-typing di screenshot — efek terminal nyata).

**Komponen yang terlihat:**
- **Deck slide tengah**: kartu dengan tumpukan edge di bawahnya (visual "deck kartu fisik"), pagination `1 / 9` + panah prev/next. Slide 1: intro + CTA "Join 20k+ ↗". Slide 2: daftar pencapaian (bullets monospace).
- **Panel "● Website arrivals"** (kanan-bawah): **live visitor log** bergaya papan keberangkatan bandara — timestamp + kota + flag: South Tangerang, California, Copenhagen, São Paulo, Singapore… Ini terjemahan visual dari pesan realtime `prs`/`leave`/`welcome` — pengunjung tahu orang lain ada di halaman yang sama, live.
- **Kursor visitor lain terlihat** (arrow berwarna) — multiplayer canvas terkonfirmasi visual.
- **Form kecil kiri-atas** ("your name" + tombol) — input nama cepat untuk presence/guestbook.
- **Tombol pena kiri-bawah** → dinding gambar, tapi **butuh login**: *"Log in to draw on the wall. Free, takes 10 seconds, and keeps the wall nice."* → magic-link auth sebagai anti-abuse, dengan copy first-person yang jujur dan lucu.

**Pelajaran desain terbesar:** tidak ada satu pun elemen "template SaaS". Semuanya dirancang seolah alat milik pribadi (terminal, papan arrivals, kanvas gambar, meja sticker) — dan itulah yang membuatnya terasa seperti *tempat*, bukan *halaman*.

---

## 7. Pola Bisnis yang Bisa Dipelajari

| Pola | Kenapa Works |
|---|---|
| Landing = slide deck | Meniru format konten yang orang sudah terbiasa (stories/TikTok), kontrol narasi urutan, satu pesan per layar |
| Playfulness sebagai fitur | Sticker board + aura + suara bikin orang tinggal lebih lama, dan lebih mungkin share |
| UGC (hot takes, guestbook) | Halaman terasa hidup, bukan brosur |
| One-click contribution (aura) | Friction nol → engagement tinggi → metrik social proof |
| Snitcher (company identification) | Konversi traffic anonim jadi leads B2B bernama |
| Funnel tunggal: main → book | Semua CTA mengarah ke Calendly/Luma/email — tidak ada pilihan yang membuat ragu |
| Admin editor sendiri | Owner update konten harian tanpa deploy ulang — halaman = produk live |

---

## 8. Blueprint Replikasi (Kalau Mau Bikin Yang Serupa)

### 8.1 Rekomendasi Stack (mode modern, tanpa Databutton)

**Opsi A — satu codebase (paling pragmatis):**
- **Next.js (App Router) + TypeScript** — SPA feel + SEO bawaan (tidak perlu trik noscript)
- **Tailwind CSS** untuk styling cepat
- **framer-motion (motion)** untuk animasi fisik sticker
- **Radix UI / shadcn/ui** untuk komponen interaksi
- **lucide-react** untuk ikon
- **Vercel** untuk hosting; file upload → Vercel Blob / Cloudflare R2 / S3
- **DB:** Postgres (Supabase/Neon) — tabel kecil, semua fitur ini muat
- **Sound:** Web Audio API + 2 file klik lokal
- **Analytics:** PostHog (event) + Snitcher/Leadfeeder (company identification)

**Opsi B — replika 1:1 (Vite + React SPA + FastAPI):**
- Frontend Vite+React Router persis pola aslinya + SEO fallback manual
- Backend FastAPI `/routes/*` — cocok kalau mau feel "Databutton-style" atau sudah nyaman Python

> Rekomendasiku: **Opsi A**. SEO jauh lebih mudah di Next.js, dan kebutuhan backend-nya kecil (≤ 10 endpoint) sehingga Next.js API routes + Postgres cukup — tidak perlu server terpisah.

### 8.2 Skema Database Minimal

```sql
settings   (id, key, value, updated_at)               -- key-value CMS
slides     (id, slug, position, heading, body, cta_type, cta_url, published)
stickers   (id, name, image_url, x, y, layer, aura_trigger, created_at)
aura_log   (id, session_hash, created_at)             -- anti-spam increment
hot_takes  (id, text, session_hash, status, created_at)
thumbs_up  (id, ref_type, ref_id, session_hash, created_at)
messages   (id, name, email, text, source, created_at)
events_log (id, name, props_json, session_hash, created_at)
```

### 8.3 Urutan Build (MVP → Pola Lengkap)

**Fase 1 — Kerangka (±1–2 hari kerja)**
1. Next.js project + Tailwind + layout slide deck (fullscreen, navigasi keyboard/swipe)
2. Halaman slide statis dulu (hardcode 8–9 slide, struktur data sudah mengikuti skema di atas)
3. OG image + JSON-LD Person/ProfilePage + meta lengkap
4. Deploy → domain

**Fase 2 — Konten dinamis (±2–3 hari)**
5. Admin editor (login sederhana: magic-link atau password satu user) — CRUD slide + upload gambar
6. API slides + settings, pindahkan konten statis ke DB
7. CTA: integrasi Calendly embed/redirect + form kontak (`/routes/send` analog)

**Fase 3 — Interaksi & gamifikasi (±3–4 hari)**
8. Sticker board: drag physics (framer-motion `drag` + spring), persist posisi via API
9. Aura counter (GET + POST increment, feedback animasi, polling 3s)
10. Hot takes: submit + list + moderasi admin
11. Guestbook + thumbs up
12. Sound effects (2 file klik, preload, play on interaction)

**Fase 4 — Growth layer (±1–2 hari)**
13. Share sticker → deep-link WhatsApp/LinkedIn/email
14. PostHog event tracking (slide_view, cta_click, booking_done, dll)
15. Snitcher / Leadfeeder untuk identifikasi perusahaan visitor
16. Cache layer (localStorage + TTL atau SWR)

**Total estimasi: 7–11 hari kerja fokus untuk replikasi pola penuh** (tanpa copy, tanpa asset design).

### 8.4 Keputusan Desain yang Perlu Ditiru vs Dibedakan

**Tiru polanya:**
- Satu slide = satu pesan, narasi urutan terkontrol
- Interaksi punya feedback (animasi + suara)
- Satu funnel utama (semua jalan menuju satu CTA)
- Cache-first agar instan
- UGC dengan moderasi owner
- SEO fallback & JSON-LD sejak hari pertama

**Bedakan identitasnya:**
- Jangan kloning persona/konten — sesuaikan dengan brand kamu sendiri
- Pilih gamifikasi yang cocok dengan niche kamu (aura di sini = inside joke komunitas growth/AI)
- Warna/typography milo.gg sangat minimal (Roboto + Roboto Mono, grayscale) — kamu bisa pilih identitas visual sendiri

---

## 9. Ringkasan Satu Paragraf

milo.gg adalah **personal landing page berbentuk deck slide interaktif** yang dibangun React+Vite di frontend dan FastAPI (platform Databutton) di backend. Kekuatannya bukan teknologi — semuanya konvensional — tapi **pola**: konten diperlakukan sebagai slide yang bisa diedit lewat CMS sendiri, pengunjung diperlakukan sebagai pemain (drag sticker, klik aura, kirim hot takes, guestbook), semua interaksi punya feedback taktil (animasi + suara) dan terukur (event analytics + Snitcher untuk identifikasi perusahaan), dan seluruh funnel diarahkan ke satu tujuan: booking. Replikasi penuh bisa dibangun dengan Next.js + Postgres + framer-motion dalam ±1–2 minggu.
