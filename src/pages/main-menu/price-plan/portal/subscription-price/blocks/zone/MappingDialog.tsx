import { useSubscriptionPriceCreateContext } from "../../hooks";
import AddMappingDialog from "./AddMappingDialog";
import EditMappingDialog from "./EditMappingDialog";

const MappingDialog = () => {
  const { showMappingDialog } = useSubscriptionPriceCreateContext();

  return (
    <>
      {showMappingDialog.show && showMappingDialog.mode === "create" && (
        <AddMappingDialog />
      )}

      {showMappingDialog.show && showMappingDialog.mode === "update" && (
        <EditMappingDialog />
      )}
    </>
  );
};

export default MappingDialog;
