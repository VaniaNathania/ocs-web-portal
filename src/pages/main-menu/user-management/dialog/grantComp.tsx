import { useUserManagement } from "../hook/useUserManagemet";
import UserGrantCompContent from "./content/grantComp/component";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserGrantComp = () => {
  const { showGrantComp, setShowGrantComp } = useUserManagement();

  return (
    <UserDialogWrapper
      title="User Grant Component"
      onClose={() => setShowGrantComp(false)}
      isOpen={showGrantComp}
      handleDialog={setShowGrantComp}
    >
      <UserGrantCompContent />
    </UserDialogWrapper>
  );
};
