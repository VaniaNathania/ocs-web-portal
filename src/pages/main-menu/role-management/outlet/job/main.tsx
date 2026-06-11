import { AvailableJob } from "./block/AvailableJob";
import { OwnedRoleJob } from "./block/OwnedRoleJob";
import { Button } from "@mui/material";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { useJobList } from "./hook/useJob";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { JobData } from "./hook/JobProvider";
import { EditRoleDialog } from "../../block/EditRoleDialog";
import { buttonMenusOps, MenusCompGroupBtnAccess } from "../../generalUseComp";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

const RoleJobMain = () => {
  const {
    showEditDialog,
    setIsEditing,
    isEditing,
    handleEditDialog,
    availableJobs,
    selectedAvailable,
    setSelectedAvailable,
    ownedJobs,
    setSelectedOwned,
    selectedOwned,
    fetchAll,
  } = useJobList();

  const { selectedRow, menuPrivAccess } = useRoleLayout();
  const { PostData, DeleteData } = useCallApi();

  const [confirmFunction, setConfirmFunction] = useState<() => void>(() => {});
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    document.title = "Role Management | Job";
  }, []);

  const handleUpdate = async (data: JobData[]) => {
    try {
      // console.log("🚀 Editing role with data:", data);

      const response = await PostData(
        `${API_ROLE}/api/stafforg/jobs/${selectedRow?.roleId}/new`,
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
    } finally {
      fetchAll();
    }
  };

  const handleDelete = async (data: JobData[]) => {
    try {
      // console.log("🚀 Editing role with data:", data);

      const response = await DeleteData(
        `${API_ROLE}/api/stafforg/jobs/${selectedRow?.roleId}/new`,
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

  const buttonMenusOps: buttonMenusOps[] = [
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
  ];

  return (
    <div className="w-full bg-white shadow-lg rounded-md p-5 ">
      <EditRoleDialog
        open={showEditDialog}
        onClose={() => handleEditDialog(false)}
        onConfirm={confirmFunction}
        description={description}
        handleEditDialog={handleEditDialog}
        isEditing={isEditing}
      />
      <div className="space-y-10">
        <AvailableJob />
        <MenusCompGroupBtnAccess
          buttonMenuOps={buttonMenusOps}
          handleButton={handleButton}
          hasAccess={menuPrivAccess?.editStatus ?? false}
        />
        <OwnedRoleJob />
      </div>
    </div>
  );
};

export default RoleJobMain;
