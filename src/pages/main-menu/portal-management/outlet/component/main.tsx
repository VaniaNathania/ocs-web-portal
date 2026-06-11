import { ConfirmDialog } from "@/pages/main-menu/directory-menu-management/block/confirmationDialog";
import { PortalManagementComp } from "./block/PortalMgrComp";
import { useCompList } from "./hook/useComp";
import DirMenuSelector from "../../component/DirMenuSelector";

const PortalManagementMain = () => {
  const { showConfirm, setShowConfirm, onConfirm, desc } = useCompList();

  return (
    <div className="w-full h-full flex flex-col">
      <ConfirmDialog
        isOpen={showConfirm}
        handleDialog={setShowConfirm}
        onConfirm={onConfirm}
        desc={desc}
      />
      <DirMenuSelector />
      {/* <DirectoryMenu /> */}
      <PortalManagementComp />
    </div>
  );
};

export default PortalManagementMain;
