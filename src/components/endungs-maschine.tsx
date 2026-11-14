"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { AudioKnopf } from "@/components/audio";
import { fuehlen } from "@/lib/haptik";
import { cn } from "@/lib/utils";

type Endung = "plural" | "ort" | "frage";

/** Von Hand geprüfte Formen – keine Regel-Automatik, damit nichts Falsches entsteht. */
const WOERTER: { wort: string; de: string; vokal: string; plural: string | null; ort: string; frage: string; hart?: string }[] = [
  { wort: "ev", de: "Haus", vokal: "e", plural: "evler", ort: "evde", frage: "ev mi" },
  { wort: "okul", de: "Schule", vokal: "u", plural: "okullar", ort: "okulda", frage: "okul mu" },
  { wort: "köpek", de: "Hund", vokal: "e", plural: "köpekler", ort: "köpekte", frage: "köpek mi", hart: "k" },
  { wort: "kız", de: "Mädchen", vokal: "ı", plural: "kızlar", ort: "kızda", frage: "kız mı" },
  { wort: "göz", de: "Auge", vokal: "ö", plural: "gözler", ort: "gözde", frage: "göz mü" },
  { wort: "araba", de: "Auto", vokal: "a", plural: "arabalar", ort: "arabada", frage: "araba mı" },
  { wort: "kitap", de: "Buch", vokal: "a", plural: "kitaplar", ort: "kitapta", frage: "kitap mı", hart: "p" },
  { wort: "süt", de: "Milch", vokal: "ü", plural: "sütler", ort: "sütte", frage: "süt mü", hart: "t" },
  { wort: "Garbsen", de: "Garbsen", vokal: "e", plural: null, ort: "Garbsen'de", frage: "Garbsen mi" },
];

const ENDUNGEN: { wert: Endung; label: string; de: string }[] = [
  { wert: "plural", label: "-ler / -lar", de: "Mehrzahl" },
  { wert: "ort", label: "-de / -da", de: "in / bei" },
  { wert: "frage", label: "mi / mı / mu / mü", de: "Frage" },
];

const HELL = ["e", "i", "ö", "ü"];
const VOKALE = [
  ["a", "ı", "o", "u"],
  ["e", "i", "ö", "ü"],
];

/** Für „mi“: e,i → i · a,ı → ı · o,u → u · ö,ü → ü */
const FRAGE_VOKAL: Record<string, string> = { e: "i", i: "i", a: "ı", ı: "ı", o: "u", u: "u", ö: "ü", ü: "ü" };

function erklaerung(w: (typeof WOERTER)[number], e: Endung): string {
  const hell = HELL.includes(w.vokal);
  if (e === "plural") return `Letzter Vokal „${w.vokal}“ ist ${hell ? "hell" : "dunkel"} → ${hell ? "-ler" : "-lar"}`;
  if (e === "ort") {
    const basis = `„${w.vokal}“ ist ${hell ? "hell" : "dunkel"} → ${hell ? "e" : "a"}`;
    return w.hart ? `${basis}. Endet auf „${w.hart}“ (Fıstıkçı Şahap) → d wird t` : basis;
  }
  return `4er-Harmonie: „${w.vokal}“ → m${FRAGE_VOKAL[w.vokal]}. Die Frage steht als eigenes Wort.`;
}

export function EndungsMaschine() {
  const reduziert = useReducedMotion();
  const [wi, setWi] = useState(0);
  const [endung, setEndung] = useState<Endung>("plural");
  const w = WOERTER[wi];
  const aktivEndung = endung === "plural" && !w.plural ? "ort" : endung;
  const form = aktivEndung === "plural" ? w.plural! : aktivEndung === "ort" ? w.ort : w.frage;
  const anhang = form.slice(w.wort.length);
  const letzterVokalIndex = w.wort.toLocaleLowerCase("tr-TR").lastIndexOf(w.vokal);
  const zielVokal = aktivEndung === "frage" ? FRAGE_VOKAL[w.vokal] : HELL.includes(w.vokal) ? "e" : "a";

  return (
    <section aria-labelledby="endungen-titel" className="mt-5 overflow-hidden rounded-3xl bg-card ring-1 ring-border">
      <div className="bg-secondary px-4 pt-4 pb-3">
        <h2 id="endungen-titel" className="text-xl font-semibold text-secondary-foreground">
          Endungs-Maschine
        </h2>
        <p className="text-sm text-secondary-foreground/80">Wähle ein Wort und eine Endung. Der letzte Vokal entscheidet.</p>
      </div>

      <div className="p-4">
        <ul className="flex flex-wrap gap-1.5" aria-label="Wort wählen">
          {WOERTER.map((x, i) => (
            <li key={x.wort}>
              <button
                type="button"
                aria-pressed={i === wi}
                onClick={() => {
                  setWi(i);
                  fuehlen("tipp");
                }}
                className={cn(
                  "min-h-11 rounded-full border-2 px-3.5 font-serif text-lg transition-colors",
                  i === wi ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"
                )}
              >
                {x.wort}
              </button>
            </li>
          ))}
        </ul>

        <div role="radiogroup" aria-label="Endung wählen" className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
          {ENDUNGEN.map((e) => {
            const an = aktivEndung === e.wert;
            const gesperrt = e.wert === "plural" && !w.plural;
            return (
              <button
                key={e.wert}
                type="button"
                role="radio"
                aria-checked={an}
                disabled={gesperrt}
                onClick={() => {
                  setEndung(e.wert);
                  fuehlen("tipp");
                }}
                className="relative flex min-h-12 flex-col items-center justify-center rounded-xl px-1 text-center disabled:opacity-40"
              >
                {an && <motion.span layoutId="endung-wahl" className="absolute inset-0 rounded-xl bg-card shadow-sm ring-1 ring-border" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative text-xs font-semibold">{e.de}</span>
                <span className="relative text-[0.7rem] text-muted-foreground">{e.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bühne */}
        <div className="defter-linien mt-4 flex min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-2 py-5">
          <p lang="tr" className="flex items-baseline font-serif text-[2.6rem] leading-none font-medium" aria-live="polite" aria-label={form}>
            {w.wort.split("").map((ch, i) => (
              <span key={`${w.wort}-${i}`} className="relative inline-block">
                {i === letzterVokalIndex && (
                  <motion.span
                    layoutId={reduziert ? undefined : "vokal-ring"}
                    aria-hidden="true"
                    className="absolute -inset-x-1 -inset-y-0.5 rounded-lg bg-safran-soft ring-2 ring-safran"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{ch}</span>
              </span>
            ))}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={form}
                initial={reduziert ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduziert ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                className="inline-block whitespace-pre text-accent"
              >
                {anhang}
              </motion.span>
            </AnimatePresence>
            <AudioKnopf text={aktivEndung === "frage" ? `${form}?` : form} className="ml-2 self-center" />
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{w.de}</p>
        </div>

        <motion.p key={`${wi}-${aktivEndung}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-start gap-2 text-[0.97rem]">
          <ArrowRight className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
          {erklaerung(w, aktivEndung)}
        </motion.p>

        {/* Vokal-Tabelle */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center" aria-hidden="true">
          {VOKALE.map((reihe, r) => (
            <div key={r} className={cn("rounded-xl p-2 ring-1 ring-border", r === 0 ? "bg-muted/60" : "bg-background")}>
              <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">{r === 0 ? "dunkel" : "hell"}</p>
              <div className="flex justify-center gap-1">
                {reihe.map((v) => {
                  const quelle = v === w.vokal;
                  const ziel = v === zielVokal;
                  return (
                    <span
                      key={v}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg font-serif text-xl transition-all duration-300",
                        quelle && "bg-safran-soft ring-2 ring-safran",
                        ziel && !quelle && "bg-rose-soft text-accent ring-2 ring-accent",
                        ziel && quelle && "text-accent"
                      )}
                    >
                      {v}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="rounded bg-safran-soft px-1 ring-1 ring-safran">gelb</span> = letzter Vokal im Wort ·{" "}
          <span className="rounded bg-rose-soft px-1 text-accent ring-1 ring-accent">rosa</span> = Vokal in der Endung
        </p>
      </div>
    </section>
  );
}
