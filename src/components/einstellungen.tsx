"use client";

import { useRef, useState } from "react";
import { Download, Monitor, Moon, Sun, Upload, Volume2 } from "lucide-react";
import { sherin } from "@/config/sherin";
import { datumLesbar } from "@/lib/datum";
import { backupHerunterladen } from "@/lib/backup";
import { sprich, TEMPO_LANGSAM } from "@/lib/speech";
import { BackupSchema, useFortschritt, useGeladen } from "@/store/fortschritt";
import { SeitenKopf, Seite } from "@/components/seiten-kopf";
import { StimmeHinweis } from "@/components/audio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Import = { daten: ReturnType<typeof BackupSchema.parse>; name: string };

export function Einstellungen() {
  const geladen = useGeladen();
  const s = useFortschritt();
  const datei = useRef<HTMLInputElement>(null);
  const [vorschau, setVorschau] = useState<Import | null>(null);
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string } | null>(null);

  async function dateiGewaehlt(f: File | undefined) {
    setMeldung(null);
    if (!f) return;
    try {
      const roh = JSON.parse(await f.text());
      const r = BackupSchema.safeParse(roh);
      if (!r.success) throw new Error("ungültig");
      setVorschau({ daten: r.data, name: f.name });
    } catch {
      setMeldung({ ok: false, text: "Diese Datei ist kein gültiges Backup dieser App." });
    } finally {
      if (datei.current) datei.current.value = "";
    }
  }

  const sektion = "rounded-2xl bg-card p-4 ring-1 ring-border";
  const themes = [
    { wert: "system", label: "Automatisch", icon: Monitor },
    { wert: "hell", label: "Hell", icon: Sun },
    { wert: "dunkel", label: "Nacht", icon: Moon },
  ] as const;

  return (
    <>
      <SeitenKopf titel="Einstellungen" ohneZahnrad />
      <Seite>
        {!geladen ? (
          <div className="h-60" aria-busy="true" />
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <section className={sektion} aria-labelledby="audio">
              <h2 id="audio" className="mb-2 text-lg font-semibold">
                Audio
              </h2>
              <StimmeHinweis immer />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => sprich(`Merhaba ${sherin.name}! Nasılsın?`)}>
                  <Volume2 aria-hidden="true" /> Stimme testen
                </Button>
                <Button variant="ghost" onClick={() => sprich("Türkçe öğreniyorum.", { langsam: true })}>
                  Langsam testen
                </Button>
              </div>
              <label htmlFor="tempo" className="mt-4 block font-medium">
                Sprechtempo: {Math.round(s.einstellungen.tempo * 100)} %
              </label>
              <input
                id="tempo"
                type="range"
                min={0.7}
                max={1.1}
                step={0.05}
                value={s.einstellungen.tempo}
                onChange={(e) => s.einstellungSetzen({ tempo: Number(e.target.value) })}
                className="mt-2 h-11 w-full accent-[var(--primary)]"
              />
              <p className="text-sm text-muted-foreground">
                Standard 90 %. Die Schildkröte spricht immer mit {Math.round(TEMPO_LANGSAM * 100)} %.
              </p>
            </section>

            <section className={sektion} aria-labelledby="theme">
              <h2 id="theme" className="mb-3 text-lg font-semibold">
                Darstellung
              </h2>
              <div role="radiogroup" aria-labelledby="theme" className="grid grid-cols-3 gap-2">
                {themes.map(({ wert, label, icon: Icon }) => {
                  const an = s.einstellungen.theme === wert;
                  return (
                    <button
                      key={wert}
                      type="button"
                      role="radio"
                      aria-checked={an}
                      onClick={() => s.einstellungSetzen({ theme: wert })}
                      className={cn(
                        "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-medium",
                        an ? "border-primary bg-secondary" : "border-border hover:bg-muted"
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Nacht ist für abends, wenn Inaya schläft.</p>
            </section>

            <section className={sektion} aria-labelledby="backup">
              <h2 id="backup" className="text-lg font-semibold">
                Backup
              </h2>
              <p className="mb-3 text-[0.95rem] text-muted-foreground">
                Dein Fortschritt liegt nur auf diesem Gerät. Sichere ihn ab und zu als Datei (z. B. sonntags).
                {s.hinweise.backupAm && <> Letztes Backup: {datumLesbar(s.hinweise.backupAm)}.</>}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={backupHerunterladen}>
                  <Download aria-hidden="true" /> Backup herunterladen
                </Button>
                <Button variant="outline" onClick={() => datei.current?.click()}>
                  <Upload aria-hidden="true" /> Backup einspielen
                </Button>
                <input
                  ref={datei}
                  type="file"
                  accept="application/json,.json"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => dateiGewaehlt(e.target.files?.[0])}
                />
              </div>
              {vorschau && (
                <div role="alertdialog" aria-labelledby="import-titel" className="mt-4 rounded-xl border-2 border-accent bg-rose-soft p-4">
                  <p id="import-titel" className="font-semibold">
                    Backup wirklich einspielen?
                  </p>
                  <p className="mt-1 text-[0.95rem]">
                    „{vorschau.name}“ vom {datumLesbar(vorschau.daten.erstellt.slice(0, 10))}:{" "}
                    {Object.keys(vorschau.daten.daten.karten).length} Karten,{" "}
                    {Object.values(vorschau.daten.daten.lektionen).filter((l) => l.fertigAm).length} abgeschlossene Lektionen. Dein jetziger
                    Stand wird dabei ersetzt.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="akzent"
                      onClick={() => {
                        s.allesErsetzen(vorschau.daten.daten);
                        setVorschau(null);
                        setMeldung({ ok: true, text: "Backup eingespielt. Willkommen zurück!" });
                      }}
                    >
                      Ja, einspielen
                    </Button>
                    <Button variant="ghost" onClick={() => setVorschau(null)}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
              {meldung && (
                <p role="status" className={cn("mt-3 font-medium", meldung.ok ? "text-primary" : "text-destructive")}>
                  {meldung.text}
                </p>
              )}
            </section>

            <section className={sektion} aria-labelledby="info">
              <h2 id="info" className="mb-1 text-lg font-semibold">
                Dein Kurs
              </h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[0.95rem]">
                <dt className="text-muted-foreground">Start</dt>
                <dd>{datumLesbar(sherin.startDatum)} (Woche 0)</dd>
                <dt className="text-muted-foreground">Lernzeit</dt>
                <dd>ca. {sherin.minutenProTag} Minuten pro Tag</dd>
                <dt className="text-muted-foreground">Karten</dt>
                <dd>{Object.keys(s.karten).length} im Karteikasten</dd>
              </dl>
            </section>
          </div>
        )}
      </Seite>
    </>
  );
}
