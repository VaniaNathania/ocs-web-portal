import { UserListProvider } from "./hook/UserProvider";
import RoleUserMain from "./main";

interface Props {
  selectedRow: any;
}

const RoleUser = () => {
  return (
    <UserListProvider>
      <RoleUserMain />
    </UserListProvider>
  );
};

export default RoleUser;
