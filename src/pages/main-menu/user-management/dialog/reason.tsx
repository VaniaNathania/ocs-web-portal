import { useUserManagement } from "../hook/useUserManagemet";
import { ReasonContent } from "./content/ReasonContent";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserReason = () => {
  const { showReasonDialog, setShowReasonDialog, reDesc } = useUserManagement();

  return (
    <UserDialogWrapper
      title={reDesc}
      onClose={() => setShowReasonDialog(false)}
      size={{ width: "md", height: "" }}
      isOpen={showReasonDialog}
      handleDialog={setShowReasonDialog}
    >
      <ReasonContent />
    </UserDialogWrapper>
  );
};
