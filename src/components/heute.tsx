"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Cake, ChevronRight, Flame, Layers, Share, Timer, X } from "lucide-react";
import type { WocheKurz } from "@/content";
import { stationFuer } from "@/content/lehrplan";
import { sherin } from "@/config/sherin";
import { datumFuer, datumLesbar, heuteISO, istGeburtstag, positionFuer, stundeBerlin, TAG_NAMEN } from "@/lib/datum";
import { faelligeIds } from "@/lib/leitner";
import { berechneSerie } from "@/lib/serie";
import { useFortschritt, useGeladen } from "@/store/fortschritt";
import { SCHRITTE } from "@/components/lektion-player";
import { AudioKnopf, StimmeHinweis } from "@/components/audio";
import { Teeglas } from "@/components/teeglas";
import { IznikBand, Tulpe } from "@/components/iznik";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

function gruss(stunde: number) {
  if (stunde < 11) return "Günaydın";
  if (stunde < 18) return "İyi günler";
  return "İyi akşamlar";
}

export function Heute({ wochen, notizen }: { wochen: WocheKurz[]; notizen: Record<string, string> }) {
  const geladen = useGeladen();
  const s = useFortschritt();
  const reduziert = useReducedMotion();
  const [jetzt, setJetzt] = useState<Date | null>(null);
  useEffect(() => setJetzt(new Date()), []);

  if (!geladen || !jetzt) {
    return (
      <header>
        <IznikBand />
        <div className="h-40" aria-busy="true" />
      </header>
    );
  }

  const heute = heuteISO(jetzt);
  const pos = positionFuer(heute);
  const station = stationFuer(pos.woche);
  const finde = (w: number, t: number) => wochen.find((x) => x.woche === w)?.lektionen.find((l) => l.tag === t);
  const istSonntag = pos.tag === 7;
  const lektion = istSonntag ? undefined : finde(pos.woche, pos.tag);
  const sonntagMoeglich = istSonntag && wochen.some((w) => w.woche === pos.woche);
  const stand = lektion ? s.lektionen[`${lektion.woche}-${lektion.tag}`] : undefined;
  const sonntagErgebnis = s.sonntag[pos.woche];
  const sonntagLaeuft = !!s.sonntagEntwurf[pos.woche];
  const serie = berechneSerie(s.aktiveTage, heute);
  const faellig = faelligeIds(s.karten, heute, s.fehlerkiste).length;
  const notiz = pos.tag === 1 ? notizen[String(pos.woche)] : undefined;

  // Tagesfortschritt fürs Teeglas
  const fuellung = istSonntag
    ? sonntagErgebnis
      ? 1
      : sonntagLaeuft
        ? (s.sonntagEntwurf[pos.woche].index / 20) * 0.9
        : 0
    : stand?.fertigAm
      ? 1
      : (stand?.erledigt.length ?? 0) / SCHRITTE.length || (s.aktiveTage[heute] ? 0.4 : 0);

  // Nachholen: verpasste Lektionen & Sonntagstests vor heute
  const nachholen: { href: string; label: string; datum: string }[] = [];
  for (const w of wochen) {
    if (w.woche > pos.woche) continue;
    for (const l of w.lektionen) {
      const d = datumFuer(l.woche, l.tag);
      if (d < heute && !s.lektionen[`${l.woche}-${l.tag}`]?.fertigAm)
        nachholen.push({ href: `/lektion/${l.woche}/${l.tag}`, label: l.titel, datum: d });
    }
    const so = datumFuer(w.woche, 7);
    if (so < heute && !s.sonntag[w.woche]) nachholen.push({ href: `/sonntag/${w.woche}`, label: `Sonntagstest Woche ${w.woche}`, datum: so });
  }

  const alltagssatz = (lektion ?? finde(pos.woche, 6) ?? finde(pos.woche, Math.max(1, pos.tag - 1)))?.alltagssatz;
  const istIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
  const iosHinweis = istIos && !standalone && !s.hinweise.iosHomescreen;

  const einblenden = (i: number) =>
    reduziert ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.06 * i, duration: 0.3 } };

  return (
    <>
      <header className="relative">
        <IznikBand />
        <div className="mx-auto flex max-w-xl items-start justify-between gap-3 px-4 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {datumLesbar(heute)} · {pos.woche === 0 ? "Woche 0" : `Woche ${pos.woche}`}
            </p>
            <h1 className="text-[2rem] leading-tight font-semibold text-balance">
              {gruss(stundeBerlin(jetzt))}, <span className="text-accent italic">{sherin.name}</span>
            </h1>
          </div>
          <Link href="/einstellungen" aria-label="Einstellungen" className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
            <Settings className="size-6" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main id="inhalt" className="pb-nav mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pt-4">
        {istGeburtstag(heute) && (
          <motion.div {...einblenden(0)} className="flex items-center gap-3 rounded-2xl bg-accent p-4 text-accent-foreground">
            <Cake className="size-8 shrink-0" aria-hidden="true" />
            <p className="font-serif text-2xl">İyi ki doğdun, {sherin.name}!</p>
          </motion.div>
        )}

        {iosHinweis && (
          <motion.div {...einblenden(0)} role="note" className="relative rounded-2xl border-2 border-primary/30 bg-secondary p-4 pr-12">
            <p className="font-semibold">Tipp: Zum Home-Bildschirm hinzufügen</p>
            <p className="mt-1 text-[0.95rem]">
              Tippe unten in Safari auf <Share className="inline size-4 align-[-2px]" aria-label="Teilen" /> und dann auf „Zum Home-Bildschirm“. So
              öffnet sich die App wie eine richtige App – und Safari löscht deinen Fortschritt nicht, falls du mal 7 Tage nicht reinschaust.
            </p>
            <button
              type="button"
              aria-label="Hinweis schließen"
              onClick={() => s.hinweisSetzen({ iosHomescreen: true })}
              className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full hover:bg-background/60"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </motion.div>
        )}

        {notiz && (
          <motion.figure {...einblenden(1)} className="relative -rotate-1 rounded-sm bg-[#fff8d6] p-5 pt-6 text-[#2a2233] shadow-[0_8px_18px_-10px_rgba(42,34,51,.5)]">
            <span className="absolute -top-2 left-1/2 h-5 w-20 -translate-x-1/2 rotate-2 bg-primary/25" aria-hidden="true" />
            <blockquote className="font-hand text-[1.6rem] leading-snug whitespace-pre-line">{notiz}</blockquote>
            <figcaption className="mt-2 text-right font-hand text-xl text-[#8c2640]">– {sherin.partner}</figcaption>
          </motion.figure>
        )}

        {/* Hauptaktion */}
        <motion.section {...einblenden(2)} className="relative overflow-hidden rounded-3xl bg-card p-5 shadow-[0_12px_30px_-18px_rgba(42,34,51,.45)] ring-1 ring-border">
          <div className="flex gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {istSonntag ? "Sonntag" : TAG_NAMEN[pos.tag]} · {station?.thema}
              </p>
              {istSonntag ? (
                <>
                  <h2 className="mt-1 text-2xl font-semibold">Sonntagstest</h2>
                  <p className="text-muted-foreground">
                    {sonntagErgebnis ? `Geschafft: ${sonntagErgebnis.prozent} %` : "20 Fragen zur ganzen Woche + Sprech-Challenge"}
                  </p>
                </>
              ) : lektion ? (
                <>
                  <h2 className="mt-1 text-2xl font-semibold text-balance">{lektion.titel}</h2>
                  <p className="text-muted-foreground">Heute lernst du: {lektion.kannZiel}</p>
                </>
              ) : (
                <>
                  <h2 className="mt-1 text-2xl font-semibold">Neue Inhalte folgen</h2>
                  <p className="text-muted-foreground">Die Lektionen für diese Woche kommen bald. Bis dahin: Wiederholen hält alles frisch.</p>
                </>
              )}
            </div>
            <Teeglas fuellung={fuellung} className="h-24 w-14 shrink-0" />
          </div>
          <div className="mt-4 flex gap-2">
            {istSonntag && sonntagMoeglich ? (
              <Link href={`/sonntag/${pos.woche}`} className={primaer}>
                {sonntagErgebnis ? "Ergebnis ansehen" : sonntagLaeuft ? "Sonntagstest fortsetzen" : "Sonntagstest starten"}
              </Link>
            ) : lektion ? (
              <Link href={`/lektion/${lektion.woche}/${lektion.tag}`} className={primaer}>
                {stand?.fertigAm ? "Lektion ansehen" : stand && (stand.erledigt.length || stand.schritt) ? "Lektion fortsetzen" : "Lektion starten"}
              </Link>
            ) : (
              <Link href="/wiederholen" className={primaer}>
                Wiederholen
              </Link>
            )}
            <Link href="/wiederholen?kurz=1" className="inline-flex min-h-14 flex-col items-center justify-center rounded-xl border-2 border-border px-3 text-sm leading-tight font-medium hover:bg-muted">
              <Timer className="size-5" aria-hidden="true" />
              Nur 5 Min.
            </Link>
          </div>
        </motion.section>

        {/* Kennzahlen */}
        <motion.div {...einblenden(3)} className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-safran-soft p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-safran-ink">
              <Flame className="size-4" aria-hidden="true" /> Serie
            </p>
            <p className="font-serif text-3xl font-semibold">
              {serie.laenge} <span className="text-base font-normal">{serie.laenge === 1 ? "Tag" : "Tage"}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {serie.laenge === 0 ? "Heute ist ein guter Tag zum Starten." : serie.jokerBenutzt ? "Joker diese Woche genutzt" : "1 Joker diese Woche frei"}
            </p>
          </div>
          <Link href="/wiederholen" className="rounded-2xl bg-secondary p-4 transition-colors hover:bg-secondary/70">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary-foreground">
              <Layers className="size-4" aria-hidden="true" /> Wiederholen
            </p>
            <p className="font-serif text-3xl font-semibold">
              {faellig} <span className="text-base font-normal">{faellig === 1 ? "Karte" : "Karten"}</span>
            </p>
            <p className="text-sm text-muted-foreground">{faellig ? "heute fällig" : "alles frisch"}</p>
          </Link>
        </motion.div>

        {alltagssatz && (
          <motion.section {...einblenden(4)} className="rounded-2xl border-l-4 border-primary bg-card p-4 ring-1 ring-border">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Alltagssatz des Tages</p>
            <div className="mt-1 flex items-center gap-3">
              <p lang="tr" className="flex-1 font-serif text-2xl">
                {alltagssatz.tr}
              </p>
              <AudioKnopf text={alltagssatz.tr} />
            </div>
            <p>{alltagssatz.de}</p>
            <p className="mt-1 text-sm text-muted-foreground">{alltagssatz.wann}</p>
          </motion.section>
        )}

        {nachholen.length > 0 && (
          <motion.section {...einblenden(5)}>
            <h2 className="mb-2 text-xl font-semibold">Nachholen</h2>
            <p className="mb-2 text-sm text-muted-foreground">Kein Stress – mach&apos;s, wenn Zeit ist. Nichts ist gesperrt.</p>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-border">
              {nachholen.slice(0, 5).map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-muted">
                    <span className="flex-1">
                      <span className="block font-medium">{n.label}</span>
                      <span className="text-sm text-muted-foreground">{datumLesbar(n.datum)}</span>
                    </span>
                    <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            {nachholen.length > 5 && <p className="mt-2 text-sm text-muted-foreground">… und {nachholen.length - 5} weitere unter „Woche“.</p>}
          </motion.section>
        )}

        <StimmeHinweis />
        <p className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
          <Tulpe className="h-5 w-4" /> <span lang="tr">Her gün biraz.</span> <span className="italic">– Jeden Tag ein bisschen.</span>
        </p>
      </main>
    </>
  );
}

const primaer = cn(
  "inline-flex min-h-14 flex-1 items-center justify-center rounded-xl bg-primary px-5 text-lg font-semibold text-primary-foreground",
  "shadow-[0_3px_0_0_var(--primary-shadow)] transition-transform active:translate-y-px"
);
