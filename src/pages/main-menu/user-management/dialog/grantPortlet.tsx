import { useUserManagement } from "../hook/useUserManagemet";
import UserGrantPortletContent from "./content/grantPortlet/portlet";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserGrantPortlet = () => {
  const { showGrantPortlet, setShowGrantPortlet } = useUserManagement();

  return (
    <UserDialogWrapper
      title="User Grant Portlet"
      onClose={() => setShowGrantPortlet(false)}
      isOpen={showGrantPortlet}
      handleDialog={setShowGrantPortlet}
    >
      <UserGrantPortletContent />
    </UserDialogWrapper>
  );
};
