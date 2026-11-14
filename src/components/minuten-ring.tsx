"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/** Sanfter 5-Minuten-Ring: zeigt die Zeit, zwingt zu nichts. */
export function MinutenRing({ minuten = 5 }: { minuten?: number }) {
  const gesamt = minuten * 60;
  const [vergangen, setVergangen] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => setVergangen(Math.min(gesamt, Math.floor((Date.now() - start) / 1000))), 1000);
    return () => clearInterval(t);
  }, [gesamt]);
  const rest = gesamt - vergangen;
  const anteil = vergangen / gesamt;
  const r = 20;
  const u = 2 * Math.PI * r;
  const fertig = rest === 0;
  return (
    <div className="flex items-center gap-3" role="timer" aria-label={fertig ? "5 Minuten geschafft" : `Noch ${Math.ceil(rest / 60)} Minuten`}>
      <svg viewBox="0 0 48 48" className="size-12 -rotate-90" aria-hidden="true">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={fertig ? "var(--primary)" : "var(--safran)"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={u}
          animate={{ strokeDashoffset: u * (1 - anteil) }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </svg>
      <p className="text-sm leading-tight">
        {fertig ? (
          <span className="font-semibold text-primary">5 Minuten geschafft – du darfst aufhören!</span>
        ) : (
          <>
            <span className="font-serif text-xl font-semibold tabular-nums">
              {Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}
            </span>
            <span className="block text-muted-foreground">Nur 5 Minuten. Jede zählt.</span>
          </>
        )}
      </p>
    </div>
  );
}
