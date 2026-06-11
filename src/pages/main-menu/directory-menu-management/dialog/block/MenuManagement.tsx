import { useCompList } from "../../hook/useComp";
import DirMenuManagementContent from "../content/MenuManagement/dirMenuManagement";
import { DirMenuDialogWrapper } from "../DirMenuDialogWraper";

export const DirMenuMenuManagement = () => {
  const { showMenuManagement, setShowMenuManagement } = useCompList();

  return (
    <DirMenuDialogWrapper
      title="Menu Management"
      onClose={() => setShowMenuManagement(false)}
      detail={false}
      size={{ width: "6xl", height: "" }}
      isOpen={showMenuManagement}
      handleDialog={setShowMenuManagement}
    >
      <DirMenuManagementContent />
    </DirMenuDialogWrapper>
  );
};
