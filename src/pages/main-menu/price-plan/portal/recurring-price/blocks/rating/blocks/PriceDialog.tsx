import { useEffect } from "react";
import { useRecurringPriceContext } from "../../../hooks";
import useRecurrringRatingContext from "../hooks/useRecurringRatingContext";
import AddPriceDialog from "./AddPriceDialog";
import EditPriceDialog from "./EditPriceDialog";

const PriceDialog = () => {
  const { setSelectedMapping } = useRecurringPriceContext();
  const { showPriceDialog } = useRecurrringRatingContext();

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

export default PriceDialog;
