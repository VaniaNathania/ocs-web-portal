import { useRecurringPriceContext } from "../../hooks";
import AddMappingDialog from "./AddMappingDialog";
import EditMappingDialog from "./EditMappingDialog";

const MappingDialog = () => {
  const { showMappingDialog } = useRecurringPriceContext();

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
