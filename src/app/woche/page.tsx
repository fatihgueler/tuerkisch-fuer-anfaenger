import { uebersicht } from "@/content";
import { WochenAnsicht } from "@/components/wochen-ansicht";

export default async function WocheSeite() {
  return <WochenAnsicht wochen={await uebersicht()} />;
}
