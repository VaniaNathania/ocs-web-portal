import { AvailableUser } from "./block/AvailableUser";
import { OwnedRoleUser } from "./block/OwnedRoleUser";
import { Button } from "@mui/material";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { useUserList } from "./hook/useUser";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { UserData } from "./hook/UserProvider";
import { EditRoleDialog } from "../../block/EditRoleDialog";
import { buttonMenusOps, MenusCompGroupBtnAccess } from "../../generalUseComp";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

const RoleUserMain = () => {
  const {
    showEditDialog,
    setIsEditing,
    isEditing,
    handleEditDialog,
    availableUsers,
    selectedAvailable,
    setSelectedAvailable,
    ownedUsers,
    setSelectedOwned,
    selectedOwned,
    fetchAll,
  } = useUserList();

  const { selectedRow, menuPrivAccess } = useRoleLayout();
  const { PutData, DeleteData } = useCallApi();

  const [confirmFunction, setConfirmFunction] = useState<() => void>(() => {});
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    document.title = "Role Management | User";
    //  console.log("test");
  }, []);

  const handleUpdate = async (data: UserData[]) => {
    try {
      // console.log("🚀 Editing role with data:", data);

      const payload = data.map((p) => ({
        userId: p.userId,
        roleId: selectedRow?.roleId,
        roleName: selectedRow?.roleName,
        comments: selectedRow?.comments,
        roleCode: selectedRow?.roleCode,
        isLocked: p.isLocked,
        userCode: p.userCode,
        spId: 0,
        userRoleTimes: 0,
        staffRoleTimes: 0,
        updateDate: p.updateDate,
        createdDate: p.createdDate,
      }));

      const response = await PutData(
        `${API_ROLE}/api/roles/${selectedRow?.roleId}/users/new`,
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
        // console.error("❌ API returned error:", response);
      }
      setSelectedAvailable([]);
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      // console.error("❌ Error creating role:", error);
    } finally {
      fetchAll();
    }
  };

  const handleDelete = async (data: UserData[]) => {
    try {
      // console.log("🚀 Editing role with data:", data);

      const payload = data.map((item) => ({
        userId: item.userId || 0,
        roleId: item.roleId || 0,
        roleName: selectedRow?.roleName || "string", // Replace with actual roleName if available
        comments: selectedRow?.comments || "string", // Replace with actual comments if available
        roleCode: selectedRow?.roleCode || "string", // Replace with actual roleCode if available
        isLocked: item.isLocked || "N", // Using existing isLocked value
        userCode: item.userCode || "string", // Using existing userCode
        spId: 0,
      }));
      const response = await DeleteData(
        `${API_ROLE}/api/roles/${selectedRow?.roleId}/users/new`,

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
        // console.error("❌ API returned error:", response);
      }
      setSelectedOwned([]);
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      // console.error("❌ Error creating role:", error);
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
        <AvailableUser />
        <MenusCompGroupBtnAccess
          buttonMenuOps={buttonMenusOps}
          handleButton={handleButton}
          hasAccess={menuPrivAccess?.editStatus ?? false}
        />
        <OwnedRoleUser />
      </div>
    </div>
  );
};

export default RoleUserMain;
