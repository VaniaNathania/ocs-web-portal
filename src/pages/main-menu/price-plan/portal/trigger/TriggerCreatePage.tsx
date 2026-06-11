import { Container, DataGridInner } from "@/components";
import { TriggerCreateContextProvider } from "./hooks";
import { DetailAccumulationDialog } from "./blocks";
import { AddBalanceDialog } from "./blocks";
// import { AddAdvanceRuleDialog } from "./blocks/AddAdvanceRuleTrigger";
import { ThresholdBalanceDialog } from "./blocks/balance/ThresholdBalanceDialog";

export default function TriggerCreatePage() {
  return (
    <TriggerCreateContextProvider>
      {/* <AddAdvanceRuleDialog /> */}
    </TriggerCreateContextProvider>
  );
}
