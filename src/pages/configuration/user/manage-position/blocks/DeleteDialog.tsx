import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useManagePositionContext } from "../hooks";
import { Button } from "@/components/ui/button";
import { Alert, useDataGrid } from "@/components";
import { ChangeEvent, useCallback, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { EnforceSwitch } from "@/components/switch";

const API_URL = apiConfig.service_price_plan;

const DeleteDialog = () => {
  const { showDeleteDialog, handleDeleteDialog, selectedPosition } =
    useManagePositionContext();
  const { reload } = useDataGrid();
  const [enforce, setEnforce] = useState(false);

  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  /* actions */
  const doDeleteData = useCallback(async () => {
    if (!selectedPosition) {
      toast.success("Please Select Position");
      return;
    }
    const response = await DeleteData(
      `${API_URL}/user_role/delete/${selectedPosition.id}/${enforce}`,
      {
        id: selectedPosition.id,
      },
    );
    if (response?.status) {
      setAlert((prev) => ({ ...prev, show: false, message: "" }));
      handleDeleteDialog(false, null);
      toast.success("Success Delete Position");
      reload();
      const createActivity = {
        module: "Manage Position",
        description: `Delete Position => ${selectedPosition.name}`,
        action: "D",
      };

      doSaveLogActivity(createActivity);
    } else {
      setAlert((prev) => ({ ...prev, show: true, message: response?.message }));
    }
  }, [selectedPosition, enforce]);

  return (
    <Dialog
      open={showDeleteDialog}
      onOpenChange={(open) => handleDeleteDialog(open, null)}
    >
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogTitle></DialogTitle>
        <DialogHeader className="p-0 border-0 block">
          <Alert variant="warning">
            <h3 className="text-lg">Are you sure?</h3>
            <span className="text-sm">you will delete this data!</span>
            <div className="mt-2 flex items-center gap-x-2">
              <label className="form-label max-w-56">Hard Delete</label>
              <EnforceSwitch
                enforce={enforce}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEnforce(e.target.checked);
                }}
              />
            </div>
          </Alert>
          {alert.show && (
            <Alert variant="danger">
              <h3>{alert.message}</h3>
            </Alert>
          )}
        </DialogHeader>
        <DialogFooter className="flex justify-end items-center gap-4 mt-3">
          <Button
            variant={"outline"}
            onClick={() => handleDeleteDialog(false, null)}
          >
            Cancel
          </Button>
          <Button variant={"destructive"} onClick={() => doDeleteData()}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteDialog };
