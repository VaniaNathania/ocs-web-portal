import { DirMenuBindPortalProvider } from "./hook/DirMenuBindPortalProvider";
import RoleUserMain from "./main";

interface Props {
  selectedRow: any;
}

export const DirMenuBindPortalContent = () => {
  return (
    <DirMenuBindPortalProvider>
      <RoleUserMain />
    </DirMenuBindPortalProvider>
  );
};
