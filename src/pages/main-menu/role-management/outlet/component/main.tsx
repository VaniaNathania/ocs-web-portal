import { Button } from "@mui/material";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { useCompList } from "./hook/useComp";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { MenuData } from "./hook/CompProvider";
import { EditRoleDialog } from "../../block/EditRoleDialog";
import { AvailableComp } from "./block/AvailableComp";
import { OwnedRoleComp } from "./block/OwnedRoleMenu";
import { DirectoryMenu } from "./block/DirectoryComp";
import { buttonMenusOps, MenusCompGroupBtnAccess } from "../../generalUseComp";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

const RoleCompMain = () => {
  const {
    showEditDialog,
    setIsEditing,
    isEditing,
    handleEditDialog,
    availableComponents,
    selectedAvailable,
    setSelectedAvailable,
    ownedComponents,
    setSelectedOwned,
    selectedOwned,
    fetchAll,
    noMenu,
  } = useCompList();

  const { selectedRow, menuPrivAccess } = useRoleLayout();
  const { PostData, DeleteData } = useCallApi();

  const [confirmFunction, setConfirmFunction] = useState<() => void>(() => {});
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    document.title = "Role Management | Component";
  }, []);

  const handleUpdate = async (data: MenuData[]) => {
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

  const handleDelete = async (data: MenuData[]) => {
    try {
      // console.log("🚀 Editing role with data:", data);
      const payload = data.map((item) => item.privId);

      const response = await DeleteData(
        `${API_ROLE}/api/roles/${selectedRow?.roleId}/privs`,
        payload,
      );

      // console.log("📦 API Response:", response);

      if (response?.status) {
        toast.success("Role edited successfully!");

        const createActivity = {
          module: "Manage Role Management",
          description: `Edit Role => ${selectedRow?.roleName}`,
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
      await handleUpdate([...availableComponents, ...noMenu]);
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
      await handleDelete(ownedComponents);
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

  const handleButton = (process: () => void, description: string) => {
    setDescription(description);
    setConfirmFunction(() => process);
    handleEditDialog(true);
  };

  const buttonMenusOps: buttonMenusOps[] = [
    {
      ops: AllAvaToOwn,
      desc: `Are you sure to gave all menus access to role ${selectedRow?.roleName}`,
      icon: <MdKeyboardDoubleArrowDown />,
    },
    {
      ops: AvaToOwn,
      desc: `Are you sure to gave selected menus access to role ${selectedRow?.roleName}`,
      icon: <MdArrowDownward />,
    },
    {
      ops: OwnToAva,
      desc: `Are you sure to take selected menus access from role ${selectedRow?.roleName}`,
      icon: <MdArrowUpward />,
    },
    {
      ops: AllOwnToAva,
      desc: `Are you sure to take all menus access from role ${selectedRow?.roleName}`,
      icon: <MdKeyboardDoubleArrowUp />,
    },
  ];

  return (
    <div className="w-full bg-white shadow-lg rounded-md p-5">
      <EditRoleDialog
        open={showEditDialog}
        onClose={() => handleEditDialog(false)}
        onConfirm={confirmFunction}
        description={description}
        handleEditDialog={handleEditDialog}
        isEditing={isEditing}
      />
      <div className="space-y-10">
        <div className="w-full flex lg:flex-row lg:space-x-5 lg:space-y-0 flex-col space-y-5 overflow-clip">
          <div className="w-full">
            <DirectoryMenu />
          </div>
          <div className="w-full">
            <AvailableComp />
          </div>
        </div>
        <MenusCompGroupBtnAccess
          buttonMenuOps={buttonMenusOps}
          handleButton={handleButton}
          hasAccess={menuPrivAccess?.editStatus ?? false}
        />
        <OwnedRoleComp />
      </div>
    </div>
  );
};

export default RoleCompMain;
