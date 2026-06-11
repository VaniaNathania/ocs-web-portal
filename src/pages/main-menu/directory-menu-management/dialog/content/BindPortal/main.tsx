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
import { useDirMenuBindPortal } from "./hook/useUserGrantPortal";
import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";
import { AvailableGrantPortal } from "./block/AvailableGrantPortal";
import { OwnedUserPortal } from "./block/OwnedUserPortal";
import { DefaultPortal } from "./block/DefaultPortal";
const RoleUserMain = () => {
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
    setAvailablerows,
    setOwnedrows,
  } = useDirMenuBindPortal();
  const { PutData, DeleteData } = useCallApi();

  const [confirmFunction, setConfirmFunction] = useState<() => void>(() => {});
  const [description, setDescription] = useState<string>("");

  const handleUpdate = async (data: PortalData[]) => {
    const selectedId = new Set(data.map((r: any) => r.portalId));

    const filteredAvailable = availablerows.filter(
      (portal: any) => !selectedId.has(portal.portalId)
    );

    const addOwned = availablerows.filter((portal: any) =>
      selectedId.has(portal.portalId)
    );

    setAvailablerows(filteredAvailable);
    setOwnedrows([...ownedrows, ...addOwned]);
    setSelectedAvailable([]);
    setSelectedOwned([]);
  };

  const handleDelete = async (data: PortalData[]) => {
    const selectedId = new Set(data.map((r: any) => r.portalId));

    const filteredOwned = ownedrows.filter(
      (portal: any) => !selectedId.has(portal.portalId)
    );

    const addAvailable = ownedrows.filter((portal: any) =>
      selectedId.has(portal.portalId)
    );

    setAvailablerows([...availablerows, ...addAvailable]);
    setOwnedrows(filteredOwned);
    setSelectedAvailable([]);
    setSelectedOwned([]);
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
    prosses();
  };

  return (
    <div className="w-full bg-white h-full rounded-md p-5 space-y-10 -z-10">
      <div className="pb-16 space-y-5">
        <AvailableGrantPortal />
        <div className="flex flex-row justify-center align-middle">
          {/* Ini button semua ava ke own */}
          <Button
            onClick={() =>
              handleButton(
                AllAvaToOwn,
                `Are you sure to gave all portals access to role `
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
                `Are you sure to gave selected portals access to role `
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
                `Are you sure to take selected portals access from role `
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
                `Are you sure to take all portals access from role `
              )
            }
          >
            <MdKeyboardDoubleArrowUp />
          </Button>
        </div>
        <OwnedUserPortal />
      </div>
      <DefaultPortal />
    </div>
  );
};

export default RoleUserMain;
