import SideBarDialogBlock from "@/pages/main-menu/role-management/block/SideBarDialogBlock";
import SideBarListBlock from "@/pages/main-menu/role-management/block/SideBarListBlock";
import { useRoleLayout } from "../RoleLayoutProvider";
import { RoleListProvider } from "@/pages/main-menu/role-management/hook/RoleListProvider";
import DeleteDialog from "@/pages/main-menu/role-management/block/DeleteDialog";

const SideBar = () => {
  const { selectedRow, setSelectedRow } = useRoleLayout();
  const styleDiv =
    "w-full md:w-1/2 lg:w-full bg-white shadow-lg rounded-md p-5 overflow-hidden";

  return (
    <div className="">
      <RoleListProvider>
        <DeleteDialog />
        <div className="flex flex-col md:flex-row lg:flex-col gap-2">
          <SideBarListBlock styleDiv={styleDiv} />
          <SideBarDialogBlock styleDiv={styleDiv} />
        </div>
      </RoleListProvider>
    </div>
  );
};

export { SideBar };
