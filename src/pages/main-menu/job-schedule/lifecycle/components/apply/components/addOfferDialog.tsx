import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import AddOfferDialogMain from "./addOfferDialogMain";
import { useOfferApply } from "../hooks/context";

const AddOfferDialog = () => {
  const { dialogOpen, setDialogOpen } = useOfferApply();
  return (
    <DialogWrapper
      isOpen={dialogOpen}
      handleDialog={setDialogOpen}
      title="Life Cycle Apply"
      size={{ width: "4xl" }}
    >
      <AddOfferDialogMain />
    </DialogWrapper>
  );
};

export default AddOfferDialog;
