import { PortalListProvider } from "./hook/PortalProvider";
import RolePortalMain from "./main";

const RolePortal = () => {
  return (
    <PortalListProvider>
      <RolePortalMain />
    </PortalListProvider>
  );
};

export default RolePortal;
