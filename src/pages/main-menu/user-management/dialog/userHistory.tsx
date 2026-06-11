import { useUserManagement } from "../hook/useUserManagemet";
import UserGrantHistoryDataContent from "./content/UserHistory/userHistory";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserHistory = () => {
  const { showUserHistory, setShowUserHistory } = useUserManagement();

  return (
    <UserDialogWrapper
      title="User History"
      onClose={() => setShowUserHistory(false)}
      isOpen={showUserHistory}
      handleDialog={setShowUserHistory}
      desc=""
    >
      <UserGrantHistoryDataContent />
    </UserDialogWrapper>
  );
};
