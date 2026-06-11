import React, { useState } from "react";
import { Trash2, X } from "lucide-react";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert } from "@/components";
import { Button } from "@/components/ui/button";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface DeleteRelationshipProps {
  offerRelaId: string;
  relationshipName: string;
  onDeleteSuccess?: () => void;
  variant?: "icon" | "text" | "minimal"; // Different display variants
  disabled?: boolean;
  className?: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

const DeleteRelationship: React.FC<DeleteRelationshipProps> = ({ offerRelaId, relationshipName, onDeleteSuccess, variant = "minimal", disabled = false, className = "" }) => {
  const { menuPrivAccess } = useOfferLayout();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const { DeleteData } = useCallApi();

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setAlert({ show: false, message: "" });

      // //  console.log("🗑️ Deleting relationship with ID:", offerRelaId);

      // Fix: Send offerRelaId as integer array, not string array
      const response = await DeleteData(`${API_URL_OFFER}/offer/rela/del-offer-rela-batch`, [
        parseInt(offerRelaId), // Convert to integer
      ]);

      // //  console.log("🗑️ Delete relationship response:", response);

      // Check for success response
      if (response?.status) {
        toast.success("Relationship deleted successfully");
        setShowDeleteDialog(false);

        // Call success callback to refresh parent data
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        throw new Error(response?.message || "Failed to delete relationship");
      }
    } catch (error: any) {
      console.error("❌ Error deleting relationship:", error);
      const errorMessage = error?.message || "Unknown error occurred while deleting relationship";
      setAlert({ show: true, message: errorMessage });
      toast.error(`Failed to delete relationship: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Render different variants for the trigger button
  const renderTriggerButton = () => {
    const baseClasses = `transition-all duration-200 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

    switch (variant) {
      case "icon":
        return (
          <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
            <button onClick={handleDeleteClick} disabled={disabled} className={`${baseClasses} text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md flex items-center justify-center`} title={`Delete ${relationshipName}`}>
              <Trash2 className="w-4 h-4" />
            </button>
          </AccessWrapper>
        );

      case "text":
        return (
          <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
            <button onClick={handleDeleteClick} disabled={disabled} className={`${baseClasses} text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2`}>
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </AccessWrapper>
        );

      case "minimal":
      default:
        return (
          <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
            <button onClick={handleDeleteClick} disabled={disabled} className={`${baseClasses} opacity-0 group-hover/item:opacity-100 text-red-500 hover:text-red-700 text-xs px-1 py-1`} title={`Delete ${relationshipName}`}>
              ×
            </button>
          </AccessWrapper>
        );
    }
  };

  return (
    <>
      {renderTriggerButton()}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => !isDeleting && setShowDeleteDialog(open)}>
        <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <DialogHeader className="p-0 border-0 block">
            <Alert variant="warning">
              <h3 className="text-lg">Are you sure?</h3>
              <span className="text-sm">You will delete the relationship "{relationshipName}"</span>
            </Alert>
            {alert.show && (
              <Alert variant="danger">
                <h3>{alert.message}</h3>
              </Alert>
            )}
          </DialogHeader>
          <DialogFooter className="flex justify-end items-center gap-4 mt-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteRelationship;
