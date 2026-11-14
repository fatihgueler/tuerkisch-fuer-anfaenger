import type { Metadata } from "next";
import { alleWochen } from "@/content";
import { SeitenKopf, Seite } from "@/components/seiten-kopf";

export const metadata: Metadata = { title: "Zum Gegenlesen" };

/** Versteckte Seite (nur per URL): alle mit pruefen: true markierten Sätze für Pasha. */
export default async function PruefenSeite() {
  const liste: { ort: string; tr: string; de: string }[] = [];
  for (const w of await alleWochen()) {
    for (const l of w.lektionen) {
      const ort = `Woche ${w.woche}, Tag ${l.tag} – ${l.titel}`;
      for (const v of l.vokabeln) {
        if (v.pruefen) liste.push({ ort: `${ort} (Vokabel)`, tr: v.tr, de: v.de });
        if (v.beispiel.pruefen) liste.push({ ort: `${ort} (Beispiel zu „${v.tr}“)`, ...v.beispiel });
      }
      for (const b of l.grammatik.beispiele) if (b.pruefen) liste.push({ ort: `${ort} (Grammatik)`, ...b });
      for (const z of l.dialog.zeilen) if (z.pruefen) liste.push({ ort: `${ort} (Dialog, ${z.sprecher})`, tr: z.tr, de: z.de });
      for (const m of l.sprechauftrag.mustersaetze) if (m.pruefen) liste.push({ ort: `${ort} (Mustersatz)`, ...m });
      if (l.alltagssatz.pruefen) liste.push({ ort: `${ort} (Alltagssatz)`, ...l.alltagssatz });
      for (const u of l.uebungen) {
        if (u.art === "satzbau" && u.pruefen) liste.push({ ort: `${ort} (Satzbau)`, tr: u.tr, de: u.de });
        if (u.art === "luecke" && u.pruefen) liste.push({ ort: `${ort} (Lücke)`, tr: u.satz.replace("___", u.loesung), de: u.de });
      }
    }
  }
  return (
    <>
      <SeitenKopf titel="Zum Gegenlesen" unter="Für Pasha" />
      <Seite>
        <p className="mt-4 text-muted-foreground">
          Diese Sätze sind als unsicher markiert. Pasha, bitte prüf, ob sie natürlich und korrekt klingen. Korrekturen trägst du in der
          Datei der jeweiligen Woche ein und entfernst dort „pruefen: true“.
        </p>
        <p className="mt-2 font-semibold">{liste.length} Sätze</p>
        <ol className="mt-4 space-y-3">
          {liste.map((s, i) => (
            <li key={i} className="rounded-xl bg-card p-4 ring-1 ring-border">
              <p className="text-sm text-muted-foreground">{s.ort}</p>
              <p lang="tr" className="mt-1 font-serif text-xl">
                {s.tr}
              </p>
              <p>{s.de}</p>
            </li>
          ))}
        </ol>
      </Seite>
    </>
  );
}
