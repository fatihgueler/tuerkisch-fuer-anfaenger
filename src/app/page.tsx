import { notizenVonPasha, uebersicht } from "@/content";
import { Heute } from "@/components/heute";

export default async function HeuteSeite() {
  return <Heute wochen={await uebersicht()} notizen={notizenVonPasha()} />;
}
