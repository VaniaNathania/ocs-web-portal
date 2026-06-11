import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
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
import { Alert, KeenIcon, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import clsx from "clsx";

interface CreateUserParams {
  email: string;
  username: string;
  password: string;
  retype_password: string;
  name: string;
  id_role: string;
  status: string;
}

const API_URL = apiConfig.service_price_plan;
type PasswordType = "password" | "retype_password";

const AddDialog = () => {
  const parentRef = useRef<any | null>(null);
  const { showAddDialog, handleAddDialog, roles } = useUserContext();
  const { reload } = useDataGrid();
  const { PostData, PutData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  const [formField, setFormField] = useState<CreateUserParams>({
    email: "",
    username: "",
    password: "",
    retype_password: "",
    name: "",
    id_role: "",
    status: "",
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    retype_password: false,
  });

  const [messagePassword, setMessagePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (password: string, confirmPassword: string) => {
    const errors: string[] = [];

    if (password) {
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one capital letter");
      }
      if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
      }
      if (password !== confirmPassword) {
        errors.push("Passwords do not match");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  useEffect(() => {
    const validation = validatePassword(
      formField.password,
      formField.retype_password,
    );
    setMessagePassword(validation.isValid);
    setPasswordErrors(validation.errors);
  }, [formField.password, formField.retype_password]);

  const isButtonDisabled =
    !messagePassword || isSubmitting || passwordErrors.length > 0;

  /* actions */
  const doCreateUser = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const response = await PostData(`${API_URL}/user/create`, {
        ...formField,
        id_role: undefined,
      });
      if (response?.status) {
        const responseUserAddRole = await PutData(
          `${API_URL}/user/add_role/${response?.message?.id}/${formField.id_role}`,
          {},
        );
        setAlert((prev) => ({ ...prev, show: false, message: "" }));
        handleAddDialog(false);
        toast.success("Success Create User");
        reload();
        const createActivity = {
          module: "Manage User",
          description: `Create New User => ${formField.username}`,
          action: "C",
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
    [formField],
  );

  const togglePassword = useCallback(
    (event: MouseEvent<HTMLButtonElement>, key: string) => {
      event.preventDefault();
      setShowPassword((prev) => ({
        ...prev,
        [key]: !prev[key as PasswordType],
      }));
    },
    [],
  );

  return (
    <Dialog open={showAddDialog} onOpenChange={(open) => handleAddDialog(open)}>
      <DialogContent className="container-fixed max-w-[720px] flex flex-col p-10 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                User - Create
              </h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
            </div>
            <Button
              variant={"outline"}
              color="#ddd"
              size={"sm"}
              onClick={() => handleAddDialog(false)}
            >
              Close
            </Button>
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
            <form action="" onSubmit={doCreateUser}>
              <div className="card-body grid gap-5">
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Name
                    </label>
                    <Input
                      className="input"
                      type="text"
                      autoComplete="off"
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
                      autoComplete="off"
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
                      autoComplete="off"
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

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Password
                    </label>
                    <div className="input">
                      <input
                        className="form-control"
                        type={showPassword.password ? "text" : "password"}
                        value={formField.password}
                        onChange={({ target }) =>
                          setFormField((prev) => ({
                            ...prev,
                            password: target.value,
                          }))
                        }
                      />
                      <button
                        className="btn btn-icon"
                        onClick={(e) => togglePassword(e, "password")}
                      >
                        <KeenIcon
                          icon="eye"
                          className={clsx("text-gray-500", {
                            hidden: showPassword.password,
                          })}
                        />
                        <KeenIcon
                          icon="eye-slash"
                          className={clsx("text-gray-500", {
                            hidden: !showPassword.password,
                          })}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Confirm Password
                    </label>
                    <div className="input">
                      <input
                        className="form-control"
                        autoComplete="off"
                        type={
                          showPassword.retype_password ? "text" : "password"
                        }
                        value={formField.retype_password}
                        onChange={({ target }) =>
                          setFormField((prev) => ({
                            ...prev,
                            retype_password: target.value,
                          }))
                        }
                      />
                      <button
                        className="btn btn-icon"
                        onClick={(e) => togglePassword(e, "retype_password")}
                      >
                        <KeenIcon
                          icon="eye"
                          className={clsx("text-gray-500", {
                            hidden: showPassword.retype_password,
                          })}
                        />
                        <KeenIcon
                          icon="eye-slash"
                          className={clsx("text-gray-500", {
                            hidden: !showPassword.retype_password,
                          })}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="w-full ps-56">
                    {passwordErrors.length > 0 && (
                      <div className="text-xs text-red-500 mt-2">
                        {passwordErrors.map((error, index) => (
                          <p key={index}>{error}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2.5">
                  <Button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isButtonDisabled}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { AddDialog };
