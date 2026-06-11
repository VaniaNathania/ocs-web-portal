import { AvailableMenu } from "./block/AvailableMenu";
import { OwnedRoleMenu } from "./block/OwnedRoleMenu";
import { Button } from "@mui/material";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import {
  Menu,
  MenuArrow,
  TMenuConfig,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
} from "@/components/menu";
import { useMenuList } from "./hook/useMenu";
import { useState } from "react";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { MenuData } from "./menuInterfaces";
import { PortalMenu } from "./block/Portal";
import { DirectoryMenu } from "./block/Directory";
import { useUserManagement } from "../../../hook/useUserManagemet";
import { useUserLayout } from "@/layouts/main-menu/user-management";
import {
  buttonMenusOps,
  MenusCompGroupBtnAccess,
} from "@/pages/main-menu/role-management/generalUseComp";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

const RoleMenuMain = () => {
  const {
    showEditDialog,
    setIsEditing,
    isEditing,
    // handleEditDialog,
    availableMenus,
    selectedAvailable,
    setSelectedAvailable,
    ownedMenus,
    setSelectedOwned,
    selectedOwned,
    option,
    setOption,
    fetchAll,
  } = useMenuList();

  const { selectedRow, setOnConfirm, setDesc, setShowConfirm } =
    useUserManagement();
  const { PostData, DeleteData } = useCallApi();

  const handleUpdate = async (data: MenuData[]) => {
    try {
      // console.log("🚀 Editing role with data:", data);

      // const payload = data.map((item) => ({
      //   privId: item.privId,
      //   privLevel: item.privEl,
      //   roleId: selectedRow?.roleId,
      // }));

      const response = await PostData(
        `${API_ROLE}/api/users/${selectedRow?.userId}/privs/new`,
        data,
      );

      // console.log("📦 API Response:", response);

      if (response?.status) {
        toast.success("Portal edited successfully!");

        const createActivity = {
          module: "Manage User Management",
          description: `Edit User Portal=> ${selectedRow?.userName}`,
          action: "E",
        };
        doSaveLogActivity(createActivity);

        // console.log("✅ Role created successfully");
      } else {
        const errorMessage =
          response?.message || "Failed to create role. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
      setSelectedAvailable([]);
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ Error creating role:", error);
      throw error; // Re-throw to be caught by the caller
    } finally {
      await fetchAll();
    }
  };

  const handleDelete = async (data: MenuData[]) => {
    try {
      // console.log("🚀 Editing role with data:", data);
      // const payload = data.map((item) => item.privId);

      const response = await DeleteData(
        `${API_ROLE}/api/users/${selectedRow?.userId}/privs/new`,
        data,
      );

      // console.log("📦 API Response:", response);

      if (response?.status) {
        toast.success("Portal edited successfully!");

        const createActivity = {
          module: "Manage User Management",
          description: `Edit User Portal=> ${selectedRow?.userName}`,
          action: "E",
        };
        doSaveLogActivity(createActivity);

        // console.log("✅ Role created successfully");
      } else {
        const errorMessage =
          response?.message || "Failed to create role. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
      setSelectedOwned([]);
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ Error creating role:", error);
      throw error; // Re-throw to be caught by the caller
    } finally {
      await fetchAll();
    }
  };

  const AllAvaToOwn = async () => {
    setIsEditing(true);
    try {
      await handleUpdate(availableMenus);
    } catch (error) {
      toast.error("Failed to edit");
    } finally {
      setIsEditing(false);
      setShowConfirm(false);
    }
  };

  const AllOwnToAva = async () => {
    setIsEditing(true);
    try {
      await handleDelete(ownedMenus);
    } catch (error) {
      toast.error("Failed to edit");
    } finally {
      setIsEditing(false);
      setShowConfirm(false);
    }
  };

  const AvaToOwn = async () => {
    setIsEditing(true);
    try {
      await handleUpdate(selectedAvailable);
    } catch (error) {
      toast.error("Failed to edit");
    } finally {
      setIsEditing(false);
      setShowConfirm(false);
    }
  };

  const OwnToAva = async () => {
    setIsEditing(true);
    try {
      await handleDelete(selectedOwned);
    } catch (error) {
      toast.error("Failed to edit");
    } finally {
      setIsEditing(false);
      setShowConfirm(false);
    }
  };

  const handleButton = (process: () => void, description: string) => {
    // console.log(description);

    setDesc(description);
    setOnConfirm(() => process);
    setShowConfirm(true);
  };

  const { menuPrivAccess } = useUserLayout();

  const buttonMenusOps: buttonMenusOps[] = [
    {
      ops: AllAvaToOwn,
      desc: `Are you sure to give all menus access to user ${selectedRow?.userName}`,
      icon: <MdKeyboardDoubleArrowDown />,
    },
    {
      ops: AvaToOwn,
      desc: `Are you sure to give selected menus access to user ${selectedRow?.userName}`,
      icon: <MdArrowDownward />,
    },
    {
      ops: OwnToAva,
      desc: `Are you sure to take all selected access to user ${selectedRow?.userName}`,
      icon: <MdArrowUpward />,
    },
    {
      ops: AllOwnToAva,
      desc: `Are you sure to take all menus access to user ${selectedRow?.userName}`,
      icon: <MdKeyboardDoubleArrowUp />,
    },
  ];

  return (
    <div className="w-full bg-white rounded-md p-5 space-y-10 min-w-fit">
      <div>
        <div>
          <Menu className="space-x-10">
            <MenuItem
              key="portal"
              className={
                option
                  ? "border-b-2 border-b-transparent pb-5"
                  : "border-b-2 border-b-gray-900 pb-5"
              }
              onClick={() => setOption(false)}
            >
              <MenuLink>
                <MenuTitle>Grant By Portal</MenuTitle>
              </MenuLink>
            </MenuItem>
            <MenuItem
              key="directory"
              className={
                !option
                  ? "border-b-2 border-b-transparent pb-5"
                  : "border-b-2 border-b-gray-900 pb-5"
              }
              onClick={() => setOption(true)}
            >
              <MenuLink>
                <MenuTitle>Grant By Directory</MenuTitle>
              </MenuLink>
            </MenuItem>
          </Menu>
        </div>
        <div className="w-full flex lg:flex-row lg:space-x-5 lg:space-y-0 flex-col space-y-5 overflow-clip">
          <div className="w-full lg:w-1/2">
            {!option ? <PortalMenu /> : <DirectoryMenu />}
          </div>
          <div className="w-full lg:w-1/2">
            <AvailableMenu />
          </div>
        </div>
      </div>
      <MenusCompGroupBtnAccess
        buttonMenuOps={buttonMenusOps}
        handleButton={handleButton}
        hasAccess={menuPrivAccess?.editStatus ?? false}
      />
      <OwnedRoleMenu />
    </div>
  );
};

export default RoleMenuMain;
