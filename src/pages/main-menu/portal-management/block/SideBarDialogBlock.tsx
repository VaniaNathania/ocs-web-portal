import { PortalData } from "../../role-management/outlet/portal/hook/PortalProvider";
import { SideBarDialog } from "../component/sideBarDialog";
import { AppListProvider } from "../hook/AppListProvider";
import { useAppList } from "../hook/useAppsList";

// interface FormData {
//   roleId: number;
//   roleName: string;
//   roleCode: string;
//   comment?: string;
//   isLocked: string;
//   appId: number;
// }

interface SideBarDialogBlockProps {
  styleDiv: string;
}

const SideBarDialogBlock = ({ styleDiv }: SideBarDialogBlockProps) => {
  return (
    <AppListProvider>
      <SideBarDialog styleDiv={styleDiv} />
    </AppListProvider>
  );
};

export default SideBarDialogBlock;
