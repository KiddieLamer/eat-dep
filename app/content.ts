// ── SEMUA KONTEN & IDENTITAS DI FILE INI ──
// Edit file ini untuk mengubah isi situs. Push ke git = deploy otomatis (Vercel).

export const SITE = {
  handle: "@eatrovert_",
  displayName: "eatrovert_",
  title: "eatrovert_ — Mukbang & Food Creator",
  description:
    "Hii, aku @eatrovert_ 🍜 konten kreator makanan — mukbang & ASMR tiap hari. 100K+ likes di TikTok, seri Day 1–55 tanpa skip. Request menu, collab, atau sekadar say hi!",
  url: "https://eatrovert.my.id",
  bio: "enjoy every small progress coz it's still a progress ✦",
} as const;

export const LINKS = {
  tiktok: "https://www.tiktok.com/@eatrovert_",
  instagram: "https://www.instagram.com/depstagram_/",
  youtube: "https://www.youtube.com/@eatrovert17",
  threads: "https://www.threads.com/@alfianhvfiz",
  whatsapp:
    "https://wa.me/6285257712001?text=" +
    encodeURIComponent("Hai eatrovert_! Aku mau collab / request menu 🍜"),
} as const;

export type Slide = {
  slug: string;
  content: string;
  cta?: { label: string; url: string };
};

// Urutan slide — "1 / 9" di UI = panjang array ini
export const SLIDES: Slide[] = [
  {
    slug: "intro",
    content:
      "Hii, Aku @eatrovert_ 🍜\n\nAku konten kreator makanan.\nMukbang, ASMR, dan semua yang\nbikin kamu ikutan lapar.",
    cta: { label: "Follow di TikTok ↗", url: LINKS.tiktok },
  },
  {
    slug: "daily",
    content:
      "Aku punya satu misi sederhana:\n\nmakan tiap hari, dan ceritakan.\n\nDay 1 → Day 55+ tanpa skip.\nKarena progress kecil tetap progress. ✦",
  },
  {
    slug: "stats",
    content:
      "Angka-angka yang kubanggakin:\n\n– 100.4K likes di TikTok\n– 1.2K+ followers (baru aja celebrate 1K 🫶)\n– 99.5K views di satu video\n– 55+ hari mukbang tanpa henti",
    cta: { label: "Lihat sendiri ↗", url: LINKS.tiktok },
  },
  {
    slug: "menu",
    content:
      "Menu yang pernah lewat:\n\n– Pempek Emak Indah 🥟\n– Ceker mercon 🔥\n– Mie gacoan level 3\n– Nasi padang dendeng batokok\n– Samyang stew, lawless burger,\n  dan 50+ lainnya",
  },
  {
    slug: "request",
    content:
      "Mau lihat aku makan apa?\n\nSeri “makan sesuai request” itu nyata —\nrequest-mu bisa jadi video berikutnya.\n\nDrop di komentar TikTok 👇",
    cta: { label: "Request di TikTok ↗", url: LINKS.tiktok },
  },
  {
    slug: "collab",
    content:
      "Brand atau UMKM kuliner?\n\nAku suka review jujur, makan seru,\ndan cerita yang bikin orang laper.\n\nYuk collab 🤝",
    cta: { label: "Chat WhatsApp ↗", url: LINKS.whatsapp },
  },
  {
    slug: "sosmed",
    content:
      "Semua tempat aku nongkrong:\n\n– TikTok  → @eatrovert_\n– IG     → @depstagram_\n– YouTube → @eatrovert17\n– Threads → @alfianhvfiz",
    cta: { label: "Buka TikTok ↗", url: LINKS.tiktok },
  },
  {
    slug: "contact",
    content:
      "Any inquiries? 💌\n\nDM TikTok/IG, atau langsung\nWhatsApp — dibalas secepat\naku menghabiskan satu pempek.",
    cta: { label: "WhatsApp Aku ↗", url: LINKS.whatsapp },
  },
  {
    slug: "outro",
    content:
      "“enjoy every small progress\ncoz it's still a progress.” ✦\n\n— aku, sambil ngunyah 🍜\n\nTerima kasih sudah mampir.",
  },
];

export type Sticker = {
  id: string;
  emoji: string;
  name: string;
  // opsional: path foto (letakkan file di public/, mis. "/stickers/pempek.jpg").
  // kalau `image` terisi, foto dipakai menggantikan emoji.
  image?: string;
  // bare=true → tanpa tile putih (untuk PNG transparan yang sudah bentuk sendiri)
  bare?: boolean;
  // noOutline=true → tanpa outline putih (untuk logo yang sudah punya gaya sendiri)
  noOutline?: boolean;
  // opsional: daftar foto — klik sticker memunculkan satu foto acak sebagai
  // polaroid yang tampil sebentar lalu menutup sendiri (sticker kamera)
  photos?: readonly string[];
  // opsional: daftar video TikTok — klik sticker memunculkan bubble judul
  // acak + link "tonton ↗" (sticker Hangry & Sumber Selera)
  videos?: readonly { url: string; text: string }[];
  // opsional: daftar teks — klik sticker memunculkan salah satunya sebagai
  // bubble acak di atas sticker (tanpa audio)
  bubbles?: readonly (string | { text: string; url?: string; urlLabel?: string })[];
  // posisi dalam persen dari area kanvas (bisa >100 = agak keluar layar)
  x: number;
  y: number;
  size: number;
  rot: number;
};

// Dialog Lotso (Toy Story 3) — klik sticker lotso: audio + bubble text acak
export const LOTSO_QUOTES = [  { file: "/sounds/lotso/q1-hugger.mp3", text: "First thing you gotta know about me? I'm a hugger. 🤗" },
  {
    file: "/sounds/lotso/q2-owners.mp3",
    text: "We don't need owners here at Sunnyside. We own ourselves — we're masters of our own fate.",
  },
  {
    file: "/sounds/lotso/q3-welcome.mp3",
    text: "Welcome to Sunnyside, folks! I'm Lots-o'-Huggin' Bear… but please, call me Lotso.",
  },
  { file: "/sounds/lotso/q4-sheriff.mp3", text: "Where's your kid now, Sheriff? 👀" },
] as const;

// Video TikTok pilihan — klik sticker "vt": bubble judul + link tonton
export const VT_VIDEOS = [
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7694259293486386440",
    text: "Day32 — makan Uno Chicken by @Hangry Indonesia 🍗",
  },
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7692381991559335175",
    text: "Day26 — salted egg chicken by @Hangry Indonesia 🧂",
  },
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7697184049319775506",
    text: "Day36 — bishi bento mukbang ASMR 🍱",
  },
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7695714794371828998",
    text: "Uno Chicken ASMR — crunch yang bikin laper 🔊",
  },
] as const;

// Audio Manchester United — klik sticker logo MU: audio + bubble GGMU
export const MU_SOUND = [
  {
    file: "/sounds/mu/manchester-united.mp3",
    text: "GGMU! 🔴 Glory Glory Man United! ⚽",
  },
] as const;

// Video kolab Bakso Sumber Selera (Kebon Jeruk 1989) — sticker logonya
export const SS_VIDEOS = [
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7699083598653115656",
    text: "Day41 — bakso cup sumber selera ✨",
  },
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7701595222253489426",
    text: "Day46 — bakso sambel sumber selera, enak bgtt 🍜",
  },
] as const;

// Video kolab Pempek Emak Indah — sticker logonya
export const EMAK_VIDEOS = [
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7704539214485916935",
    text: "Post 1 — makan pempek Emak Indah 😋",
  },
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7707167058835950866",
    text: "Post 4 — makan pempek 1 pack 🤤",
  },
] as const;

// Video kolab Uma Food — sticker logonya
export const UMA_VIDEOS = [
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7706777989333273864",
    text: "Post 3 — cireng kuah & pangsit ayam @Uma.food_ 🤤",
  },
] as const;

// Video kolab Bittersweet by Najla — sticker logonya
export const BITTERSWEET_VIDEOS = [
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7696110608361770258",
    text: "Review scoop tin & dessertbox Bittersweet by Najla 🍰",
  },
] as const;

// Video kolab Nasi Jukut Kak Ala — sticker logonya
export const NASIJUKUT_VIDEOS = [
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7693516689681550644",
    text: "Mukbang ASMR Nasi Jukut Kak Ala 🍛",
  },
] as const;

// Video kolab Kanzler Singles — sticker logonya
export const KANZLER_VIDEOS = [
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7694654750163225863",
    text: "Day30 — sosis tomyum oseng Thailand by Kanzler 🌭",
  },
] as const;

// Video kolab Bolosego — sticker logonya
export const BOLOSEGO_VIDEOS = [
  {
    url: "https://www.tiktok.com/@eatrovert_/video/7706437083400916242",
    text: "Post 2 — ceker mercon @Bolosego, enak bgt luv 🌶️",
  },
] as const;

// "name" adalah konfigurasi perilaku (pola content-as-behavior ala milo):
//  – mengandung "ramen"     → klik = +1 di Lapar Meter
//  – mengandung "chat"      → klik = buka WhatsApp
//  – mengandung "camera"    → klik = buka Instagram
//  – mengandung "movie"     → klik = buka YouTube
//  – mengandung "headset"   → klik = play/pause lagu Novo Amor
//  – mengandung "lotso"     → klik = audio dialog + bubble text di atasnya
//  – mengandung "vt"        → klik = bubble judul video TikTok + link tonton
//  – punya `bubbles`        → klik = bubble text acak (mascot, dll.)
export const STICKERS: Sticker[] = [
  { id: "s12", emoji: "🎧", name: "headset", image: "/stickers/headset.webp", bare: true, x: 92.6, y: 8.6, size: 84, rot: -6 },
  // logo platform asli — klik = bubble + link buka platform (tidak langsung open tab)
  { id: "s15", emoji: "▶️", name: "youtube shorts", image: "/stickers/shorts.png", bare: true, x: 91.4, y: 45.8, size: 56, rot: 8,
    bubbles: [{ text: "Mukbang kilat & ASMR pendek ada di Shorts 🎬", url: LINKS.youtube, urlLabel: "buka YouTube ↗" }] },
  { id: "s16", emoji: "📷", name: "instagram", image: "/stickers/instagram.png", bare: true, x: 21, y: 52.8, size: 44, rot: -8,
    bubbles: [{ text: "Foto & story harianku ada di IG 📸", url: LINKS.instagram, urlLabel: "buka IG ↗" }] },
  { id: "s17", emoji: "🎵", name: "tiktok", image: "/stickers/tiktok.png", bare: true, noOutline: true, x: 15.6, y: 8.3, size: 72, rot: 0,
    bubbles: [{ text: "Konten harian & mukbangku semua di sini 🎵", url: LINKS.tiktok, urlLabel: "buka TikTok ↗" }] },
  { id: "s18", emoji: "💬", name: "whatsapp", image: "/stickers/whatsapp.png", bare: true, x: 23, y: 37.5, size: 44, rot: 6,
    bubbles: [{ text: "Chat aku di sini buat collab & request menu 💬", url: LINKS.whatsapp, urlLabel: "chat WhatsApp ↗" }] },
  { id: "s19", emoji: "🧵", name: "threads", image: "/stickers/threads.png", bare: true, x: 6.6, y: 63.9, size: 44, rot: -5,
    bubbles: [{ text: "Ceitan & pikiran harianku ada di Threads ✍️", url: LINKS.threads, urlLabel: "buka Threads ↗" }] },
  { id: "s13", emoji: "🧸", name: "lotso", image: "/stickers/lotso.png", bare: true, x: 67.2, y: 84.7, size: 64, rot: 4 },
  {
    id: "s14",
    emoji: "😋",
    name: "mascot",
    image: "/stickers/mascot.png",
    bare: true,
    bubbles: [
      "bismillahirohmanirohim..",
      "Day 1 , Day 2 , Day 3, Day seterusnyaa",
      "Business inquiry bisa DM di Tiktok ya",
      "hari ini kita ngonten apa ya?",
    ],
    x: 28.1,
    y: 91,
    size: 60,
    rot: -6,
  },
  {
    id: "s20",
    emoji: "🎥",
    name: "hangry vt",
    image: "/stickers/hangry.png",
    bare: true,
    videos: VT_VIDEOS,
    x: 78.1,
    y: 8.6,
    size: 84,
    rot: 0,
  },
  {
    id: "s21",
    emoji: "🍜",
    name: "sumber selera vt",
    image: "/stickers/sumber-selera.png",
    bare: true,
    videos: SS_VIDEOS,
    x: 43.4,
    y: 89.6,
    size: 64,
    rot: -5,
  },
  {
    id: "s22",
    emoji: "🥟",
    name: "emak indah vt",
    image: "/stickers/emak-indah.png",
    bare: true,
    videos: EMAK_VIDEOS,
    x: 85.2,
    y: 26.4,
    size: 130,
    rot: 6,
  },
  {
    id: "s23",
    emoji: "🍲",
    name: "uma food vt",
    image: "/stickers/uma-food.png",
    bare: true,
    videos: UMA_VIDEOS,
    x: 91.8,
    y: 65.3,
    size: 62,
    rot: -6,
  },
  {
    id: "s24",
    emoji: "🍰",
    name: "bittersweet vt",
    image: "/stickers/bittersweet.png",
    bare: true,
    videos: BITTERSWEET_VIDEOS,
    x: 87.9,
    y: 83.3,
    size: 48,
    rot: 5,
  },
  {
    id: "s25",
    emoji: "🍛",
    name: "nasi jukut vt",
    image: "/stickers/nasijukut.png",
    bare: true,
    videos: NASIJUKUT_VIDEOS,
    x: 78.9,
    y: 47.5,
    size: 48,
    rot: -6,
  },
  {
    id: "s26",
    emoji: "🌶️",
    name: "bolosego vt",
    image: "/stickers/bolosego.png",
    bare: true,
    videos: BOLOSEGO_VIDEOS,
    x: 56.3,
    y: 89.6,
    size: 62,
    rot: 5,
  },
  {
    id: "s27",
    emoji: "☀️",
    name: "sun",
    image: "/stickers/sun.webp",
    bare: true,
    noOutline: true,
    x: 27.3,
    y: 8.3,
    size: 56,
    rot: 8,
  },
  {
    id: "s28",
    emoji: "💻",
    name: "laptop",
    image: "/stickers/laptop.webp",
    bare: true,
    bubbles: [
      {
        text: "Website ini dibuat oleh ranpo.my.id 🖥️",
        url: "https://ranpo.my.id",
        urlLabel: "ranpo.my.id ↗",
      },
    ],
    x: 38.3,
    y: 11.1,
    size: 62,
    rot: -5,
  },
  {
    id: "s29",
    emoji: "⚽",
    name: "manchester united mu",
    image: "/stickers/manutd.png",
    bare: true,
    x: 7,
    y: 43.1,
    size: 62,
    rot: 6,
  },
  {
    id: "s30",
    emoji: "🐱",
    name: "kucing",
    image: "/stickers/kucing.png",
    bare: true,
    x: 32,
    y: 37.5,
    size: 60,
    rot: -3,
  },
  {
    id: "s31",
    emoji: "📧",
    name: "email",
    image: "/stickers/email.webp",
    bare: true,
    noOutline: true,
    bubbles: [
      {
        text: "Mau ngobrol lebih lanjut? 💌",
        url: "mailto:syawalinatafrijiyyah@gmail.com",
        urlLabel: "syawalinatafrijiyyah@gmail.com ↗",
      },
    ],
    x: 77.7,
    y: 90.3,
    size: 58,
    rot: 6,
  },
  {
    id: "s32",
    emoji: "📸",
    name: "polaroid",
    image: "/stickers/pet-album.webp",
    bare: true,
    noOutline: true,
    photos: ["/photos/cat-1.jpg", "/photos/cat-2.jpg", "/photos/cat-3.jpg", "/photos/cat-4.jpg"],
    x: 7,
    y: 81.3,
    size: 48,
    rot: -5,
  },
  {
    id: "s33",
    emoji: "👋",
    name: "wave",
    image: "/stickers/wave.png",
    bare: true,
    x: 53.5,
    y: 20.6,
    size: 120,
    rot: 0,
  },
  {
    id: "s34",
    emoji: "🍢",
    name: "cimol bojot aa",
    image: "/stickers/cimol.png",
    bare: true,
    bubbles: ["VT Cimol Bojot AA — soon 👀"],
    x: 12,
    y: 27,
    size: 38,
    rot: 5,
  },
  {
    id: "s35",
    emoji: "🍪",
    name: "endorphins",
    image: "/stickers/endorphins.png",
    bare: true,
    bubbles: ["VT Endorphins — soon 👀"],
    x: 16.4,
    y: 83.3,
    size: 46,
    rot: -6,
  },
  {
    id: "s36",
    emoji: "🌭",
    name: "kanzler vt",
    image: "/stickers/kanzler.png",
    bare: true,
    videos: KANZLER_VIDEOS,
    x: 4.7,
    y: 13,
    size: 46,
    rot: -4,
  },
];

// ── TEMA (identitas: hitam ala milo.gg, aksen tomat sebagai warna brand) ──
export const THEME = {
  bg: "#050505", // hitam pekat
  grid: "rgba(255, 255, 255, 0.055)", // garis grid halus terang
  ink: "#F2F2F2", // teks terang
  accent: "#E4572E", // tomat (brand food)
  card: "#0A0A0A",
  muted: "#9CA3AF",
} as const;

// ── MUSIK: klik sticker headset → play random, klik lagi → pause ──
export const TRACKS = [
  { id: "utj0BFuv1-Q", title: "Carry You" },
  { id: "AS_gmvtj4R0", title: "Repeat Until Death" },
  { id: "OmKAn8rNbKg", title: "Anchor" },
  { id: "MACzQc6FlRM", title: "State Lines" },
] as const;
