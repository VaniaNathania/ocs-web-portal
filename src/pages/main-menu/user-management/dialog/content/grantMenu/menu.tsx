import RoleMenuMain from "./main";
import { MenuListProvider } from "./hook/MenuProvider";

const UserGrantMenuContent = () => {
  return (
    <MenuListProvider>
      <RoleMenuMain />
    </MenuListProvider>
  );
};

export default UserGrantMenuContent;
