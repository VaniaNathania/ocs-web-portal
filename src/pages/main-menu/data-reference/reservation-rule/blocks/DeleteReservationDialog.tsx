import { Button } from "@/components/ui/button";
import { Alert } from "@/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useReservationListContext } from "../hooks/useReservationRuleContext";
import { useEffect } from "react";
import { ReUsageList } from "../hooks/ReservationRuleContext";

const API_URL_REF = apiConfigRef.ref;

interface DeleteReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  isDeleting?: boolean;
  setIsDeleting?: (item: boolean) => void;
  reload?: any;
  setShowDeleteDialog?: (item: boolean) => void;
  itemToDelete?: ReUsageList | null;
}

const DeleteReservationDialog = ({
  open,
  onOpenChange,
  itemName,
  isDeleting = false,
  setIsDeleting = () => {},
  reload,
  setShowDeleteDialog = () => {},
  itemToDelete,
}: DeleteReservationDialogProps) => {
  const { DeleteData } = useCallApi();
  const { selectedItem, setSelectedItem } = useReservationListContext();

  const handleConfirm = async () => {
    if (!itemToDelete) {
      toast.error("No item selected for deletion");
      return;
    }

    setIsDeleting(true);

    try {
      const currentReId = itemToDelete.reId;
      const currentReAttr = itemToDelete.reAttr;
      const currentProdSpecId = itemToDelete.prodSpecId;

      //  console.log("🔍 Item to delete:", {
      //   reId: currentReId,
      //   reAttr: currentReAttr,
      //   reAttrType: typeof currentReAttr,
      //   prodSpecId: currentProdSpecId,
      // });

      let payload: any = {};

      const base = {
        reId: currentReId,
        reAttr: currentReAttr ? Number(currentReAttr) : 0,
        spId: 0,
      };

      // 🔴 JIKA ADA MAIN PRODUCT
      if (currentProdSpecId !== null && currentProdSpecId !== undefined) {
        payload = {
          reservePolicyProdSpecDto: {
            ...base,
            prodSpecId: Number(currentProdSpecId),
          },
          reserveLimitProdSpecDto: {
            ...base,
            prodSpecId: Number(currentProdSpecId),
          },
        };
      }
      // 🟢 JIKA TANPA MAIN PRODUCT
      else {
        payload = {
          reservePolicyDto: base,
          reserveLimitDto: base,
        };
      }

      //  console.log("🗑️ delete payload:", payload);

      const response = await DeleteData(
        `${API_URL_REF}/api/reservation-rule/del-reservation-policy`,
        payload,
      );

      if (response?.status) {
        toast.success("Reservation rule deleted successfully!");

        // ✅ Clear selectedItem jika item yang di-delete adalah item yang sedang dipilih
        if (selectedItem?.reId === currentReId) {
          setSelectedItem(null);
        }

        await reload();
        setShowDeleteDialog(false);
      } else {
        toast.error(response?.message || "Delete failed");
      }
    } catch (error) {
      console.error("❌ Error deleting reservation rule", error);
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isDeleting && onOpenChange(isOpen)}
    >
      <DialogContent className="max-w-md p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>

        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <span className="text-sm mt-1 block">
              You will delete the reservation rule
              {itemName && (
                <>
                  {" "}
                  <strong>"{itemName}"</strong>
                </>
              )}
              . This action cannot be undone.
            </span>
          </Alert>
        </DialogHeader>

        <DialogFooter className="flex justify-end items-center gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteReservationDialog;
