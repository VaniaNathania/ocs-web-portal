import { useCallback, useRef, useState } from "react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useManagePositionContext } from "../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { Checkbox } from "@/components/ui/checkbox";
import { doSaveLogActivity } from "@/actions/GlobalActions";

const API_URL = apiConfig.service_price_plan;

interface MenuItem {
  id: string;
  name: string;
  children?: MenuItem[];
}

const MenuItemComponent: React.FC<{
  menu: MenuItem;
  selectMenus: string[];
  handleCheckboxChange: (id: string) => void;
}> = ({ menu, selectMenus, handleCheckboxChange }) => {
  const { id, name, children = [] } = menu;

  return (
    <div className="mt-3">
      <div className="text-sm flex items-center gap-3">
        <Checkbox
          checked={selectMenus.includes(id)}
          id={`label-${id}`}
          onCheckedChange={() => handleCheckboxChange(id)}
        />
        <label htmlFor={`label-${id}`}>{name}</label>
      </div>
      {children.length > 0 && (
        <div className="pl-5">
          {children.map((child) => (
            <MenuItemComponent
              key={child.id}
              menu={child}
              selectMenus={selectMenus}
              handleCheckboxChange={handleCheckboxChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AddDialog = () => {
  const parentRef = useRef<any | null>(null);
  const { showAddDialog, handleAddDialog, menus } = useManagePositionContext();
  const { reload } = useDataGrid();
  const { PostData } = useCallApi();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [selectMenus, setSelectMenus] = useState<string[]>([]);
  const [formField, setFormField] = useState({
    name: "",
  });

  /* actions */
  const handleCheckboxChange = useCallback((key: string) => {
    setSelectMenus((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }, []);

  const doCreatePosition = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const response = await PostData(`${API_URL}/user_role/create`, {
        name: formField.name,
        roles: selectMenus,
        application: "edc",
        status: "Y",
      });

      if (response?.status) {
        setAlert((prev) => ({ ...prev, show: false, message: "" }));
        handleAddDialog(false);
        toast.success("Success Create Position");
        reload();
        setFormField({
          name: "",
        });
        setSelectMenus([]);
        const createActivity = {
          module: "Manage Position",
          description: `Create New Position => ${formField.name}`,
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
    [formField, selectMenus],
  );

  return (
    <Dialog open={showAddDialog} onOpenChange={(open) => handleAddDialog(open)}>
      <DialogContent className="container-fixed max-w-screen-lg flex flex-col p-10 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Positions - Create
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
            <form action="" onSubmit={doCreatePosition}>
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

                <div className="grid md:grid-cols-3 w-full gap-5">
                  {menus.map((menu) => (
                    <div className="card" key={menu.id}>
                      <div className="card-body">
                        <MenuItemComponent
                          menu={menu}
                          selectMenus={selectMenus}
                          handleCheckboxChange={handleCheckboxChange}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2.5">
                  <Button className="btn btn-primary" type="submit">
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
