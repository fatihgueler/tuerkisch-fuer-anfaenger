"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Download, X } from "lucide-react";
import type { Vokabel, Woche } from "@/content/schema";
import { stationFuer } from "@/content/lehrplan";
import { erzeugeSonntagstest } from "@/lib/sonntag";
import { backupHerunterladen } from "@/lib/backup";
import { heuteISO } from "@/lib/datum";
import { stopp } from "@/lib/speech";
import { useFortschritt, useGeladen, type SonntagsEntwurf } from "@/store/fortschritt";
import { UebungsRahmen } from "@/components/uebungen";
import { AudioKnopf, StimmeHinweis } from "@/components/audio";
import { Muehur } from "@/components/muehur";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SonntagsTest({ woche, vokabeln }: { woche: Woche; vokabeln: Record<string, Vokabel> }) {
  const geladen = useGeladen();
  const entwurf = useFortschritt((s) => s.sonntagEntwurf[woche.woche]);
  const ergebnis = useFortschritt((s) => s.sonntag[woche.woche]);
  const entwurfSetzen = useFortschritt((s) => s.entwurfSetzen);
  const [neuStart, setNeuStart] = useState(false);
  const station = stationFuer(woche.woche);

  useEffect(() => () => stopp(), []);

  if (!geladen) return <div className="min-h-dvh" aria-busy="true" />;

  function starten() {
    const s = useFortschritt.getState();
    entwurfSetzen(woche.woche, { fragen: erzeugeSonntagstest(woche, vokabeln, s.fehlerkiste, s.karten), index: 0, ergebnisse: [] });
    setNeuStart(false);
  }

  const zeigeErgebnis = ergebnis && !entwurf && !neuStart;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 pb-3 backdrop-blur"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <Link href="/" aria-label="Zur Startseite" className="-ml-2 flex size-11 items-center justify-center rounded-full hover:bg-muted">
          <X aria-hidden="true" />
        </Link>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Sonntagstest · Woche {woche.woche}</p>
          {entwurf && (
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted ring-1 ring-border" aria-hidden="true">
              <div className="h-full rounded-full bg-safran transition-[width] duration-300" style={{ width: `${(entwurf.index / entwurf.fragen.length) * 100}%` }} />
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 px-4 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {entwurf ? (
          <Fragen woche={woche.woche} entwurf={entwurf} vokabeln={vokabeln} />
        ) : zeigeErgebnis ? (
          <Ergebnis woche={woche} onNochmal={() => setNeuStart(true)} />
        ) : (
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl font-semibold">Pazar testi</h1>
            <p className="text-lg">
              20 Fragen zu „{station?.thema}“ – plus ein paar Wörter, die dir früher schwer gefallen sind. Danach eine kleine Sprech-Challenge mit Pasha.
            </p>
            <p className="text-muted-foreground">Ca. 15 Minuten. Du kannst jederzeit unterbrechen – es geht genau dort weiter.</p>
            <StimmeHinweis />
            <Button size="lg" variant="akzent" onClick={starten}>
              Sonntagstest starten
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function Fragen({ woche, entwurf, vokabeln }: { woche: number; entwurf: SonntagsEntwurf; vokabeln: Record<string, Vokabel> }) {
  const entwurfSetzen = useFortschritt((s) => s.entwurfSetzen);
  const sonntagSpeichern = useFortschritt((s) => s.sonntagSpeichern);
  const pool = useMemo(() => {
    const prefix = `w${String(woche).padStart(2, "0")}-`;
    const alle = Object.values(vokabeln);
    const diese = alle.filter((v) => v.id.startsWith(prefix));
    return diese.length >= 8 ? diese : alle;
  }, [vokabeln, woche]);
  const frage = entwurf.fragen[entwurf.index];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Frage {entwurf.index + 1} von {entwurf.fragen.length}
      </p>
      <UebungsRahmen
        key={entwurf.index}
        uebung={frage.uebung}
        vokabeln={vokabeln}
        pool={pool}
        onWeiter={(a) => {
          const ergebnisse = [...entwurf.ergebnisse, { ergebnis: a.ergebnis, frage: frage.text, loesung: a.loesung, eingabe: a.eingabe, quelle: frage.quelle }];
          const index = entwurf.index + 1;
          window.scrollTo({ top: 0 });
          if (index < entwurf.fragen.length) {
            entwurfSetzen(woche, { ...entwurf, index, ergebnisse });
            return;
          }
          const punkte = ergebnisse.reduce((p, e) => p + (e.ergebnis === "richtig" ? 1 : e.ergebnis === "fast" ? 0.5 : 0), 0);
          const falsch = ergebnisse.filter((e) => e.ergebnis === "falsch");
          sonntagSpeichern(
            woche,
            {
              prozent: Math.round((punkte / ergebnisse.length) * 100),
              datum: heuteISO(),
              falsche: falsch.map((e) => ({ frage: e.frage, loesung: e.loesung, antwort: e.eingabe })),
              sprech: [false, false, false],
            },
            falsch.map((e) => e.quelle).filter((q): q is string => !!q),
            ergebnisse.filter((e) => e.ergebnis === "richtig" && e.quelle).map((e) => e.quelle!)
          );
          entwurfSetzen(woche, null);
        }}
      />
    </div>
  );
}

function Ergebnis({ woche, onNochmal }: { woche: Woche; onNochmal: () => void }) {
  const e = useFortschritt((s) => s.sonntag[woche.woche])!;
  const sprech = useFortschritt((s) => s.sonntagSprech);
  const backupAm = useFortschritt((s) => s.hinweise.backupAm);
  const reduziert = useReducedMotion();
  const stempel = e.prozent >= 80;
  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl bg-card p-6 text-center ring-1 ring-border">
        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Ergebnis Woche {woche.woche}</p>
        <p className="font-serif text-7xl font-semibold text-primary">{e.prozent}&nbsp;%</p>
        {stempel ? (
          <motion.div
            initial={reduziert ? false : { scale: 2.4, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.25 }}
            className="mx-auto mt-2 w-fit"
          >
            <Muehur woche={woche.woche} className="size-28" />
          </motion.div>
        ) : null}
        <p className="mt-3 text-lg text-pretty">
          {stempel
            ? "Mühür verdient! Der Stempel ist in deinem Plan."
            : e.prozent >= 60
              ? "Gut gemacht! Ab 80 % gibt's den Wochen-Stempel – die Fehler kommen in die Wiederholung."
              : "Diese Woche war viel. Montag starten wir mit einer Extra-Wiederholung – ganz entspannt."}
        </p>
      </section>

      {e.falsche.length > 0 && (
        <section>
          <h2 className="mb-2 text-xl font-semibold">Zum Merken</h2>
          <ul className="space-y-2">
            {e.falsche.map((f, i) => (
              <li key={i} className="rounded-xl bg-card p-3 ring-1 ring-border">
                <p className="text-sm text-muted-foreground">{f.frage}</p>
                <div className="flex items-center gap-2">
                  <p lang="tr" className="flex-1 font-serif text-lg">
                    {f.loesung}
                  </p>
                  {!f.loesung.includes(" = ") && <AudioKnopf text={f.loesung} />}
                </div>
                {f.antwort && <p className="text-sm text-muted-foreground line-through decoration-accent/60">{f.antwort}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold">Sprech-Challenge mit Pasha</h2>
        <p className="mb-3 text-muted-foreground">Drei Situationen – spielt sie einfach durch und hak sie ab.</p>
        <ul className="space-y-2.5">
          {woche.sonntag.sprechChallenge.map((c, i) => {
            const an = !!e.sprech[i];
            return (
              <li key={i}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={an}
                  onClick={() => sprech(woche.woche, i, !an)}
                  className={cn(
                    "flex w-full gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                    an ? "border-primary bg-secondary" : "border-border bg-card"
                  )}
                >
                  <span
                    className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border-2", an ? "border-primary bg-primary text-primary-foreground" : "border-input")}
                    aria-hidden="true"
                  >
                    {an && <Check className="size-5" />}
                  </span>
                  <span>
                    <span className="block">{c.situation}</span>
                    {c.hilfe && (
                      <span className="mt-1 block">
                        <span lang="tr" className="font-serif">
                          {c.hilfe.tr}
                        </span>
                        <span className="block text-sm text-muted-foreground">{c.hilfe.de}</span>
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {backupAm !== heuteISO() && (
        <section className="flex items-center gap-3 rounded-xl border border-dashed border-input p-3 text-[0.95rem]">
          <p className="flex-1 text-muted-foreground">Sonntag ist Backup-Tag: Sichere kurz deinen Fortschritt.</p>
          <Button variant="outline" size="sm" onClick={backupHerunterladen}>
            <Download aria-hidden="true" /> Backup sichern
          </Button>
        </section>
      )}

      <div className="flex flex-col gap-2">
        <Link href="/" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-primary px-6 text-lg font-medium text-primary-foreground">
          Zur Startseite
        </Link>
        <Button variant="ghost" onClick={onNochmal}>
          Test nochmal machen
        </Button>
      </div>
    </div>
  );
}
