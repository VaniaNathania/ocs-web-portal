import { useEffect } from "react";
import useRecurringBenefitContext from "../hooks/useRecurringBenefitContext";
import AddPriceDialog from "./AddPriceDialog";
import EditPriceDialog from "./EditPriceDialog";
import { useRecurringPriceContext } from "../../../hooks";

const PriceBenefitDialog = () => {
  const { setSelectedMapping } = useRecurringPriceContext();
  const { showPriceDialog } = useRecurringBenefitContext();

  useEffect(() => {
    if (!showPriceDialog.show) {
      setSelectedMapping(null);
    }
  }, [showPriceDialog.show]);

  return (
    <>
      {showPriceDialog.show && showPriceDialog.mode === "create" && (
        <AddPriceDialog />
      )}

      {showPriceDialog.show && showPriceDialog.mode === "update" && (
        <EditPriceDialog />
      )}
    </>
  );
};

export default PriceBenefitDialog;
