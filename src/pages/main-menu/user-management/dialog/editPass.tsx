import { useUserManagement } from "../hook/useUserManagemet";
import { EditPassContent } from "./content/EditPassContent";
import { UserDialogWrapper } from "./userDialogWraper";

export const UserEditPass = () => {
  const { showEditPass, setShowEditPass } = useUserManagement();

  return (
    <UserDialogWrapper
      title="Edit Password"
      onClose={() => setShowEditPass(false)}
      detail={true}
      size={{ width: "md", height: "" }}
      isOpen={showEditPass}
      handleDialog={setShowEditPass}
    >
      <EditPassContent />
    </UserDialogWrapper>
  );
};
