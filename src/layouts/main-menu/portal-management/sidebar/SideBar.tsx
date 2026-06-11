import { usePortalLayout } from "../PortalLayoutProvider";
import SideBarListBlock from "@/pages/main-menu/portal-management/block/SideBarListBlock";
import SideBarDialogBlock from "@/pages/main-menu/portal-management/block/SideBarDialogBlock";
import { PortalListProvider } from "@/pages/main-menu/portal-management/hook/PortalListProvider";
import DeleteDialog from "@/pages/main-menu/portal-management/block/DeleteDialog";

const SideBar = () => {
  const { selectedRow, setSelectedRow } = usePortalLayout();
  const styleDiv = "w-full bg-white shadow-lg rounded-md p-5 overflow-hidden";

  return (
    <div className="flex flex-col space-y-5">
      <PortalListProvider>
        <DeleteDialog />
        <SideBarListBlock styleDiv={styleDiv} />
        <SideBarDialogBlock styleDiv={styleDiv} />
      </PortalListProvider>
    </div>
  );
};

export { SideBar };
