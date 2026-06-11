import { AvailablePortlet } from "./block/AvailablePortlet";
import { OwnedRolePortlet } from "./block/OwnedRolePortlet";
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
import { usePortletList } from "./hook/usePortlet";
import { useState } from "react";
import { toast } from "sonner";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { PortalMenu } from "./block/Portal";
import { DirectoryMenu } from "./block/Directory";
import { Portlet } from "./hook/PortletsProvider";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

const RolePortletMain = () => {
  const {
    showEditDialog,
    setIsEditing,
    isEditing,
    handleEditDialog,
    availablePortlets,
    selectedAvailable,
    setSelectedAvailable,
    ownedPortlets,
    setSelectedOwned,
    selectedOwned,
    fetchAll,
    option,
    setOption,
  } = usePortletList();

  const { selectedRow } = useRoleLayout();
  const { PostData, DeleteData } = useCallApi();

  const [confirmFunction, setConfirmFunction] = useState<() => void>(() => {});
  const [description, setDescription] = useState<string>("");

  const handleUpdate = async (data: Portlet[]) => {
    try {
      //  console.log("🚀 Editing role with data:", data);

      const payload = data.map((item) => ({
        privId: item.privId,
        privLevel: item.privEl,
        roleId: selectedRow?.roleId,
      }));

      const response = await PostData(
        `${API_ROLE}/api/roles/${selectedRow?.roleId}/privs/new`,
        data,
      );

      //  console.log("📦 API Response:", response);

      if (response?.status) {
        toast.success("Portal edited successfully!");

        const createActivity = {
          module: "Manage Role Management",
          description: `Edit Role Portal=> ${selectedRow?.roleName}`,
          action: "E",
        };
        doSaveLogActivity(createActivity);

        //  console.log("✅ Role created successfully");
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

  const handleDelete = async (data: Portlet[]) => {
    try {
      //  console.log("🚀 Editing role with data:", data);
      const payload = data.map((item) => item.privId);

      const response = await DeleteData(
        `${API_ROLE}/api/roles/${selectedRow?.roleId}/privs`,
        payload,
      );

      //  console.log("📦 API Response:", response);

      if (response?.status) {
        toast.success("Portal edited successfully!");

        const createActivity = {
          module: "Manage Role Management",
          description: `Edit Role Portal=> ${selectedRow?.roleName}`,
          action: "E",
        };
        doSaveLogActivity(createActivity);

        //  console.log("✅ Role created successfully");
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
      await handleUpdate(availablePortlets);
    } catch (error) {
      toast.error("Failed to edit");
    } finally {
      setIsEditing(false);
      handleEditDialog(false);
    }
  };

  const AllOwnToAva = async () => {
    setIsEditing(true);
    try {
      await handleDelete(ownedPortlets);
    } catch (error) {
      toast.error("Failed to edit");
    } finally {
      setIsEditing(false);
      handleEditDialog(false);
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
      handleEditDialog(false);
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
      handleEditDialog(false);
    }
  };

  const handleButton = (prosses: () => void, description: string) => {
    setDescription(description);
    setConfirmFunction(() => prosses);
    handleEditDialog(true);
  };

  return (
    <div className="w-full bg-white rounded-md p-5 space-y-10">
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
                <MenuTitle>Grant By Type</MenuTitle>
              </MenuLink>
            </MenuItem>
          </Menu>
        </div>
        <div className="w-full flex lg:flex-row lg:space-x-5 lg:space-y-0 flex-col space-y-5">
          <div className="w-full">
            {!option ? <PortalMenu /> : <DirectoryMenu />}
          </div>
          <div className="w-full">
            <AvailablePortlet />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center align-middle">
        {/* Ini button semua ava ke own */}
        <Button
          onClick={() =>
            handleButton(
              AllAvaToOwn,
              `Are you sure to gave all portals access to role ${selectedRow?.roleName}`,
            )
          }
        >
          <MdKeyboardDoubleArrowDown />
        </Button>
        {/* Ini button ava ke own */}
        <Button
          onClick={() =>
            handleButton(
              AvaToOwn,
              `Are you sure to gave selected portals access to role ${selectedRow?.roleName}`,
            )
          }
        >
          <MdArrowDownward />
        </Button>

        {/* Ini button own ke ava */}
        <Button
          onClick={() =>
            handleButton(
              OwnToAva,
              `Are you sure to take selected portals access from role ${selectedRow?.roleName}`,
            )
          }
        >
          <MdArrowUpward />
        </Button>
        {/* Ini button semua own ke ava */}

        <Button
          onClick={() =>
            handleButton(
              AllOwnToAva,
              `Are you sure to take all portals access from role ${selectedRow?.roleName}`,
            )
          }
        >
          <MdKeyboardDoubleArrowUp />
        </Button>
      </div>
      <OwnedRolePortlet />
    </div>
  );
};

export default RolePortletMain;
