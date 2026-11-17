"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

/** Rounded image card that fades through the hero images every few seconds. */
export default function HeroSlider({ images, interval = 5, label }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = images.length;
  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), Math.max(2, Number(interval) || 5) * 1000);
    return () => clearInterval(t);
  }, [n, paused, interval]);

  if (n === 0) {
    return (
      <div className="relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-[28px] text-4xl font-bold text-white md:ml-auto"
        style={{ backgroundImage: "linear-gradient(135deg, var(--brand), var(--brand-dark))" }} aria-hidden>{label}</div>
    );
  }
  return (
    <div className="relative w-full max-w-md md:ml-auto" role="group" aria-roledescription="carousel" aria-label="হিরো ছবি"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="relative aspect-square overflow-hidden rounded-[28px] bg-brand-soft shadow-2xl ring-1 ring-black/5">
        {images.map((im, idx) => (
          <Image key={im.src} src={im.src} alt={im.alt || ""} fill priority={idx === 0} sizes="(max-width:768px) 90vw, 448px"
            className={`object-cover transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`} aria-hidden={idx !== i} />
        ))}
      </div>
      {n > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map((im, idx) => (
            <button key={im.src} type="button" onClick={() => setI(idx)} aria-label={`ছবি ${idx + 1}`} aria-current={idx === i}
              className={`h-2.5 rounded-full transition-all ${idx === i ? "w-7 bg-brand" : "w-2.5 bg-brand/30 hover:bg-brand/60"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
