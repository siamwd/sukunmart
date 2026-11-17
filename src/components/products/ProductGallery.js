"use client";
import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, name }) {
  const [i, setI] = useState(0);
  if (!images.length) {
    return <div className="flex aspect-square items-center justify-center rounded-card bg-surface p-6 text-center text-muted">{name}<br />ছবি এখনো যোগ করা হয়নি</div>;
  }
  const cur = images[i];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card bg-surface">
        <Image src={cur.path} alt={cur.alt || name} fill priority={i === 0} sizes="(max-width:768px) 100vw, 560px" className="object-cover" />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="ছবির তালিকা">
          {images.map((im, idx) => (
            <li key={im.path} className="shrink-0">
              <button type="button" onClick={() => setI(idx)} aria-label={`ছবি ${idx + 1}`} aria-current={idx === i}
                className={`relative block h-16 w-16 overflow-hidden rounded-btn border-2 ${idx === i ? "border-brand" : "border-transparent"}`}>
                <Image src={im.path} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
