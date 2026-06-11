import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { useUserContext } from "../hooks";
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
  const { showDeleteDialog, handleDeleteDialog, selectedUser } =
    useUserContext();
  const { reload } = useDataGrid();
  const [enforce, setEnforce] = useState(false);

  const { DeleteData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  /* actions */
  const doDeleteData = useCallback(async () => {
    const response = await DeleteData(
      `${API_URL}/user/delete/${selectedUser}/${enforce}`,
      {
        id: selectedUser,
      },
    );
    if (response?.status) {
      setAlert((prev) => ({ ...prev, show: false, message: "" }));
      handleDeleteDialog(false, null);
      toast.success("Success Delete User");
      reload();
      const createActivity = {
        module: "Manage User",
        description: `Delete User => ${selectedUser}`,
        action: "D",
      };

      doSaveLogActivity(createActivity);
    } else {
      setAlert((prev) => ({ ...prev, show: true, message: response?.message }));
    }
  }, [selectedUser, enforce]);

  return (
    <Dialog
      open={showDeleteDialog}
      onOpenChange={(open) => handleDeleteDialog(open, null)}
    >
      <DialogContent className="container-fixed max-w-md flex flex-col p-5 overflow-hidden [&>button]:hidden">
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
