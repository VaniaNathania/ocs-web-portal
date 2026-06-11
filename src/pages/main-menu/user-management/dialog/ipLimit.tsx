import { useUserManagement } from "../hook/useUserManagemet";
import UserGrantIPLimitContent from "./content/IPLimit/ipLimit";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserIPLimit = () => {
  const { showIPLimit, setShowIPLimit } = useUserManagement();

  return (
    <UserDialogWrapper
      title="User IP Limit"
      onClose={() => setShowIPLimit(false)}
      detail={false}
      size={{ width: "xl", height: "500px" }}
      isOpen={showIPLimit}
      handleDialog={setShowIPLimit}
      desc=""
      scrollAble={false}
    >
      <UserGrantIPLimitContent />
    </UserDialogWrapper>
  );
};
