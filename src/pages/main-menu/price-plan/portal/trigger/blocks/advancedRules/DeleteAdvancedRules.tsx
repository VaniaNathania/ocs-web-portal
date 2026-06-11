import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { apiConfig } from "@/config/api.config";
import { useTriggerCreateContext } from "../../hooks";
import axios from "axios";

const API_URL = apiConfig.service_price_plan;

interface DeleteProps {
  onRefresh: () => void;
}

const DeleteAdvancedRulesDialog: React.FC<DeleteProps> = ({ onRefresh }) => {
  const { DeleteData } = useCallApi();
  const {
    showDeleteAdvancedRulesDialog,
    setShowDeleteAdvancedRulesDialog,
    selectedDeleteAdvancedRules,
    setSelectedDeleteAdvancedRules,
    acmTriggerListRefreshKey,
  } = useTriggerCreateContext();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${API_URL}/trigger/advance-rule/delete/${selectedDeleteAdvancedRules.triggerId}/${selectedDeleteAdvancedRules.seq}`,
      );

      // Check response format: {"status":200,"message":"success"}
      if (response.data.status === 200 && response.data.message === "success") {
        toast.success("Advanced rule deleted successfully");
        setShowDeleteAdvancedRulesDialog(false);
        setSelectedDeleteAdvancedRules(null);
        onRefresh();
      } else {
        toast.error("Failed to delete advanced rule");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the advanced rule");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      setShowDeleteAdvancedRulesDialog(false);
      setSelectedDeleteAdvancedRules(null);
    }
  };

  return (
    <Dialog
      open={showDeleteAdvancedRulesDialog}
      onOpenChange={setShowDeleteAdvancedRulesDialog}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Advanced Rule</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this advanced rule?
            <br />
            <br />
            <strong>Seq:</strong> {selectedDeleteAdvancedRules?.seq || "-"}
            <br />
            <strong>Effective Date:</strong>{" "}
            {selectedDeleteAdvancedRules?.effDate
              ? new Date(
                  selectedDeleteAdvancedRules.effDate,
                ).toLocaleDateString("id-ID")
              : "-"}
            <br />
            <strong>Expiry Date:</strong>{" "}
            {selectedDeleteAdvancedRules?.expDate
              ? new Date(
                  selectedDeleteAdvancedRules.expDate,
                ).toLocaleDateString("id-ID")
              : "-"}
            <br />
            <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAdvancedRulesDialog;
