import type { Ergebnis } from "@/lib/check";
import { plusTage } from "@/lib/datum";

export const INTERVALLE = [1, 2, 4, 8, 16] as const;
export const AUFWAERM_LIMIT = 15;

export type Karte = { fach: number; faellig: string; gesehen?: number };

export function neueKarte(heute: string): Karte {
  return { fach: 1, faellig: plusTage(heute, 1), gesehen: 0 };
}

export function bewerte(karte: Karte, ergebnis: Ergebnis, heute: string): Karte {
  const gesehen = (karte.gesehen ?? 0) + 1;
  if (ergebnis === "falsch") return { fach: 1, faellig: plusTage(heute, INTERVALLE[0]), gesehen };
  const fach = ergebnis === "richtig" ? Math.min(5, karte.fach + 1) : karte.fach;
  return { fach, faellig: plusTage(heute, INTERVALLE[fach - 1]), gesehen };
}

/** Fällige Karten: Fehlerkiste zuerst, dann nach Fälligkeit und Fach. */
export function faelligeIds(
  karten: Record<string, Karte>,
  heute: string,
  fehlerkiste: string[],
  limit = Infinity,
  bekannt?: (id: string) => boolean
): string[] {
  const ok = (id: string) => (bekannt ? bekannt(id) : true);
  const ausKiste = fehlerkiste.filter((id) => karten[id] && ok(id));
  const rest = Object.entries(karten)
    .filter(([id, k]) => k.faellig <= heute && !ausKiste.includes(id) && ok(id))
    .sort(([, a], [, b]) => (a.faellig === b.faellig ? a.fach - b.fach : a.faellig < b.faellig ? -1 : 1))
    .map(([id]) => id);
  return [...ausKiste, ...rest].slice(0, limit);
}
