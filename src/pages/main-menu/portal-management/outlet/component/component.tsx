import { CompListProvider } from "./hook/CompProvider";
import RoleCompMain from "./main";

const PortalManagement = () => {
  return (
    <CompListProvider>
      <RoleCompMain />
    </CompListProvider>
  );
};

export default PortalManagement;
