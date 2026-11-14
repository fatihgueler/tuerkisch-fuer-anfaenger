import { z } from "zod";

/* Hinweis: Diese Datei darf nur `zod` importieren (wird auch von scripts/check-content.ts genutzt). */

const nichtLeer = z.string().trim().min(1);

export const SatzSchema = z.object({ tr: nichtLeer, de: nichtLeer, pruefen: z.boolean().optional() });

export const VokabelSchema = z.object({
  id: z.string().regex(/^w\d{2}-[a-z0-9-]+$/, "ID-Format: w01-wort"),
  tr: nichtLeer,
  de: nichtLeer,
  typ: z.enum(["wort", "chunk"]).optional(),
  beispiel: SatzSchema,
  merktipp: nichtLeer.optional(),
  /** Alternative richtige Schreibweisen für Tippübungen */
  auch: z.array(nichtLeer).optional(),
  pruefen: z.boolean().optional(),
});

const VokabelRef = z.object({ vokabel: nichtLeer });

export const UebungSchema = z.discriminatedUnion("art", [
  z.object({ art: z.literal("auswahl_de_tr"), ...VokabelRef.shape }),
  z.object({ art: z.literal("auswahl_tr_de"), ...VokabelRef.shape }),
  z.object({ art: z.literal("tippen"), ...VokabelRef.shape }),
  z.object({ art: z.literal("hoeren"), ...VokabelRef.shape }),
  z.object({
    art: z.literal("satzbau"),
    tr: nichtLeer,
    de: nichtLeer,
    /** Zusätzliche falsche Kacheln */
    extra: z.array(nichtLeer).optional(),
    pruefen: z.boolean().optional(),
  }),
  z.object({
    art: z.literal("luecke"),
    /** Satz mit genau einem „___“ für die Lücke */
    satz: nichtLeer.refine((s) => s.split("___").length === 2, "Genau eine Lücke ___"),
    loesung: nichtLeer,
    optionen: z.array(nichtLeer).min(2).max(4),
    de: nichtLeer,
    hinweis: nichtLeer.optional(),
    pruefen: z.boolean().optional(),
  }),
  z.object({ art: z.literal("zuordnen"), vokabeln: z.array(nichtLeer).min(3).max(5) }),
]);

export const LektionSchema = z.object({
  woche: z.number().int().min(0).max(26),
  tag: z.number().int().min(1).max(6),
  titel: nichtLeer,
  kannZiel: nichtLeer,
  vokabeln: z.array(VokabelSchema).min(1).max(12),
  grammatik: z.object({
    titel: nichtLeer,
    erklaerung: z.array(nichtLeer).min(1).max(5),
    tabelle: z
      .object({ kopf: z.array(nichtLeer), zeilen: z.array(z.array(z.string())) })
      .optional(),
    beispiele: z.array(SatzSchema).min(1).max(4),
  }),
  dialog: z.object({
    titel: nichtLeer,
    zeilen: z.array(SatzSchema.extend({ sprecher: nichtLeer })).min(4).max(10),
  }),
  uebungen: z.array(UebungSchema).min(8).max(12),
  sprechauftrag: z.object({ aufgabe: nichtLeer, mustersaetze: z.array(SatzSchema).min(2).max(3) }),
  alltagssatz: SatzSchema.extend({ wann: nichtLeer }),
  merktipp: z.object({ titel: nichtLeer, text: nichtLeer }),
});

export const WocheSchema = z.object({
  woche: z.number().int().min(0).max(26),
  lektionen: z.array(LektionSchema).min(1).max(6),
  sonntag: z.object({
    sprechChallenge: z.array(z.object({ situation: nichtLeer, hilfe: SatzSchema.optional() })).length(3),
  }),
});

export const NotizenSchema = z.record(z.string().regex(/^\d+$/), z.string());

export type Satz = z.infer<typeof SatzSchema>;
export type Vokabel = z.infer<typeof VokabelSchema>;
export type Uebung = z.infer<typeof UebungSchema>;
export type Lektion = z.infer<typeof LektionSchema>;
export type Woche = z.infer<typeof WocheSchema>;
