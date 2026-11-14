"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Circle, CircleDot } from "lucide-react";
import type { WocheKurz } from "@/content";
import { stationFuer } from "@/content/lehrplan";
import { datumFuer, datumLesbar, heuteISO, LETZTE_WOCHE, positionFuer, TAG_KURZ } from "@/lib/datum";
import { useFortschritt, useGeladen } from "@/store/fortschritt";
import { SeitenKopf, Seite } from "@/components/seiten-kopf";
import { Muehur } from "@/components/muehur";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WochenAnsicht({ wochen }: { wochen: WocheKurz[] }) {
  const geladen = useGeladen();
  const s = useFortschritt();
  const [heute, setHeute] = useState<string | null>(null);
  const [woche, setWoche] = useState<number | null>(null);
  useEffect(() => {
    const h = heuteISO();
    setHeute(h);
    setWoche(positionFuer(h).woche);
  }, []);

  if (!geladen || heute === null || woche === null) return <SeitenKopf titel="Diese Woche" />;

  const station = stationFuer(woche);
  const daten = wochen.find((w) => w.woche === woche);
  const tage = woche === 0 ? [6, 7] : [1, 2, 3, 4, 5, 6, 7];
  const ergebnis = s.sonntag[woche];

  return (
    <>
      <SeitenKopf titel={woche === 0 ? "Woche 0" : `Woche ${woche}`} unter={station?.thema} />
      <Seite>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="outline" size="icon" aria-label="Vorherige Woche" disabled={woche === 0} onClick={() => setWoche(woche - 1)}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {datumLesbar(datumFuer(woche, tage[0]), false)} – {datumLesbar(datumFuer(woche, 7), false)}
          </p>
          <Button variant="outline" size="icon" aria-label="Nächste Woche" disabled={woche === LETZTE_WOCHE} onClick={() => setWoche(woche + 1)}>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
        {station && (
          <p className="mt-3 rounded-xl bg-secondary p-3 text-secondary-foreground">
            <span className="font-semibold">Kann-Ziel:</span> {station.kannZiel}
          </p>
        )}
        <ol className="mt-4 space-y-2.5">
          {tage.map((t) => {
            const datum = datumFuer(woche, t);
            const istHeute = datum === heute;
            const vorbei = datum < heute;
            const l = t < 7 ? daten?.lektionen.find((x) => x.tag === t) : undefined;
            const sonntag = t === 7;
            const fertig = sonntag ? !!ergebnis : !!(l && s.lektionen[`${woche}-${t}`]?.fertigAm);
            const begonnen = !sonntag && !!(l && s.lektionen[`${woche}-${t}`]?.erledigt.length);
            const vorhanden = sonntag ? !!daten : !!l;
            const href = sonntag ? `/sonntag/${woche}` : `/lektion/${woche}/${t}`;
            const status = fertig ? "erledigt" : istHeute ? "heute" : vorbei && vorhanden ? "nachholen" : begonnen ? "begonnen" : vorhanden ? "offen" : "folgt";
            const inhalt = (
              <>
                <span
                  className={cn(
                    "flex size-12 shrink-0 flex-col items-center justify-center rounded-xl text-sm font-semibold",
                    fertig ? "bg-primary text-primary-foreground" : istHeute ? "bg-safran text-[#2a2233]" : "bg-muted"
                  )}
                >
                  {TAG_KURZ[t]}
                  <span className="text-[0.7rem] font-normal">{Number(datum.slice(8))}.</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{sonntag ? "Sonntagstest" : (l?.titel ?? "Inhalte folgen")}</span>
                  <span className={cn("text-sm", status === "nachholen" ? "text-accent" : "text-muted-foreground")}>
                    {status === "erledigt" && (sonntag && ergebnis ? `Geschafft · ${ergebnis.prozent} %` : "Geschafft")}
                    {status === "heute" && "Heute"}
                    {status === "nachholen" && "Nachholen"}
                    {status === "begonnen" && "Angefangen"}
                    {status === "offen" && (t === 6 ? "Festigungstag" : "Offen")}
                    {status === "folgt" && "Kommt bald"}
                  </span>
                </span>
                {fertig ? (
                  sonntag && ergebnis && ergebnis.prozent >= 80 ? (
                    <Muehur woche={woche} className="size-11 -rotate-12" />
                  ) : (
                    <Check className="size-6 text-primary" aria-label="erledigt" />
                  )
                ) : istHeute ? (
                  <CircleDot className="size-6 text-safran-ink" aria-hidden="true" />
                ) : (
                  <Circle className="size-6 text-border" aria-hidden="true" />
                )}
              </>
            );
            const klasse = cn(
              "flex min-h-16 items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border",
              istHeute && "ring-2 ring-safran",
              vorhanden && "transition-colors hover:bg-muted"
            );
            return (
              <li key={t}>
                {vorhanden ? (
                  <Link href={href} className={klasse}>
                    {inhalt}
                  </Link>
                ) : (
                  <div className={cn(klasse, "opacity-70")}>{inhalt}</div>
                )}
              </li>
            );
          })}
        </ol>
      </Seite>
    </>
  );
}
