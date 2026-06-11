import { AvailablePortal } from "./block/AvailablePortal";
import { OwnedRolePortal } from "./block/OwnedRolePortal";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { usePortalList } from "./hook/usePortal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { PortalData } from "./hook/PortalProvider";
import { EditRoleDialog } from "../../block/EditRoleDialog";
import { buttonMenusOps, MenusCompGroupBtnAccess } from "../../generalUseComp";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

const RolePortalMain = () => {
  const {
    showEditDialog,
    setIsEditing,
    isEditing,
    handleEditDialog,
    availablePortal,
    selectedAvailable,
    setSelectedAvailable,
    ownedPortal,
    setSelectedOwned,
    selectedOwned,
    fetchAll,
  } = usePortalList();

  const { selectedRow, menuPrivAccess } = useRoleLayout();
  const { PutData, DeleteData } = useCallApi();

  const [confirmFunction, setConfirmFunction] = useState<() => void>(() => {});

  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    document.title = "Role Management | Portal";
  }, []);

  const handleUpdate = async (data: PortalData[]) => {
    try {
      // console.log("🚀 Editing role with data:", data);

      const response = await PutData(
        `${API_ROLE}/api/roles/${selectedRow?.roleId}/portals/new`,
        data,
      );

      // console.log("📦 API Response:", response);

      if (response?.status) {
        toast.success("Role edited successfully!");

        const createActivity = {
          module: "Manage Role Management",
          description: `Edit Role=> ${selectedRow?.roleName}`,
          action: "E",
        };
        // doSaveLogActivity(createActivity);

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
    } finally {
      fetchAll();
    }
  };

  const handleDelete = async (data: PortalData[]) => {
    try {
      // console.log("🚀 Editing role with data:", data);

      const response = await DeleteData(
        `${API_ROLE}/api/roles/${selectedRow?.roleId}/portals`,
        data,
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
    } finally {
      fetchAll();
    }
  };

  const AllAvaToOwn = async () => {
    setIsEditing(true);
    try {
      await handleUpdate(availablePortal);
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
      await handleDelete(ownedPortal);
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

  // Define the array
  const buttonMenusOps: buttonMenusOps[] = [
    {
      ops: AllAvaToOwn,
      desc: `Are you sure to gave all portals access to role ${selectedRow?.roleName}`,
      icon: <MdKeyboardDoubleArrowDown />,
    },
    {
      ops: AvaToOwn,
      desc: `Are you sure to gave selected portals access to role ${selectedRow?.roleName}`,
      icon: <MdArrowDownward />,
    },
    {
      ops: OwnToAva,
      desc: `Are you sure to take selected portals access from role ${selectedRow?.roleName}`,
      icon: <MdArrowUpward />,
    },
    {
      ops: AllOwnToAva,
      desc: `Are you sure to take all portals access from role ${selectedRow?.roleName}`,
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
        <AvailablePortal />

        <MenusCompGroupBtnAccess
          buttonMenuOps={buttonMenusOps}
          handleButton={handleButton}
          hasAccess={menuPrivAccess?.editStatus ?? false}
        />

        <OwnedRolePortal />
      </div>
    </div>
  );
};

export default RolePortalMain;
