import { useUserManagement } from "../hook/useUserManagemet";
import { UserGrantPortalContent } from "./content/grantPortal/grantPortal";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserGrantPortal = () => {
  const { showGrantPortal, setShowGrantPortal } = useUserManagement();

  return (
    <UserDialogWrapper
      title="User Grant Portal"
      onClose={() => setShowGrantPortal(false)}
      isOpen={showGrantPortal}
      handleDialog={setShowGrantPortal}
    >
      <UserGrantPortalContent />
    </UserDialogWrapper>
  );
};
