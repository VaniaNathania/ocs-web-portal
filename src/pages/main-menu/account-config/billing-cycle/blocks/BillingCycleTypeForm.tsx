import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import useAccountBalanceContext from "../hooks/useAccountBalanceContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import useBillingCycleTypeContext from "../hooks/useBillingCycleTypeContext";
import { createDefaultBillingCycleTypePayload } from "../types/forms";
import { DateTimePickerField } from "@/components/ui/dateTime-picker";

interface FormsProps {
  forms: UseFormReturn<BillingCycleTypePayload>;
  isSubmitting: boolean;
  formType: "create" | "update";
}
const API_URL = apiConfig.service_price_plan;

const BalanceEditDialog = ({ formType, forms, isSubmitting }: FormsProps) => {
  const {
    handleShowDialog,
    showDialog,
    selectedBillingCycleType,
    doGetBillingCycleType,
    handlerefresh,
  } = useBillingCycleTypeContext();
  const { GetData, PostData, PutData, DeleteData } = useCallApi();
  const {
    control,
    formState: { errors },
    register,
    watch,
    reset,
    setValue,
    handleSubmit,
    clearErrors,
    setError,
  } = forms;

  //for isCurrrency Condition

  const onSubmit = async (data: BillingCycleTypePayload) => {
    // Validasi khusus untuk mode UPDATE
    // Lanjutkan proses create atau update
    if (showDialog.mode === "create") {
      doCreateBalanceType(data);
    } else if (showDialog.mode === "update") {
      doUpdateBalanceType(data);
    }
  };
  const doCreateBalanceType = async (data: BillingCycleTypePayload) => {
    try {
      const response = await PostData(
        `${API_URL}/billing-cycle/create/type`,
        data,
      );
      if (response?.status) {
        toast.success(response?.message);
        handleShowDialog(false, "create", null);
        handlerefresh();
        reset(createDefaultBillingCycleTypePayload());
        // handlerefresh();
        // reset(createDefaultBillingCycleTypePayload());
      }
      // reload();
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };
  const doUpdateBalanceType = async (data: BillingCycleTypePayload) => {
    try {
      const response = await PutData(
        `${API_URL}/billing-cycle/mod/type?billingCycleTypeId=${selectedBillingCycleType?.billingCycleTypeId}`,
        data,
      );
      if (response?.status) {
        toast.success(response?.message);
        handleShowDialog(false, "update", null);
        handlerefresh();
        reset(createDefaultBillingCycleTypePayload());
        // reset(createDefaultAccountBalancePayload());
        // reload();
        // handlerefresh();
      }
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  };

  useEffect(() => {
    if (!showDialog.show) {
      reset(createDefaultBillingCycleTypePayload());
    }
  }, [showDialog.show, reset]);

  return (
    <Dialog
      open={showDialog.show}
      onOpenChange={(open) => handleShowDialog(open, showDialog.mode, null)}
    >
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-7">
        <DialogHeader className="space-y-1.5">
          <DialogTitle>
            {showDialog.mode === "create" ? "Create" : "Edit"} Billing Cycle
            Type
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <form className="space-y-10 mt-4" onSubmit={handleSubmit(onSubmit)}>
          {/* BASIC INFORMATION */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Balance Type Name */}
              <div>
                <Label>
                  <span className="text-red-500">*</span>Billing Cycle Type Name
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    className="mt-1"
                    {...register("billingCycleTypeName")}
                  />
                </div>
                {errors.billingCycleTypeName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.billingCycleTypeName.message}
                  </p>
                )}
              </div>
              <div>
                <Label>
                  <span className="text-red-500">*</span>Billing Cycle Type Code
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    className="mt-1"
                    {...register("billingCycleTypeCode")}
                  />
                </div>
              </div>

              {/* Balance Catalog */}
              <div>
                <Label>
                  <span className="text-red-500">*</span>
                  Paid Flag
                </Label>
                <Controller
                  name="postpaid"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) =>
                        field.onChange(val === "" ? null : val)
                      }
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select Accumulation Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Y">Post Paid</SelectItem>
                        <SelectItem value="N">Pre Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Rechargeable */}
              <div>
                <Label>
                  <span className="text-red-500">*</span>Cycle
                </Label>
                <Controller
                  name="timeUnit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) =>
                        field.onChange(val === "" ? null : val)
                      }
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select Rechargeable" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="D">Day</SelectItem>
                        <SelectItem value="W">Week</SelectItem>
                        <SelectItem value="M">Month </SelectItem>
                        <SelectItem value="Y">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.billingCycleTypeName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.billingCycleTypeName.message}
                  </p>
                )}
              </div>

              {/* Standard Code */}
              <div>
                <Label>
                  <span className="text-red-500">*</span>Start Date
                </Label>
                <div className="relative">
                  <DateTimePickerField
                    control={control}
                    name="beginDate"
                    label="Start Date"
                    error={errors.beginDate}
                  />
                </div>
                {errors.beginDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.beginDate.message}
                  </p>
                )}
              </div>
              {/* End Date */}
              <div>
                <Label>
                  <span className="text-red-500">*</span>Debt Date
                </Label>
                <div className="relative">
                  <DateTimePickerField
                    control={control}
                    name="debtDate"
                    label="Debt Date"
                    error={errors.beginDate}
                  />
                </div>
                {errors.debtDate && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.debtDate.message}
                  </p>
                )}
              </div>
              {/* Run Date */}
              <div>
                <Label>Run Date</Label>
                <div className="relative">
                  <DateTimePickerField
                    control={control}
                    name="runDate"
                    label="runDate Date"
                    error={errors.beginDate}
                  />
                </div>
              </div>
              <div>
                <Label>
                  <span className="text-red-500">*</span>Quantity
                </Label>
                <NumericFormat
                  thousandSeparator=","
                  allowNegative={false}
                  customInput={Input}
                  className="mt-1"
                  value={watch("quantity") ?? ""}
                  onValueChange={(values) =>
                    setValue(
                      "quantity",
                      (values.value === ""
                        ? null
                        : Number(values.value)) as number,
                      { shouldValidate: true, shouldTouch: true },
                    )
                  }
                />
                {errors.quantity && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {/* Maximum Balance */}
              <div>
                <Label>Customer Type</Label>
                <Controller
                  name="custType"
                  control={control}
                  render={({ field }) => {
                    const postpaid = watch("postpaid");

                    return (
                      <Select
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select Customer Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {postpaid === "Y" ? (
                            <>
                              <SelectItem value="D">Day</SelectItem>
                              <SelectItem value="W">Week</SelectItem>
                            </>
                          ) : postpaid === "N" ? (
                            <SelectItem value="W">Week</SelectItem>
                          ) : (
                            <>
                              <SelectItem value="D">Day</SelectItem>
                              <SelectItem value="W">Week</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
              </div>

              <div>
                <Label>Product Type</Label>
                <Controller
                  name="prodType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) =>
                        field.onChange(val === "" ? null : val)
                      }
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select Product Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="F">Fix</SelectItem>
                        <SelectItem value="M">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.billingCycleTypeName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.billingCycleTypeName.message}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <DialogFooter className="pt-4 flex justify-end gap-5">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleShowDialog(false, showDialog.mode, null)}
            >
              Cancel
            </Button>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BalanceEditDialog;
