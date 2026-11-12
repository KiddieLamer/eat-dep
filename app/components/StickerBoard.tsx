"use client";

import { useEffect, useRef, useState } from "react";
import { LINKS, LOTSO_QUOTES, MU_SOUND, type Sticker } from "../content";
import { playClick, playQuote } from "../lib/sound";

const LS_POS = "eatro_stickers_v1";

type PosMap = Record<string, { x: number; y: number }>;

// transform kanonik sticker — dx/dy dalam px world (dibagi zoom di pemanggil)
const canon = (rot: number, dx = 0, dy = 0) =>
  `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`;

// Posisi khusus mobile (layar < 700px) — 2 baris atas + 2 baris bawah deck
const MOBILE_POS: Record<string, { x: number; y: number }> = {
  s17: { x: 8, y: 6 }, s27: { x: 25, y: 6 }, s20: { x: 41.7, y: 6 }, s12: { x: 58.3, y: 6 },
  s34: { x: 75, y: 6 }, s36: { x: 91.7, y: 6 },
  s28: { x: 10, y: 16 }, s30: { x: 30, y: 15 }, s33: { x: 50, y: 15 }, s19: { x: 70, y: 15 },
  s25: { x: 90, y: 15 }, s32: { x: 92.9, y: 92 },
  s29: { x: 8.3, y: 78 }, s16: { x: 25, y: 78 }, s23: { x: 41.7, y: 78 }, s22: { x: 58.3, y: 78 },
  s24: { x: 75, y: 78 }, s15: { x: 91.7, y: 78 },
  s18: { x: 8, y: 92 }, s14: { x: 22, y: 92 }, s21: { x: 36, y: 92 }, s26: { x: 50, y: 92 },
  s31: { x: 64, y: 92 }, s35: { x: 78, y: 92 },
};

// Sticker board: drag butter-smooth (transform compositor-only, tanpa setState
// selama drag). Klik (geser < 6px) memicu perilaku sesuai keyword di `name`.
// Bubble dialog dirender sebagai layer terpisah agar tidak ikut kena
// filter outline putih milik sticker.
export function StickerBoard({ stickers, zoom }: { stickers: Sticker[]; zoom: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<PosMap>({});
  const posRef = useRef<PosMap>({});
  const drag = useRef<{
    id: string;
    el: HTMLElement;
    rot: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: number;
    lastDx: number;
    lastDy: number;
  } | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bubble, setBubble] = useState<{
    id: string;
    text: string;
    url?: string;
    urlLabel?: string;
    x?: number;
    y?: number;
    below?: boolean;
  } | null>(null);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [photoPop, setPhotoPop] = useState<{ id: string; src: string } | null>(null);
  const photoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // faktor skala responsif: di layar sempit semua sticker mengecil proporsional
  const [sf, setSf] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      setSf(vw < 700 ? Math.min(0.75, Math.max(0.28, vw / 1400)) : Math.min(1, Math.max(0.45, vw / 1100)));
      setIsMobile(vw < 700);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const showBubble = (s: Sticker, text: string, url?: string, urlLabel?: string) => {
    // anchor bubble ke TEPI ATAS sticker (bukan tengah) — diukur dari DOM,
    // dikompensasi zoom supaya posisinya benar di dalam world
    let cx: number | null = null;
    let top: number | null = null;
    const imgSel = s.image ? `img[src="${s.image}"]` : null;
    const el = (imgSel ? document.querySelector(imgSel) : null)?.closest(".sticker") as HTMLElement | null;
    const wrap = wrapRef.current;
    let below = false;
    if (el && wrap) {
      const r = el.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      const z = zoomRef.current || 1;
      cx = (r.left + r.width / 2 - wr.left) / z;
      // sticker dekat atas layar → bubble tampil DI BAWAH sticker
      if (r.top < 130) {
        below = true;
        top = (r.bottom - wr.top) / z;
      } else {
        top = (r.top - wr.top) / z;
      }
    }
    if (cx === null || top === null) {
      const p = pos[s.id] ?? { x: s.x, y: s.y };
      const wr2 = wrap?.getBoundingClientRect();
      cx = (p.x / 100) * (wr2?.width ?? 0);
      top = (p.y / 100) * (wr2?.height ?? 0);
    }
    // clamp horizontal biar bubble tidak keluar layar
    const w2 = wrap?.getBoundingClientRect().width ?? 1280;
    cx = Math.min(Math.max(cx, 135), w2 - 135);
    setBubble({ id: s.id, text, url, urlLabel, x: cx, y: top, below });
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 8000);
  };

  const showPhoto = (id: string, src: string) => {
    setPhotoPop({ id, src });
    if (photoTimer.current) clearTimeout(photoTimer.current);
    photoTimer.current = setTimeout(() => setPhotoPop(null), 4500);
  };

  const closePhoto = () => {
    if (photoTimer.current) clearTimeout(photoTimer.current);
    setPhotoPop(null);
  };

  // muat posisi tersimpan (client only — hindari hydration mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_POS);
      if (raw) {
        const parsed = JSON.parse(raw) as PosMap;
        posRef.current = parsed;
        setPos(parsed);
      }
    } catch {}
  }, []);

  const persist = (next: PosMap) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(LS_POS, JSON.stringify(next));
      } catch {}
    }, 300);
  };

  const applyPos = (id: string, x: number, y: number) => {
    const next = { ...posRef.current, [id]: { x, y } };
    posRef.current = next;
    setPos(next);
    persist(next);
  };

  const getPos = (s: Sticker) => {
    if (isMobile) return MOBILE_POS[s.id] ?? { x: s.x, y: s.y };
    return pos[s.id] ?? { x: s.x, y: s.y };
  };

  const onPointerDown = (s: Sticker) => (e: React.PointerEvent) => {
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // pointerId sintetis (testing) / sudah lepas — drag tetap jalan via bubbling
    }
    el.classList.add("is-dragging");
    const p = getPos(s);
    drag.current = {
      id: s.id,
      el,
      rot: s.rot,
      startX: e.clientX,
      startY: e.clientY,
      origX: p.x,
      origY: p.y,
      moved: 0,
      lastDx: 0,
      lastDy: 0,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / zoomRef.current;
    const dy = (e.clientY - d.startY) / zoomRef.current;
    d.moved = Math.max(d.moved, Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY));
    d.lastDx = dx;
    d.lastDy = dy;
    // compositor-only: tulis transform langsung ke DOM, nol re-render React
    d.el.style.transform = canon(d.rot, dx, dy);
  };

  const onPointerUp = (s: Sticker) => (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d) {
      d.el.classList.remove("is-dragging");
      d.el.style.transform = canon(s.rot);
    }
    if (!d || d.moved <= 6) {
      // ── KLIK ──
      playClick();
      const n = s.name.toLowerCase();
      if (n.includes("headset") || n.includes("headphone") || n.includes("music")) {
        window.dispatchEvent(new Event("eatro:music-toggle"));
      } else if (n.includes("manchester") || n.includes("manutd")) {
        // audio anthem + bubble GGMU
        const m = MU_SOUND[Math.floor(Math.random() * MU_SOUND.length)];
        playQuote(m.file);
        showBubble(s, m.text);
      } else if (s.videos?.length) {
        // bubble judul video TikTok + link tonton (random dari daftar videonya)
        const v = s.videos[Math.floor(Math.random() * s.videos.length)];
        showBubble(s, v.text, v.url);
      } else if (s.photos?.length) {
        // polaroid: foto acak muncul sebentar lalu menutup sendiri (klik = tutup cepat)
        const src = s.photos[Math.floor(Math.random() * s.photos.length)];
        showPhoto(s.id, src);
      } else if (s.bubbles?.length) {
        // bubble text acak di atas sticker — bisa string atau {text, url, urlLabel}
        const raw = s.bubbles[Math.floor(Math.random() * s.bubbles.length)];
        const entry = typeof raw === "string" ? { text: raw } : raw;
        showBubble(s, entry.text, entry.url, entry.urlLabel);
      } else if (n.includes("lotso")) {
        // audio dialog + bubble text di atas sticker (random dari LOTSO_QUOTES)
        const q = LOTSO_QUOTES[Math.floor(Math.random() * LOTSO_QUOTES.length)];
        playQuote(q.file);
        showBubble(s, q.text);
      }
      // bounce untuk semua sticker yang diklik
      const el = e.currentTarget as HTMLElement;
      el.classList.remove("sticker-bounce");
      void el.offsetWidth; // restart animation
      el.classList.add("sticker-bounce");
      return;
    }
    // ── DRAG SELESAI: commit posisi sekali di akhir ──
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    applyPos(
      d.id,
      d.origX + (d.lastDx / rect.width) * 100,
      d.origY + (d.lastDy / rect.height) * 100
    );
  };

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {stickers.map((s) => {
        const p = getPos(s);
        return (
          <div
            key={s.id}
            className={`sticker no-pan${s.bare ? " sticker-bare" : ""}${s.noOutline ? " sticker-no-outline" : ""}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: canon(s.rot),
              fontSize: isMobile ? Math.min(s.size * sf, 29) : s.size * sf,
              padding: s.image ? 6 : 10,
              zIndex: 20,
            }}
            onPointerDown={onPointerDown(s)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp(s)}
          >
            {s.image ? (
              <img
                src={s.image}
                alt=""
                draggable={false}
                style={{ width: isMobile ? Math.min(s.size * 1.9 * sf, 55) : s.size * 1.9 * sf, borderRadius: s.bare ? 0 : 8, display: "block" }}
              />
            ) : (
              <span aria-hidden>{s.emoji}</span>
            )}
          </div>
        );
      })}
      {/* bubble dialog — layer terpisah agar TIDAK ikut kena filter outline sticker */}
      {bubble &&
        (() => {
          const s = stickers.find((x) => x.id === bubble.id);
          if (!s) return null;
          return (
            <div
              className={`sticker-bubble${bubble.below ? " sticker-bubble--below" : ""}`}
              role="status"
              style={{ left: `${bubble.x}px`, top: `${bubble.y}px` }}
            >
              {bubble.text}
              {bubble.url && (
                <a
                  href={bubble.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bubble-link"
                >
                  {bubble.urlLabel ?? "tonton ↗"}
                </a>
              )}
            </div>
          );
        })()}
      {/* popup foto polaroid — layer mandiri, pintar menempatkan diri */}
      {photoPop &&
        (() => {
          const s = stickers.find((x) => x.id === photoPop.id);
          if (!s) return null;
          const p = getPos(s);
          // vertikal: di bawah sticker kalau sticker di atas layar, selain itu di atas
          const vert = p.y < 45 ? "16px" : "calc(-100% - 16px)";
          // horizontal: clamp biar tidak melewati tepi kiri/kanan
          const horiz = p.x < 15 ? "-12%" : p.x > 85 ? "-88%" : "-50%";
          return (
            <div
              className="photo-pop"
              role="status"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: `translate(${horiz}, ${vert})` }}
            >
              <div className="photo-pop-card" onClick={closePhoto}>
                <img src={photoPop.src} alt="Foto kucing" draggable={false} />
                <span className="photo-pop-caption">📸 klik untuk tutup</span>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
