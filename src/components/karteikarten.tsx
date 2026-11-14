"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Vokabel } from "@/content/schema";
import type { Ergebnis } from "@/lib/check";
import { sprich } from "@/lib/speech";
import { useFortschritt } from "@/store/fortschritt";
import { AudioPaar } from "@/components/audio";
import { Button } from "@/components/ui/button";

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
    karteBewerten(v.id, e);
    setOffen(false);
    const n = index + 1;
    setIndex(n);
    onWeiter?.(n);
    if (n >= gueltig.length) onFertig();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Karte {index + 1} von {gueltig.length} · {trZuerst ? "Türkisch → Deutsch" : "Deutsch → Türkisch"}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={v.id + index}
          initial={{ opacity: 0, rotateY: -8, y: 8 }}
          animate={{ opacity: 1, rotateY: 0, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="defter-linien relative min-h-60 rounded-2xl bg-card p-6 shadow-[0_1px_0_var(--border),0_10px_24px_-14px_rgba(42,34,51,.35)] ring-1 ring-border"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            {trZuerst ? (
              <>
                <p lang="tr" className="font-serif text-4xl font-medium text-balance">
                  {v.tr}
                </p>
                <AudioPaar text={v.tr} />
              </>
            ) : (
              <p className="text-2xl font-medium text-balance">{v.de}</p>
            )}
            {offen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 w-full border-t-2 border-dashed border-border pt-4">
                {trZuerst ? (
                  <p className="text-2xl font-medium">{v.de}</p>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <p lang="tr" className="font-serif text-4xl font-medium">
                      {v.tr}
                    </p>
                    <AudioPaar text={v.tr} />
                  </div>
                )}
                <p lang="tr" className="mt-3 font-serif text-lg">
                  {v.beispiel.tr}
                </p>
                <p className="text-muted-foreground">{v.beispiel.de}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      {!offen ? (
        <Button
          size="lg"
          onClick={() => {
            setOffen(true);
            if (!trZuerst) sprich(v.tr);
          }}
        >
          Aufdecken
        </Button>
      ) : (
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Wie gut wusstest du es?">
          <Button variant="outline" className="border-accent/60" onClick={() => bewerten("falsch")}>
            Nicht gewusst
          </Button>
          <Button variant="outline" className="border-safran" onClick={() => bewerten("fast")}>
            Fast
          </Button>
          <Button onClick={() => bewerten("richtig")}>Gewusst</Button>
        </div>
      )}
    </div>
  );
}
