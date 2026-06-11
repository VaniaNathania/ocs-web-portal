import { DataGridInner } from "@/components";
import { TcelBalanceAdjustmentProvider } from "./hooks/TcelBalanceAjustmentContext";
// import { TcelBalanceAdjustmentProvider } from "./hooks/TcelBalanceAdjustmentContext";
// import BalanceEditDialog from "./blocks/BalanceEditDialog";

const TcelBalanceAdjustment = () => {
  return (
    <>
      <TcelBalanceAdjustmentProvider>
        <DataGridInner />
      </TcelBalanceAdjustmentProvider>
    </>
  );
};

export default TcelBalanceAdjustment;
