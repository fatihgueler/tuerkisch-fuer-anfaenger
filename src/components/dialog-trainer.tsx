"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Ear, Eye, EyeOff, Mic, Play, Square, Turtle, Users } from "lucide-react";
import { sprich, stopp } from "@/lib/speech";
import { fuehlen } from "@/lib/haptik";
import { AudioKnopf } from "@/components/audio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Zeile = { sprecher: string; tr: string; de: string };
type Modus = "hoeren" | "nachsprechen" | "rolle";

const TONHOEHE: Record<string, number> = { Pasha: 0.8, Sherin: 1.1 };

const MODI: { wert: Modus; label: string; icon: typeof Ear; info: string }[] = [
  { wert: "hoeren", label: "Anhören", icon: Ear, info: "Der ganze Dialog am Stück." },
  { wert: "nachsprechen", label: "Nachsprechen", icon: Mic, info: "Nach jeder Zeile eine Pause – sprich laut nach (Shadowing)." },
  { wert: "rolle", label: "Rollenspiel", icon: Users, info: "" },
];

/** Pausenlänge zum Nachsprechen: grob so lang wie der Satz selbst, plus Luft. */
function pausenDauer(text: string, langsam: boolean) {
  return Math.round((1400 + text.length * 85) * (langsam ? 1.35 : 1));
}

/**
 * Dialog mit drei Modi: anhören, Zeile für Zeile nachsprechen, Rollenspiel
 * (eigene Rolle ist verdeckt, nur Deutsch als Stichwort – erst selbst sagen, dann hören).
 */
export function DialogTrainer({ titel, zeilen }: { titel: string; zeilen: Zeile[] }) {
  const reduziert = useReducedMotion();
  const sprecher = Array.from(new Set(zeilen.map((z) => z.sprecher)));
  const rolle = sprecher.includes("Sherin") ? "Sherin" : (sprecher[1] ?? sprecher[0]);

  const [modus, setModus] = useState<Modus>("hoeren");
  const [langsam, setLangsam] = useState(false);
  const [uebersetzung, setUebersetzung] = useState(true);
  const [aktiv, setAktiv] = useState<number | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  const [pause, setPause] = useState<{ i: number; dauer: number; art: "nach" | "du" } | null>(null);
  const [aufgedeckt, setAufgedeckt] = useState<Set<number>>(new Set());

  const abbruch = useRef(false);
  const weiterRef = useRef<(() => void) | null>(null);
  const zeilenRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(
    () => () => {
      abbruch.current = true;
      stopp();
    },
    []
  );

  // Aktive Zeile sichtbar halten
  useEffect(() => {
    if (aktiv === null) return;
    zeilenRefs.current[aktiv]?.scrollIntoView({ block: "nearest", behavior: reduziert ? "auto" : "smooth" });
  }, [aktiv, reduziert]);

  function warte(ms: number) {
    return new Promise<void>((resolve) => {
      const t = setTimeout(fertig, ms);
      function fertig() {
        clearTimeout(t);
        weiterRef.current = null;
        resolve();
      }
      weiterRef.current = fertig;
    });
  }

  function beenden() {
    abbruch.current = true;
    weiterRef.current?.();
    stopp();
    setLaeuft(false);
    setAktiv(null);
    setPause(null);
  }

  async function start() {
    if (laeuft) return beenden();
    abbruch.current = false;
    setLaeuft(true);
    setAufgedeckt(new Set());
    for (let i = 0; i < zeilen.length; i++) {
      if (abbruch.current) break;
      const z = zeilen[i];
      setAktiv(i);
      const ton = TONHOEHE[z.sprecher] ?? 1.25;
      if (modus === "rolle" && z.sprecher === rolle) {
        // Erst selbst sagen …
        const dauer = pausenDauer(z.tr, true) + 1200;
        setPause({ i, dauer, art: "du" });
        fuehlen("tipp");
        await warte(dauer);
        setPause(null);
        if (abbruch.current) break;
        // … dann aufdecken und das Original hören
        setAufgedeckt((a) => new Set(a).add(i));
        await sprich(z.tr, { tonhoehe: ton, langsam });
        await warte(500);
      } else {
        await sprich(z.tr, { tonhoehe: ton, langsam });
        if (abbruch.current) break;
        if (modus === "nachsprechen") {
          const dauer = pausenDauer(z.tr, langsam);
          setPause({ i, dauer, art: "nach" });
          await warte(dauer);
          setPause(null);
        } else {
          await warte(250);
        }
      }
    }
    if (!abbruch.current) {
      setAktiv(null);
      setLaeuft(false);
      setAufgedeckt(new Set(zeilen.keys()));
      fuehlen("richtig");
    }
  }

  const info = modus === "rolle" ? `Du bist ${rolle}. Deine Zeilen sind verdeckt – sag sie zuerst selbst, dann hörst du das Original.` : MODI.find((m) => m.wert === modus)?.info;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold">Dialog</h2>
        <p className="font-hand text-2xl text-accent">{titel}</p>
      </div>

      <div role="radiogroup" aria-label="Übungsart" className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
        {MODI.map(({ wert, label, icon: Icon }) => {
          const an = modus === wert;
          return (
            <button
              key={wert}
              type="button"
              role="radio"
              aria-checked={an}
              disabled={laeuft}
              onClick={() => {
                setModus(wert);
                setAufgedeckt(new Set());
              }}
              className={cn(
                "relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-xs font-medium transition-colors disabled:opacity-60",
                an ? "text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {an && (
                <motion.span
                  layoutId="dialog-modus"
                  className="absolute inset-0 rounded-xl bg-card shadow-sm ring-1 ring-border"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="relative size-5" aria-hidden="true" />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>
      <p className="-mt-1 text-sm text-muted-foreground">{info}</p>

      <div className="flex flex-wrap gap-2">
        <Button variant={laeuft ? "akzent" : "default"} onClick={start} className="flex-1">
          {laeuft ? <Square aria-hidden="true" /> : <Play aria-hidden="true" />}
          {laeuft ? "Stopp" : modus === "hoeren" ? "Abspielen" : modus === "nachsprechen" ? "Nachsprechen starten" : "Rollenspiel starten"}
        </Button>
        <Button variant="outline" size="icon" onClick={() => setLangsam((l) => !l)} aria-pressed={langsam} aria-label="Langsam sprechen" className={cn(langsam && "border-primary bg-secondary")}>
          <Turtle aria-hidden="true" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setUebersetzung((u) => !u)} aria-pressed={!uebersetzung} aria-label={uebersetzung ? "Deutsch ausblenden" : "Deutsch zeigen"}>
          {uebersetzung ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>

      <ol className="flex flex-col gap-3">
        {zeilen.map((z, i) => {
          const sherin = z.sprecher === rolle;
          const verdeckt = modus === "rolle" && sherin && !aufgedeckt.has(i);
          const istAktiv = aktiv === i;
          const pauseHier = pause?.i === i ? pause : null;
          return (
            <li
              key={i}
              ref={(el) => {
                zeilenRefs.current[i] = el;
              }}
              className={cn("flex scroll-my-24", sherin ? "justify-end" : "justify-start")}
            >
              <motion.div
                animate={{ scale: istAktiv && !reduziert ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className={cn(
                  "relative max-w-[88%] overflow-hidden rounded-2xl p-3 ring-1 transition-shadow duration-200",
                  sherin ? "rounded-br-sm bg-secondary ring-primary/20" : "rounded-bl-sm bg-card ring-border",
                  istAktiv && "shadow-[0_0_0_3px_var(--safran)]",
                  laeuft && !istAktiv && "opacity-70"
                )}
              >
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {z.sprecher}
                  {verdeckt && " · du"}
                </p>
                <AnimatePresence mode="wait" initial={false}>
                  {verdeckt ? (
                    <motion.div key="verdeckt" exit={{ opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.2 }}>
                      <p className="text-lg leading-snug font-medium">{z.de}</p>
                      <button
                        type="button"
                        onClick={() => setAufgedeckt((a) => new Set(a).add(i))}
                        className="mt-1 min-h-11 text-sm font-medium text-primary underline underline-offset-4"
                      >
                        Türkisch zeigen
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="offen" initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.25 }}>
                      <div className="flex items-start gap-2">
                        <p lang="tr" className="flex-1 font-serif text-lg leading-snug">
                          {z.tr}
                        </p>
                        <AudioKnopf text={z.tr} className="-mt-1 -mr-1" />
                      </div>
                      {uebersetzung && <p className="mt-1 text-[0.95rem] text-muted-foreground">{z.de}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {pauseHier && (
                  <button
                    type="button"
                    onClick={() => weiterRef.current?.()}
                    className="mt-2 flex min-h-11 w-full flex-col gap-1.5 text-left"
                    aria-label="Weiter zur nächsten Zeile"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-accent">
                      <Mic className="size-4" aria-hidden="true" />
                      {pauseHier.art === "du" ? "Du bist dran – sag es auf Türkisch!" : "Jetzt du – sprich nach!"}
                      <span className="ml-auto text-xs font-normal text-muted-foreground">tippen = weiter</span>
                    </span>
                    <span className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <motion.span
                        key={`${pauseHier.i}-${pauseHier.art}`}
                        className="block h-full origin-left rounded-full bg-accent"
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: pauseHier.dauer / 1000, ease: "linear" }}
                      />
                    </span>
                  </button>
                )}
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
