import { UserRoleGrantProvider } from "./hook/UserRoleGrantProvider";
import RoleUserMain from "./main";

interface Props {
  selectedRow: any;
}

export const UserGrantRoleContent = () => {
  return (
    <UserRoleGrantProvider>
      <RoleUserMain />
    </UserRoleGrantProvider>
  );
};
