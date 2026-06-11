import { useSubscriptionPriceCreateContext } from "../hooks";
import AddRatePlanDialog from "./AddRatePlanDialog";
import EditRatePlanDialog from "./EditRatePlanDialog";

const RatePlanDialog = () => {
  const { showRatePlanDialog } = useSubscriptionPriceCreateContext();

  return (
    <>
      {showRatePlanDialog.show && showRatePlanDialog.mode === "create" && (
        <AddRatePlanDialog />
      )}

      {showRatePlanDialog.show && showRatePlanDialog.mode === "update" && (
        <EditRatePlanDialog />
      )}
    </>
  );
};

export default RatePlanDialog;
