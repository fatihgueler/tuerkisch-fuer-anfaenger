import type { Uebung, Vokabel, Woche } from "@/content/schema";
import type { Karte } from "@/lib/leitner";
import type { SonntagsFrage } from "@/store/fortschritt";

function mischen<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Für Tippübungen ungeeignet: Einträge mit Klammern oder Auslassungspunkten */
export const tippbar = (v?: Vokabel) => !!v && !/[(…]/.test(v.tr);

function text(u: Uebung, index: Record<string, Vokabel>): string {
  switch (u.art) {
    case "auswahl_de_tr":
    case "tippen":
      return `${index[u.vokabel]?.de ?? ""} → Türkisch`;
    case "auswahl_tr_de":
      return `${index[u.vokabel]?.tr ?? ""} → Deutsch`;
    case "hoeren":
      return `Hören: ${index[u.vokabel]?.tr ?? ""}`;
    case "satzbau":
      return `Satzbau: ${u.de}`;
    case "luecke":
      return `Lücke: ${u.satz}`;
    case "zuordnen":
      return "Paare zuordnen";
  }
}

/** 20 Fragen: 8 Vokabeln (beide Richtungen), 4 Hören, 3 Satzbau, 2 Lücken, 3 Fehlerkiste der Vorwochen. */
export function erzeugeSonntagstest(
  woche: Woche,
  index: Record<string, Vokabel>,
  fehlerkiste: string[],
  karten: Record<string, Karte>
): SonntagsFrage[] {
  const prefix = `w${String(woche.woche).padStart(2, "0")}-`;
  const vokabeln = mischen(woche.lektionen.flatMap((l) => l.vokabeln));
  const uebungen = woche.lektionen.flatMap((l) => l.uebungen);
  const nimm = (i: number) => vokabeln[i % vokabeln.length];
  const fragen: SonntagsFrage[] = [];
  const neu = (uebung: Uebung, quelle?: string) => fragen.push({ uebung, quelle, text: text(uebung, index) });

  // 8 Wochenvokabeln, beide Richtungen
  for (let i = 0; i < 8; i++) {
    const v = nimm(i);
    neu({ art: i % 2 === 0 ? "auswahl_de_tr" : "auswahl_tr_de", vokabel: v.id }, v.id);
  }
  // 4 Hören – möglichst andere Wörter
  for (let i = 8; i < 12; i++) {
    const v = nimm(i);
    neu({ art: "hoeren", vokabel: v.id }, v.id);
  }
  // 3 Satzbau: aus den Übungen, sonst aus Beispielsätzen
  const satzbau = mischen(uebungen.filter((u) => u.art === "satzbau"));
  for (let i = 0; i < 3; i++) {
    if (satzbau[i]) neu(satzbau[i]);
    else {
      const v = nimm(i + 3);
      neu({ art: "satzbau", tr: v.beispiel.tr, de: v.beispiel.de });
    }
  }
  // 2 Grammatiklücken
  const luecken = mischen(uebungen.filter((u) => u.art === "luecke"));
  for (let i = 0; i < 2; i++) {
    if (luecken[i]) neu(luecken[i]);
    else {
      const v = nimm(i + 5);
      neu({ art: tippbar(v) ? "tippen" : "auswahl_de_tr", vokabel: v.id }, v.id);
    }
  }
  // 3 aus der Fehlerkiste der Vorwochen (sonst wackelige Karten, sonst Tippen)
  const alt = (id: string) => !!index[id] && !id.startsWith(prefix);
  const kiste = mischen(fehlerkiste.filter(alt));
  const wackelig = mischen(Object.entries(karten).filter(([id, k]) => alt(id) && k.fach <= 2 && !kiste.includes(id)).map(([id]) => id));
  const extra = [...kiste, ...wackelig].slice(0, 3);
  extra.forEach((id, i) => neu({ art: i % 2 === 1 && tippbar(index[id]) ? "tippen" : "auswahl_de_tr", vokabel: id }, id));
  for (let i = extra.length; i < 3; i++) {
    const v = nimm(i + 1);
    neu({ art: tippbar(v) ? "tippen" : "auswahl_tr_de", vokabel: v.id }, v.id);
  }

  return mischen(fragen);
}
