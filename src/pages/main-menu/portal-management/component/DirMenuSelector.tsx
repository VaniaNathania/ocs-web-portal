import { usePortalLayout } from "@/layouts/main-menu/portal-management";
import { DialogWrapper } from "../../role-management/generalUseComp";
import DirMenuSelectorMain from "./DirMenuSelector/main";

const DirMenuSelector = () => {
  const { showDirMenuSelector, setShowDirMenuSelector } = usePortalLayout();
  return (
    <DialogWrapper
      isOpen={showDirMenuSelector}
      handleDialog={setShowDirMenuSelector}
      title="Directory & Menu Selector"
      size={{ width: "2xl", height: "" }}
    >
      <DirMenuSelectorMain />
    </DialogWrapper>
  );
};

export default DirMenuSelector;
