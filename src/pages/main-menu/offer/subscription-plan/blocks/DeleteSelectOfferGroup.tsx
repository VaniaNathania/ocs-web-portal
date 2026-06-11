import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AvailableOffer } from "./SelectOfferGroupSubsPlan";
import { AvailableOfferChild } from "./SelectOfferGroupSubsPlan";
import { Alert } from "@/components";

interface DeleteSelectOfferGroupProps {
  offer: AvailableOffer | AvailableOfferChild | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteSelectOfferGroup: React.FC<DeleteSelectOfferGroupProps> = ({ offer, onConfirm, onCancel }) => {
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  return (
    <Dialog open={!!offer} onOpenChange={onCancel}>
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">You will delete this offer group</span>
          </Alert>
          {alert.show && (
            <Alert variant="danger">
              <h3>{alert.message}</h3>
            </Alert>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSelectOfferGroup;
