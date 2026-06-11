import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import { useState } from "react";
import { Loading } from "../../role-management/block/loadingBlock";

interface ConfProps {
  isOpen: boolean;
  handleDialog: (bool: boolean) => void;
  title?: string;
  desc?: string;
  onConfirm: any;
}

export const ConfirmDialog = ({
  isOpen,
  handleDialog,
  title = "Are You Sure?",
  desc = "This are confirmation Dialog",
  onConfirm,
}: ConfProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close only if clicked directly on the backdrop
    if (e.target === e.currentTarget) {
      handleDialog(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // console.log("di conf dialog");

      await onConfirm();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <Dialog open={isOpen} onOpenChange={(open) => handleDialog(open)}>
        <DialogContent
          className={`container-fixed max-w-sm flex flex-col p-0 overflow-hidden [&>button]:hidden`}
        >
          <DialogHeader className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                {title}
              </DialogTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDialog(false)}
              className="h-8 w-8 p-0"
            >
              <KeenIcon icon="cross" className="text-sm" />
            </Button>
          </DialogHeader>

          <DialogBody className="">
            {loading && <Loading />}
            <div className="flex flex-col gap-5">
              <DialogDescription className="text-gray-600">
                {desc}
              </DialogDescription>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm"}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
};
