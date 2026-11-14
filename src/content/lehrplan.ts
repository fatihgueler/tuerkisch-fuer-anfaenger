/* Hinweis: Diese Datei hat keine Importe (wird auch von scripts/check-content.ts genutzt). */

export type Station = {
  woche: number;
  phase: 0 | 1 | 2 | 3 | 4;
  thema: string;
  grammatik: string[];
  wortfelder: string[];
  kannZiel: string;
};

export const PHASEN: Record<number, { name: string; niveau: string }> = {
  0: { name: "Start", niveau: "Hallo Türkisch" },
  1: { name: "Fundament", niveau: "A1.1" },
  2: { name: "Alltag", niveau: "A1.2" },
  3: { name: "Erzählen", niveau: "A2.1" },
  4: { name: "Frei sprechen", niveau: "A2.2 → B1-Ansätze" },
};

export const lehrplan: Station[] = [
  {
    woche: 0,
    phase: 0,
    thema: "Hallo Türkisch",
    grammatik: [
      "Aussprache & Alphabet: c = dsch, ç = tsch, ş = sch, ğ dehnt den Vokal, ı = dumpfes i, j, v, y",
      "Betonung meist auf der letzten Silbe",
    ],
    wortfelder: [
      "Merhaba, Günaydın, İyi akşamlar",
      "Teşekkür ederim, Evet/Hayır",
      "Nasılsın? – İyiyim.",
      "Überlebenssätze: Anlamadım. / Tekrar eder misin? / Yavaş konuşur musun?",
    ],
    kannZiel: "begrüßen, danken, um Wiederholung bitten",
  },
  // PHASE 1 – Fundament (A1.1)
  {
    woche: 1,
    phase: 1,
    thema: "Ich & du",
    grammatik: ["Personalpronomen", "„sein“-Endungen (-(y)Im, -sIn, -DIr …)", "Vokalharmonie (4-fach)", "Frage mI", "Zahlen 1–10"],
    wortfelder: ["Name, Herkunft, Wohnort", "„Benim adım Sherin. Garbsen'de oturuyorum.“ als Chunk"],
    kannZiel: "sich vorstellen",
  },
  {
    woche: 2,
    phase: 1,
    thema: "Meine Familie",
    grammatik: ["Plural -lAr (2-fach)", "Possessiv 1./2. Person", "var/yok („Bir kızım var.“)", "Zahlen bis 100", "Alter"],
    wortfelder: ["Familie", "Zahlen", "Alter"],
    kannZiel: "Familie vorstellen",
  },
  {
    woche: 3,
    phase: 1,
    thema: "Unser Zuhause",
    grammatik: ["Lokativ -DA (evde, mutfakta)", "bu/şu/o", "nerede?", "Possessiv 3. Person", "Konsonantenwechsel (köpek → köpeği)"],
    wortfelder: ["Räume", "Möbel", "Amani"],
    kannZiel: "sagen, wo etwas ist",
  },
  {
    woche: 4,
    phase: 1,
    thema: "Mein Tag",
    grammatik: ["Präsens -(I)yor (bejaht)", "Grundverben (kalkmak, yemek, içmek, gitmek, uyumak, oynamak)", "Wochentage", "volle Stunden"],
    wortfelder: ["Tagesablauf", "Wochentage", "Uhrzeit (volle Stunden)"],
    kannZiel: "Tagesablauf beschreiben",
  },
  {
    woche: 5,
    phase: 1,
    thema: "Wohin & woher",
    grammatik: ["-(I)yor verneint/fragend", "Dativ -(y)A (eve, markete)", "Ablativ -DAn (evden)", "gelmek/gitmek"],
    wortfelder: ["Orte in der Stadt", "Bewegung"],
    kannZiel: "sagen, wohin man geht",
  },
  {
    woche: 6,
    phase: 1,
    thema: "Essen & Einkaufen",
    grammatik: ["Akkusativ -(y)I (bestimmt) vs. unbestimmt", "istiyorum", "„… alabilir miyim?“ als Chunk", "Ne kadar?", "„siz“ einführen"],
    wortfelder: ["Lebensmittel", "Einkaufen", "am Tisch"],
    kannZiel: "im Laden einkaufen, am Tisch fragen",
  },
  // PHASE 2 – Alltag (A1.2)
  {
    woche: 7,
    phase: 2,
    thema: "Wetter, Kleidung, Farben",
    grammatik: ["Adjektive", "çok/biraz", "Vergleich daha/en"],
    wortfelder: ["Wetter", "Kleidung", "Farben"],
    kannZiel: "Wetter & Kleidung beschreiben",
  },
  {
    woche: 8,
    phase: 2,
    thema: "Was hast du gemacht?",
    grammatik: ["Vergangenheit -DI (bejaht)", "dün, geçen hafta"],
    wortfelder: ["Zeitangaben der Vergangenheit", "Alltagsaktivitäten"],
    kannZiel: "vom gestrigen Tag erzählen",
  },
  {
    woche: 9,
    phase: 2,
    thema: "Das Wochenende",
    grammatik: ["-DI verneint/fragend", "evdeydim, yoktu, var mıydı"],
    wortfelder: ["Freizeit", "Ausflüge", "Besuche"],
    kannZiel: "vom Wochenende erzählen und nachfragen",
  },
  {
    woche: 10,
    phase: 2,
    thema: "Körper & Gesundheit",
    grammatik: ["„Başım ağrıyor“", "lazım/gerek", "Geçmiş olsun"],
    wortfelder: ["Körperteile", "Arzt, Apotheke, Kinderarzt („Kızımın ateşi var.“)"],
    kannZiel: "Beschwerden beschreiben",
  },
  {
    woche: 11,
    phase: 2,
    thema: "Unterwegs",
    grammatik: ["Wegbeschreibung (sağ, sol, düz)", "-(y)lA (mit)", "Imperativ (gel, bak; höflich -(y)In)"],
    wortfelder: ["Verkehrsmittel", "Wegbeschreibung"],
    kannZiel: "nach dem Weg fragen, Anweisungen verstehen",
  },
  {
    woche: 12,
    phase: 2,
    thema: "Pläne",
    grammatik: ["Zukunft -(y)AcAk", "yarın, seneye"],
    wortfelder: ["Urlaub", "Besuch bei Familie"],
    kannZiel: "über Pläne sprechen",
  },
  {
    woche: 13,
    phase: 2,
    thema: "Festigungswoche Phase 2",
    grammatik: ["keine neue Grammatik", "Fehlerkiste leeren"],
    wortfelder: ["lange Dialoge", "Hörverstehen"],
    kannZiel: "3 Minuten Gespräch über Alltag",
  },
  // PHASE 3 – Erzählen (A2.1)
  {
    woche: 14,
    phase: 3,
    thema: "Wollen & können",
    grammatik: ["-mAk istemek", "-(y)Abil / -(y)AmA"],
    wortfelder: ["Hobbys"],
    kannZiel: "Wünsche und Fähigkeiten ausdrücken",
  },
  {
    woche: 15,
    phase: 3,
    thema: "Gefühle & Meinung",
    grammatik: ["Bence …", "çünkü", "-mAyI sevmek"],
    wortfelder: ["mutlu, yorgun, üzgün, sinirli"],
    kannZiel: "Gefühle und Meinung begründen",
  },
  {
    woche: 16,
    phase: 3,
    thema: "Gewohnheiten",
    grammatik: ["Aorist -(A/I)r („Her sabah çay içerim.“)", "her zaman, bazen, hiç", "höfliche Bitten „… verir misiniz?“"],
    wortfelder: ["Routinen", "Häufigkeit"],
    kannZiel: "Gewohnheiten beschreiben, höflich bitten",
  },
  {
    woche: 17,
    phase: 3,
    thema: "Zeit & Termine",
    grammatik: ["Uhrzeit komplett (buçuk, çeyrek, geçiyor/var)", "Datum, Monate", "-DAn … -A kadar"],
    wortfelder: ["Termine", "Telefon"],
    kannZiel: "Termine ausmachen, am Telefon",
  },
  {
    woche: 18,
    phase: 3,
    thema: "Schönheit & Pflege (Sherin-Woche)",
    grammatik: ["Possessiv + Kasus (saçımı, yüzüme)"],
    wortfelder: ["kuaför, saç, cilt bakımı, makyaj, krem, oje, randevu", "im Salon sprechen, beraten"],
    kannZiel: "im Salon/Kosmetikstudio sprechen",
  },
  {
    woche: 19,
    phase: 3,
    thema: "Familie & Kinder",
    grammatik: ["-mAlI (müssen)"],
    wortfelder: ["Verwandtschaft (kayınvalide, kayınpeder, görümce, elti, yenge, amca, dayı, teyze, hala)", "mit Kindern sprechen"],
    kannZiel: "mit Inaya auf Türkisch sprechen, Verwandte richtig benennen",
  },
  {
    woche: 20,
    phase: 3,
    thema: "Festigungswoche Phase 3",
    grammatik: ["Vergangenheit/Gegenwart/Zukunft mischen"],
    wortfelder: ["„Mein Leben“ als 2-Minuten-Monolog"],
    kannZiel: "zusammenhängend erzählen",
  },
  // PHASE 4 – Frei sprechen (A2.2 → B1-Ansätze)
  {
    woche: 21,
    phase: 4,
    thema: "Gäste & Höflichkeit",
    grammatik: ["Höflichkeitsformeln: Hoş geldiniz/Hoş bulduk, Ellerine sağlık, Afiyet olsun, Kolay gelsin, Başın sağ olsun, Güle güle"],
    wortfelder: ["Einladung", "Tischgespräch", "Teekultur"],
    kannZiel: "Gäste empfangen, selbst Gast sein",
  },
  {
    woche: 22,
    phase: 4,
    thema: "Wenn … dann",
    grammatik: ["Konditional -sA/-(y)sA", "keşke", "Ratschläge („… yapsan iyi olur“)"],
    wortfelder: ["Wünsche", "Ratschläge"],
    kannZiel: "Bedingungen, Wünsche, Ratschläge",
  },
  {
    woche: 23,
    phase: 4,
    thema: "Verbinden",
    grammatik: ["-ken (während)", "-DIktan sonra, -mAdAn önce", "-DIğI als Chunks („Ne dediğini anlamadım.“, „Bildiğim kadarıyla …“)"],
    wortfelder: ["Satzverbindungen"],
    kannZiel: "Sätze verbinden",
  },
  {
    woche: 24,
    phase: 4,
    thema: "Behörde & Erledigungen",
    grammatik: ["Hörensagen -mIş („Hasta olmuş.“)", "„… diyor ki“"],
    wortfelder: ["Bank, Post, Vertrag, Reklamation"],
    kannZiel: "Erledigungen, Gehörtes weitergeben",
  },
  {
    woche: 25,
    phase: 4,
    thema: "Wie ein Muttersprachler",
    grammatik: ["Füllwörter (yani, şey, hani, aslında, neyse)"],
    wortfelder: ["Sprichwörter & Redewendungen", "Smalltalk über Serien/Social Media"],
    kannZiel: "natürlicher klingen",
  },
  {
    woche: 26,
    phase: 4,
    thema: "Abschluss",
    grammatik: ["große Wiederholung", "Abschlusstest"],
    wortfelder: ["10 Minuten freies Gespräch mit Pasha", "Urkunde „Sherin Türkçe konuşuyor!“"],
    kannZiel: "10 Minuten frei mit Pasha sprechen",
  },
];

export function stationFuer(woche: number): Station | undefined {
  return lehrplan.find((s) => s.woche === woche);
}
