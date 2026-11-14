// Nur in Server-Komponenten verwenden (lädt die Wochen-JSONs).
import { cache } from "react";
import { NotizenSchema, WocheSchema, type Lektion, type Vokabel, type Woche } from "./schema";
import notizenRoh from "./notizen-von-pasha.json";
import { LETZTE_WOCHE } from "@/lib/datum";

/** Lädt eine Woche (woche-NN.json), falls vorhanden. Neue Dateien werden automatisch gefunden. */
export const ladeWoche = cache(async (n: number): Promise<Woche | null> => {
  let roh: unknown;
  try {
    roh = (await import(`./wochen/woche-${String(n).padStart(2, "0")}.json`)).default;
  } catch {
    return null;
  }
  return WocheSchema.parse(roh);
});

export const alleWochen = cache(async (): Promise<Woche[]> => {
  const wochen = await Promise.all(Array.from({ length: LETZTE_WOCHE + 1 }, (_, i) => ladeWoche(i)));
  return wochen.filter((w): w is Woche => w !== null);
});

export async function ladeLektion(woche: number, tag: number): Promise<Lektion | null> {
  return (await ladeWoche(woche))?.lektionen.find((l) => l.tag === tag) ?? null;
}

/** Alle Vokabeln bis einschließlich Woche `bis` */
export async function vokabelIndex(bis = LETZTE_WOCHE): Promise<Record<string, Vokabel>> {
  const index: Record<string, Vokabel> = {};
  for (const w of await alleWochen()) {
    if (w.woche > bis) continue;
    for (const l of w.lektionen) for (const v of l.vokabeln) index[v.id] = v;
  }
  return index;
}

export type LektionKurz = Pick<Lektion, "woche" | "tag" | "titel" | "kannZiel" | "alltagssatz"> & { vokabelIds: string[] };
export type WocheKurz = { woche: number; lektionen: LektionKurz[] };

export async function uebersicht(): Promise<WocheKurz[]> {
  return (await alleWochen()).map((w) => ({
    woche: w.woche,
    lektionen: w.lektionen.map((l) => ({
      woche: l.woche,
      tag: l.tag,
      titel: l.titel,
      kannZiel: l.kannZiel,
      alltagssatz: l.alltagssatz,
      vokabelIds: l.vokabeln.map((v) => v.id),
    })),
  }));
}

/** Pashas Notizen – Platzhalter ({{…}}) werden nicht angezeigt. */
export function notizenVonPasha(): Record<string, string> {
  const n = NotizenSchema.parse(notizenRoh);
  return Object.fromEntries(Object.entries(n).filter(([, t]) => t.trim() && !t.includes("{{")));
}
