import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { CompListProvider } from "@/pages/main-menu/directory-menu-management/hook/CompProvider";
import { useCompList } from "@/pages/main-menu/directory-menu-management/hook/useComp";
import { useDirMenuBindPortal } from "../hook/useUserGrantPortal";
import { apiConfigRole } from "@/config/api.config";

const API_URL = apiConfigRole.role;

export const DefaultPortal = () => {
  const {
    selectedRow,
    setOnConfirm,
    setDesc,
    setShowConfirm,
    setShowBindPortal,
    // fetchUser,
  } = useCompList();
  const { ownedrows, recOwned, adding, availablerows } = useDirMenuBindPortal();

  const { PostData } = useCallApi();
  const handleUpdatePortal = async () => {
    try {
      //  console.log(selectedRow);

      const ownedIds = adding.map((item) => item.portalId);
      const addPortal = ownedrows.filter(
        (item) => !recOwned.includes(item.portalId),
      );
      const delPortal = availablerows.filter((item) =>
        ownedIds.includes(item.portalId),
      );

      // console.log("add", addPortal);
      // console.log("del", delPortal, ownedIds);

      const payload = {
        addPortalList: addPortal.map((item) => ({
          ...item,
          stateDate: new Date(),
          partyId: selectedRow?.id,
        })),
        delPortalList: delPortal.map((item) => ({
          ...item,
          stateDate: new Date(),
          partyId: selectedRow?.id,
        })),
        spId: 0,
        // portalId: selectedRow.po,
        partyId: selectedRow?.id,
        // parentId: selectedRow?.parentId === 0 ? null : selectedRow?.parentId,
        type: selectedRow?.type,
        state: selectedRow?.state,
        stateDate: new Date(),
        // seq: selectedRow.seq,
      };

      // const

      // const payload = ownedrows.map((row) => row.portalId);
      const response = await PostData(
        `${API_URL}/api/portals/bind-menu-to-portals`,
        payload,
      );
      if (response?.status) {
        toast.success("portal binded edited successfully!");
      } else {
        toast.error(response?.message || "Failed to bind portal.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong.");
    } finally {
      // setShowBindPortal(false);
      setShowConfirm(false);
      // fetchUser();
    }

    //  console.log("handleUpdate");
  };

  const handleResetPortal = () => {
    // setDefaultPortalId(selectedRow?.portalId.toString() ?? "0");
    setShowBindPortal(false);
    setShowConfirm(false);
  };

  const handleConfirmation = (bool: boolean) => {
    setShowConfirm(true);
    if (bool) {
      setDesc("Are you sure to save bind portal?");
      setOnConfirm(() => () => handleUpdatePortal());
    } else {
      setDesc("Are you sure to discard all changes on bind portal?");
      setOnConfirm(() => () => handleResetPortal());
    }
  };

  // Find the default portal in ownedrows
  // const defaultPortal = ownedrows.find(
  //   (row) => row.portalId.toString() === defaultPortalId
  // );

  return (
    <div className="flex flex-row w-full fixed bottom-0 left-0 px-10 py-5 bg-white border-t-2 z-50 justify-end">
      <div className="w-full flex justify-end space-x-5 overflow-x-">
        <Button variant="default" onClick={() => handleConfirmation(true)}>
          OK
        </Button>
        <Button variant="outline" onClick={() => handleConfirmation(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
