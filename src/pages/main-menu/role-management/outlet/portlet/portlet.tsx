import { PortletListProvider } from "./hook/PortletsProvider";
import RolePortletMain from "./main";

const RolePortlet = () => {
  return (
    <PortletListProvider>
      <RolePortletMain />
    </PortletListProvider>
  );
};

export default RolePortlet;
