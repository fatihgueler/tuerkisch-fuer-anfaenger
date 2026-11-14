export type Ergebnis = "richtig" | "fast" | "falsch";

const SONDER: Record<string, string> = { ş: "s", ç: "c", ğ: "g", ı: "i", ö: "o", ü: "u", â: "a", î: "i", û: "u" };

/** Kleinschreibung (tr-TR), Apostrophe raus, Satzzeichen ignorieren, Leerzeichen normalisieren. */
export function normalisiere(s: string): string {
  return s
    .normalize("NFC")
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇/g, "i")
    .replace(/['’`´]/g, "")
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ohne Sonderzeichen: ş→s, ç→c, ğ→g, ı→i, ö→o, ü→u */
export function ohneSonderzeichen(s: string): string {
  return normalisiere(s).replace(/[şçğıöüâîû]/g, (c) => SONDER[c] ?? c);
}

export function pruefe(eingabe: string, loesungen: string[]): { ergebnis: Ergebnis; korrekt: string } {
  const e = normalisiere(eingabe);
  const korrekt = loesungen[0];
  if (!e) return { ergebnis: "falsch", korrekt };
  for (const l of loesungen) if (normalisiere(l) === e) return { ergebnis: "richtig", korrekt: l };
  const eo = ohneSonderzeichen(eingabe);
  for (const l of loesungen) if (ohneSonderzeichen(l) === eo) return { ergebnis: "fast", korrekt: l };
  return { ergebnis: "falsch", korrekt };
}

/** Markiert in der korrekten Schreibweise die Buchstaben, die Sonderzeichen sind
 *  (für „fast richtig“ – zeigt, wo ş, ç, ğ, ı, ö, ü hingehören). */
export function sonderzeichenMarkieren(korrekt: string): { text: string; markiert: boolean }[] {
  const teile: { text: string; markiert: boolean }[] = [];
  for (const ch of korrekt) {
    const m = /[şçğıöüŞÇĞİÖÜ]/.test(ch);
    const letzte = teile[teile.length - 1];
    if (letzte && letzte.markiert === m) letzte.text += ch;
    else teile.push({ text: ch, markiert: m });
  }
  return teile;
}
