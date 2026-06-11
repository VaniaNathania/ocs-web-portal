import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { AtributeDelete } from "../components/AttributeSalesOrganization";

interface DeleteSalesOrganizationProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDelete: AtributeDelete[];
  onDeleteSuccess?: (deletedItems: AtributeDelete[]) => void;

  // onSuccess: () => void;
  // selectedBatch: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

export const DeleteSalesOrganization: React.FC<
  DeleteSalesOrganizationProps
> = ({ isOpen, onClose, selectedDelete, onDeleteSuccess }) => {
  const { DeleteData } = useCallApi();
  // const { reload } = useDataGrid();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const doDeleteDialog = async () => {
    const payload = selectedDelete.map((item) => ({
      subsPlanOfferAttrId: item.subsPlanOfferAttrId,
      attrValueId: item.attrValueId,
      orgId: item.orgId,
      excludeFlag: item.excludeFlag,
      spId: item.spId,
    }));

    //  console.log(payload);
    try {
      const response = await DeleteData(
        `${API_URL_OFFER}/offer/subs-plan/del-subs-plan-attr-value-apply-org`,
        payload,
      );
      if (response?.status) {
        toast.success("Success Delete");

        if (onDeleteSuccess) {
          onDeleteSuccess(selectedDelete);
        }

        onClose();
      } else {
        toast.error("Failed Delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred while deleting");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">
              You will delete This feature value! This action cannot be undone.
            </span>
          </Alert>
        </DialogHeader>

        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              doDeleteDialog();
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSalesOrganization;
