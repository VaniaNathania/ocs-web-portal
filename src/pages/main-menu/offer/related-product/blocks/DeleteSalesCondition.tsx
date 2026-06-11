import { Alert } from "@/components/alert/Alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteSalesConditionProps {
  offerId: number;
  areaId: number | number[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess: () => void;
  type?: "area" | "org" | "channel" | "catg"; // Tambahkan parameter type
}

const API_URL_OFFER = apiConfigOffer.offer;

const DeleteSalesCondition: React.FC<DeleteSalesConditionProps> = ({
  offerId,
  areaId,
  isOpen,
  onClose,
  onDeleteSuccess,
  type = "area", // Default ke "area"
}) => {
  const { DeleteData } = useCallApi();
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const isMultipleDelete = Array.isArray(areaId);
  const areaIds = isMultipleDelete ? areaId : [areaId];
  const deleteCount = areaIds.length;

  // Function untuk mendapatkan endpoint berdasarkan type
  const getEndpoint = (type: string) => {
    switch (type) {
      case "area":
        return "del-offer-apply-area-batch";
      case "org":
        return "del-offer-apply-org-batch";
      case "channel":
        return "del-offer-apply-channel-batch";
      case "catg":
        return "del-offer-apply-catg-batch"; // ✅ PERBAIKAN: Remove leading slash
      default:
        return "del-offer-apply-area-batch"; // ✅ PERBAIKAN: Default ke area, bukan catg
    }
  };

  // Function untuk mendapatkan label berdasarkan type
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "area":
        return "Sales Area";
      case "org":
        return "Sales Organization";
      case "channel":
        return "Sales Contact Channel";
      case "catg":
        return "Sales Category";
      default:
        return "Sales Area";
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setAlert({ show: false, message: "" });

      const requestBody = areaIds.map((id) => id);
      const endpoint = getEndpoint(type);
      const typeLabel = getTypeLabel(type);

      const response = await DeleteData(`${API_URL_OFFER}/offer/apply/${endpoint}/${offerId}`, requestBody);

      if (response?.status) {
        const successMessage = isMultipleDelete
          ? `${deleteCount} ${typeLabel} deleted successfully`
          : `${typeLabel} deleted successfully`;
        toast.success(successMessage);
        onClose();
        onDeleteSuccess();
      } else {
        throw new Error(response?.message || `Failed to delete ${typeLabel} sales condition(s)`);
      }
    } catch (error: any) {
      console.error(`❌ Error deleting ${getTypeLabel(type)} sales condition(s)`, error);
      const errorMessage =
        error?.message || `Unknown error occurred while deleting ${getTypeLabel(type)} sales condition(s)`;
      setAlert({ show: true, message: errorMessage });
      toast.error(`Failed to delete ${getTypeLabel(type)} sales condition(s): ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setAlert({ show: false, message: "" }); // reset alert
      onClose();
    }
  };

  const typeLabel = getTypeLabel(type);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">
              {isMultipleDelete
                ? `You will delete ${deleteCount} ${typeLabel}`
                : `You will delete the ${typeLabel} sales condition`}
            </span>
          </Alert>
          {/* {alert.show && (
            <Alert variant="danger">
              <h3>{alert.message}</h3>
            </Alert>
          )} */}
        </DialogHeader>
        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSalesCondition;
