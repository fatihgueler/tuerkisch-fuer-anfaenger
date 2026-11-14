"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Teeglas } from "@/components/teeglas";
import { Tulpe } from "@/components/iznik";
import { Button } from "@/components/ui/button";

const BLAETTER = Array.from({ length: 14 }, (_, i) => {
  const winkel = (i / 14) * Math.PI * 2;
  return { x: Math.cos(winkel) * (110 + (i % 3) * 30), y: Math.sin(winkel) * (110 + (i % 3) * 30), r: (i * 47) % 360, farbe: i % 3 };
});

export function Feier({ offen, onSchliessen, titel, text }: { offen: boolean; onSchliessen: () => void; titel: string; text: string }) {
  const reduziert = useReducedMotion();
  return (
    <AnimatePresence>
      {offen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feier-titel"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onSchliessen}
        >
          <motion.div
            className="relative w-full max-w-sm rounded-3xl bg-card p-7 text-center shadow-2xl"
            initial={{ scale: reduziert ? 1 : 0.85, y: reduziert ? 0 : 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {!reduziert && (
              <div className="pointer-events-none absolute top-16 left-1/2" aria-hidden="true">
                {BLAETTER.map((b, i) => (
                  <motion.span
                    key={i}
                    className="absolute block size-3 rounded-[60%_10%]"
                    style={{ background: ["var(--accent)", "var(--safran)", "var(--primary)"][b.farbe] }}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
                    animate={{ x: b.x, y: b.y, opacity: 0, rotate: b.r, scale: 1.2 }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
                  />
                ))}
              </div>
            )}
            <div className="mx-auto mb-3 flex items-end justify-center gap-1">
              <Tulpe className="h-10 w-8 -rotate-12" />
              <Teeglas fuellung={1} className="h-28 w-16" />
              <Tulpe className="h-10 w-8 rotate-12" />
            </div>
            <h2 id="feier-titel" className="text-3xl font-semibold">
              {titel}
            </h2>
            <p className="mt-2 text-lg">{text}</p>
            <Button size="lg" className="mt-6 w-full" onClick={onSchliessen} autoFocus>
              Teşekkürler!
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
