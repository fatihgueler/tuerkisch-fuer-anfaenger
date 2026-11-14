import type { Ergebnis } from "@/lib/check";
import { normalisiere, ohneSonderzeichen } from "@/lib/check";

/** Eigennamen erkennt die Spracherkennung oft „türkisch“ (Sherin → Şirin). Großzügig sein. */
const NAMEN = ["sherin", "pasha", "inaya", "amani", "garbsen", "elif"];
const flachName = (s: string) => ohneSonderzeichen(s).replace(/sh/g, "s").replace(/ı/g, "i");

export type WortStatus = "ok" | "fast" | "fehlt";
export type WortTeil = { text: string; status: WortStatus | null };

function abstand(a: string, b: string): number {
  if (a === b) return 0;
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let vorher = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, vorher + (a[i - 1] === b[j - 1] ? 0 : 1));
      vorher = tmp;
    }
  }
  return d[b.length];
}

/**
 * Vergleicht Wort für Wort, was die Spracherkennung gehört hat, mit dem Zielsatz.
 * Liefert den Zielsatz in Teilen (Wörter mit Status, Zwischenräume/Satzzeichen ohne)
 * und eine Gesamtbewertung.
 */
export function vergleicheWoerter(ziel: string, gehoert: string): { teile: WortTeil[]; anteil: number; ergebnis: Ergebnis } {
  const rest = normalisiere(gehoert).split(" ").filter(Boolean);
  const teile: WortTeil[] = [];
  let punkte = 0;
  let anzahl = 0;
  for (const stueck of ziel.split(/(\s+)/)) {
    const norm = normalisiere(stueck);
    if (!norm) {
      teile.push({ text: stueck, status: null });
      continue;
    }
    anzahl++;
    let status: WortStatus = "fehlt";
    const exakt = rest.indexOf(norm);
    const istName = NAMEN.some((n) => flachName(norm).startsWith(flachName(n)));
    const nameTreffer = istName ? rest.findIndex((r) => abstand(flachName(r), flachName(norm)) <= 2) : -1;
    if (exakt >= 0 || nameTreffer >= 0) {
      status = "ok";
      rest.splice(exakt >= 0 ? exakt : nameTreffer, 1);
    } else {
      const flach = ohneSonderzeichen(norm);
      const nah = rest.findIndex((r) => ohneSonderzeichen(r) === flach || (norm.length >= 4 && abstand(r, norm) <= 1));
      if (nah >= 0) {
        status = "fast";
        rest.splice(nah, 1);
      }
    }
    punkte += status === "ok" ? 1 : status === "fast" ? 0.6 : 0;
    teile.push({ text: stueck, status });
  }
  const anteil = anzahl ? punkte / anzahl : 0;
  const ergebnis: Ergebnis = anteil >= 0.85 ? "richtig" : anteil >= 0.5 ? "fast" : "falsch";
  return { teile, anteil, ergebnis };
}
