import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Alert } from "@/components";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";

const API_URL_REF = apiConfigRef.ref;


interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  zoneMapName: string;
  zoneMapId?: string | number;
  onDeleteSuccess?: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  zoneMapName,
  zoneMapId,
  onDeleteSuccess,
}) => {
  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Build CallOcsDubboService payload
  const buildZonePayload = (dubboServiceName: string, data: Record<string, any>) => {
    const refererUrl = window.location.origin + "/portal/";
    return {
      ServiceName: "CallOcsDubboService",
      Data: {
        ...data,
        zsmart_dubbo_service_name: dubboServiceName,
        zsmart_fish_flag: true,
        zsmart_referer_url: refererUrl,
      },
      zsmart_origin_menu: {
        menuId: 1264,
        menuUrl: "cvbs/modules/price/config/views/ZoneView",
        menuName: "zone",
        menuType: "S",
        comprivList: [],
        menuParam: {},
        parentId: 111000,
        loaded: true,
      },
    };
  };

  const doDeleteZoneMap = useCallback(async () => {
    if (!zoneMapName || !zoneMapId) {
      toast.error("No Zone Map selected");
      return;
    }

    setIsDeleting(true);
    setAlert({ show: false, message: "" });

    try {
      const payload = buildZonePayload("DelZoneMap", {
        zoneMapId: String(zoneMapId),
      });

      const response = await DeleteData(`${API_URL_REF}/api/zone/del-zone-map?zoneMapId=${zoneMapId}`, payload);

      if (response?.status) {
        setAlert({ show: false, message: "" });
        toast.success(`Successfully deleted Zone Map: ${zoneMapName}`);
        
        const createActivity = {
          module: "Manage Zone Map",
          description: `Delete Zone Map => ${zoneMapName}${zoneMapId ? ` (ID: ${zoneMapId})` : ""}`,
          action: "D",
        };
        doSaveLogActivity(createActivity);

        if (onDeleteSuccess) {
          onDeleteSuccess();
        }

        onClose();
      } else {
        const errorMessage = response?.message || "Failed to delete Zone Map";
        setAlert({ show: true, message: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "An error occurred while deleting";
      setAlert({ show: true, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [zoneMapName, zoneMapId, onClose, onDeleteSuccess, DeleteData]);

  useEffect(() => {
    if (!isOpen) {
      setAlert({ show: false, message: "" });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">
              You will delete the Zone Map "{zoneMapName || "Unknown"}"
              {zoneMapId && ` (ID: ${zoneMapId})`}
            </span>
          </Alert>
          {alert.show && (
            <Alert variant="danger">
              <h3>{alert.message}</h3>
            </Alert>
          )}
        </DialogHeader>
        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={doDeleteZoneMap}
            disabled={isDeleting || !zoneMapName}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
