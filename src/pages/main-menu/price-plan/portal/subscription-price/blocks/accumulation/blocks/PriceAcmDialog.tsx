import { useAccumulationContext } from "../hooks/useAccumulationContext";
import AddPriceDialog from "./AddPriceDialog";
import EditPriceDialog from "./EditPriceDialog";

const PriceAcmDialog = () => {
  const { showPriceDialog } = useAccumulationContext();

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

export default PriceAcmDialog;
