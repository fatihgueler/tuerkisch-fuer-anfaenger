"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Timer } from "lucide-react";
import type { Vokabel } from "@/content/schema";
import type { WocheKurz } from "@/content";
import { heuteISO, positionFuer } from "@/lib/datum";
import { AUFWAERM_LIMIT, faelligeIds } from "@/lib/leitner";
import { useFortschritt, useGeladen } from "@/store/fortschritt";
import { SeitenKopf, Seite } from "@/components/seiten-kopf";
import { Karteikarten } from "@/components/karteikarten";
import { AudioPaar, StimmeHinweis } from "@/components/audio";
import { Nachsprechen } from "@/components/nachsprechen";
import { Feier } from "@/components/feier";
import { mischen } from "@/components/uebungen";
import { Button } from "@/components/ui/button";

export function Wiederholen({ vokabeln, wochen, kurz }: { vokabeln: Record<string, Vokabel>; wochen: WocheKurz[]; kurz: boolean }) {
  const geladen = useGeladen();
  const tagAktiv = useFortschritt((s) => s.tagAktiv);
  const anzahlKarten = useFortschritt((s) => Object.keys(s.karten).filter((id) => vokabeln[id]).length);
  const [ids, setIds] = useState<string[] | null>(null);
  const [phase, setPhase] = useState<"karten" | "satz" | "fertig">("karten");
  const [feier, setFeier] = useState(false);

  useEffect(() => {
    if (!geladen || ids) return;
    const s = useFortschritt.getState();
    let liste = faelligeIds(s.karten, heuteISO(), s.fehlerkiste, kurz ? AUFWAERM_LIMIT : Infinity, (id) => !!vokabeln[id]);
    if (kurz && liste.length === 0) liste = mischen(Object.keys(s.karten).filter((id) => vokabeln[id])).slice(0, 8);
    setIds(liste);
  }, [geladen, ids, kurz, vokabeln]);

  const heute = heuteISO();
  const pos = positionFuer(heute);
  const w = wochen.find((x) => x.woche === pos.woche);
  const alltagssatz = (w?.lektionen.find((l) => l.tag === pos.tag) ?? w?.lektionen.at(-1))?.alltagssatz;

  return (
    <>
      <SeitenKopf titel={kurz ? "Kurzer Tag" : "Wiederholen"} unter={kurz ? "10 Minuten zählen auch" : "Karteikasten"} />
      <Seite>
        <div className="mt-4 flex flex-col gap-4">
          {!geladen || !ids ? (
            <div className="h-60" aria-busy="true" />
          ) : phase === "karten" ? (
            <>
              {kurz && (
                <p className="flex items-center gap-2 rounded-xl bg-secondary p-3 text-secondary-foreground">
                  <Timer className="size-5 shrink-0" aria-hidden="true" />
                  Fällige Karten + Alltagssatz – dann ist der Tag geschafft und deine Serie läuft weiter.
                </p>
              )}
              <StimmeHinweis />
              {ids.length === 0 && anzahlKarten === 0 ? (
                <div className="rounded-2xl bg-card p-6 text-center ring-1 ring-border">
                  <p className="mb-4 text-lg">Noch keine Karten im Kasten. Sie kommen mit jeder Lektion dazu.</p>
                  <Link href="/" className="inline-flex min-h-12 items-center rounded-xl bg-primary px-5 font-medium text-primary-foreground">
                    Zur heutigen Lektion
                  </Link>
                </div>
              ) : ids.length === 0 ? (
                <div className="rounded-2xl bg-card p-6 text-center ring-1 ring-border">
                  <p className="mb-1 font-serif text-2xl">Her şey tamam!</p>
                  <p className="mb-4 text-muted-foreground">Heute ist nichts fällig. Alles frisch.</p>
                  <Button variant="outline" onClick={() => setIds(mischen(Object.keys(useFortschritt.getState().karten).filter((id) => vokabeln[id])).slice(0, 10))}>
                    Trotzdem 10 Karten üben
                  </Button>
                </div>
              ) : (
                <Karteikarten ids={ids} vokabeln={vokabeln} onFertig={() => setPhase(kurz ? "satz" : "fertig")} />
              )}
            </>
          ) : phase === "satz" && alltagssatz ? (
            <section className="flex flex-col gap-4">
              <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
                <p className="text-sm font-semibold tracking-wide uppercase opacity-90">Alltagssatz des Tages</p>
                <p lang="tr" className="mt-1 font-serif text-3xl">
                  {alltagssatz.tr}
                </p>
                <p className="text-lg">{alltagssatz.de}</p>
                <p className="mt-2 text-[0.95rem] opacity-90">Wann: {alltagssatz.wann}</p>
              </div>
              <AudioPaar text={alltagssatz.tr} />
              <Nachsprechen ziel={alltagssatz.tr} />
              <Button
                size="lg"
                variant="akzent"
                onClick={() => {
                  tagAktiv("kurz");
                  setPhase("fertig");
                  setFeier(true);
                }}
              >
                <Check aria-hidden="true" /> Kurzen Tag abschließen
              </Button>
            </section>
          ) : (
            <div className="rounded-2xl bg-card p-6 text-center ring-1 ring-border">
              <p className="mb-1 font-serif text-2xl">Aferin!</p>
              <p className="mb-4 text-muted-foreground">{kurz ? "Kurzer Tag geschafft – deine Serie läuft weiter." : "Alle fälligen Karten wiederholt."}</p>
              {kurz && phase === "fertig" && !alltagssatz && (
                <Button className="mb-3" onClick={() => tagAktiv("kurz")}>
                  Kurzen Tag abschließen
                </Button>
              )}
              <Link href="/" className="inline-flex min-h-12 items-center rounded-xl bg-primary px-5 font-medium text-primary-foreground">
                Zur Startseite
              </Link>
            </div>
          )}
        </div>
      </Seite>
      <Feier offen={feier} onSchliessen={() => setFeier(false)} titel="Aferin, Sherin!" text="10 Minuten, die zählen. Deine Serie läuft weiter." />
    </>
  );
}
