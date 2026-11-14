import { Ear, MessageCircleHeart, Moon, StickyNote, Sprout } from "lucide-react";
import { alleWochen } from "@/content";
import { SeitenKopf, Seite } from "@/components/seiten-kopf";

const LERNTIPPS = [
  {
    icon: StickyNote,
    titel: "Klebezettel",
    text: "Beschrifte Dinge zu Hause auf Türkisch: kapı (Tür), pencere (Fenster), buzdolabı (Kühlschrank). Du siehst sie hundertmal am Tag – und lernst nebenbei.",
  },
  {
    icon: Ear,
    titel: "Shadowing",
    text: "Satz anhören → sofort nachsprechen, möglichst gleichzeitig. Nicht nachdenken, nur nachmachen. Das trainiert Aussprache und Sprachmelodie.",
  },
  {
    icon: Moon,
    titel: "Zwei Minuten am Abend",
    text: "Fass jeden Abend laut deinen Tag auf Türkisch zusammen – in zwei Minuten. Mit önce, sonra und ein paar Verben reicht es schon.",
  },
  {
    icon: Sprout,
    titel: "Fehler sind Fortschritt",
    text: "Jeder Fehler zeigt dir, was dein Kopf gerade lernt. Pasha versteht dich auch mit falscher Endung – und korrigiert gern.",
  },
  {
    icon: MessageCircleHeart,
    titel: "Nur-Türkisch-Zeit mit Pasha",
    text: "Vereinbart eine feste Zeit, in der nur Türkisch gesprochen wird – zum Beispiel beim Abendessen. Erst 10 Minuten, später länger.",
  },
];

export default async function TippsSeite() {
  const wochen = await alleWochen();
  return (
    <>
      <SeitenKopf titel="Tipps" unter="Merkhilfen & Lerntricks" />
      <Seite>
        <section aria-labelledby="lerntipps" className="mt-5">
          <h2 id="lerntipps" className="mb-3 text-xl font-semibold">
            So bleibt&apos;s hängen
          </h2>
          <ul className="space-y-3">
            {LERNTIPPS.map(({ icon: Icon, titel, text }) => (
              <li key={titel} className="flex gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold">{titel}</h3>
                  <p className="text-[0.97rem]">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="merktipps" className="mt-8">
          <h2 id="merktipps" className="mb-1 text-xl font-semibold">
            Alle Merk-Tipps
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">Gesammelt aus deinen Lektionen.</p>
          {wochen.map((w) => {
            const tipps = w.lektionen.flatMap((l) => [
              ...l.vokabeln.filter((v) => v.merktipp).map((v) => ({ kopf: v.tr, text: v.merktipp! })),
              { kopf: l.merktipp.titel, text: l.merktipp.text },
            ]);
            return (
              <details key={w.woche} className="group mb-2 rounded-2xl bg-card ring-1 ring-border" open={w.woche === wochen[0]?.woche}>
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 font-semibold">
                  Woche {w.woche}
                  <span className="text-sm font-normal text-muted-foreground">{tipps.length} Tipps</span>
                </summary>
                <ul className="space-y-2 px-4 pb-4">
                  {tipps.map((t, i) => (
                    <li key={i} className="rounded-lg border-l-4 border-safran bg-safran-soft/50 p-3">
                      <p className="font-serif font-semibold">
                        {t.kopf}
                      </p>
                      <p className="font-hand text-[1.3rem] leading-snug">{t.text}</p>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </section>
      </Seite>
    </>
  );
}
