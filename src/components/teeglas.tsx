"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

/** Tulpenförmiges Teeglas (ince belli bardak), füllt sich mit dem Tagesfortschritt. */
export function Teeglas({ fuellung, className, label }: { fuellung: number; className?: string; label?: string }) {
  const id = useId().replace(/:/g, "");
  const reduziert = useReducedMotion();
  const f = Math.max(0, Math.min(1, fuellung));
  // Glas-Innenraum: y von 14 (oben) bis 86 (unten)
  const oben = 86 - 72 * f;
  return (
    <svg
      viewBox="0 0 64 110"
      role="img"
      aria-label={label ?? `Teeglas zu ${Math.round(f * 100)} % gefüllt`}
      className={cn("h-24 w-14", className)}
    >
      <defs>
        <clipPath id={`glas-${id}`}>
          <path d="M14 12 C12 30 22 42 22 52 C22 62 10 70 12 86 L52 86 C54 70 42 62 42 52 C42 42 52 30 50 12 Z" />
        </clipPath>
        <linearGradient id={`tee-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--tee)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--tee)" />
        </linearGradient>
      </defs>
      {/* Tee */}
      <g clipPath={`url(#glas-${id})`}>
        <motion.rect
          x="0"
          width="64"
          height="100"
          fill={`url(#tee-${id})`}
          initial={false}
          animate={{ y: oben }}
          transition={reduziert ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 16 }}
        />
        {f > 0 && <motion.ellipse cx="32" rx="22" ry="2" fill="#fff" opacity="0.25" initial={false} animate={{ cy: oben + 1 }} />}
      </g>
      {/* Glas */}
      <path
        d="M14 12 C12 30 22 42 22 52 C22 62 10 70 12 86 L52 86 C54 70 42 62 42 52 C42 42 52 30 50 12 Z"
        fill="none"
        stroke="var(--glas)"
        strokeWidth="2"
      />
      <path d="M18 18 C17 30 24 40 25 48" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      {/* Untertasse */}
      <ellipse cx="32" cy="92" rx="28" ry="6" fill="var(--primary)" />
      <ellipse cx="32" cy="90" rx="20" ry="3" fill="var(--background)" opacity="0.35" />
      <circle cx="10" cy="92" r="1.6" fill="var(--safran)" />
      <circle cx="54" cy="92" r="1.6" fill="var(--safran)" />
      <circle cx="32" cy="97" r="1.6" fill="var(--accent)" />
      {/* Teelöffel */}
      <path d="M44 6 L36 74" stroke="var(--glas)" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
