"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { Vokabel } from "@/content/schema";
import type { Ergebnis } from "@/lib/check";
import { sprich } from "@/lib/speech";
import { useFortschritt } from "@/store/fortschritt";
import { AudioPaar } from "@/components/audio";
import { Button } from "@/components/ui/button";
import { fuehlen } from "@/lib/haptik";
import { cn } from "@/lib/utils";

/** Selbstbewertete Leitner-Karten. Gerade Indizes TR→DE, ungerade DE→TR. */
export function Karteikarten({
  ids,
  vokabeln,
  start = 0,
  onWeiter,
  onFertig,
}: {
  ids: string[];
  vokabeln: Record<string, Vokabel>;
  start?: number;
  onWeiter?: (index: number) => void;
  onFertig: () => void;
}) {
  const karteBewerten = useFortschritt((s) => s.karteBewerten);
  const [index, setIndex] = useState(Math.min(start, ids.length));
  const [offen, setOffen] = useState(false);
  const [richtung, setRichtung] = useState(0);
  const reduziert = useReducedMotion();
  const x = useMotionValue(0);
  const drehung = useTransform(x, [-200, 200], [-10, 10]);
  const gewusstSicht = useTransform(x, [20, 110], [0, 1]);
  const nochmalSicht = useTransform(x, [-110, -20], [1, 0]);
  const gueltig = ids.filter((id) => vokabeln[id]);
  const v = vokabeln[gueltig[index]];

  if (!v) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center ring-1 ring-border">
        <p className="mb-4 text-lg">{gueltig.length ? "Alle Karten geschafft!" : "Heute ist nichts fällig."}</p>
        <Button size="lg" className="w-full" onClick={onFertig}>
          Weiter
        </Button>
      </div>
    );
  }

  const trZuerst = index % 2 === 0;

  function bewerten(e: Ergebnis) {
    fuehlen(e === "falsch" ? "falsch" : "richtig");
    setRichtung(e === "richtig" ? 1 : e === "falsch" ? -1 : 0);
    karteBewerten(v.id, e);
    setOffen(false);
    const n = index + 1;
    setIndex(n);
    onWeiter?.(n);
    if (n >= gueltig.length) onFertig();
  }

  function aufdecken() {
    if (offen) return;
    fuehlen("tipp");
    setOffen(true);
    if (!trZuerst) sprich(v.tr);
  }

  const frage = trZuerst ? (
    <>
      <p lang="tr" className="font-serif text-4xl font-medium text-balance">
        {v.tr}
      </p>
      <Stopp>
        <AudioPaar text={v.tr} />
      </Stopp>
    </>
  ) : (
    <p className="text-2xl font-medium text-balance">{v.de}</p>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground" aria-live="polite">
        <span>
          Karte {index + 1} von {gueltig.length}
        </span>
        <span>{trZuerst ? "Türkisch → Deutsch" : "Deutsch → Türkisch"}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
        <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${(index / gueltig.length) * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 26 }} />
      </div>
      <div className="relative [perspective:1200px]">
        <AnimatePresence mode="wait" custom={richtung} initial={false} onExitComplete={() => x.set(0)}>
          <motion.div
            key={v.id + index}
            custom={richtung}
            variants={{
              rein: { opacity: 0, y: reduziert ? 0 : 24, scale: reduziert ? 1 : 0.96 },
              da: { opacity: 1, y: 0, scale: 1 },
              raus: (r: number) =>
                reduziert
                  ? { opacity: 0, transition: { duration: 0.1 } }
                  : { opacity: 0, x: r * 320, rotate: r * 12, y: r === 0 ? -40 : 0, transition: { duration: 0.22, ease: "easeIn" } },
            }}
            initial="rein"
            animate="da"
            exit="raus"
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            drag={offen ? "x" : false}
            dragSnapToOrigin
            dragElastic={0.6}
            style={{ x, rotate: drehung }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 110) bewerten("richtig");
              else if (info.offset.x < -110) bewerten("falsch");
            }}
            className="relative touch-pan-y"
          >
            <motion.div
              role={offen ? undefined : "button"}
              tabIndex={offen ? -1 : 0}
              aria-label={offen ? undefined : "Karte umdrehen"}
              onClick={aufdecken}
              onKeyDown={(e) => {
                if (!offen && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  aufdecken();
                }
              }}
              animate={{ rotateY: offen ? 180 : 0 }}
              transition={reduziert ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
              className={cn("grid [transform-style:preserve-3d]", !offen && "cursor-pointer")}
            >
              {/* Vorderseite */}
              <div className={cn(flaeche, "[backface-visibility:hidden]")}>
                <div className="my-auto flex flex-col items-center gap-3 pt-6 text-center">{frage}</div>
                <p className="pt-4 text-center text-sm text-muted-foreground">Tippen zum Umdrehen</p>
              </div>
              {/* Rückseite */}
              <div className={cn(flaeche, "[backface-visibility:hidden] [transform:rotateY(180deg)]")} aria-hidden={!offen}>
                <motion.div style={{ opacity: gewusstSicht }} className="pointer-events-none absolute top-4 left-4 -rotate-12 rounded-lg border-2 border-primary px-2 py-0.5 text-sm font-bold text-primary uppercase">
                  Gewusst
                </motion.div>
                <motion.div style={{ opacity: nochmalSicht }} className="pointer-events-none absolute top-4 right-4 rotate-12 rounded-lg border-2 border-accent px-2 py-0.5 text-sm font-bold text-accent uppercase">
                  Nochmal
                </motion.div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <p className="text-sm text-muted-foreground">{trZuerst ? v.tr : v.de}</p>
                  {trZuerst ? (
                    <p className="text-3xl font-medium text-balance">{v.de}</p>
                  ) : (
                    <>
                      <p lang="tr" className="font-serif text-4xl font-medium text-balance">
                        {v.tr}
                      </p>
                      <Stopp>
                        <AudioPaar text={v.tr} />
                      </Stopp>
                    </>
                  )}
                  <div className="mt-3 w-full border-t-2 border-dashed border-border pt-3">
                    <p lang="tr" className="font-serif text-lg">
                      {v.beispiel.tr}
                    </p>
                    <p className="text-muted-foreground">{v.beispiel.de}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      {!offen ? (
        <Button size="lg" onClick={aufdecken}>
          Aufdecken
        </Button>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Wie gut wusstest du es?">
            <Button variant="outline" className="border-accent/60" onClick={() => bewerten("falsch")}>
              Nicht gewusst
            </Button>
            <Button variant="outline" className="border-safran" onClick={() => bewerten("fast")}>
              Fast
            </Button>
            <Button onClick={() => bewerten("richtig")}>Gewusst</Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">Oder wischen: rechts = gewusst · links = nochmal</p>
        </>
      )}
    </div>
  );
}

const flaeche =
  "defter-linien relative col-start-1 row-start-1 flex min-h-64 flex-col rounded-2xl bg-card p-6 shadow-[0_1px_0_var(--border),0_10px_24px_-14px_rgba(42,34,51,.35)] ring-1 ring-border";

/** Klicks auf Audio-Knöpfe sollen die Karte nicht umdrehen. */
function Stopp({ children }: { children: React.ReactNode }) {
  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} onPointerDownCapture={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}
