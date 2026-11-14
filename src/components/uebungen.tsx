"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Headphones, RotateCcw, X } from "lucide-react";
import type { Uebung, Vokabel } from "@/content/schema";
import { pruefe, sonderzeichenMarkieren, type Ergebnis } from "@/lib/check";
import { sprich } from "@/lib/speech";
import { AudioKnopf } from "@/components/audio";
import { SonderzeichenLeiste } from "@/components/sonderzeichen";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Antwort = { ergebnis: Ergebnis; loesung: string; eingabe: string; audio?: string };

type Basis = { gesperrt: boolean; onAntwort: (a: Antwort) => void };

/* ── Hilfen ─────────────────────────────────────────────── */

export function mischen<T>(liste: T[]): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Bis zu n Ablenker mit anderem Text; bevorzugt gleicher Typ (Wort/Chunk). */
export function ablenker(korrekt: Vokabel, pool: Vokabel[], feld: "tr" | "de", n = 3): Vokabel[] {
  const gesehen = new Set([korrekt[feld].toLocaleLowerCase("tr-TR")]);
  const kandidaten = mischen(pool.filter((v) => v.id !== korrekt.id));
  const typ = korrekt.typ ?? "wort";
  kandidaten.sort((a, b) => Number((b.typ ?? "wort") === typ) - Number((a.typ ?? "wort") === typ));
  const raus: Vokabel[] = [];
  for (const v of kandidaten) {
    const k = v[feld].toLocaleLowerCase("tr-TR");
    if (gesehen.has(k)) continue;
    gesehen.add(k);
    raus.push(v);
    if (raus.length === n) break;
  }
  return raus;
}

const titelFuer: Record<Uebung["art"], string> = {
  auswahl_de_tr: "Wie sagt man das auf Türkisch?",
  auswahl_tr_de: "Was bedeutet das?",
  tippen: "Schreib es auf Türkisch",
  hoeren: "Hör zu – was bedeutet das?",
  satzbau: "Bau den Satz",
  luecke: "Was fehlt?",
  zuordnen: "Finde die Paare",
};

/* ── Rahmen mit Rückmeldung ─────────────────────────────── */

export function UebungsRahmen({
  uebung,
  vokabeln,
  pool,
  onWeiter,
}: {
  uebung: Uebung;
  vokabeln: Record<string, Vokabel>;
  pool: Vokabel[];
  onWeiter: (a: Antwort) => void;
}) {
  const [antwort, setAntwort] = useState<Antwort | null>(null);
  const onAntwort = (a: Antwort) => {
    setAntwort(a);
    if (a.audio && a.ergebnis !== "richtig") sprich(a.audio);
  };
  const props = { gesperrt: !!antwort, onAntwort };

  let inhalt: React.ReactNode = null;
  switch (uebung.art) {
    case "auswahl_de_tr":
    case "auswahl_tr_de":
    case "hoeren": {
      const v = vokabeln[uebung.vokabel];
      if (v) inhalt = <Auswahl art={uebung.art} vokabel={v} pool={pool} {...props} />;
      break;
    }
    case "tippen": {
      const v = vokabeln[uebung.vokabel];
      if (v) inhalt = <Tippen vokabel={v} {...props} />;
      break;
    }
    case "satzbau":
      inhalt = <Satzbau tr={uebung.tr} de={uebung.de} extra={uebung.extra} {...props} />;
      break;
    case "luecke":
      inhalt = <Luecke u={uebung} {...props} />;
      break;
    case "zuordnen": {
      const vs = uebung.vokabeln.map((id) => vokabeln[id]).filter(Boolean);
      inhalt = <Zuordnen vokabeln={vs} {...props} />;
      break;
    }
  }

  return (
    <section aria-labelledby="uebung-titel" className="flex flex-col gap-5">
      <h2 id="uebung-titel" className="text-xl font-semibold">
        {titelFuer[uebung.art]}
      </h2>
      {inhalt ?? <p>Diese Übung konnte nicht geladen werden.</p>}
      <AnimatePresence>
        {antwort && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "sticky bottom-3 z-10 rounded-2xl border-2 p-4 shadow-lg",
              antwort.ergebnis === "richtig" && "border-primary bg-secondary",
              antwort.ergebnis === "fast" && "border-safran bg-safran-soft",
              antwort.ergebnis === "falsch" && "border-accent bg-rose-soft"
            )}
          >
            <Rueckmeldung antwort={antwort} />
            <Button size="lg" className="mt-3 w-full" onClick={() => onWeiter(antwort)} autoFocus>
              Weiter
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Rueckmeldung({ antwort }: { antwort: Antwort }) {
  const { ergebnis, loesung, audio } = antwort;
  return (
    <div role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-lg font-semibold">
        {ergebnis === "richtig" ? (
          <>
            <Check className="text-primary" aria-hidden="true" /> Doğru! Richtig.
          </>
        ) : ergebnis === "fast" ? (
          <>Fast richtig – achte auf die Sonderzeichen</>
        ) : (
          <>
            <X className="text-accent" aria-hidden="true" /> Noch nicht – so geht&apos;s:
          </>
        )}
      </p>
      {ergebnis !== "richtig" && (
        <div className="mt-2 flex items-center gap-3">
          <p className="font-serif text-xl">
            {ergebnis === "fast"
              ? sonderzeichenMarkieren(loesung).map((t, i) =>
                  t.markiert ? (
                    <mark key={i} className="rounded bg-safran px-0.5 text-[#2a2233]">
                      {t.text}
                    </mark>
                  ) : (
                    <span key={i}>{t.text}</span>
                  )
                )
              : loesung}
          </p>
          {audio && <AudioKnopf text={audio} />}
        </div>
      )}
    </div>
  );
}

/* ── Auswahl (DE→TR, TR→DE, Hören) ──────────────────────── */

function Auswahl({
  art,
  vokabel,
  pool,
  gesperrt,
  onAntwort,
}: Basis & { art: "auswahl_de_tr" | "auswahl_tr_de" | "hoeren"; vokabel: Vokabel; pool: Vokabel[] }) {
  const zeigeTr = art === "auswahl_de_tr";
  const feld = zeigeTr ? "tr" : "de";
  const optionen = useMemo(() => mischen([vokabel, ...ablenker(vokabel, pool, feld)]), [vokabel, pool, feld]);
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex min-h-28 items-center justify-center gap-3 rounded-2xl bg-card p-5 text-center shadow-sm ring-1 ring-border">
        {art === "hoeren" ? (
          <button
            type="button"
            onClick={() => sprich(vokabel.tr)}
            className="flex flex-col items-center gap-2 rounded-2xl p-3 text-primary"
            aria-label="Anhören"
          >
            <span className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_3px_0_0_var(--primary-shadow)]">
              <Headphones className="size-9" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">Antippen zum Anhören</span>
          </button>
        ) : (
          <>
            <p className={cn("text-balance", zeigeTr ? "text-2xl font-medium" : "font-serif text-3xl")} lang={zeigeTr ? "de" : "tr"}>
              {zeigeTr ? vokabel.de : vokabel.tr}
            </p>
            {!zeigeTr && <AudioKnopf text={vokabel.tr} />}
          </>
        )}
      </div>
      {art === "hoeren" && <AudioKnopf text={vokabel.tr} langsam className="self-center" />}
      <ul className="grid gap-2.5">
        {optionen.map((o) => {
          const richtig = o.id === vokabel.id;
          const istGewaehlt = gewaehlt === o.id;
          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={gesperrt}
                lang={zeigeTr ? "tr" : "de"}
                onClick={() => {
                  setGewaehlt(o.id);
                  if (zeigeTr) sprich(o.tr);
                  onAntwort({
                    ergebnis: richtig ? "richtig" : "falsch",
                    loesung: zeigeTr ? vokabel.tr : vokabel.de,
                    eingabe: o[feld],
                    audio: vokabel.tr,
                  });
                }}
                className={cn(
                  "min-h-14 w-full rounded-xl border-2 bg-card px-4 py-3 text-left text-lg transition-colors duration-150",
                  zeigeTr && "font-serif",
                  !gesperrt && "hover:border-primary hover:bg-secondary/60",
                  gesperrt && richtig && "border-primary bg-secondary",
                  gesperrt && istGewaehlt && !richtig && "border-accent bg-rose-soft",
                  gesperrt && !richtig && !istGewaehlt && "opacity-60"
                )}
              >
                {o[feld]}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Tippen DE→TR ───────────────────────────────────────── */

function Tippen({ vokabel, gesperrt, onAntwort }: Basis & { vokabel: Vokabel }) {
  const [wert, setWert] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const loesungen = [vokabel.tr, ...(vokabel.auch ?? [])];
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (gesperrt || !wert.trim()) return;
        const r = pruefe(wert, loesungen);
        onAntwort({ ergebnis: r.ergebnis, loesung: r.korrekt, eingabe: wert, audio: vokabel.tr });
        if (r.ergebnis === "richtig") sprich(vokabel.tr);
      }}
    >
      <div className="rounded-2xl bg-card p-5 text-center text-2xl font-medium shadow-sm ring-1 ring-border">{vokabel.de}</div>
      <SonderzeichenLeiste ziel={ref} onEinfuegen={setWert} />
      <label htmlFor="tipp-eingabe" className="sr-only">
        Deine Antwort auf Türkisch
      </label>
      <input
        id="tipp-eingabe"
        ref={ref}
        value={wert}
        onChange={(e) => setWert(e.target.value)}
        disabled={gesperrt}
        lang="tr"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder="Auf Türkisch …"
        className="h-14 w-full rounded-xl border-2 border-input bg-card px-4 font-serif text-xl focus:border-primary focus:outline-none"
      />
      {!gesperrt && (
        <Button type="submit" size="lg" disabled={!wert.trim()}>
          Prüfen
        </Button>
      )}
    </form>
  );
}

/* ── Satzbau ────────────────────────────────────────────── */

function Satzbau({ tr, de, extra, gesperrt, onAntwort }: Basis & { tr: string; de: string; extra?: string[] }) {
  const kacheln = useMemo(() => {
    const woerter = tr.split(/\s+/).filter(Boolean);
    let k = mischen([...woerter, ...(extra ?? [])].map((text, i) => ({ id: i, text })));
    // nicht schon in richtiger Reihenfolge anbieten
    if (k.length > 1 && k.map((x) => x.text).join(" ") === tr) k = [...k.slice(1), k[0]];
    return k;
  }, [tr, extra]);
  const [gewaehlt, setGewaehlt] = useState<number[]>([]);
  const satz = gewaehlt.map((i) => kacheln.find((k) => k.id === i)!.text).join(" ");

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-card p-4 text-center text-xl font-medium shadow-sm ring-1 ring-border">{de}</div>
      <div
        aria-label="Dein Satz"
        className="defter-linien flex min-h-24 flex-wrap content-start gap-2 rounded-xl border-2 border-dashed border-input p-3"
      >
        {gewaehlt.length === 0 && <span className="text-muted-foreground">Tippe die Wörter in der richtigen Reihenfolge an.</span>}
        {gewaehlt.map((i) => {
          const k = kacheln.find((x) => x.id === i)!;
          return (
            <button
              key={i}
              type="button"
              disabled={gesperrt}
              onClick={() => setGewaehlt((g) => g.filter((x) => x !== i))}
              className="min-h-11 rounded-lg border-2 border-primary bg-secondary px-3 font-serif text-lg"
            >
              {k.text}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Wort-Kacheln">
        {kacheln.map((k) => {
          const benutzt = gewaehlt.includes(k.id);
          return (
            <button
              key={k.id}
              type="button"
              disabled={gesperrt || benutzt}
              onClick={() => setGewaehlt((g) => [...g, k.id])}
              className={cn(
                "min-h-11 rounded-lg border-2 border-border bg-card px-3 font-serif text-lg shadow-[0_2px_0_0_var(--border)] transition-opacity",
                benutzt && "opacity-25"
              )}
            >
              {k.text}
            </button>
          );
        })}
      </div>
      {!gesperrt && (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Zurücksetzen" onClick={() => setGewaehlt([])} disabled={!gewaehlt.length}>
            <RotateCcw aria-hidden="true" />
          </Button>
          <Button
            size="lg"
            className="flex-1"
            disabled={!gewaehlt.length}
            onClick={() => {
              const r = pruefe(satz, [tr]);
              onAntwort({ ergebnis: r.ergebnis, loesung: tr, eingabe: satz, audio: tr });
              if (r.ergebnis === "richtig") sprich(tr);
            }}
          >
            Prüfen
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Lückentext ─────────────────────────────────────────── */

function Luecke({ u, gesperrt, onAntwort }: Basis & { u: Extract<Uebung, { art: "luecke" }> }) {
  const [vor, nach] = u.satz.split("___");
  const optionen = useMemo(() => mischen(u.optionen), [u.optionen]);
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const voll = u.satz.replace("___", u.loesung);
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <p className="font-serif text-2xl leading-relaxed" lang="tr">
          {vor}
          <span
            className={cn(
              "mx-0.5 inline-block min-w-12 border-b-[3px] px-1 text-center",
              gewaehlt ? (gewaehlt === u.loesung ? "border-primary text-primary" : "border-accent text-accent") : "border-input"
            )}
          >
            {gewaehlt ?? " "}
          </span>
          {nach}
        </p>
        <p className="mt-2 text-muted-foreground">{u.de}</p>
        {u.hinweis && <p className="mt-1 text-sm text-muted-foreground">Tipp: {u.hinweis}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {optionen.map((o) => (
          <button
            key={o}
            type="button"
            disabled={gesperrt}
            onClick={() => {
              setGewaehlt(o);
              onAntwort({ ergebnis: o === u.loesung ? "richtig" : "falsch", loesung: voll, eingabe: o, audio: voll });
              if (o === u.loesung) sprich(voll);
            }}
            className={cn(
              "min-h-14 rounded-xl border-2 bg-card px-3 font-serif text-xl",
              !gesperrt && "hover:border-primary hover:bg-secondary/60",
              gesperrt && o === u.loesung && "border-primary bg-secondary",
              gesperrt && gewaehlt === o && o !== u.loesung && "border-accent bg-rose-soft"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Paare zuordnen ─────────────────────────────────────── */

function Zuordnen({ vokabeln, gesperrt, onAntwort }: Basis & { vokabeln: Vokabel[] }) {
  const links = useMemo(() => mischen(vokabeln), [vokabeln]);
  const rechts = useMemo(() => mischen(vokabeln), [vokabeln]);
  const [auswahl, setAuswahl] = useState<string | null>(null);
  const [fertig, setFertig] = useState<string[]>([]);
  const [fehler, setFehler] = useState(0);
  const [wackeln, setWackeln] = useState<string | null>(null);

  function rechtsTippen(id: string) {
    if (!auswahl || gesperrt) return;
    if (auswahl === id) {
      const neu = [...fertig, id];
      setFertig(neu);
      setAuswahl(null);
      if (neu.length === vokabeln.length) {
        onAntwort({
          ergebnis: fehler === 0 ? "richtig" : fehler <= 1 ? "fast" : "falsch",
          loesung: vokabeln.map((v) => `${v.tr} = ${v.de}`).join(" · "),
          eingabe: "",
        });
      }
    } else {
      setFehler((f) => f + 1);
      setWackeln(id);
      setTimeout(() => setWackeln(null), 300);
    }
  }

  const knopf = "min-h-14 w-full rounded-xl border-2 px-3 py-2 text-left transition-colors duration-150";
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <ul className="grid gap-2.5" aria-label="Türkisch">
        {links.map((v) => {
          const ok = fertig.includes(v.id);
          return (
            <li key={v.id}>
              <button
                type="button"
                disabled={ok || gesperrt}
                aria-pressed={auswahl === v.id}
                lang="tr"
                onClick={() => {
                  setAuswahl(v.id);
                  sprich(v.tr);
                }}
                className={cn(
                  knopf,
                  "font-serif text-lg",
                  ok ? "border-primary bg-secondary opacity-70" : auswahl === v.id ? "border-primary bg-card ring-3 ring-primary/30" : "border-border bg-card"
                )}
              >
                {v.tr}
              </button>
            </li>
          );
        })}
      </ul>
      <ul className="grid gap-2.5" aria-label="Deutsch">
        {rechts.map((v) => {
          const ok = fertig.includes(v.id);
          return (
            <li key={v.id}>
              <motion.button
                type="button"
                disabled={ok || gesperrt}
                onClick={() => rechtsTippen(v.id)}
                animate={wackeln === v.id ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
                transition={{ duration: 0.28 }}
                className={cn(
                  knopf,
                  "text-base",
                  ok ? "border-primary bg-secondary opacity-70" : wackeln === v.id ? "border-accent bg-rose-soft" : "border-border bg-card"
                )}
              >
                {v.de}
              </motion.button>
            </li>
          );
        })}
      </ul>
      {!auswahl && fertig.length < vokabeln.length && (
        <p className="col-span-2 text-center text-sm text-muted-foreground">Erst links ein türkisches Wort antippen, dann rechts die Bedeutung.</p>
      )}
    </div>
  );
}
