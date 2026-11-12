"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LINKS, SITE, SLIDES, STICKERS } from "../content";
import { Deck } from "./Deck";
import { MusicPlayer } from "./MusicPlayer";
import { StickerBoard } from "./StickerBoard";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const NAV_COOLDOWN = 800; // ms — debounce scroll antar slide
const WHEEL_THRESHOLD = 30;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Kanvas utama: drag = pan, scroll = maju/mundur slide, pinch/ctrl+scroll = zoom.
// Kerangka interaksi sama dengan milo.gg, identitas visual berbeda.
export function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [played, setPlayed] = useState<Set<string>>(new Set());
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const panRef = useRef(pan);
  panRef.current = pan;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const idxRef = useRef(index);
  idxRef.current = index;
  const lastNav = useRef(0);
  const lastWheelPan = useRef(0);

  // ── navigasi slide ──
  // force=true (tombol/keyboard) → bypass cooldown scroll;
  // cooldown tetap dicatat agar wheel yang menyusul tidak loncat 2 slide.
  const nav = useCallback((dir: 1 | -1, force = false) => {
    const now = Date.now();
    if (!force && now - lastNav.current < NAV_COOLDOWN) return;
    lastNav.current = now;
    setIndex((i) => clamp(i + dir, 0, SLIDES.length - 1));
  }, []);

  // catat slide yang sudah pernah diketik (tidak mengetik ulang saat bolak-balik)
  useEffect(() => {
    const slug = SLIDES[idxRef.current]?.slug;
    if (slug) setPlayed((p) => (p.has(slug) ? p : new Set(p).add(slug)));
  }, [index]);

  // ── zoom di sekitar sebuah titik layar ──
  const zoomAt = useCallback((clientX: number, clientY: number, nextZoom: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 };
    const z0 = zoomRef.current;
    const pan0 = panRef.current;
    const w = { x: (p.x - pan0.x) / z0, y: (p.y - pan0.y) / z0 };
    setZoom(nextZoom);
    setPan({ x: p.x - w.x * nextZoom, y: p.y - w.y * nextZoom });
  }, []);

  // ── wheel: scroll = nav slide, ctrl/meta+scroll = zoom (listener native, non-passive) ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const z = clamp(zoomRef.current * Math.exp(-e.deltaY * 0.002), MIN_ZOOM, MAX_ZOOM);
        zoomAt(e.clientX, e.clientY, z);
        return;
      }
      // dua arah: deltaX (trackpad horizontal) → pan halus, deltaY → nav slide
      const now = Date.now();
      if (Math.abs(e.deltaY) > WHEEL_THRESHOLD) {
        if (now - lastNav.current < NAV_COOLDOWN) return;
        nav(e.deltaY > 0 ? 1 : -1);
      } else if (Math.abs(e.deltaX) > WHEEL_THRESHOLD) {
        if (now - lastWheelPan.current < NAV_COOLDOWN) return;
        lastWheelPan.current = now;
        setPan((p) => ({ ...p, x: clamp(p.x - e.deltaX, -900, 900) }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [nav, zoomAt]);

  // ── keyboard: panah untuk navigasi slide ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") nav(1);
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") nav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav]);

  // ── pointer: drag background = pan; 2 pointer = pinch zoom ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let panDrag: {
      id: number;
      x: number;
      y: number;
      panX: number;
      panY: number;
    } | null = null;
    let pinch: { d0: number; z0: number; mid: { x: number; y: number }; pan0: { x: number; y: number } } | null =
      null;

    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.hypot(a.x - b.x, a.y - b.y);

    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, .no-pan")) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const rect = el.getBoundingClientRect();
        pinch = {
          d0: dist(a, b),
          z0: zoomRef.current,
          mid: {
            x: (a.x + b.x) / 2 - rect.left - rect.width / 2,
            y: (a.y + b.y) / 2 - rect.top - rect.height / 2,
          },
          pan0: panRef.current,
        };
        panDrag = null;
      } else if (pointers.size === 1) {
        panDrag = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          panX: panRef.current.x,
          panY: panRef.current.y,
        };
        el.setPointerCapture(e.pointerId);
        el.classList.add("panning");
      }
    };

    const onMove = (e: PointerEvent) => {
      // abaikan gerakan hover (tanpa tombol ditekan) — cegah pan "hantu"
      if (e.buttons === 0) {
        pointers.delete(e.pointerId);
        return;
      }
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const z = clamp(pinch.z0 * (dist(a, b) / pinch.d0), MIN_ZOOM, MAX_ZOOM);
        const w = {
          x: (pinch.mid.x - pinch.pan0.x) / pinch.z0,
          y: (pinch.mid.y - pinch.pan0.y) / pinch.z0,
        };
        setZoom(z);
        setPan({ x: pinch.mid.x - w.x * z, y: pinch.mid.y - w.y * z });
        return;
      }
      if (panDrag && e.pointerId === panDrag.id && pointers.size === 1) {
        setPan({
          x: clamp(panDrag.panX + (e.clientX - panDrag.x), -900, 900),
          y: clamp(panDrag.panY + (e.clientY - panDrag.y), -700, 700),
        });
      }
    };

    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) {
        panDrag = null;
        el.classList.remove("panning");
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden overscroll-none touch-none select-none cursor-grab"
      style={{ background: "var(--bg)", color: "var(--ink)" }}
    >
      {/* DUNIA — semua yang di dalam sini ikut pan/zoom */}
      <div
        className="world-grid absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <StickerBoard stickers={STICKERS} zoom={zoom} />        <Deck slides={SLIDES} index={index} onNav={nav} alreadyPlayed={played} />
      </div>

      {/* HUD dihilangkan — semua link sudah tersedia sebagai sticker di board */}

      <MusicPlayer />
    </div>
  );
}
