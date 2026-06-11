import { useRecurringPriceContext } from "../hooks";
import CreateRatePlanDialog from "./CreateRatePlanDialog";
import EditRatePlanDialog from "./EditRatePlanDialog";

const RatePlanDialog = () => {
  const { showRatePlanDialog } = useRecurringPriceContext();

  return (
    <>
      {showRatePlanDialog.show && showRatePlanDialog.mode === "create" && (
        <CreateRatePlanDialog />
      )}

      {showRatePlanDialog.show && showRatePlanDialog.mode === "update" && (
        <EditRatePlanDialog />
      )}
    </>
  );
};

export default RatePlanDialog;
