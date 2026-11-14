import { notFound } from "next/navigation";
import { alleWochen, ladeWoche, vokabelIndex } from "@/content";
import { SonntagsTest } from "@/components/sonntags-test";

export async function generateStaticParams() {
  return (await alleWochen()).map((w) => ({ woche: String(w.woche) }));
}
export const dynamicParams = false;

export default async function SonntagSeite({ params }: { params: Promise<{ woche: string }> }) {
  const n = Number((await params).woche);
  const woche = await ladeWoche(n);
  if (!woche) notFound();
  return <SonntagsTest woche={woche} vokabeln={await vokabelIndex(n)} />;
}
