import useBenefitContext from "../hooks/useBenefitContext";
import AddPriceDialog from "./AddPriceDialog";
import EditPriceDialog from "./EditPriceDialog";

const PriceBenefitDialog = () => {
  const { showPriceDialog } = useBenefitContext();

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
