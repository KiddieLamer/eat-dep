"use client";

import { useEffect, useState } from "react";

// Efek ketik ala terminal — teks slide muncul per karakter saat slide aktif.
// instant=true → langsung tampil penuh (dipakai untuk slide yang sudah pernah dilihat).
export function Typewriter({
  text,
  active,
  instant = false,
}: {
  text: string;
  active: boolean;
  instant?: boolean;
}) {
  const [n, setN] = useState(instant ? text.length : 0);

  useEffect(() => {
    if (instant) {
      setN(text.length);
      return;
    }
    if (!active) {
      setN(0);
      return;
    }
    setN(0);
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < text.length) t = setTimeout(tick, 9 + Math.random() * 14);
    };
    t = setTimeout(tick, 250);
    return () => clearTimeout(t);
  }, [text, active, instant]);

  const done = n >= text.length;
  return (
    <span className="tw-pre">
      {text.slice(0, n)}
      {!done && <span className="tw-cursor">▌</span>}
    </span>
  );
}
