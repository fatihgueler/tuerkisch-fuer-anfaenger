"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play } from "lucide-react";
import { pruefe, type Ergebnis } from "@/lib/check";
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
export function Nachsprechen({ ziel, onBewertet }: { ziel: string; onBewertet?: (e: Ergebnis) => void }) {
  const [modus, setModus] = useState<"erkennung" | "aufnahme" | "keins" | null>(null);
  const [aktiv, setAktiv] = useState(false);
  const [erkannt, setErkannt] = useState<string | null>(null);
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
      const beste = alternativen.find((a) => pruefe(a, [ziel]).ergebnis !== "falsch") ?? alternativen[0] ?? "";
      setErkannt(beste);
      bewerten(pruefe(beste, [ziel]).ergebnis);
    };
    r.onerror = () => {
      setAktiv(false);
      // z. B. keine Berechtigung → auf Aufnahme ausweichen
      setModus(typeof MediaRecorder !== "undefined" ? "aufnahme" : "keins");
    };
    r.onend = () => setAktiv(false);
    erkRef.current = r;
    setErkannt(null);
    setErgebnis(null);
    setAktiv(true);
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
              <Mic aria-hidden="true" /> {aktiv ? "Ich höre zu …" : "Nachsprechen"}
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
      {erkannt !== null && (
        <p className="text-sm">
          Erkannt: <span className="font-serif text-base">„{erkannt || "…"}“</span>
        </p>
      )}
      {(modus !== "erkennung" || erkannt !== null) && (
        <div>
          <p className="mb-1.5 text-sm text-muted-foreground">
            {modus === "erkennung" ? "Stimmt das? Du entscheidest:" : "Vergleiche mit dem Original – wie war's?"}
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
