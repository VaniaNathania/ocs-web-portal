import { useUserManagement } from "../hook/useUserManagemet";
import UserGrantMenuContent from "./content/grantMenu/menu";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserGrantMenu = () => {
  const { showGrantMenu, setShowGrantMenu } = useUserManagement();

  return (
    <UserDialogWrapper
      title="User Grant Menu"
      onClose={() => setShowGrantMenu(false)}
      isOpen={showGrantMenu}
      handleDialog={setShowGrantMenu}
    >
      <UserGrantMenuContent />
    </UserDialogWrapper>
  );
};
