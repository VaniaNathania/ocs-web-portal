import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import useAccountBalanceContext from "../../account-balanceType/hooks/useAccountBalanceContext";
import useAccountItemContext from "../hooks/useAccountItemContext";
import { KeenIcon, useDataGrid } from "@/components";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { set } from "date-fns";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NumericFormat } from "react-number-format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import GroupedAccountBalanceSelect from "./GroupedAccountBalanceSelect";
import SearchableGroupedBalanceSelect from "./GroupedAccountBalanceSelect";

const API_URL = apiConfig.service_price_plan;

const AddDialog = () => {
  const { PostData } = useCallApi();
  const {
    handleShowDialog,
    selectedAccountItem,
    setSelectedAccountItem,
    showDialog,
    doGetParent,
    parent,
    childrenList,
  } = useAccountItemContext();
  const { reload } = useDataGrid();
  const [formField, setFormField] = useState<CreateAccountItem>({
    acctResId: 0,
    parentId: 0,
    exchangeItemTypeId: 0,
    acctItemTypeName: "",
    comments: null,
    acctItemTypeCode: null,
    usageType: null,
    spId: 0,
    gstType: null,
    feeType: null,
    zeroFeePrintFlag: null,
    defaultTaxItemTypeId: null,
    feeClass: null,
    billPriority: null,
    acctItemGroupId: null,
    billItemType: null,
    taxAcctItemTypeId: null,
    discountAcctItemTypeId: null,
    taxApplyId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBalType, setSelectedBalType] = useState<number | null>(null);
  const { balType } = useAccountItemContext();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleClose = () => {
    handleShowDialog(false, "create", null);
    resetForm();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formField.acctItemTypeName.trim()) {
      newErrors.acctItemTypeName = "Account Item Type Name is required";
    }

    if (!formField.acctResId || formField.acctResId === 0) {
      newErrors.acctResId = "Account Balance Type is required";
    }

    if (!formField.billPriority || formField.billPriority <= 0) {
      newErrors.billPriority = "Bill Priority must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    doCreateAccountItem();
    setIsSubmitting(false);
  };
  const doCreateAccountItem = async () => {
    try {
      const response = await PostData(
        `${API_URL}/account-item-type/create`,
        formField,
      );
      if (response?.status) {
        handleShowDialog(false, "create", null);
        reload();
        resetForm();
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      //  console.log(error);
      toast.error("Failed to Create Account Item Type");
    }
  };

  useEffect(() => {
    if (selectedBalType === 4 || selectedBalType === 5) {
      setFormField((prev) => ({
        ...prev,
        defaultTaxItemTypeId: null,
      }));
    }
  }, [selectedBalType]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const resetForm = () => {
    setFormField({
      acctResId: 0,
      parentId: 0,
      exchangeItemTypeId: 0,
      acctItemTypeName: "",
      comments: null,
      acctItemTypeCode: null,
      usageType: null,
      spId: 0,
      gstType: null,
      feeType: null,
      zeroFeePrintFlag: null,
      defaultTaxItemTypeId: null,
      feeClass: null,
      billPriority: 0,
      acctItemGroupId: null,
      billItemType: null,
      taxAcctItemTypeId: null,
      discountAcctItemTypeId: null,
      taxApplyId: null,
    });
    setErrors({});
    setSelectedBalType(null);
  };

  return (
    <Dialog
      open={showDialog.show && showDialog.mode === "create"}
      onOpenChange={handleClose}
    >
      <DialogContent className="container-fixed max-w-[1080px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-5 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex flex-wrap items-center justify-between grow">
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                Add Account Item Type
              </h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
            </div>
            <div
              className="opacity-50 cursor-pointer hover:opacity-100"
              onClick={() => {
                handleShowDialog(false, "create", null);
              }}
            >
              <KeenIcon icon="cross" className="text-1.5xl" />
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="px-0 pb-0 scrollable-y">
          <div className="flex flex-col px-0">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 p-0 card-body">
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Account Item Type Name
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col grow">
                      <Input
                        className={`input`}
                        type="text"
                        autoComplete="off"
                        value={formField.acctItemTypeName}
                        onChange={({ target }) => {
                          setFormField((prev) => ({
                            ...prev,
                            acctItemTypeName: target.value,
                          }));
                          if (errors.acctItemTypeName)
                            clearError("acctItemTypeName");
                        }}
                      />
                      {errors.acctItemTypeName && (
                        <span className="text-xs text-red-600">
                          {errors.acctItemTypeName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Parent Account Item Type Name{" "}
                    </label>
                    <div className="flex flex-col grow">
                      <Select
                        value={formField.parentId?.toString() ?? ""}
                        onValueChange={(parentId) => {
                          setFormField((prev) => ({
                            ...prev,
                            parentId: parseInt(parentId),
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Parent Account Item Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {parent ? (
                            parent.map((parent) => (
                              <SelectItem
                                value={parent.id?.toString()}
                                key={parent.id}
                              >
                                {parent.acctItemTypeName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              Loading...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Account Balance Type{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col grow">
                      <SearchableGroupedBalanceSelect
                        value={formField.acctResId?.toString() ?? ""}
                        onValueChange={(acctResId) => {
                          setFormField((prev) => ({
                            ...prev,
                            acctResId: parseInt(acctResId),
                          }));

                          if (errors.acctResId) clearError("acctResId");
                        }}
                        placeholder="Select Account Balance Type"
                      />
                      {errors.acctResId && (
                        <span className="text-xs text-red-600">
                          {errors.acctResId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Account Item Type Code
                    </label>
                    <div className="flex flex-col grow">
                      <Input
                        className={`input`}
                        type="text"
                        autoComplete="off"
                        value={formField?.acctItemTypeCode ?? ""}
                        onChange={({ target }) => {
                          setFormField((prev) => ({
                            ...prev,
                            acctItemTypeCode: target.value,
                          }));
                          if (target.value) {
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Usage Type
                    </label>

                    <div className="flex flex-col grow">
                      <Select
                        value={formField.usageType ?? ""}
                        onValueChange={(value) => {
                          setFormField((prev) => ({
                            ...prev,
                            usageType: value,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Tax</SelectItem>
                          <SelectItem value="B">Discount Charge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Bind For Tax
                    </label>
                    <div className="grow">
                      <Select
                        value={formField.taxAcctItemTypeId?.toString() ?? ""}
                        onValueChange={(taxAcctItemTypeId) => {
                          setFormField((prev) => ({
                            ...prev,
                            taxAcctItemTypeId:
                              parseInt(taxAcctItemTypeId) ?? "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Parent Account Item Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {parent.map((parent) => (
                            <SelectItem
                              value={parent.id?.toString()}
                              key={parent.id}
                            >
                              {parent.acctItemTypeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Bind For Discount
                    </label>
                    <div className="grow">
                      <Select
                        value={
                          formField.discountAcctItemTypeId?.toString() ?? ""
                        }
                        onValueChange={(discountAcctItemTypeId) => {
                          setFormField((prev) => ({
                            ...prev,
                            discountAcctItemTypeId:
                              parseInt(discountAcctItemTypeId) ?? "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Parent Account Item Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {parent.map((parent) => (
                            <SelectItem
                              value={parent.id?.toString()}
                              key={parent.id}
                            >
                              {parent.acctItemTypeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Exchange To
                    </label>
                    <div className="grow">
                      <Select
                        value={formField.exchangeItemTypeId?.toString() ?? ""}
                        onValueChange={(exchangeItemTypeId) => {
                          setFormField((prev) => ({
                            ...prev,
                            exchangeItemTypeId:
                              parseInt(exchangeItemTypeId) ?? "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Parent Account Item Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {parent.map((parent) => (
                            <SelectItem
                              value={parent.id?.toString()}
                              key={parent.id}
                            >
                              {parent.acctItemTypeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      GST Type
                    </label>

                    <div className="flex flex-col grow">
                      <Select
                        value={formField.gstType ?? ""}
                        onValueChange={(value) => {
                          setFormField((prev) => ({
                            ...prev,
                            gstType: value,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="G">GSTStandardRate</SelectItem>
                          <SelectItem value="Z">GSTZeroRate</SelectItem>
                          <SelectItem value="O">GSTOutOfScope</SelectItem>
                          <SelectItem value="E">GSTTaxExempt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Zero Fee Point
                    </label>

                    <div className="flex flex-col grow">
                      <Select
                        value={formField.zeroFeePrintFlag ?? ""}
                        onValueChange={(value) => {
                          setFormField((prev) => ({
                            ...prev,
                            zeroFeePrintFlag: value,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Y">Yes</SelectItem>
                          <SelectItem value="N">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Bill Priority
                      <span>
                        <span className="text-red-500"> *</span>
                      </span>
                    </label>
                    <div className="grow">
                      <NumericFormat
                        className="input"
                        value={formField.billPriority}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowNegative={false}
                        onValueChange={(values) => {
                          setFormField((prev) => ({
                            ...prev,
                            billPriority: values.floatValue || 0,
                          }));
                          if (errors.billPriority) {
                            clearError("billPriority");
                          }
                        }}
                        placeholder="Enter Bill Priority"
                      />
                      {errors.billPriority && (
                        <span className="text-xs text-red-600">
                          {errors.billPriority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Fee Type
                    </label>

                    <div className="flex flex-col grow">
                      <Select
                        value={formField.feeType ?? ""}
                        onValueChange={(value) => {
                          setFormField((prev) => ({
                            ...prev,
                            feeType: value,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent></SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Bill Item Type
                    </label>

                    <div className="flex flex-col grow">
                      <Select
                        value={formField.billItemType ?? ""}
                        onValueChange={(value) => {
                          setFormField((prev) => ({
                            ...prev,
                            billItemType: value,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent></SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                {selectedBalType !== 4 && selectedBalType !== 5 && (
                  <div className="w-full">
                    <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                      <label className="flex items-center gap-1 form-label max-w-56">
                        Default Tax Item ID
                      </label>
                      <div className="grow">
                        <Select
                          value={
                            formField.defaultTaxItemTypeId?.toString() ?? ""
                          }
                          onValueChange={(defaultTaxItemTypeId) => {
                            setFormField((prev) => ({
                              ...prev,
                              defaultTaxItemTypeId:
                                parseInt(defaultTaxItemTypeId) ?? "",
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Parent Account Item Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {parent.map((parent) => (
                              <SelectItem
                                value={parent.id?.toString()}
                                key={parent.id}
                              >
                                {parent.acctItemTypeName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Fee Class
                    </label>

                    <div className="flex flex-col grow">
                      <Select
                        value={formField.feeClass ?? ""}
                        onValueChange={(value) => {
                          setFormField((prev) => ({
                            ...prev,
                            feeClass: value,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="D">Device</SelectItem>
                          <SelectItem value="O">Other Service</SelectItem>
                          <SelectItem value="S">Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Remarks
                    </label>
                    <div className="flex flex-col grow">
                      <Input
                        className={`input`}
                        type="text"
                        autoComplete="off"
                        value={formField.comments ?? ""}
                        onChange={({ target }) => {
                          setFormField((prev) => ({
                            ...prev,
                            comments: target.value,
                          }));
                          if (target.value) {
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2.5 gap-5">
                  <Button
                    variant={"outline"}
                    type="reset"
                    onClick={() => {
                      //   resetForm();
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant={"default"}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
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
export default AddDialog;
