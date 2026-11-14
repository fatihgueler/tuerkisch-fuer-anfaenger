import { notFound } from "next/navigation";
import { alleWochen, ladeLektion, ladeWoche, vokabelIndex } from "@/content";
import { LektionPlayer } from "@/components/lektion-player";

export async function generateStaticParams() {
  return (await alleWochen()).flatMap((w) => w.lektionen.map((l) => ({ woche: String(w.woche), tag: String(l.tag) })));
}
export const dynamicParams = false;

export default async function LektionSeite({ params }: { params: Promise<{ woche: string; tag: string }> }) {
  const { woche, tag } = await params;
  const w = Number(woche);
  const lektion = await ladeLektion(w, Number(tag));
  if (!lektion) notFound();
  const vokabeln = await vokabelIndex(w);
  const vorwoche = await ladeWoche(w - 1);
  const vorwocheIds = vorwoche?.lektionen.flatMap((l) => l.vokabeln.map((v) => v.id)) ?? [];
  return <LektionPlayer lektion={lektion} vokabeln={vokabeln} vorwocheIds={vorwocheIds} />;
}
