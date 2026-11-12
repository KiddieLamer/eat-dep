"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Slide } from "../content";
import { playClick } from "../lib/sound";
import { Typewriter } from "./Typewriter";

// Tangga tumpukan kartu persis milo.gg (dari HTML aslinya):
// opacity 0.9→0.3, translateY 25→220, scale 0.96→0.84, blur 0→3px, origin-bottom.
const STACK_LADDER = [
  { opacity: 0.9, y: 25, scale: 0.96, blur: 0 },
  { opacity: 0.8, y: 45, scale: 0.94, blur: 1 },
  { opacity: 0.7, y: 70, scale: 0.92, blur: 1 },
  { opacity: 0.6, y: 100, scale: 0.9, blur: 2 },
  { opacity: 0.5, y: 135, scale: 0.88, blur: 2 },
  { opacity: 0.4, y: 175, scale: 0.86, blur: 3 },
  { opacity: 0.3, y: 220, scale: 0.84, blur: 3 },
];

// Deck slide di tengah kanvas — kartu kecil berukuran TETAP (semua slide sama),
// pager mungil di kanan-atas, teks mono, CTA kiri-bawah.
// animasi teks cuma main sekali per slide (ala alreadyPlayed milo.gg).
export function Deck({
  slides,
  index,
  onNav,
  alreadyPlayed,
}: {
  slides: Slide[];
  index: number;
  onNav: (dir: 1 | -1, force?: boolean) => void;
  alreadyPlayed: Set<string>;
}) {
  const total = slides.length;
  const idx = ((index % total) + total) % total;
  const slide = slides[idx];
  const played = alreadyPlayed.has(slide.slug);
  const len = slide.content.length;

  // ukuran teks menyesuaikan panjang konten (pola milo: panjang → kecil)
  const textClass =
    len > 320 ? "text-sm md:text-lg" : len > 180 ? "text-base md:text-xl" : "text-lg md:text-2xl";

  return (
    <div
      className="deck-wrap no-pan relative select-none"
      style={{ width: "min(440px, 82vw)", perspective: 1000 }}
    >
      {/* tumpukan kartu di bawah (persis tangga milo) */}
      {STACK_LADDER.map((l, i) => (
        <div
          key={i}
          className="deck-under"
          style={{
            transform: `translateY(${l.y}px) scale(${l.scale})`,
            opacity: l.opacity,
            filter: l.blur ? `blur(${l.blur}px)` : undefined,
            zIndex: 20 + i * 10,
          }}
        />
      ))}

      {/* kartu utama — tinggi tetap, semua slide identik */}
      <div className="deck-card" style={{ zIndex: 100 }}>
        {/* pager mungil di kanan-atas */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            className="deck-btn"
            aria-label="Slide sebelumnya"
            onClick={() => {
              playClick();
              onNav(-1, true);
            }}
            disabled={idx === 0}
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
          </button>
          <span className="deck-text text-xs font-medium tracking-widest" style={{ color: "var(--muted)" }}>
            {idx + 1} / {total}
          </span>
          <button
            className="deck-btn"
            aria-label="Slide berikutnya"
            onClick={() => {
              playClick();
              onNav(1, true);
            }}
            disabled={idx === total - 1}
          >
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>

        <div key={slide.slug} className="flex-1 min-h-0 flex flex-col justify-center pt-7 overflow-hidden">
          <p className={`deck-text ${textClass} leading-relaxed font-medium`} style={{ color: "var(--ink)" }}>
            <Typewriter text={slide.content} active instant={played} />
          </p>
        </div>

        {slide.cta && (
          <div className="flex justify-start">
            <a
              href={slide.cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-pill deck-text"
              onClick={() => playClick()}
            >
              {slide.cta.label.replace(" ↗", "")}
              <ArrowUpRight size={14} strokeWidth={2.5} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
