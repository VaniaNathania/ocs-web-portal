import { OwnedRoleUser } from "./block/OwnedRoleUser";
import { Button } from "@mui/material";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { RoleSPID } from "@/pages/main-menu/role-management/component/sideBarListContextTable";
import { useUserRoleGrant } from "./hook/useUserRoleGrant";
import { AvailableRoleGrant } from "./block/AvailableRoleGrant";
import { useUserManagement } from "../../../hook/useUserManagemet";
import { useUserLayout } from "@/layouts/main-menu/user-management";
import {
  buttonMenusOps,
  MenusCompGroupBtnAccess,
} from "@/pages/main-menu/role-management/generalUseComp";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

const RoleUserMain = () => {
  const {
    setIsEditing,
    handleEditDialog,
    availableroles,
    selectedAvailable,
    ownedroles,
    selectedOwned,
    fetchAll,
    setSelectedAvailable,
    setSelectedOwned,
  } = useUserRoleGrant();
  const { setShowConfirm, setOnConfirm, setDesc, selectedRow } =
    useUserManagement();
  const { PostData, DeleteData } = useCallApi();

  const handleUpdate = async (data: RoleSPID[]) => {
    try {
      //  console.log("🚀 Editing role with data:", data);

      const response = await PostData(
        `${API_ROLE}/api/prod/users/${selectedRow?.userId}/roles/new`,
        data,
      );
      //  console.log("📦 API Response:", response);
      if (response?.status) {
        toast.success("User edited successfully!");
        const createActivity = {
          module: "Manage User Management",
          description: `Edit Role User=> ${selectedRow?.userName}`,
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
    } finally {
      fetchAll();
      setShowConfirm(false);
    }
  };

  const handleDelete = async (data: RoleSPID[]) => {
    try {
      const payload = data.map((p) => ({
        ...p,
        userCode: selectedRow?.userCode,
        userId: selectedRow?.userId,
      }));
      //  console.log("🚀 Editing role with data:", payload);

      const response = await DeleteData(
        `${API_ROLE}/api/prod/users/${selectedRow?.userId}/roles/new`,
        payload,
      );
      //  console.log("📦 API Response:", response);
      if (response?.status) {
        toast.success("User edited successfully!");
        const createActivity = {
          module: "Manage User Management",
          description: `Edit Role User=> ${selectedRow?.userName}`,
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
    } finally {
      fetchAll();
      setShowConfirm(false);
    }
  };

  const AllAvaToOwn = async () => {
    setIsEditing(true);
    try {
      await handleUpdate(availableroles);
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
      await handleDelete(ownedroles);
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
    setDesc(description);
    setOnConfirm(() => prosses);
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
      desc: `Are you sure to take selected menus access to user ${selectedRow?.userName}`,
      icon: <MdArrowUpward />,
    },
    {
      ops: AllOwnToAva,
      desc: `Are you sure to take all menus access to user ${selectedRow?.userName}`,
      icon: <MdKeyboardDoubleArrowUp />,
    },
  ];

  return (
    <div className="w-full bg-white rounded-md p-5 space-y-10">
      <div className="overflow-y-auto space-y-5">
        <AvailableRoleGrant />
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
