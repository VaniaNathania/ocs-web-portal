import { useUserManagement } from "../hook/useUserManagemet";
import { UserGrantDPContent } from "./content/grantDataPrivelage/grantDP";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserGrantDataPrivelage = () => {
  const { showGrantDataPrivelage, setShowGrantDataPrivelage } =
    useUserManagement();

  return (
    <UserDialogWrapper
      title="User Grant Data Privelage"
      onClose={() => setShowGrantDataPrivelage(false)}
      isOpen={showGrantDataPrivelage}
      handleDialog={setShowGrantDataPrivelage}
      scrollAble={false}
    >
      <UserGrantDPContent />
    </UserDialogWrapper>
  );
};
