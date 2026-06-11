import RoleMenuMain from "./main";
import { MenuListProvider } from "./hook/MenuProvider";

const RoleMenu = () => {
  return (
    <MenuListProvider>
      <RoleMenuMain />
    </MenuListProvider>
  );
};

export default RoleMenu;
