"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type Ergebnis } from "@/lib/check";
import { vergleicheWoerter, type WortTeil } from "@/lib/wortvergleich";
import { fuehlen } from "@/lib/haptik";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Erkennung = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function erkennungKlasse(): (new () => Erkennung) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Erkennung; webkitSpeechRecognition?: new () => Erkennung };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const BEWERTUNG: { wert: Ergebnis; label: string }[] = [
  { wert: "richtig", label: "Gut" },
  { wert: "fast", label: "Fast" },
  { wert: "falsch", label: "Nochmal" },
];

/** Nachsprechen: Spracherkennung (tr-TR), sonst Aufnahme + Selbstbewertung. */
export function Nachsprechen({ ziel, onBewertet, ohneBewertung }: { ziel: string; onBewertet?: (e: Ergebnis) => void; ohneBewertung?: boolean }) {
  const [modus, setModus] = useState<"erkennung" | "aufnahme" | "keins" | null>(null);
  const [aktiv, setAktiv] = useState(false);
  const [erkannt, setErkannt] = useState<string | null>(null);
  const [teile, setTeile] = useState<WortTeil[] | null>(null);
  const reduziert = useReducedMotion();
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null);
  const [aufnahmeUrl, setAufnahmeUrl] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const erkRef = useRef<Erkennung | null>(null);

  useEffect(() => {
    if (erkennungKlasse()) setModus("erkennung");
    else if (typeof MediaRecorder !== "undefined" && "mediaDevices" in navigator) setModus("aufnahme");
    else setModus("keins");
  }, []);

  useEffect(() => () => {
    if (aufnahmeUrl) URL.revokeObjectURL(aufnahmeUrl);
  }, [aufnahmeUrl]);

  function bewerten(e: Ergebnis) {
    setErgebnis(e);
    onBewertet?.(e);
  }

  function starteErkennung() {
    const K = erkennungKlasse();
    if (!K) return setModus("aufnahme");
    const r = new K();
    r.lang = "tr-TR";
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onresult = (e) => {
      const alternativen = Array.from(e.results[0] ?? []).map((a) => a.transcript);
      // Die Alternative nehmen, die am besten zum Zielsatz passt
      const bewertet = alternativen.map((a) => ({ a, v: vergleicheWoerter(ziel, a) }));
      bewertet.sort((x, y) => y.v.anteil - x.v.anteil);
      const beste = bewertet[0];
      setErkannt(beste?.a ?? "");
      setTeile(beste?.v.teile ?? null);
      const erg = beste?.v.ergebnis ?? "falsch";
      fuehlen(erg === "falsch" ? "falsch" : "richtig");
      bewerten(erg);
    };
    r.onerror = () => {
      setAktiv(false);
      // z. B. keine Berechtigung → auf Aufnahme ausweichen
      setModus(typeof MediaRecorder !== "undefined" ? "aufnahme" : "keins");
    };
    r.onend = () => setAktiv(false);
    erkRef.current = r;
    setErkannt(null);
    setTeile(null);
    setErgebnis(null);
    setAktiv(true);
    fuehlen("tipp");
    r.start();
  }

  async function starteAufnahme() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const teile: Blob[] = [];
      rec.ondataavailable = (e) => teile.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setAufnahmeUrl(URL.createObjectURL(new Blob(teile, { type: rec.mimeType })));
        setAktiv(false);
      };
      recRef.current = rec;
      setAufnahmeUrl(null);
      setErgebnis(null);
      rec.start();
      setAktiv(true);
    } catch {
      setModus("keins");
    }
  }

  if (modus === null) return null;

  return (
    <div className="space-y-3 rounded-xl bg-muted/70 p-3">
      {modus !== "keins" && (
        <div className="flex flex-wrap items-center gap-2">
          {modus === "erkennung" ? (
            <Button variant={aktiv ? "akzent" : "outline"} onClick={() => (aktiv ? erkRef.current?.stop() : starteErkennung())}>
              <Mic aria-hidden="true" /> {aktiv ? "Fertig" : erkannt !== null ? "Nochmal sprechen" : "Nachsprechen"}
            </Button>
          ) : (
            <Button variant={aktiv ? "akzent" : "outline"} onClick={() => (aktiv ? recRef.current?.stop() : starteAufnahme())}>
              {aktiv ? <Square aria-hidden="true" /> : <Mic aria-hidden="true" />}
              {aktiv ? "Aufnahme stoppen" : "Aufnehmen"}
            </Button>
          )}
          {aufnahmeUrl && (
            <Button variant="ghost" onClick={() => new Audio(aufnahmeUrl).play()}>
              <Play aria-hidden="true" /> Mich anhören
            </Button>
          )}
        </div>
      )}
      {aktiv && modus === "erkennung" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <span className="flex h-5 items-end gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-1 rounded-full bg-accent"
                animate={reduziert ? { height: 10 } : { height: [6, 18, 8, 14, 6] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </span>
          Sprich jetzt – ich höre zu.
        </div>
      )}
      {erkannt !== null && teile && (
        <div aria-live="polite">
          <p className="mb-1 text-sm text-muted-foreground">So kam es an:</p>
          <p lang="tr" className="font-serif text-xl leading-relaxed">
            {teile.map((t, i) =>
              t.status === null ? (
                <span key={i}>{t.text}</span>
              ) : (
                <motion.span
                  key={i}
                  initial={reduziert ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className={cn(
                    "inline-block rounded-md px-1 underline decoration-2 underline-offset-4",
                    t.status === "ok" && "bg-secondary text-secondary-foreground decoration-primary",
                    t.status === "fast" && "bg-safran-soft text-foreground decoration-safran decoration-wavy",
                    t.status === "fehlt" && "bg-rose-soft text-foreground decoration-accent decoration-dotted"
                  )}
                >
                  {t.text}
                </motion.span>
              )
            )}
          </p>
          <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
            <span><span className="text-primary">━</span> gut</span>
            <span><span className="text-safran">∼</span> fast</span>
            <span><span className="text-accent">┈</span> nicht gehört</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Gehört: <span lang="tr">„{erkannt || "…"}“</span>
          </p>
        </div>
      )}
      {!ohneBewertung && (modus !== "erkennung" || erkannt !== null) && (
        <div>
          <p className="mb-1.5 text-sm text-muted-foreground">
            {modus === "erkennung" ? "Mein Vorschlag ist markiert – du entscheidest:" : "Vergleiche mit dem Original – wie war's?"}
          </p>
          <div className="flex gap-2" role="group" aria-label="Selbst bewerten">
            {BEWERTUNG.map((b) => (
              <button
                key={b.wert}
                type="button"
                aria-pressed={ergebnis === b.wert}
                onClick={() => bewerten(b.wert)}
                className={cn(
                  "min-h-11 flex-1 rounded-lg border-2 px-2 text-sm font-medium transition-colors",
                  ergebnis === b.wert
                    ? b.wert === "falsch"
                      ? "border-accent bg-rose-soft"
                      : "border-primary bg-secondary"
                    : "border-border bg-card hover:bg-muted"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
