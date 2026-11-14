// Prüft alle Wochen-JSONs: Schema, eindeutige IDs, Beispiele, Verweise; listet pruefen: true.
// Aufruf: npm run check:content
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WocheSchema, NotizenSchema } from "../src/content/schema.ts";
import { lehrplan } from "../src/content/lehrplan.ts";

const ordner = join(import.meta.dirname, "../src/content/wochen");
const dateien = readdirSync(ordner).filter((f) => /^woche-\d{2}\.json$/.test(f)).sort();
const fehler: string[] = [];
const pruefen: string[] = [];
const ids = new Map<string, string>();
type W = ReturnType<typeof WocheSchema.parse>;
const wochen: W[] = [];

for (const datei of dateien) {
  const nr = Number(datei.slice(6, 8));
  let roh: unknown;
  try {
    roh = JSON.parse(readFileSync(join(ordner, datei), "utf8"));
  } catch (e) {
    fehler.push(`${datei}: kein gültiges JSON (${(e as Error).message})`);
    continue;
  }
  const r = WocheSchema.safeParse(roh);
  if (!r.success) {
    for (const i of r.error.issues) fehler.push(`${datei}: ${i.path.join(".")} – ${i.message}`);
    continue;
  }
  const w = r.data;
  if (w.woche !== nr) fehler.push(`${datei}: "woche" ist ${w.woche}, erwartet ${nr}`);
  if (!lehrplan.some((s) => s.woche === nr)) fehler.push(`${datei}: Woche ${nr} fehlt im Lehrplan`);
  const tage = w.lektionen.map((l) => l.tag);
  if (new Set(tage).size !== tage.length) fehler.push(`${datei}: doppelte Tage`);
  if (nr === 0 && tage.some((t) => t !== 6)) fehler.push(`${datei}: Woche 0 darf nur Tag 6 haben`);
  for (const l of w.lektionen) {
    if (l.woche !== nr) fehler.push(`${datei} Tag ${l.tag}: woche passt nicht`);
    const max = l.tag === 6 && nr !== 0 ? 5 : 12;
    if (l.vokabeln.length > max) fehler.push(`${datei} Tag ${l.tag}: zu viele neue Wörter (${l.vokabeln.length} > ${max})`);
    for (const v of l.vokabeln) {
      if (!v.id.startsWith(`w${String(nr).padStart(2, "0")}-`)) fehler.push(`${v.id}: Präfix passt nicht zu Woche ${nr}`);
      if (ids.has(v.id)) fehler.push(`${v.id}: doppelte ID (auch in ${ids.get(v.id)})`);
      ids.set(v.id, `${datei} Tag ${l.tag}`);
      if (!v.beispiel?.tr || !v.beispiel?.de) fehler.push(`${v.id}: Beispiel fehlt`);
      if (v.pruefen) pruefen.push(`W${nr} T${l.tag} Vokabel ${v.tr} – ${v.de}`);
      if (v.beispiel.pruefen) pruefen.push(`W${nr} T${l.tag} Beispiel: ${v.beispiel.tr}`);
    }
    for (const b of l.grammatik.beispiele) if (b.pruefen) pruefen.push(`W${nr} T${l.tag} Grammatik: ${b.tr}`);
    for (const z of l.dialog.zeilen) if (z.pruefen) pruefen.push(`W${nr} T${l.tag} Dialog: ${z.tr}`);
    for (const m of l.sprechauftrag.mustersaetze) if (m.pruefen) pruefen.push(`W${nr} T${l.tag} Mustersatz: ${m.tr}`);
    if (l.alltagssatz.pruefen) pruefen.push(`W${nr} T${l.tag} Alltagssatz: ${l.alltagssatz.tr}`);
    for (const u of l.uebungen) {
      if (u.art === "satzbau" && u.pruefen) pruefen.push(`W${nr} T${l.tag} Satzbau: ${u.tr}`);
      if (u.art === "luecke") {
        if (!u.optionen.includes(u.loesung)) fehler.push(`W${nr} T${l.tag} Lücke „${u.satz}“: Lösung nicht in Optionen`);
        if (u.pruefen) pruefen.push(`W${nr} T${l.tag} Lücke: ${u.satz.replace("___", u.loesung)}`);
      }
    }
  }
  wochen.push(w);
}

// Verweise prüfen (dürfen auf dieselbe Woche oder Vorwochen zeigen)
for (const w of wochen) {
  for (const l of w.lektionen) {
    const refs: string[] = [];
    for (const u of l.uebungen) {
      if ("vokabel" in u) refs.push(u.vokabel);
      if (u.art === "zuordnen") refs.push(...u.vokabeln);
    }
    for (const r of refs) {
      if (!ids.has(r)) fehler.push(`W${w.woche} T${l.tag}: Übung verweist auf unbekannte Vokabel „${r}“`);
      else if (Number(r.slice(1, 3)) > w.woche) fehler.push(`W${w.woche} T${l.tag}: „${r}“ stammt aus einer späteren Woche`);
    }
  }
}

// Pashas Notizen
try {
  NotizenSchema.parse(JSON.parse(readFileSync(join(import.meta.dirname, "../src/content/notizen-von-pasha.json"), "utf8")));
} catch (e) {
  fehler.push(`notizen-von-pasha.json: ${(e as Error).message}`);
}

console.log(`Wochen: ${wochen.map((w) => w.woche).join(", ") || "–"}  ·  Vokabeln: ${ids.size}`);
for (const w of wochen) {
  const n = w.lektionen.map((l) => `T${l.tag}:${l.vokabeln.length}`).join(" ");
  console.log(`  Woche ${w.woche}: ${n}`);
}
console.log(`\npruefen: true (${pruefen.length}):`);
for (const p of pruefen) console.log(`  • ${p}`);
if (fehler.length) {
  console.error(`\n✗ ${fehler.length} Fehler:`);
  for (const f of fehler) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\n✓ Inhalte sind gültig.");
