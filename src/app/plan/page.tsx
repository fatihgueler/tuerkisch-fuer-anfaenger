import { alleWochen } from "@/content";
import { PlanReise } from "@/components/plan-reise";

export default async function PlanSeite() {
  return <PlanReise vorhanden={(await alleWochen()).map((w) => w.woche)} />;
}
