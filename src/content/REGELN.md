# Regeln für Inhalte – Sherins Türkisch-App

Wörtliche Kopie aus dem Auftrag. Verbindlich für alle späteren Inhalts-Sessions.

## <sherin>

- Name: Sherin. Ehemann: Pasha (Türke, Muttersprache Türkisch). Tochter: Inaya (Kleinkind, ca. 1 Jahr). Hund: Amani (große Hündin). Wohnort: Garbsen bei Hannover.
- Ziel: In 6 Monaten (bis Mitte Mai 2027) Alltagsgespräche auf Türkisch führen und verstehen, u. a. mit Pasha und seiner Familie. Realistisches Zielniveau: solides A2, beim Sprechen erste B1-Ansätze.
- Hat eine Friseurausbildung und interessiert sich für Kosmetik → eine Themenwoche dazu (Woche 18), Beispielsätze dürfen das gelegentlich aufgreifen.
- Mama eines Kleinkinds → wenig, zerstückelte Zeit. Eine Lektion dauert ca. 25–30 Min. Es gibt einen „Kurzer Tag“-Modus (10 Min), der für die Serie zählt.
- Lernt v. a. am Handy → mobile-first, Bedienung mit einer Hand.
- Pashas Kosename für sie: „Dilemin“ (nur in Pashas Notizen verwenden, nie in Übungen).

## <didaktik>

Wochenrhythmus:
- Mo–Fr: neue Lektion, 8–10 neue Wörter/Chunks.
- Sa: Festigungstag, max. 5 neue Wörter, längerer Dialog, mehr Sprechen.
- So: Sonntagstest über die ganze Woche + Fehler aus Vorwochen.

Aufbau einer Lektion (fester Ablauf, Fortschrittsbalken oben, jeder Schritt einzeln abschließbar, Fortsetzen nach Unterbrechung MUSS funktionieren):
1. Aufwärmen – fällige Wiederholungen (max. 15 Karten, ~5 Min)
2. Neue Wörter – Karte: TR groß + Audio, DE, Beispielsatz TR/DE mit Audio, ggf. Merk-Tipp
3. Grammatik-Häppchen – max. 5 kurze Sätze Erklärung auf Deutsch, ggf. Mini-Tabelle, 3 Beispiele. Chunks vor Regeln.
4. Dialog – 4–8 Zeilen aus Sherins Alltag, jede Zeile mit Audio, Übersetzung ein-/ausblendbar, Button „Ganzen Dialog abspielen“
5. Übungen – 8–12 gemischt: Auswahl DE→TR, Auswahl TR→DE, Tippen DE→TR, Hören (TR hören → Bedeutung wählen), Satzbau (Wort-Kacheln ordnen), Lückentext (Endung einsetzen), Paare zuordnen
6. Sprechauftrag mit Pasha – konkrete 5-Minuten-Aufgabe („Erzähl Pasha auf Türkisch, was Inaya heute gemacht hat. Benutze: …“) + 2–3 Mustersätze, Abhaken
7. Abschluss – „Alltagssatz des Tages“ (heute zu Hause benutzen) + Merk-Tipp des Tages + kurze Feier-Animation

Jede Lektion hat oben ein Kann-Ziel: „Heute lernst du: …“

Regeln:
- Jedes neue Wort kommt in der Woche mind. 3× vor (Karte, Dialog/Übung, Sonntag).
- „sen“ (du) im Familienkontext. „siz“ (Sie) ab Woche 6 bei Fremden (Einkaufen, Arzt, Behörde).
- Merk-Tipps nur, wenn sie wirklich gut sind (Klangbrücke, Lehnwort, Bildgeschichte). Lieber kein Tipp als ein erzwungener.
  Gute Beispiele: ev = Haus → „Eva ist zu Hause.“ | çok = sehr/viel → klingt wie „Schock – so viel!“ | kuaför, şoför, asansör, pantolon → aus dem Französischen, klingen bekannt | Wortstellung: Verb am Ende, wie im deutschen Nebensatz („…, weil ich Tee trinke“ → „Çay içiyorum.“) | Endungen = Lego-Steine, die man ans Wort klickt.

## <inhaltsqualitaet>

- Standard-Türkisch (Istanbuler Norm), natürliche Alltagssprache, keine steifen Lehrbuchsätze.
- Jeden türkischen Satz prüfen auf: Vokalharmonie, Konsonantenwechsel (kitap → kitabı, köpek → köpeği), Bindebuchstaben (y, n, s), Apostroph bei Eigennamen nach der Aussprache (Sherin'in, Inaya'ya, Amani'yi, Garbsen'de, Hannover'de – NICHT „Hannover'da“).
- Türkische Sonderzeichen IMMER korrekt (ı ≠ i, İ ≠ I). Keine aserbaidschanischen oder veralteten Formen.
- Übersetzungen sinngemäß, nicht Wort-für-Wort.
- Bei Unsicherheit: `pruefen: true` setzen, NICHT raten.
- Grammatik nur so viel, wie zum Sprechen nötig. Fachbegriffe immer mit deutscher Klartext-Erklärung („Lokativ = wo?“).

---

## Technische Hinweise zum Format (ergänzend)

- Eine Datei pro Woche: `src/content/wochen/woche-NN.json`, Schema in `src/content/schema.ts`.
- Vokabel-IDs: `wNN-wort` (Kleinbuchstaben, nur a–z, 0–9, Bindestrich; türkische Zeichen umschreiben: ç→c, ş→s, ğ→g, ı→i, ö→o, ü→u). IDs müssen app-weit eindeutig sein.
- Übungen `auswahl_de_tr`, `auswahl_tr_de`, `tippen`, `hoeren` verweisen per `vokabel` auf eine ID; `zuordnen` per `vokabeln` auf 3–5 IDs. Erlaubt sind IDs aus derselben Woche oder Vorwochen.
- `luecke`: Satz mit genau einem `___`, `loesung` muss in `optionen` stehen.
- `satzbau`: Die Kacheln entstehen aus den Wörtern von `tr` (an Leerzeichen getrennt).
- Woche 0 hat nur Tag 6 (Sa). Jede Woche hat `sonntag.sprechChallenge` mit genau 3 Situationen.
- Unsichere Sätze: `pruefen: true` am Satz/an der Vokabel → erscheinen unter `/pruefen` für Pasha.
- Prüfen mit `npm run check:content`.
