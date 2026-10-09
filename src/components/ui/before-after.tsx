"use client";

import { useRef, useState } from "react";
import { ArrowLeftRight } from "lucide-react";

type Photo = { src: string; date: string };
type BeforeAfterProps = { before: Photo; after: Photo };

const KEY_STEP = 5;
const clamp = (n: number) => Math.min(100, Math.max(0, n));

// Antes/depois: arraste com pointer events; ← → no teclado.
export function BeforeAfter({ before, after }: BeforeAfterProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);

  const moveTo = (clientX: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (box) setSplit(clamp(((clientX - box.left) / box.width) * 100));
  };

  return (
    <div
      ref={boxRef}
      className="relative aspect-[4/5] touch-none overflow-hidden rounded-[24px] bg-surface select-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => e.buttons > 0 && moveTo(e.clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- URLs assinadas e temporárias do Storage */}
      <img src={after.src} alt={`Sua foto de ${after.date}`} className="absolute inset-0 size-full -scale-x-100 object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- idem */}
        <img src={before.src} alt={`Sua foto de ${before.date}`} className="absolute inset-0 size-full -scale-x-100 object-cover" draggable={false} />
      </div>
      <span className="absolute top-3 left-3 rounded-pill bg-white px-3 py-1 text-xs font-bold text-[#2A1B14]">{before.date}</span>
      <span className="absolute top-3 right-3 rounded-pill bg-white px-3 py-1 text-xs font-bold text-[#2A1B14]">{after.date}</span>
      <div className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white" style={{ left: `${split}%` }} aria-hidden />
      <div
        role="slider" tabIndex={0} aria-label="Comparar antes e depois" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(split)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setSplit((s) => clamp(s - KEY_STEP));
          if (e.key === "ArrowRight") setSplit((s) => clamp(s + KEY_STEP));
        }}
        className="absolute top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill bg-white text-[#2A1B14] shadow-card"
        style={{ left: `${split}%` }}
      >
        <ArrowLeftRight className="size-5" strokeWidth={2} aria-hidden />
      </div>
    </div>
  );
}
