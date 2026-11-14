import { uebersicht, vokabelIndex } from "@/content";
import { Wiederholen } from "@/components/wiederholen";

export default async function WiederholenSeite({ searchParams }: { searchParams: Promise<{ kurz?: string }> }) {
  const { kurz } = await searchParams;
  return <Wiederholen vokabeln={await vokabelIndex()} wochen={await uebersicht()} kurz={kurz === "1"} />;
}
