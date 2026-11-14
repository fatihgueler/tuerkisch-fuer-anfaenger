import { sherin } from "@/config/sherin";
import { plusTage, wochenSchluessel } from "@/lib/datum";

export type SerienInfo = { laenge: number; heuteAktiv: boolean; jokerBenutzt: boolean };

/** Serie = aufeinanderfolgende aktive Tage. 1 Joker pro Lernwoche überbrückt einen fehlenden Tag.
 *  Heute zählt erst, wenn etwas gemacht wurde – ein offener heutiger Tag bricht nichts. */
export function berechneSerie(aktiveTage: Record<string, unknown>, heute: string): SerienInfo {
  const heuteAktiv = !!aktiveTage[heute];
  const joker = new Set<number>();
  let laenge = 0;
  let tag = heuteAktiv ? heute : plusTage(heute, -1);
  while (tag >= sherin.startDatum) {
    if (aktiveTage[tag]) laenge++;
    else {
      const w = wochenSchluessel(tag);
      if (joker.has(w)) break;
      joker.add(w);
    }
    tag = plusTage(tag, -1);
  }
  return { laenge, heuteAktiv, jokerBenutzt: laenge > 0 && joker.has(wochenSchluessel(heute)) };
}
