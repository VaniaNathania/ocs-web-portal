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
import { useUserGrantPortal } from "./hook/useUserGrantPortal";
import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";
import { AvailableGrantPortal } from "./block/AvailableGrantPortal";
import { OwnedUserPortal } from "./block/OwnedUserPortal";
import { DefaultPortal } from "./block/DefaultPortal";
import { useUserLayout } from "@/layouts/main-menu/user-management";
import {
  buttonMenusOps,
  MenusCompGroupBtnAccess,
} from "@/pages/main-menu/role-management/generalUseComp";
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
  } = useUserGrantPortal();
  const { menuPrivAccess } = useUserLayout();

  // treat rows with/without roleId as distinct
  const hasRoleId = (p: PortalData) =>
    p.roleId !== undefined && p.roleId !== null;

  const keyOf = (p: PortalData) =>
    `${p.portalId}::${hasRoleId(p) ? p.roleId : "no-role"}`;

  const dedupeByCompositeKey = <T extends PortalData>(arr: T[]) => {
    const m = new Map<string, T>();
    for (const it of arr) m.set(keyOf(it), it);
    return Array.from(m.values());
  };

  const handleUpdate = (data: PortalData[]) => {
    // only move those WITHOUT roleId
    const idsToMove = new Set(
      data.filter((p) => !hasRoleId(p)).map((p) => keyOf(p))
    );

    // capture current arrays once to avoid stale reads across batched updates
    const currentAvailable = availablerows;

    setAvailablerows((prev) => prev.filter((p) => !idsToMove.has(keyOf(p))));

    setOwnedrows((prev) => {
      const addOwned = currentAvailable.filter((p) => idsToMove.has(keyOf(p)));
      return dedupeByCompositeKey([...prev, ...addOwned]);
    });

    setSelectedAvailable([]);
    setSelectedOwned([]);
  };

  const handleDelete = (data: PortalData[]) => {
    // only move those WITHOUT roleId
    const idsToMove = new Set(
      data.filter((p) => !hasRoleId(p)).map((p) => keyOf(p))
    );

    const currentOwned = ownedrows;

    setOwnedrows((prev) => prev.filter((p) => !idsToMove.has(keyOf(p))));

    setAvailablerows((prev) => {
      const addAvailable = currentOwned.filter((p) => idsToMove.has(keyOf(p)));
      return dedupeByCompositeKey([...prev, ...addAvailable]);
    });

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

  const buttonMenusOps: buttonMenusOps[] = [
    {
      ops: AllAvaToOwn,
      desc: ``,
      icon: <MdKeyboardDoubleArrowDown />,
    },
    {
      ops: AvaToOwn,
      desc: ``,
      icon: <MdArrowDownward />,
    },
    {
      ops: OwnToAva,
      desc: ``,
      icon: <MdArrowUpward />,
    },
    {
      ops: AllOwnToAva,
      desc: ``,
      icon: <MdKeyboardDoubleArrowUp />,
    },
  ];

  return (
    <div className="w-full bg-white h-full rounded-md p-5 space-y-10 -z-10">
      <div className="pb-16 space-y-5">
        <AvailableGrantPortal />
        <MenusCompGroupBtnAccess
          buttonMenuOps={buttonMenusOps}
          handleButton={handleButton}
          hasAccess={menuPrivAccess?.editStatus ?? false}
        />
        <OwnedUserPortal />
      </div>
      <DefaultPortal />
    </div>
  );
};

export default RoleUserMain;
