import { useUserManagement } from "../hook/useUserManagemet";
import { UserGrantRoleContent } from "./content/grantRole/grantRole";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserGrantRole = () => {
  const { showGrantRole, setShowGrantRole } = useUserManagement();

  return (
    <UserDialogWrapper
      title="User Grant Role"
      onClose={() => setShowGrantRole(false)}
      isOpen={showGrantRole}
      desc=""
      handleDialog={setShowGrantRole}
    >
      <UserGrantRoleContent />
    </UserDialogWrapper>
  );
};
