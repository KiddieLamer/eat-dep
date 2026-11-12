"use client";

import { useEffect, useRef, useState } from "react";
import { TRACKS } from "../content";

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: Record<string, unknown>
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (id: string) => void;
  destroy: () => void;
}

// Music player ala sticker "airpod" milo.gg: klik headset = play lagu random
// Novo Amor (YouTube embed, IFrame API resmi), klik lagi = pause. Tanpa backend.
// Catatan: seluruh logika di dalam effect mount-sekali — state via ref agar
// cleanup tidak pernah menghancurkan player saat status berubah.
export function MusicPlayer() {
  const divRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const pickRandom = () => TRACKS[Math.floor(Math.random() * TRACKS.length)];

    const ensureApi = () =>
      new Promise<void>((resolve) => {
        if (window.YT?.Player) return resolve();
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve();
        };
        if (!document.querySelector('script[src*="iframe_api"]')) {
          const s = document.createElement("script");
          s.src = "https://www.youtube.com/iframe_api";
          document.head.appendChild(s);
        }
      });

    const onToggle = () => {
      const p = playerRef.current;
      if (p && !cancelled) {
        // toggle pause/play lagu yang sama
        if (playingRef.current) p.pauseVideo();
        else p.playVideo();
        return;
      }
      if (cancelled) return;
      // pertama kali: pilih lagu random, buat player, autoplay
      const track = pickRandom();
      setTitle(track.title);
      ensureApi().then(() => {
        if (cancelled || !divRef.current) return;
        playerRef.current = new window.YT!.Player(divRef.current, {
          videoId: track.id,
          playerVars: { autoplay: 1, controls: 0 },
          events: {
            onReady: (e: { target: YTPlayer }) => e.target.playVideo(),
            onStateChange: (e: { data: number }) => {
              playingRef.current = e.data === 1; // 1 = PLAYING
              setPlaying(e.data === 1);
            },
            onError: () => {
              // video tak bisa di-embed → coba lagu lain
              const others = TRACKS.filter((t) => t.title !== title);
              const next = others[Math.floor(Math.random() * others.length)];
              setTitle(next.title);
              playerRef.current?.loadVideoById(next.id);
            },
          },
        });
      });
    };

    window.addEventListener("eatro:music-toggle", onToggle);
    return () => {
      cancelled = true;
      window.removeEventListener("eatro:music-toggle", onToggle);
      try {
        playerRef.current?.destroy();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* player tersembunyi — audio only, tidak terlihat */}
      <div
        ref={divRef}
        aria-hidden
        style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", left: -10, top: -10 }}
      />
      {/* chip "now playing" ala papan milo */}
      {playing && (
        <div className="now-playing">
          🎧 Novo Amor — {title} &nbsp;·&nbsp; klik headset untuk pause
        </div>
      )}
    </>
  );
}
