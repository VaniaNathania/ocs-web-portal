import {
  DialogWrapper,
  ParentDialogProps,
} from "@/pages/main-menu/role-management/generalUseComp";
import { OrderSubsDetailProvider } from "./hooks/SubsDetailContext";
import Main from "./blocks/main";

const SubsDetail = ({ isOpen, handleDialog }: ParentDialogProps) => {
  return (
    <DialogWrapper
      isOpen={isOpen}
      handleDialog={handleDialog}
      title="Subscriber List Detail"
    >
      <OrderSubsDetailProvider>
        <Main />
      </OrderSubsDetailProvider>
    </DialogWrapper>
  );
};

export default SubsDetail;
