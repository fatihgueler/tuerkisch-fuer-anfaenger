"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { lehrplan, PHASEN } from "@/content/lehrplan";
import { datumFuer, datumLesbar, heuteISO, positionFuer } from "@/lib/datum";
import { useFortschritt, useGeladen } from "@/store/fortschritt";
import { SeitenKopf, Seite } from "@/components/seiten-kopf";
import { Muehur } from "@/components/muehur";
import { cn } from "@/lib/utils";

export function PlanReise({ vorhanden }: { vorhanden: number[] }) {
  const geladen = useGeladen();
  const sonntag = useFortschritt((s) => s.sonntag);
  const reduziert = useReducedMotion();
  const [aktuell, setAktuell] = useState<number | null>(null);
  useEffect(() => setAktuell(positionFuer(heuteISO()).woche), []);
  const stempel = (w: number) => geladen && (sonntag[w]?.prozent ?? 0) >= 80;
  const anzahl = lehrplan.filter((s) => stempel(s.woche)).length;

  return (
    <>
      <SeitenKopf titel="Deine Reise" unter="26 Stationen bis Mai 2027" />
      <Seite>
        <section aria-labelledby="stempel-titel" className="mt-5 rounded-2xl bg-card p-4 ring-1 ring-border">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="stempel-titel" className="text-xl font-semibold">
              Stempelheft
            </h2>
            <p className="text-sm text-muted-foreground">
              {anzahl} von {lehrplan.length}
            </p>
          </div>
          <ul className="grid grid-cols-6 gap-1.5 sm:grid-cols-9" aria-label="Wochen-Stempel">
            {lehrplan.map((s) => (
              <li key={s.woche} className="flex justify-center">
                {stempel(s.woche) ? (
                  <Muehur woche={s.woche} className="size-12 -rotate-12" />
                ) : (
                  <Muehur woche={s.woche} leer className="size-12" />
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">Ein Stempel (Mühür) gibt&apos;s ab 80 % im Sonntagstest.</p>
        </section>

        <ol className="relative mt-6 pb-4">
          <span aria-hidden="true" className="absolute top-4 bottom-4 left-[1.375rem] w-0.5 border-l-2 border-dashed border-primary/40" />
          {lehrplan.map((s, i) => {
            const neuePhase = i === 0 || lehrplan[i - 1].phase !== s.phase;
            const ist = aktuell === s.woche;
            const vorbei = aktuell !== null && s.woche < aktuell;
            const verlinkt = vorhanden.includes(s.woche);
            return (
              <li key={s.woche}>
                {neuePhase && (
                  <p className="relative mt-4 mb-2 ml-14 font-hand text-2xl text-accent">
                    {s.phase === 0 ? "Start" : `Phase ${s.phase}: ${PHASEN[s.phase].name}`}
                    <span className="ml-2 font-sans text-sm text-muted-foreground">{PHASEN[s.phase].niveau}</span>
                  </p>
                )}
                <motion.div
                  initial={reduziert ? false : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.25 }}
                  className="relative flex gap-3 py-1.5"
                >
                  <span
                    className={cn(
                      "z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-2 font-serif text-lg font-semibold",
                      stempel(s.woche)
                        ? "border-accent bg-rose-soft text-accent"
                        : ist
                          ? "border-safran bg-safran text-[#2a2233]"
                          : vorbei
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card"
                    )}
                  >
                    {s.woche}
                  </span>
                  <div className={cn("min-w-0 flex-1 rounded-xl p-3", ist ? "bg-safran-soft ring-2 ring-safran" : "bg-card ring-1 ring-border")}>
                    <p className="text-xs text-muted-foreground">
                      {datumLesbar(datumFuer(s.woche, s.woche === 0 ? 6 : 1), false)}
                      {ist && <span className="ml-2 font-semibold text-safran-ink">· Du bist hier</span>}
                    </p>
                    <h3 className="text-lg leading-snug font-semibold">
                      {verlinkt ? (
                        <Link href={`/lektion/${s.woche}/${s.woche === 0 ? 6 : 1}`} className="underline-offset-4 hover:underline">
                          {s.thema}
                        </Link>
                      ) : (
                        s.thema
                      )}
                    </h3>
                    <p className="text-[0.95rem]">Kann: {s.kannZiel}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.grammatik.join(" · ")}</p>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
        <p className="mb-4 text-center font-hand text-2xl text-accent">Sherin Türkçe konuşuyor!</p>
      </Seite>
    </>
  );
}
