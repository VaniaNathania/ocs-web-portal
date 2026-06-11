import { useEffect } from "react";
import { ConfirmDialog } from "./block/confirmationDialog";
import { NavBtn } from "./block/navButton";
import { DirMenuBindPortal } from "./dialog/block/BindPortal";
import { DirMenuImport } from "./dialog/block/Import";
import { DirMenuMenuManagement } from "./dialog/block/MenuManagement";
import { DirMenuMenuSelector } from "./dialog/block/MenuSelector";
import { DirMenuNewDir } from "./dialog/block/NewDir";
import { useCompList } from "./hook/useComp";
import { DirectoryMenuManagementComp } from "./block/DirMenuComp";

const RoleCompMain = () => {
  // console.log("test di main");
  const { showConfirm, setShowConfirm, onConfirm, desc } = useCompList();
  useEffect(() => {
    document.title = "Directory Menu Management";
  }, []);

  return (
    <div>
      <ConfirmDialog
        isOpen={showConfirm}
        handleDialog={setShowConfirm}
        onConfirm={onConfirm}
        desc={desc}
      />
      <DirMenuBindPortal />
      <DirMenuImport />
      <DirMenuNewDir />
      <DirMenuMenuSelector />
      <DirMenuMenuManagement />
      <div className="space-y-5 mb-5">
        <NavBtn />
        <DirectoryMenuManagementComp />
      </div>
    </div>
  );
};

export default RoleCompMain;
