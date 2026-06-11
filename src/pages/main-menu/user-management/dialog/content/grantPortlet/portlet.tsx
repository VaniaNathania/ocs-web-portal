import { PortletListProvider } from "./hook/PortletsProvider";
import RolePortletMain from "./main";

const UserGrantPortletContent = () => {
  return (
    <PortletListProvider>
      <RolePortletMain />
    </PortletListProvider>
  );
};

export default UserGrantPortletContent;
