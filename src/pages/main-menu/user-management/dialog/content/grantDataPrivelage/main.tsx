import { OwnedUserDP } from "./block/OwnedUserDP";
import { Button } from "@mui/material";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdKeyboardDoubleArrowDown,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { useState } from "react";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { useUserGrantDP } from "./hook/useUserGrantDP";
import { AvailableGrantDP } from "./block/AvailableGrantDP";
import { UserDataPriv } from "./hook/UserGrantDPProvider";
import { KeenIcon } from "@/components";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

const UserDPMain = () => {
  const {
    showEditDialog,
    setIsEditing,
    isEditing,
    handleEditDialog,
    availablerows,
    selectedAvailable,
    setSelectedAvailable,
    ownedrows,
    setSelectedOwned,
    selectedOwned,
    fetchAll,
  } = useUserGrantDP();
  const { PutData, DeleteData } = useCallApi();

  const [confirmFunction, setConfirmFunction] = useState<() => void>(() => {});
  const [description, setDescription] = useState<string>("");

  const handleUpdate = async (data: UserDataPriv[]) => {
    // try {
    // //  console.log("🚀 Editing role with data:", data);
    //   const response = await PutData(
    //     `${API_ROLE}/api/roles/${selectedRow?.roleId}/users/new`,
    //     data
    //   );
    // //  console.log("📦 API Response:", response);
    //   if (response?.status) {
    //     toast.success("Portal edited successfully!");
    //     const createActivity = {
    //       module: "Manage Role Management",
    //       description: `Edit Role Portal=> `,
    //       action: "E",
    //     };
    //     doSaveLogActivity(createActivity);
    //   //  console.log("✅ Role created successfully");
    //   } else {
    //     const errorMessage =
    //       response?.message || "Failed to create role. Please try again.";
    //     toast.error(errorMessage);
    //     console.error("❌ API returned error:", response);
    //   }
    //   setSelectedAvailable([]);
    // } catch (error: any) {
    //   const errorMessage =
    //     error?.message || "Something went wrong. Please try again.";
    //   toast.error(errorMessage);
    //   console.error("❌ Error creating role:", error);
    // } finally {
    //   fetchAll();
    // }
  };

  const handleDelete = async (data: UserDataPriv[]) => {
    // try {
    // //  console.log("🚀 Editing role with data:", data);
    //   const response = await DeleteData(
    //     `${API_ROLE}/api/roles/${selectedRow?.roleId}/users/new`,
    //     data
    //   );
    // //  console.log("📦 API Response:", response);
    //   if (response?.status) {
    //     toast.success("Portal edited successfully!");
    //     const createActivity = {
    //       module: "Manage Role Management",
    //       description: `Edit Role Portal=> `,
    //       action: "E",
    //     };
    //     doSaveLogActivity(createActivity);
    //   //  console.log("✅ Role created successfully");
    //   } else {
    //     const errorMessage =
    //       response?.message || "Failed to create role. Please try again.";
    //     toast.error(errorMessage);
    //     console.error("❌ API returned error:", response);
    //   }
    //   setSelectedOwned([]);
    // } catch (error: any) {
    //   const errorMessage =
    //     error?.message || "Something went wrong. Please try again.";
    //   toast.error(errorMessage);
    //   console.error("❌ Error creating role:", error);
    // } finally {
    //   fetchAll();
    // }
  };

  const AllAvaToOwn = async () => {
    setIsEditing(true);
    try {
      await handleUpdate(availablerows);
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
      await handleDelete(ownedrows);
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
    <div className="w-full bg-white rounded-md p-5 flex flex-col h-[700px] overflow-hidden">
      <div className="h-full flex flex-col md:flex-row flex-1 min-h-0 gap-5">
        {/* Left column */}
        <div className="h-[47%] md:w-[45%] flex flex-col min-h-0 md:h-full">
          <AvailableGrantDP />
        </div>

        {/* Buttons mobile */}
        <div className="h-[6%] flex flex-row justify-center items-center md:hidden space-x-4">
          <Button
            onClick={() =>
              handleButton(
                AvaToOwn,
                `Are you sure to give selected portals access to role `,
              )
            }
          >
            <MdArrowDownward />
          </Button>
          <Button
            onClick={() =>
              handleButton(
                OwnToAva,
                `Are you sure to take selected portals access from role `,
              )
            }
          >
            <MdArrowUpward />
          </Button>
        </div>

        {/* Buttons desktop */}
        <div className="hidden md:flex md:w-[10%] flex-col justify-center px-2">
          <Button
            onClick={() =>
              handleButton(
                AvaToOwn,
                `Are you sure to give selected portals access to role `,
              )
            }
            className="w-[50px] h-[50px]"
          >
            <KeenIcon icon="right" />
          </Button>
          <Button
            onClick={() =>
              handleButton(
                OwnToAva,
                `Are you sure to take selected portals access from role `,
              )
            }
            className="w-[50px] h-[50px] mt-2"
          >
            <KeenIcon icon="left" />
          </Button>
        </div>

        {/* Right column */}
        <div className="h-[47%] md:w-[45%] flex flex-col min-h-0 md:h-full">
          <OwnedUserDP />
        </div>
      </div>
    </div>
  );
};

export default UserDPMain;
