import { ParentDialogProps } from "@/pages/main-menu/role-management/generalUseComp";
import { OrderModifyHistoryAccInfoProvider } from "./hook/modifyHistoryContext";
import Main from "./block/main";

const ModHistoryAccInfo = ({ isOpen, handleDialog }: ParentDialogProps) => {
  return (
    <OrderModifyHistoryAccInfoProvider>
      <Main isOpen={isOpen} handleDialog={handleDialog} />
    </OrderModifyHistoryAccInfoProvider>
  );
};

export default ModHistoryAccInfo;
