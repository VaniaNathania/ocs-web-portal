import { useUserManagement } from "../hook/useUserManagemet";
import { UserExportContent } from "./content/export/export";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserExport = () => {
  const { showExport, setShowExport } = useUserManagement();

  return (
    <UserDialogWrapper
      title="User Export"
      onClose={() => setShowExport(false)}
      detail={false}
      size={{ width: "sm", height: "" }}
      isOpen={showExport}
      handleDialog={setShowExport}
    >
      <UserExportContent />
    </UserDialogWrapper>
  );
};
