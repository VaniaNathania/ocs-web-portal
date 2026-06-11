import { UserGrantPortalProvider } from "./hook/UserGrantPortalProvider";
import RoleUserMain from "./main";

interface Props {
  selectedRow: any;
}

export const UserGrantPortalContent = () => {
  return (
    <UserGrantPortalProvider>
      <RoleUserMain />
    </UserGrantPortalProvider>
  );
};
