"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Play, Square, X, Check } from "lucide-react";
import type { Lektion, Vokabel } from "@/content/schema";
import { heuteISO } from "@/lib/datum";
import { AUFWAERM_LIMIT, faelligeIds } from "@/lib/leitner";
import { sprich, stopp } from "@/lib/speech";
import { leererStand, useFortschritt, useGeladen } from "@/store/fortschritt";
import { AudioKnopf, AudioPaar, StimmeHinweis } from "@/components/audio";
import { Karteikarten } from "@/components/karteikarten";
import { Nachsprechen } from "@/components/nachsprechen";
import { Teeglas } from "@/components/teeglas";
import { UebungsRahmen } from "@/components/uebungen";
import { Feier } from "@/components/feier";
import { Button } from "@/components/ui/button";
import { Tulpe } from "@/components/iznik";
import { cn } from "@/lib/utils";

export const SCHRITTE = ["Aufwärmen", "Neue Wörter", "Grammatik", "Dialog", "Übungen", "Sprechen", "Abschluss"];

export function LektionPlayer({
  lektion,
  vokabeln,
  vorwocheIds,
}: {
  lektion: Lektion;
  vokabeln: Record<string, Vokabel>;
  vorwocheIds: string[];
}) {
  const geladen = useGeladen();
  const key = `${lektion.woche}-${lektion.tag}`;
  const stand = useFortschritt((s) => s.lektionen[key]) ?? leererStand();
  const aktualisieren = useFortschritt((s) => s.lektionAktualisieren);
  const schrittErledigt = useFortschritt((s) => s.schrittErledigt);
  const reduziert = useReducedMotion();

  // Aufwärm-Karten einmalig festlegen (damit Fortsetzen stabil ist)
  useEffect(() => {
    if (!geladen || stand.warmupIds) return;
    const s = useFortschritt.getState();
    const heute = heuteISO();
    const eigene = new Set(lektion.vokabeln.map((v) => v.id));
    const bekannt = (id: string) => !!vokabeln[id] && !eigene.has(id);
    let ids = faelligeIds(s.karten, heute, s.fehlerkiste, AUFWAERM_LIMIT, bekannt);
    const vorwoche = s.sonntag[lektion.woche - 1];
    const extra = lektion.tag === 1 && !!vorwoche && vorwoche.prozent < 60;
    if (extra) ids = [...new Set([...ids, ...vorwocheIds.filter(bekannt)])].slice(0, 25);
    aktualisieren(key, { warmupIds: ids, extra });
  }, [geladen, stand.warmupIds, key, lektion, vokabeln, vorwocheIds, aktualisieren]);

  useEffect(() => () => stopp(), []);

  if (!geladen) return <div className="min-h-dvh" aria-busy="true" />;

  const schritt = stand.schritt;
  const geheZu = (n: number) => {
    stopp();
    aktualisieren(key, { schritt: n });
    window.scrollTo({ top: 0, behavior: reduziert ? "auto" : "smooth" });
  };
  const fertigMit = (n: number) => {
    schrittErledigt(key, n);
    geheZu(Math.min(n + 1, SCHRITTE.length - 1));
  };
  const fuellung = stand.fertigAm ? 1 : stand.erledigt.length / SCHRITTE.length;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <header
        className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 pb-3 backdrop-blur"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Lektion verlassen (Fortschritt bleibt gespeichert)"
            className="-ml-2 flex size-11 items-center justify-center rounded-full hover:bg-muted"
          >
            <X aria-hidden="true" />
          </Link>
          <nav aria-label="Schritte der Lektion" className="flex flex-1 gap-1">
            {SCHRITTE.map((name, i) => {
              const erledigt = stand.erledigt.includes(i);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => geheZu(i)}
                  aria-label={`${i + 1}. ${name}${erledigt ? " (erledigt)" : ""}`}
                  aria-current={i === schritt ? "step" : undefined}
                  className="group flex h-11 flex-1 items-center"
                >
                  <span
                    className={cn(
                      "h-2.5 w-full rounded-full transition-colors duration-300",
                      erledigt ? "bg-primary" : i === schritt ? "bg-safran" : "bg-muted ring-1 ring-border"
                    )}
                  />
                </button>
              );
            })}
          </nav>
          <Teeglas fuellung={fuellung} className="-my-2 h-12 w-7" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Schritt {schritt + 1}/7 · {SCHRITTE[schritt]}
        </p>
      </header>

      <main className="flex-1 px-4 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {schritt === 0 && (
          <div className="mb-5 rounded-2xl bg-secondary p-4">
            <p className="text-sm font-semibold tracking-wide text-secondary-foreground uppercase">Heute lernst du:</p>
            <p className="font-serif text-xl text-balance">{lektion.kannZiel}</p>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={schritt}
            initial={{ opacity: 0, y: reduziert ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {schritt === 0 && (
              <SchrittAufwaermen
                ids={stand.warmupIds ?? []}
                extra={!!stand.extra}
                start={stand.warmupIndex}
                vokabeln={vokabeln}
                onWeiter={(i) => aktualisieren(key, { warmupIndex: i })}
                onFertig={() => fertigMit(0)}
              />
            )}
            {schritt === 1 && (
              <SchrittWoerter
                lektion={lektion}
                index={stand.wortIndex}
                setIndex={(i) => aktualisieren(key, { wortIndex: i })}
                onFertig={() => {
                  useFortschritt.getState().kartenHinzufuegen(lektion.vokabeln.map((v) => v.id));
                  fertigMit(1);
                }}
              />
            )}
            {schritt === 2 && <SchrittGrammatik lektion={lektion} onFertig={() => fertigMit(2)} />}
            {schritt === 3 && <SchrittDialog lektion={lektion} onFertig={() => fertigMit(3)} />}
            {schritt === 4 && (
              <SchrittUebungen
                lektion={lektion}
                vokabeln={vokabeln}
                index={stand.uebungIndex}
                richtig={stand.uebungRichtig}
                onAntwort={(richtig) =>
                  aktualisieren(key, { uebungIndex: stand.uebungIndex + 1, uebungRichtig: stand.uebungRichtig + (richtig ? 1 : 0) })
                }
                onNochmal={() => aktualisieren(key, { uebungIndex: 0, uebungRichtig: 0 })}
                onFertig={() => fertigMit(4)}
              />
            )}
            {schritt === 5 && (
              <SchrittSprechen lektion={lektion} erledigt={stand.erledigt.includes(5)} onFertig={() => fertigMit(5)} onSpaeter={() => geheZu(6)} />
            )}
            {schritt === 6 && <SchrittAbschluss lektion={lektion} schluessel={key} offen={SCHRITTE.slice(0, 6).filter((_, i) => !stand.erledigt.includes(i))} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ── 1. Aufwärmen ───────────────────────────────────────── */

function SchrittAufwaermen(props: {
  ids: string[];
  extra: boolean;
  start: number;
  vokabeln: Record<string, Vokabel>;
  onWeiter: (i: number) => void;
  onFertig: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold">Aufwärmen</h2>
        <p className="text-muted-foreground">
          {props.extra
            ? "Extra-Wiederholung: Wir festigen heute nochmal die letzte Woche. Ganz in Ruhe."
            : props.ids.length
              ? "Ein paar Karten von früher – etwa 5 Minuten."
              : "Heute ist nichts zu wiederholen. Direkt weiter!"}
        </p>
      </div>
      <StimmeHinweis />
      <Karteikarten ids={props.ids} vokabeln={props.vokabeln} start={props.start} onWeiter={props.onWeiter} onFertig={props.onFertig} />
    </div>
  );
}

/* ── 2. Neue Wörter ─────────────────────────────────────── */

function SchrittWoerter({ lektion, index, setIndex, onFertig }: { lektion: Lektion; index: number; setIndex: (i: number) => void; onFertig: () => void }) {
  const vs = lektion.vokabeln;
  const i = Math.min(index, vs.length - 1);
  const v = vs[i];
  const reduziert = useReducedMotion();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold">Neue Wörter</h2>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {i + 1} / {vs.length}
        </p>
      </div>
      <AnimatePresence mode="wait">
        <motion.article
          key={v.id}
          initial={{ opacity: 0, x: reduziert ? 0 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduziert ? 0 : -24 }}
          transition={{ duration: 0.2 }}
          className="defter-linien relative overflow-hidden rounded-2xl bg-card p-6 shadow-[0_10px_24px_-14px_rgba(42,34,51,.35)] ring-1 ring-border"
        >
          <span className="absolute top-0 left-6 h-full w-px bg-accent/25" aria-hidden="true" />
          <div className="pl-4">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{v.typ === "chunk" ? "Ausdruck" : "Wort"}</p>
            <p lang="tr" className="mt-1 font-serif text-[2.6rem] leading-tight font-medium text-balance">
              {v.tr}
            </p>
            <div className="mt-2">
              <AudioPaar text={v.tr} gross />
            </div>
            <p className="mt-3 text-xl">{v.de}</p>
            <div className="mt-5 flex items-start gap-2 rounded-xl bg-muted/70 p-3">
              <div className="flex-1">
                <p lang="tr" className="font-serif text-lg">
                  {v.beispiel.tr}
                </p>
                <p className="text-muted-foreground">{v.beispiel.de}</p>
              </div>
              <AudioKnopf text={v.beispiel.tr} />
            </div>
            {v.merktipp && (
              <p className="mt-4 rotate-[-0.6deg] rounded-lg border-l-4 border-safran bg-safran-soft/70 p-3 font-hand text-[1.35rem] leading-snug">
                {v.merktipp}
              </p>
            )}
          </div>
        </motion.article>
      </AnimatePresence>
      <div className="flex gap-2">
        <Button variant="outline" size="lg" aria-label="Vorheriges Wort" disabled={i === 0} onClick={() => setIndex(i - 1)}>
          <ChevronLeft aria-hidden="true" />
        </Button>
        {i < vs.length - 1 ? (
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              setIndex(i + 1);
              sprich(vs[i + 1].tr);
            }}
          >
            Nächstes Wort <ChevronRight aria-hidden="true" />
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={onFertig}>
            Alle Wörter gelernt <Check aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── 3. Grammatik ───────────────────────────────────────── */

function SchrittGrammatik({ lektion, onFertig }: { lektion: Lektion; onFertig: () => void }) {
  const g = lektion.grammatik;
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-semibold text-balance">{g.titel}</h2>
      <ul className="space-y-2.5">
        {g.erklaerung.map((s, i) => (
          <li key={i} className="flex gap-3">
            <Tulpe className="mt-0.5 h-5 w-4 shrink-0" />
            <span>{s}</span>
          </li>
        ))}
      </ul>
      {g.tabelle && (
        <div className="-mx-1 overflow-x-auto rounded-xl ring-1 ring-border">
          <table className="w-full min-w-0 border-collapse bg-card text-left text-[0.95rem]">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                {g.tabelle.kopf.map((k, i) => (
                  <th key={i} scope="col" className="px-2.5 py-2 font-semibold">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.tabelle.zeilen.map((z, i) => (
                <tr key={i} className="border-t border-border">
                  {z.map((zelle, j) => (
                    <td key={j} lang={j > 0 ? "tr" : undefined} className={cn("px-2.5 py-2", j > 0 && "font-serif")}>
                      {zelle}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Beispiele</h3>
        {g.beispiele.map((b, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-border">
            <div className="flex-1">
              <p lang="tr" className="font-serif text-lg">
                {b.tr}
              </p>
              <p className="text-muted-foreground">{b.de}</p>
            </div>
            <AudioKnopf text={b.tr} />
          </div>
        ))}
      </div>
      <Button size="lg" onClick={onFertig}>
        Verstanden <Check aria-hidden="true" />
      </Button>
    </div>
  );
}

/* ── 4. Dialog ──────────────────────────────────────────── */

const TONHOEHE: Record<string, number> = { Pasha: 0.8, Sherin: 1.1 };

function SchrittDialog({ lektion, onFertig }: { lektion: Lektion; onFertig: () => void }) {
  const [uebersetzung, setUebersetzung] = useState(true);
  const [aktiv, setAktiv] = useState<number | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const zeilen = lektion.dialog.zeilen;

  const abbruch = useRef(false);
  useEffect(() => () => {
    abbruch.current = true;
  }, []);

  async function alles() {
    if (laeuft) {
      abbruch.current = true;
      stopp();
      setLaeuft(false);
      setAktiv(null);
      return;
    }
    abbruch.current = false;
    setLaeuft(true);
    for (let i = 0; i < zeilen.length; i++) {
      if (abbruch.current) break;
      setAktiv(i);
      await sprich(zeilen[i].tr, { tonhoehe: TONHOEHE[zeilen[i].sprecher] ?? 1.25 });
    }
    if (!abbruch.current) {
      setAktiv(null);
      setLaeuft(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold">Dialog</h2>
        <p className="font-hand text-2xl text-accent">{lektion.dialog.titel}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant={laeuft ? "akzent" : "default"} onClick={alles}>
          {laeuft ? <Square aria-hidden="true" /> : <Play aria-hidden="true" />}
          {laeuft ? "Stopp" : "Ganzen Dialog abspielen"}
        </Button>
        <Button variant="outline" onClick={() => setUebersetzung((u) => !u)} aria-pressed={uebersetzung}>
          {uebersetzung ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {uebersetzung ? "Deutsch ausblenden" : "Deutsch zeigen"}
        </Button>
      </div>
      <ol className="flex flex-col gap-3">
        {zeilen.map((z, i) => {
          const sherin = z.sprecher === "Sherin";
          return (
            <li key={i} className={cn("flex", sherin ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl p-3 ring-1 transition-shadow duration-200",
                  sherin ? "rounded-br-sm bg-secondary ring-primary/20" : "rounded-bl-sm bg-card ring-border",
                  aktiv === i && "shadow-[0_0_0_3px_var(--safran)]"
                )}
              >
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{z.sprecher}</p>
                <div className="flex items-start gap-2">
                  <p lang="tr" className="flex-1 font-serif text-lg leading-snug">
                    {z.tr}
                  </p>
                  <AudioKnopf text={z.tr} className="-mt-1 -mr-1" />
                </div>
                {uebersetzung && <p className="mt-1 text-[0.95rem] text-muted-foreground">{z.de}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <Button size="lg" onClick={onFertig}>
        Dialog geschafft <Check aria-hidden="true" />
      </Button>
    </div>
  );
}

/* ── 5. Übungen ─────────────────────────────────────────── */

function SchrittUebungen({
  lektion,
  vokabeln,
  index,
  richtig,
  onAntwort,
  onNochmal,
  onFertig,
}: {
  lektion: Lektion;
  vokabeln: Record<string, Vokabel>;
  index: number;
  richtig: number;
  onAntwort: (richtig: boolean) => void;
  onNochmal: () => void;
  onFertig: () => void;
}) {
  const pool = useMemo(() => {
    const alle = Object.values(vokabeln);
    const prefix = `w${String(lektion.woche).padStart(2, "0")}-`;
    const diese = alle.filter((v) => v.id.startsWith(prefix));
    return diese.length >= 8 ? diese : alle;
  }, [vokabeln, lektion.woche]);
  const n = lektion.uebungen.length;

  if (index >= n) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6 text-center ring-1 ring-border">
        <Tulpe className="h-12 w-10" />
        <h2 className="text-2xl font-semibold">Übungen geschafft</h2>
        <p className="text-lg">
          {richtig} von {n} auf Anhieb richtig.
        </p>
        <p className="text-muted-foreground">{richtig / n >= 0.8 ? "Çok iyi! Sehr gut." : "Fehler sind Fortschritt – genau so lernt man."}</p>
        <div className="flex w-full flex-col gap-2">
          <Button size="lg" onClick={onFertig}>
            Weiter <ChevronRight aria-hidden="true" />
          </Button>
          <Button variant="ghost" onClick={onNochmal}>
            Übungen nochmal machen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Übung {index + 1} von {n}
      </p>
      <UebungsRahmen
        key={index}
        uebung={lektion.uebungen[index]}
        vokabeln={vokabeln}
        pool={pool}
        onWeiter={(a) => {
          onAntwort(a.ergebnis !== "falsch");
          window.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
}

/* ── 6. Sprechauftrag ───────────────────────────────────── */

function SchrittSprechen({ lektion, erledigt, onFertig, onSpaeter }: { lektion: Lektion; erledigt: boolean; onFertig: () => void; onSpaeter: () => void }) {
  const s = lektion.sprechauftrag;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">Sprechauftrag mit Pasha</h2>
      <div className="relative rounded-2xl border-2 border-primary/30 bg-card p-5">
        <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-sm font-semibold text-primary-foreground">5 Minuten</span>
        <p className="text-lg text-pretty">{s.aufgabe}</p>
      </div>
      <h3 className="text-lg font-semibold">Mustersätze</h3>
      {s.mustersaetze.map((m, i) => (
        <div key={i} className="rounded-xl bg-card p-3 ring-1 ring-border">
          <div className="mb-2 flex items-start gap-2">
            <div className="flex-1">
              <p lang="tr" className="font-serif text-lg">
                {m.tr}
              </p>
              <p className="text-muted-foreground">{m.de}</p>
            </div>
            <AudioPaar text={m.tr} />
          </div>
          <Nachsprechen ziel={m.tr} />
        </div>
      ))}
      <Button size="lg" onClick={onFertig} variant={erledigt ? "outline" : "default"}>
        <Check aria-hidden="true" /> Mit Pasha gemacht
      </Button>
      <Button variant="ghost" onClick={onSpaeter}>
        Pasha ist gerade nicht da – später
      </Button>
    </div>
  );
}

/* ── 7. Abschluss ───────────────────────────────────────── */

function SchrittAbschluss({ lektion, schluessel, offen }: { lektion: Lektion; schluessel: string; offen: string[] }) {
  const abschliessen = useFortschritt((s) => s.lektionAbschliessen);
  const fertig = useFortschritt((s) => !!s.lektionen[schluessel]?.fertigAm);
  const [feier, setFeier] = useState(false);
  const a = lektion.alltagssatz;
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-semibold">Abschluss</h2>
      <section className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-[0_4px_0_0_var(--primary-shadow)]">
        <p className="text-sm font-semibold tracking-wide uppercase opacity-90">Alltagssatz des Tages</p>
        <div className="mt-1 flex items-start gap-3">
          <p lang="tr" className="flex-1 font-serif text-3xl leading-tight">
            {a.tr}
          </p>
          <AudioKnopf text={a.tr} className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground" />
        </div>
        <p className="mt-1 text-lg">{a.de}</p>
        <p className="mt-3 text-[0.95rem] opacity-90">Wann: {a.wann}</p>
      </section>
      <section className="rotate-[0.5deg] rounded-2xl border-l-4 border-safran bg-safran-soft/70 p-5">
        <p className="text-sm font-semibold tracking-wide text-safran-ink uppercase">Merk-Tipp: {lektion.merktipp.titel}</p>
        <p className="mt-1 font-hand text-[1.45rem] leading-snug">{lektion.merktipp.text}</p>
      </section>
      {offen.length > 0 && !fertig && (
        <p className="text-sm text-muted-foreground">
          Noch offen: {offen.join(", ")}. Du kannst trotzdem abschließen – oben in der Leiste kommst du jederzeit zurück.
        </p>
      )}
      {!fertig ? (
        <Button
          size="lg"
          variant="akzent"
          onClick={() => {
            abschliessen(schluessel);
            setFeier(true);
          }}
        >
          Lektion abschließen
        </Button>
      ) : (
        <Link href="/" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-primary px-6 text-lg font-medium text-primary-foreground">
          Zur Startseite
        </Link>
      )}
      <Feier offen={feier} onSchliessen={() => setFeier(false)} titel="Harika, Sherin!" text="Lektion geschafft. Dein Teeglas ist voll." />
    </div>
  );
}
