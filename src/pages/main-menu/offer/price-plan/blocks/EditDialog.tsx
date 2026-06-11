import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePricePlanListContext } from "../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiConfigOffer } from "@/config/api.config";
import { Alert, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import moment from "moment";
import { DatePicker } from "./DatePicker";
import { Textarea } from "@/components/ui/textarea";

interface CreatePricePlanParams {
  categoryname: string;
  remarks: string;
  offercatgcode: string;
  effdate: string;
}

interface EditDialogProps {
  data: {
    offerCatgName: string;
    effDate: string;
    offerCatgCode: string;
    comments: string;
    offercatgid: string | number;
  };
  onClose: () => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const EditDialog = ({ data, onClose }: EditDialogProps) => {
  // console.log(data)
  const parentRef = useRef<any | null>(null);
  const { showEditDialog, handleEditDialog, editDialogData, refreshCategorySideBar } =
    usePricePlanListContext();
  const { reload } = useDataGrid();
  const { PostData, PutData } = useCallApi();

  const [alert, setAlert] = useState({ show: false, message: "" });

  // 🟢 initial value dari props (old value)
  const initialFormField: CreatePricePlanParams = {
    categoryname: editDialogData?.offerCatgName || "",
    remarks: editDialogData?.comments || "",
    offercatgcode: editDialogData?.offerCatgCode || "",
    effdate: editDialogData?.effDate || moment().format("YYYY-MM-DD"),
  };

  const [formField, setFormField] = useState<CreatePricePlanParams>(
    initialFormField
  );

  const [expBaseValidPeriod, setExpBaseValidPeriod] = useState<Date>(
    editDialogData?.effDate ? new Date(editDialogData.effDate) : new Date()
  );

  // reset form setiap kali dialog dibuka
  useEffect(() => {
    if (showEditDialog) {
      setFormField(initialFormField);
      setExpBaseValidPeriod(
        editDialogData?.effDate ? new Date(editDialogData.effDate) : new Date()
      );
    }
  }, [showEditDialog, editDialogData]);

  /* actions */
  const doSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const isChanged =
        formField.categoryname !== initialFormField.categoryname ||
        formField.remarks !== initialFormField.remarks ||
        formField.offercatgcode !== initialFormField.offercatgcode ||
        formField.effdate !== initialFormField.effdate;

      if (!isChanged) {
        toast.info("No changes detected");
        return;
      }

      let response;

      if (editDialogData?.offercatgid) {
        // 🟢 UPDATE
        response = await PutData(
          `${API_URL_OFFER}/offer/category/mod-offer-catg`,
          {
            offerCatg: {
              spId: 0,
              offerCatgType: "4",
              offerCatgClass: "A",
              offerCatgId: editDialogData.offercatgid,
              offerCatgName: formField.categoryname,
              comments: formField.remarks,
              offerCatgCode: formField.offercatgcode,
              effDate: formField.effdate,
            },
            offerCatgApplyChannelList: [],
          }
        );
      } else {
        // 🟢 CREATE
        response = await PostData(
          `${API_URL_OFFER}/offer-category/add-offer-catg`,
          {
            offerCatg: {
              offerCatgType: "4",
              offerCatgName: formField.categoryname,
              comments: formField.remarks,
              offerCatgCode: formField.offercatgcode,
              offerCatgClass: "A",
              effDate: formField.effdate,
            }
          }
        );
      }

      if (response?.status) {
        toast.success(
          editDialogData?.offercatgid
            ? "Success Update Offer Category"
            : "Success Create Offer Category"
        );

        // ✅ close dialog
        handleEditDialog(false);

        // ✅ refresh page / reload data
        reload();

        await refreshCategorySideBar();

        // ✅ log activity
        const activity = {
          module: "Default",
          description: `${editDialogData?.offercatgid ? "Update" : "Create"
            } Offer Category => ${formField.categoryname}`,
          action: editDialogData?.offercatgid ? "U" : "C",
        };
        doSaveLogActivity(activity);
      } else {
        setAlert({ show: true, message: response?.message });
      }
    },
    [formField, initialFormField, editDialogData]
  );

  return (
    <Dialog
      open={showEditDialog}
      onOpenChange={(open) => handleEditDialog(open)}
    >
      <DialogContent className="container-fixed max-w-[1500px] flex flex-col p-10 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-0 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between flex-wrap grow gap-5 pb-7.5">
            <div className="flex flex-col justify-center gap-2">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                {editDialogData?.offercatgid
                  ? "Edit Root Category"
                  : "New Root Category"}
              </h1>
            </div>
            <Button
              variant={"outline"}
              color="#ddd"
              size={"sm"}
              onClick={() => handleEditDialog(false)}
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
            <form onSubmit={doSubmit}>
              <div className="card-body grid gap-5">
                {/* Category Name */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Category Name
                      <span className="text-red-500 font-medium">*</span>
                    </label>
                    <Input
                      className="input"
                      type="text"
                      placeholder="Input name"
                      autoComplete="off"
                      value={formField.categoryname}
                      onChange={({ target }) =>
                        setFormField((prev) => ({
                          ...prev,
                          categoryname: target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Category Code */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Category Code
                    </label>
                    <Input
                      className="input"
                      type="text"
                      placeholder="Input code"
                      autoComplete="off"
                      value={formField.offercatgcode}
                      onChange={({ target }) =>
                        setFormField((prev) => ({
                          ...prev,
                          offercatgcode: target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Effective Date */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5 w-full">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Effective Date
                      <span className="text-red-500 font-medium">*</span>
                    </label>
                    <div className="grow flex gap-2 items-center w-full">
                      <div className="relative w-full">
                        <DatePicker
                          date={expBaseValidPeriod}
                          setDate={(selectedDate: Date | undefined) => {
                            setExpBaseValidPeriod(selectedDate ?? new Date());
                            setFormField((prev) => ({
                              ...prev,
                              effdate: moment(selectedDate).format(
                                "YYYY-MM-DD"
                              ),
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Remarks
                    </label>
                    <Textarea
                      className="min-h-20"
                      placeholder="Input notes"
                      value={formField.remarks}
                      onChange={({ target }) =>
                        setFormField((prev) => ({
                          ...prev,
                          remarks: target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-6 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleEditDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-400 hover:bg-blue-500 text-white"
                    type="submit"
                  >
                    {editDialogData?.offercatgid ? "Update" : "Submit"}
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

export { EditDialog };