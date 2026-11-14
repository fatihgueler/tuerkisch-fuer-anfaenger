"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";
import type { Ergebnis } from "@/lib/check";
import { bewerte, neueKarte, type Karte } from "@/lib/leitner";
import { heuteISO } from "@/lib/datum";

export const SPEICHER_KEY = "sherin-turkce-v1";
export const SPEICHER_VERSION = 1;

export type LektionsStand = {
  schritt: number;
  erledigt: number[];
  wortIndex: number;
  uebungIndex: number;
  uebungRichtig: number;
  warmupIds?: string[];
  warmupIndex: number;
  extra?: boolean;
  fertigAm?: string;
};

export type SonntagsErgebnis = {
  prozent: number;
  datum: string;
  falsche: { frage: string; loesung: string; antwort: string }[];
  sprech: boolean[];
};

export type Aktivitaet = "lektion" | "kurz" | "sonntag";

export type Einstellungen = { theme: "system" | "hell" | "dunkel"; tempo: number };

type Daten = {
  karten: Record<string, Karte>;
  fehlerkiste: string[];
  lektionen: Record<string, LektionsStand>;
  sonntag: Record<string, SonntagsErgebnis>;
  aktiveTage: Record<string, Aktivitaet>;
  einstellungen: Einstellungen;
  hinweise: { iosHomescreen?: boolean; backupAm?: string };
};

type Aktionen = {
  lektionAktualisieren: (key: string, teil: Partial<LektionsStand>) => void;
  schrittErledigt: (key: string, schritt: number) => void;
  lektionAbschliessen: (key: string) => void;
  kartenHinzufuegen: (ids: string[]) => void;
  karteBewerten: (id: string, ergebnis: Ergebnis) => void;
  sonntagSpeichern: (woche: number, e: SonntagsErgebnis, falscheIds: string[], richtigeIds: string[]) => void;
  sonntagSprech: (woche: number, i: number, wert: boolean) => void;
  tagAktiv: (a: Aktivitaet) => void;
  einstellungSetzen: (e: Partial<Einstellungen>) => void;
  hinweisSetzen: (h: Partial<Daten["hinweise"]>) => void;
  allesErsetzen: (d: Daten) => void;
};

export type Fortschritt = Daten & Aktionen;

const leer: Daten = {
  karten: {},
  fehlerkiste: [],
  lektionen: {},
  sonntag: {},
  aktiveTage: {},
  einstellungen: { theme: "system", tempo: 0.9 },
  hinweise: {},
};

export const leererStand = (): LektionsStand => ({ schritt: 0, erledigt: [], wortIndex: 0, uebungIndex: 0, uebungRichtig: 0, warmupIndex: 0 });

const RANG: Record<Aktivitaet, number> = { kurz: 1, lektion: 2, sonntag: 3 };

export const useFortschritt = create<Fortschritt>()(
  persist(
    (set) => ({
      ...leer,
      lektionAktualisieren: (key, teil) =>
        set((s) => ({ lektionen: { ...s.lektionen, [key]: { ...(s.lektionen[key] ?? leererStand()), ...teil } } })),
      schrittErledigt: (key, schritt) =>
        set((s) => {
          const alt = s.lektionen[key] ?? leererStand();
          if (alt.erledigt.includes(schritt)) return {};
          return { lektionen: { ...s.lektionen, [key]: { ...alt, erledigt: [...alt.erledigt, schritt].sort() } } };
        }),
      lektionAbschliessen: (key) =>
        set((s) => {
          const heute = heuteISO();
          const alt = s.lektionen[key] ?? leererStand();
          return {
            lektionen: { ...s.lektionen, [key]: { ...alt, fertigAm: alt.fertigAm ?? heute, erledigt: [0, 1, 2, 3, 4, 5, 6] } },
            aktiveTage: mitAktivitaet(s.aktiveTage, heute, "lektion"),
          };
        }),
      kartenHinzufuegen: (ids) =>
        set((s) => {
          const heute = heuteISO();
          const karten = { ...s.karten };
          for (const id of ids) if (!karten[id]) karten[id] = neueKarte(heute);
          return { karten };
        }),
      karteBewerten: (id, ergebnis) =>
        set((s) => {
          const heute = heuteISO();
          const k = s.karten[id] ?? neueKarte(heute);
          const fehlerkiste = ergebnis === "richtig" ? s.fehlerkiste.filter((f) => f !== id) : s.fehlerkiste;
          return { karten: { ...s.karten, [id]: bewerte(k, ergebnis, heute) }, fehlerkiste };
        }),
      sonntagSpeichern: (woche, e, falscheIds, richtigeIds) =>
        set((s) => {
          const heute = heuteISO();
          const karten = { ...s.karten };
          for (const id of falscheIds) karten[id] = bewerte(karten[id] ?? neueKarte(heute), "falsch", heute);
          for (const id of richtigeIds) if (karten[id]) karten[id] = bewerte(karten[id], "richtig", heute);
          const kiste = new Set(s.fehlerkiste.filter((id) => !richtigeIds.includes(id)));
          for (const id of falscheIds) kiste.add(id);
          return {
            sonntag: { ...s.sonntag, [woche]: e },
            karten,
            fehlerkiste: [...kiste],
            aktiveTage: mitAktivitaet(s.aktiveTage, heute, "sonntag"),
          };
        }),
      sonntagSprech: (woche, i, wert) =>
        set((s) => {
          const e = s.sonntag[woche];
          if (!e) return {};
          const sprech = [...e.sprech];
          sprech[i] = wert;
          return { sonntag: { ...s.sonntag, [woche]: { ...e, sprech } } };
        }),
      tagAktiv: (a) => set((s) => ({ aktiveTage: mitAktivitaet(s.aktiveTage, heuteISO(), a) })),
      einstellungSetzen: (e) => set((s) => ({ einstellungen: { ...s.einstellungen, ...e } })),
      hinweisSetzen: (h) => set((s) => ({ hinweise: { ...s.hinweise, ...h } })),
      allesErsetzen: (d) => set(() => ({ ...leer, ...d })),
    }),
    {
      name: SPEICHER_KEY,
      version: SPEICHER_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): Daten => ({
        karten: s.karten,
        fehlerkiste: s.fehlerkiste,
        lektionen: s.lektionen,
        sonntag: s.sonntag,
        aktiveTage: s.aktiveTage,
        einstellungen: s.einstellungen,
        hinweise: s.hinweise,
      }),
      // Spätere Versionen: hier alte Stände umbauen (if (version < 2) …)
      migrate: (alt) => ({ ...leer, ...(alt as Partial<Daten>) }),
    }
  )
);

function mitAktivitaet(tage: Record<string, Aktivitaet>, tag: string, a: Aktivitaet) {
  const alt = tage[tag];
  if (alt && RANG[alt] >= RANG[a]) return tage;
  return { ...tage, [tag]: a };
}

/** true, sobald der localStorage-Stand geladen ist (verhindert Hydration-Sprünge). */
export function useGeladen(): boolean {
  const [geladen, setGeladen] = useState(false);
  useEffect(() => {
    if (useFortschritt.persist.hasHydrated()) setGeladen(true);
    return useFortschritt.persist.onFinishHydration(() => setGeladen(true));
  }, []);
  return geladen;
}

/* ── Backup ─────────────────────────────────────────────── */

const KarteSchema = z.object({ fach: z.number().int().min(1).max(5), faellig: z.string(), gesehen: z.number().optional() });
const StandSchema = z.object({
  schritt: z.number(),
  erledigt: z.array(z.number()),
  wortIndex: z.number(),
  uebungIndex: z.number(),
  uebungRichtig: z.number(),
  warmupIds: z.array(z.string()).optional(),
  warmupIndex: z.number(),
  extra: z.boolean().optional(),
  fertigAm: z.string().optional(),
});
export const BackupSchema = z.object({
  app: z.literal("sherin-turkce"),
  version: z.number(),
  erstellt: z.string(),
  daten: z.object({
    karten: z.record(z.string(), KarteSchema),
    fehlerkiste: z.array(z.string()),
    lektionen: z.record(z.string(), StandSchema),
    sonntag: z.record(
      z.string(),
      z.object({
        prozent: z.number(),
        datum: z.string(),
        falsche: z.array(z.object({ frage: z.string(), loesung: z.string(), antwort: z.string() })),
        sprech: z.array(z.boolean()),
      })
    ),
    aktiveTage: z.record(z.string(), z.enum(["lektion", "kurz", "sonntag"])),
    einstellungen: z.object({ theme: z.enum(["system", "hell", "dunkel"]), tempo: z.number() }),
    hinweise: z.object({ iosHomescreen: z.boolean().optional(), backupAm: z.string().optional() }),
  }),
});

export function backupErstellen(s: Fortschritt) {
  return {
    app: "sherin-turkce" as const,
    version: SPEICHER_VERSION,
    erstellt: new Date().toISOString(),
    daten: {
      karten: s.karten,
      fehlerkiste: s.fehlerkiste,
      lektionen: s.lektionen,
      sonntag: s.sonntag,
      aktiveTage: s.aktiveTage,
      einstellungen: s.einstellungen,
      hinweise: s.hinweise,
    },
  };
}
