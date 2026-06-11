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
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, KeenIcon, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Textarea } from "@/components/ui/textarea";
import moment from "moment";
import { DatePicker } from "./DatePicker";
import { useMainProductOfferDetailContext } from "../../main-product/hooks";

interface CreateHistoryParams {
  branch_id: string;
  branch_code: string;
  branch_name: string;
  department_id: string;
  department_name: string;
  employee_id: string;
  employee_name: string;
  start_at: string;
  condition_start: string;
  note_start: string;
  end_at: string;
  condition_end: string;
  note_end: string;
}

const API_URL = apiConfig.service_assets;
const API_URL_MASTER_DATA = apiConfig.service_master_data;

const EditMainProductOfferDialog = () => {
  const parentRef = useRef<any | null>(null);
  const {
    showEditMainProductOfferDialog,
    handleEditMainProductOfferDialog,
    selectedHistory,
  } = useMainProductOfferDetailContext();
  const { reload } = useDataGrid();
  const { PostData, PutData, GetData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const [branch, setBranchs] = useState<any[]>([]);
  const [departments, setDepartment] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const [startDate, setStartDate] = useState<Date>(new Date());

  const [formField, setFormField] = useState<CreateHistoryParams>({
    branch_id: "",
    branch_code: "",
    branch_name: "",
    department_id: "",
    department_name: "",
    employee_id: "",
    employee_name: "",
    start_at: "",
    condition_start: "",
    note_start: "",
    end_at: "",
    condition_end: "",
    note_end: "",
  });

  /* actions */
  const doUpdateHistory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const response = await PutData(
        `${API_URL}/inventory/history/update/${selectedHistory?.id}`,
        {
          ...formField,
        }
      );
      if (response?.status) {
        setAlert((prev) => ({ ...prev, show: false, message: "" }));
        handleEditMainProductOfferDialog(false, null);
        toast.success("Success Edit History");
        reload();
        const createActivity = {
          module: "Inventory",
          description: `Create Edit History for ${formField.branch_name} => ${formField.employee_name}`,
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
    [formField, selectedHistory]
  );

  useEffect(() => {
    if (selectedHistory) {
      setFormField((prev) => ({
        ...prev,
        branch_id: selectedHistory?.branch_id || "",
        branch_code: selectedHistory?.branch_code || "",
        branch_name: selectedHistory?.branch_name || "",
        department_id: selectedHistory?.department_id || "",
        department_name: selectedHistory?.department_name || "",
        employee_id: selectedHistory?.employee_id || "",
        employee_name: selectedHistory?.employee_name || "",
        start_at: moment(selectedHistory?.start_at).format("YYYY-MM-DD"),
        condition_start: selectedHistory?.condition_start || "",
        note_start: selectedHistory?.note_start || "",
        end_at: moment(startDate).format("YYYY-MM-DD"),
        condition_end: selectedHistory?.condition_end || "",
        note_end: selectedHistory?.note_end || "",
      }));
    }

    const storedBranchs = localStorage.getItem("branchs");
    const storedDepartments = localStorage.getItem("departments");

    if (storedBranchs && storedDepartments) {
      setBranchs(JSON.parse(storedBranchs));
      setDepartment(JSON.parse(storedDepartments));

      return;
    }

    const fetchBranchs = async () => {
      try {
        const response = await GetData(`${API_URL_MASTER_DATA}/branch/list`, {
          limit: 100,
          page: 1,
          with_deleted: false,
          order_field: "created_at",
          order_direction: "DESC",
          filter: "",
        });

        if (response?.data?.list) {
          setBranchs(response.data.list);
          localStorage.setItem("branchs", JSON.stringify(response.data.list));
        }
      } catch (error) {
        toast.error("Error loading Branch data");
      }
    };

  }, [selectedHistory]);

  return (
    <Dialog
      open={showEditMainProductOfferDialog}
      onOpenChange={(open) => handleEditMainProductOfferDialog(open, null)}
    >
      <DialogContent className="container-fixed max-w-[720px] flex flex-col p-10 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Pengembalian
              </h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
            </div>
            <Button
              variant={"outline"}
              color="#ddd"
              size={"sm"}
              onClick={() => handleEditMainProductOfferDialog(false, null)}
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
            <form action="" onSubmit={doUpdateHistory}>
              <div className="card-body grid gap-5">
                <div className="w-full">
                  <div className="flex items-baseline gap-2.5">
                    <p className="form-label flex items-center gap-1 w-6/12">
                      Nama Pengguna
                    </p>
                    <div className="w-9/12">
                      <Select
                        value={formField.employee_id}
                        onValueChange={(employee_id) => {
                          const selectedEmployee = employee.find(
                            (dp) => dp._idx == employee_id
                          );
                          setFormField((prev: any) => ({
                            ...prev,
                            employee_id,
                            employee_name: selectedEmployee
                              ? selectedEmployee.employeename
                              : "",
                            department_id: selectedEmployee
                              ? selectedEmployee.idxdept
                              : "",
                            department_name: selectedEmployee
                              ? selectedEmployee.departement
                              : "",
                          }));
                        }}
                        disabled
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          {employee.map((dp: any) => (
                            <SelectItem
                              key={dp._idx}
                              value={dp._idx.toString()}
                            >
                              {dp.employeename}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-center gap-2.5">
                    <p className="form-label w-6/12">Cabang</p>

                    <div className="w-9/12">
                      <Select
                        value={formField.branch_id}
                        onValueChange={(branch_id) => {
                          const selectedBranch = branch.find(
                            (dp) => dp.id === branch_id
                          );
                          setFormField((prev: any) => ({
                            ...prev,
                            branch_id,
                            branch_name: selectedBranch
                              ? selectedBranch.name
                              : "",
                            branch_code: selectedBranch
                              ? selectedBranch.code
                              : "",
                          }));
                        }}
                        disabled
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          {branch.map((br) => (
                            <SelectItem key={br.id} value={br.id}>
                              {br.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-center gap-2.5">
                    <p className="form-label w-6/12">Departemen</p>
                    <div className="w-9/12">
                      <Select
                        value={formField.department_id}
                        disabled
                        onValueChange={(department_id) => {
                          const selectedDepartment = departments.find(
                            (dp) => dp._idx == department_id
                          );
                          setFormField((prev: any) => ({
                            ...prev,
                            department_id,
                            department_name: selectedDepartment
                              ? selectedDepartment.deptname
                              : "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dp) => (
                            <SelectItem
                              key={dp._idx}
                              value={dp._idx.toString()}
                            >
                              {dp.deptname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-center gap-2.5">
                    <p className="form-label w-6/12">Kondisi</p>
                    <div className="w-9/12">
                      <Select
                        value={formField.condition_end}
                        onValueChange={(condition_end) => {
                          setFormField((prev: any) => ({
                            ...prev,
                            condition_end: condition_end,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">NEW</SelectItem>
                          <SelectItem value="good">GOOD</SelectItem>
                          <SelectItem value="minor_damage">
                            MINOR DAMAGE
                          </SelectItem>
                          <SelectItem value="damaged">DAMAGED</SelectItem>
                          <SelectItem value="unusable">UNUSABLE</SelectItem>
                          <SelectItem value="disposed">DISPOSED</SelectItem>
                          <SelectItem value="lost">LOST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline gap-2.5">
                    <p className="form-label flex items-center gap-1 w-6/12">
                      Tanggal
                    </p>
                    <div className="w-9/12">
                      <DatePicker
                        // date={formField.effdate ? new Date(formField.effdate) : undefined}
                        setDate={(selectedDate: Date | undefined) => {
                          setFormField((prev: any) => ({
                            ...prev,
                            effdate: selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : null,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline gap-2.5">
                    <p className="form-label flex items-center gap-1 w-6/12">
                      Note
                    </p>
                    <div className="w-9/12">
                      <Textarea
                        className="input text-[14px] focus-visible:ring-offset-0 focus-visible:ring-0"
                        value={formField.note_end}
                        onChange={({ target }) =>
                          setFormField((prev) => ({
                            ...prev,
                            note_end: target.value,
                          }))
                        }
                        placeholder="Note Akhir"
                      ></Textarea>
                    </div>
                  </div>
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

export { EditMainProductOfferDialog };
