import { useCallback, useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserContext } from "../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";

const API_URL = apiConfig.service_price_plan;

const EditDialog = () => {
  const parentRef = useRef<any | null>(null);
  const { showEditDialog, selectedUser, handleEditDialog, roles } =
    useUserContext();
  const { reload } = useDataGrid();
  const { GetData, PutData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [formField, setFormField] = useState({
    name: "",
    username: "",
    email: "",
    id_role: "",
    id_role_old: "",
    status: "",
  });

  /* actions */
  const doUpdateUser = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const response = await PutData(`${API_URL}/user/update/${selectedUser}`, {
        ...formField,
        id_role: undefined,
        id_role_old: undefined,
      });
      if (response?.status) {
        if (formField.id_role_old != "") {
          const responseUserDeleteRole = await PutData(
            `${API_URL}/user/delete_role/${selectedUser}/${formField.id_role_old}`,
            {},
          );
        }

        const responseUserAddRole = await PutData(
          `${API_URL}/user/add_role/${selectedUser}/${formField.id_role}`,
          {},
        );
        setAlert((prev) => ({ ...prev, show: false, message: "" }));
        handleEditDialog(false, null);
        toast.success("Success Update User");
        reload();
        const createActivity = {
          module: "Manage User",
          description: `Edit User => ${formField.username}`,
          action: "U",
        };

        doSaveLogActivity(createActivity);
      } else {
        setAlert((prev) => ({
          ...prev,
          show: true,
          message: response?.message,
        }));
      }
    },
    [selectedUser, formField],
  );

  const doFetchUserData = useCallback(async (id: string) => {
    const response = await GetData(`${API_URL}/user/detail/${id}`, { id });
    if (response?.status) {
      let id_role = response.data.roles.filter(
        (item: any) => item.application.id == "edc",
      );

      setFormField((prev) => ({
        ...prev,
        name: response.data.name,
        username: response.data.username,
        email: response.data.email,
        id_role: id_role.length != 0 ? id_role[0].id : "",
        id_role_old: id_role.length != 0 ? id_role[0].id : "",
        status: response.data.status,
      }));
    } else {
      setFormField((prev) => ({
        ...prev,
        name: "",
        username: "",
        email: "",
        id_role: "0",
        id_role_old: "",
        status: "",
      }));
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      doFetchUserData(selectedUser);
    }
  }, [selectedUser]);

  return (
    <Dialog
      open={showEditDialog}
      onOpenChange={(open) => handleEditDialog(open, null)}
    >
      <DialogContent className="container-fixed max-w-[720px] flex flex-col p-10 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                User - Update
              </h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
            </div>
            <button
              className="btn btn-sm btn-light"
              onClick={() => handleEditDialog(false, null)}
            >
              Close
            </button>
          </div>
        </DialogHeader>
        <DialogBody
          className="scrollable-y py-0 mb-5 ps-0 pe-3 -me-7"
          ref={parentRef}
        >
          <div className="flex flex-col items-stretch grow gap-5 lg:gap-7.5">
            {alert.show && (
              <Alert variant="danger">
                <h3>{alert.message}</h3>
              </Alert>
            )}
            <form onSubmit={doUpdateUser}>
              <div className="card-body grid gap-5">
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Name
                    </label>
                    <Input
                      className="input"
                      type="text"
                      value={formField.name}
                      onChange={({ target }) =>
                        setFormField((prev) => ({
                          ...prev,
                          name: target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Username
                    </label>
                    <Input
                      className="input"
                      type="text"
                      value={formField.username}
                      onChange={({ target }) =>
                        setFormField((prev) => ({
                          ...prev,
                          username: target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Email
                    </label>
                    <Input
                      className="input"
                      type="email"
                      value={formField.email}
                      onChange={({ target }) =>
                        setFormField((prev) => ({
                          ...prev,
                          email: target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <label className="form-label max-w-56">Role</label>

                    <div className="grow">
                      <Select
                        value={formField.id_role}
                        onValueChange={(id_role) =>
                          setFormField((prev) => ({ ...prev, id_role }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role, idx) => (
                            <SelectItem value={role.id} key={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-2.5">
                  <label className="form-label max-w-56">Status</label>

                  <div className="grow">
                    <Select
                      value={formField.status}
                      onValueChange={(status) =>
                        setFormField((prev) => ({ ...prev, status }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Y">Active</SelectItem>
                        <SelectItem value="N">Non Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-2.5">
                  <Button className="btn btn-primary">Save Changes</Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { EditDialog };
