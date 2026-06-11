import {
  DialogWrapper,
  ParentDialogProps,
} from "@/pages/main-menu/role-management/generalUseComp";

import ModHistoryTable from "../block/ModHistoryTable";

const Main = ({ isOpen, handleDialog }: ParentDialogProps) => {
  return (
    <DialogWrapper
      title="Modify History"
      isOpen={isOpen}
      handleDialog={handleDialog}
      size={{ width: "6xl" }}
    >
      <div className="flex flex-col gap-5">
        <ModHistoryTable />
      </div>
    </DialogWrapper>
  );
};

export default Main;
