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
import { Alert } from "@/components";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";

const API_URL_REF = apiConfigRef.ref;

interface AdviceDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;


  selectedAdviceIds: string[];

  // permission + state rules
  canDelete: boolean;
  states: string; // 

  // callbacks
  onDeleteSuccess?: () => void;
}

const AdviceDeleteDialog: React.FC<AdviceDeleteDialogProps> = ({
  isOpen,
  onClose,
  selectedAdviceIds,
  canDelete,
  states,
  onDeleteSuccess,
}) => {
  const { DeleteData } = useCallApi();

  const [alert, setAlert] = useState({ show: false, message: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  const doDeleteAdvice = useCallback(async () => {
    // 1) validate before calling API
    if (!canDelete || states !== "not-delivered") {
      const msg = "Delete is only allowed for Not-Delivered";
      setAlert({ show: true, message: msg });
      toast.error(msg);
      return;
    }

    if (!selectedAdviceIds || selectedAdviceIds.length === 0) {
      const msg = "Please select at least one row";
      setAlert({ show: true, message: msg });
      toast.error(msg);
      return;
    }

    setIsDeleting(true);
    setAlert({ show: false, message: "" });

    try {

      const query = selectedAdviceIds
        .map((id) => `adviceId=${encodeURIComponent(id)}`)
        .join("&");

      const url = `${API_URL_REF}/api/advice-monitor/del-advice?${query}`;

      // send DELETE without body
      const response = await DeleteData(url, {});

      if (!response || response.status === false) {
        const errorMessage = response?.message || "Delete failed";
        setAlert({ show: true, message: errorMessage });
        toast.error(errorMessage);
        return;
      }

      toast.success(`Deleted ${selectedAdviceIds.length} record(s) successfully`);

      if (onDeleteSuccess) onDeleteSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || "Delete failed. Please try again.";
      setAlert({ show: true, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [DeleteData, canDelete, states, selectedAdviceIds, onClose, onDeleteSuccess]);

  useEffect(() => {
    if (!isOpen) setAlert({ show: false, message: "" });
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isDeleting && !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Confirm delete
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Please confirm the selected data will be deleted.
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Main message */}
          <div className="text-sm text-gray-700">
            You are about to delete{" "}
            <span className="font-medium text-gray-900">
              {selectedAdviceIds.length}
            </span>{" "}
            record{selectedAdviceIds.length > 1 ? "s" : ""}.
          </div>

          {/* Selected IDs preview */}
          {selectedAdviceIds.length > 0 && (
            <div className="text-xs text-gray-600">
              <div className="mb-1">Selected IDs:</div>
              <div className="flex flex-wrap gap-2">
                {selectedAdviceIds.slice(0, 5).map((id) => (
                  <span
                    key={id}
                    className="px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700"
                  >
                    {id}
                  </span>
                ))}
                {selectedAdviceIds.length > 5 && (
                  <span className="px-2 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700">
                    +{selectedAdviceIds.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Restriction info */}
          {(!canDelete || states !== "not-delivered") && (
            <div className="text-sm text-gray-600">
              Delete is only allowed for{" "}
              <span className="font-medium text-gray-800">
                Not-Delivered
              </span>{" "}
              records.
            </div>
          )}

          {/* Error message */}
          {alert.show && (
            <div className="text-sm text-red-600">
              {alert.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"

            onClick={doDeleteAdvice}
            disabled={
              isDeleting ||
              !canDelete ||
              states !== "not-delivered" ||
              selectedAdviceIds.length === 0
            }
            className="min-w-[110px] transition hover:shadow-sm hover:scale-[1.02]"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

};

export default AdviceDeleteDialog;
