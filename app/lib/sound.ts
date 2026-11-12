// Sound design ala milo.gg: 2 sample klik yang di-preload lewat Web Audio API,
// diputar random (variasi) pada setiap interaksi. AudioContext baru boleh
// dibuat/resume setelah gesture user pertama — playClick() memastikannya.

let ctx: AudioContext | null = null;
let buffers: AudioBuffer[] = [];

function ensureAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      // preload + decode kedua sample
      Promise.all(
        ["/sounds/click1.m4a", "/sounds/click2.m4a"].map((p) =>
          fetch(p)
            .then((r) => r.arrayBuffer())
            .then((a) => ctx!.decodeAudioData(a))
        )
      )
        .then((bs) => {
          buffers = bs;
          if (typeof window !== "undefined") {
            (window as unknown as { __soundDebug?: unknown }).__soundDebug = {
              state: ctx?.state,
              buffers: buffers.length,
            };
          }
        })
        .catch(() => {
          // sound gagal dimuat → situs tetap jalan tanpa suara
        });
    } catch {
      return;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function playClick(volume = 0.25) {
  try {
    ensureAudio();
    if (!ctx || !buffers.length) return;
    const src = ctx.createBufferSource();
    src.buffer = buffers[Math.floor(Math.random() * buffers.length)];
    const gain = ctx.createGain();
    gain.gain.value = volume;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    (window as unknown as { __soundDebug?: unknown }).__soundDebug = {
      state: ctx.state,
      buffers: buffers.length,
    };
  } catch {
    // jangan pernah biarkan suara merusak interaksi
  }
}

// ── Audio dialog (mis. quote Lotso): satu elemen, quote baru memotong sebelumnya ──
let quoteAudio: HTMLAudioElement | null = null;

export function playQuote(src: string) {
  try {
    if (quoteAudio) {
      quoteAudio.pause();
      quoteAudio.currentTime = 0;
    }
    quoteAudio = new Audio(src);
    quoteAudio.volume = 0.9;
    void quoteAudio.play();
    (window as unknown as { __lotsoDebug?: unknown }).__lotsoDebug = {
      src,
      playing: true,
    };
  } catch {
    // tanpa gesture/audio support → diam
  }
}
