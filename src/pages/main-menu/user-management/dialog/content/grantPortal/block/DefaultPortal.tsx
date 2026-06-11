import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserManagement } from "@/pages/main-menu/user-management/hook/useUserManagemet";
import { useEffect, useState } from "react";
import { useUserGrantPortal } from "../hook/useUserGrantPortal";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

export const DefaultPortal = () => {
  const {
    selectedRow,
    setOnConfirm,
    setDesc,
    setShowConfirm,
    setShowGrantPortal,
    fetchUser,
  } = useUserManagement();
  const { ownedrows } = useUserGrantPortal();
  const [defaultPortalId, setDefaultPortalId] = useState<string>(
    selectedRow?.portalId?.toString() ?? "0",
  );

  // console.log(selectedRow?.portalId, selectedRow?.portalName, ownedrows);

  useEffect(() => {
    if (selectedRow?.portalId) {
      setDefaultPortalId(selectedRow.portalId.toString());
    }
  }, [selectedRow, ownedrows]);

  const { PostData } = useCallApi();
  const handleUpdatePortal = async () => {
    try {
      const payload = ownedrows
        .filter((p) => !p.roleId)
        .map((row) => row.portalId);
      // console.log(payload);

      const response = await PostData(
        `${API_ROLE}/api/users/${selectedRow?.userId}/user/portals?defaulPortalId=${defaultPortalId}`,
        payload,
      );
      if (response?.status) {
        toast.success("User portal edited successfully!");
        const createActivity = {
          module: "Manage User Management",
          description: `Edit User => ${selectedRow?.userName}`,
          action: "E",
        };
        doSaveLogActivity(createActivity);
      } else {
        toast.error(response?.message || "Failed to edit user portal.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong.");
    } finally {
      setShowGrantPortal(false);
      setShowConfirm(false);
      fetchUser();
    }
  };

  const handleResetPortal = () => {
    setDefaultPortalId(selectedRow?.portalId.toString() ?? "0");
    setShowGrantPortal(false);
    setShowConfirm(false);
  };

  const handleConfirmation = (bool: boolean) => {
    setShowConfirm(true);
    if (bool) {
      setDesc("Are you sure to save user portal?");
      setOnConfirm(() => () => handleUpdatePortal());
    } else {
      setDesc("Are you sure to discard all changes on user portal?");
      setOnConfirm(() => () => handleResetPortal());
    }
  };

  // Find the default portal in ownedrows
  const defaultPortal = ownedrows.find(
    (row) => row.portalId.toString() === defaultPortalId,
  );

  return (
    <div className="flex flex-row w-full fixed bottom-0 left-0 px-10 py-5 bg-white border-t-2 z-50">
      {/* <div className="flex flex-row items-center space-x-5 w-3/4 h-3/4 overflow-x-auto">
        <label className="block text-sm font-medium text-gray-700 w-1/4">
          Default Portal
        </label>
        <div className="w-3/4">
          <Select
            value={defaultPortal ? defaultPortalId : "0"}
            onValueChange={(val) => {
              setDefaultPortalId(val);
            }}
            disabled={ownedrows.length === 0}
          >
            <SelectTrigger className="w-full px-2 py-1 text-sm h-10">
              <SelectValue placeholder="Doesn't have assigned portal">
                {defaultPortal
                  ? defaultPortal.portalName
                  : "Doesn't have assigned portal"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ownedrows.length === 0 ? (
                <SelectItem value="0">Doesn't have assigned portal</SelectItem>
              ) : (
                ownedrows.map((item) => (
                  <SelectItem
                    key={item.portalId}
                    value={item.portalId.toString()}
                  >
                    {item.portalName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div> */}
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
