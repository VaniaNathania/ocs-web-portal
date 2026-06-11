import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useAccountBalanceContext from "../hooks/useAccountBalanceContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router";
import { useCallApi } from "@/hooks";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { AccountBalanceTypePayload, accountBalanceTypeSchema, createDefaultAccountBalancePayload } from "../types/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import AccountItemSearchSelect from "@/pages/main-menu/price-plan/portal/subscription-price/blocks/SelectSearchAccountItemType";
import { Checkbox } from "@/components/ui/checkbox";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import { useDataGrid } from "@/components";
import { NumericFormat } from "react-number-format";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface FormsProps {
  forms: UseFormReturn<AccountBalanceTypePayload>;
  isSubmitting: boolean;
  formType: "create" | "update";
}
const API_URL = apiConfig.service_price_plan;

const BalanceEditDialog = ({ formType, forms, isSubmitting }: FormsProps) => {
  const {
    showDialog,
    handleShowDialog,
    selectedBalanceType,
    balTypeList,
    getBalTypeList,
    setBalTypeList,
    parentList,
    getParentAcctResId,
    unitType,
    getUnitType,
    acmUnit,
    getAcmUnitList,
    selectedId,
    doGetListBalanceType,
    setSelectedId,
    handlerefresh,
  } = useAccountBalanceContext();
  const { menuPrivAccess } = useAccountConfigLayout();
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
  console.log("errors", errors);
  // const {reload} = useDataGrid();
  const adjustTypeValue = watch("adjustType") ?? 0;

  // Tambahkan state untuk tracking
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  const [isLoadingData, setIsLoadingData] = useState(false);

  const toggleAdjustType = (val: number) => {
    const newValue =
      (adjustTypeValue & val) === val
        ? adjustTypeValue - val // uncheck
        : adjustTypeValue + val; // check
    setValue("adjustType", newValue);
  };

  //for isCurrrency Condition
  const balTypeDisabled = watch("balType");

  const onSubmit = async (data: AccountBalanceTypePayload) => {
    // Validasi khusus untuk mode UPDATE

    // Lanjutkan proses create atau update
    if (showDialog.mode === "create") {
      doCreateBalanceType(data);
    } else if (showDialog.mode === "update") {
      doUpdateBalanceType(data);
    }
  };
  const doCreateBalanceType = async (data: AccountBalanceTypePayload) => {
    try {
      const response = await PostData(`${API_URL}/account-balance/add-acct-res`, data);
      // PERBAIKAN: cek response?.status === true (dari PostData)
      if (response?.status === true) {
        toast.success(response?.message || "Balance Type created successfully");
        handleShowDialog(false, "create", null, null);
        reset(createDefaultAccountBalancePayload());
        handlerefresh();
      } else {
        toast.error(response?.message || "Failed to create Balance Type");
      }
    } catch (error) {
      console.error("Error creating Balance Type", error);
      toast.error("Error creating data. Please check your connection!");
    }
  };

  const doUpdateBalanceType = async (data: AccountBalanceTypePayload) => {
    try {
      const response = await PutData(`${API_URL}/account-balance/mod-acct-res/${selectedBalanceType?.acctResId}`, data);

      // PERBAIKAN: cek response?.status === true (dari PutData)
      if (response?.status === true) {
        toast.success(response?.message || "Balance Type updated successfully");
        handleShowDialog(false, "update", null, null);
        reset(createDefaultAccountBalancePayload());
        handlerefresh();
      } else {
        toast.error(response?.message || "Failed to update Balance Type");
      }
    } catch (error) {
      console.error("Error updating Balance Type", error);
      toast.error("Error updating data. Please check your connection!");
    }
  };

  useEffect(() => {
    if (showDialog.show) {
      const loadAllData = async () => {
        setIsLoadingData(true);
        try {
          await Promise.all([getBalTypeList(), getParentAcctResId(), getUnitType(), getAcmUnitList()]);
        } catch (error) {
          console.error("Error loading dropdown data:", error);
          toast.error("Failed to load data");
        } finally {
          setIsLoadingData(false);
        }
      };

      loadAllData();
    }
  }, [showDialog.show]);

  useEffect(() => {
    if (!showDialog.show) {
      reset(createDefaultAccountBalancePayload());
    }
  }, [showDialog.show, reset]);

  useEffect(() => {
    if (balTypeDisabled === 4 || balTypeDisabled === 5) {
      setValue("isCurrency", "N"); // paksa ke N
    }
  }, [, setValue, balTypeDisabled]);

  useEffect(() => {
    if (watch("acctResFree.rum") === null && watch("acctResFree.value") === null) {
      setValue("acctResFree", null);
    }
  }, [watch("acctResFree.rum"), watch("acctResFree.value")]);

  return (
    <Dialog open={showDialog.show} onOpenChange={(open) => handleShowDialog(open, showDialog.mode, null, null)}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-7">
        <DialogHeader className="space-y-1.5">
          <DialogTitle>{showDialog.mode === "create" ? "Create" : "Edit"} Balance Configuration</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {isLoadingData ? (
          // Tampilkan loading spinner kalau masih loading
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          </div>
        ) : (
          <form className="space-y-10 mt-4" onSubmit={handleSubmit(onSubmit)}>
            {/* BASIC INFORMATION */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Balance Type Name */}
                <div>
                  <Label>
                    <span className="text-red-500">*</span>Balance Type Name
                  </Label>
                  <div className="relative">
                    <Input type="text" className="mt-1" {...register("acctResName")} />
                    {isCheckingName && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">Checking...</span>}
                  </div>
                  {errors.acctResName && <p className="text-xs text-red-500 mt-1">{errors.acctResName.message}</p>}
                </div>

                {/* Balance Catalog */}
                <div>
                  <Label>
                    <span className="text-red-500">*</span>Balance Catalog
                  </Label>
                  <Controller
                    name="balType"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select value={field.value === 0 ? "" : String(field.value)} onValueChange={(val) => field.onChange(val ? Number(val) : 0)}>
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Balance Catalog" />
                          </SelectTrigger>
                          <SelectContent>
                            {balTypeList?.length > 0 ? (
                              balTypeList.map((item) => (
                                <SelectItem key={item.balType} value={String(item.balType)}>
                                  {item.balTypeName}
                                </SelectItem>
                              ))
                            ) : (
                              <p className="p-2 text-sm text-center text-gray-500">Balance Catalog Not Found</p>
                            )}
                          </SelectContent>
                        </Select>
                        {field.value !== 0 && (
                          <button type="button" onClick={() => setValue("balType", 0, { shouldValidate: true, shouldDirty: true })} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                  {errors.balType && <p className="text-xs text-red-500 mt-1">{errors.balType.message}</p>}
                </div>

                {/* Rechargeable */}
                <div>
                  <Label>Rechargeable</Label>
                  <Controller
                    name="refillable"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select value={field.value === null ? "" : String(field.value)} onValueChange={(val) => field.onChange(val ? val : null)}>
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Rechargeable" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Keep Unique Anytime</SelectItem>
                            <SelectItem value="M">Keep Unique In One Effective Period Or Expiry Period</SelectItem>
                            <SelectItem value="Y">Keep Unique</SelectItem>
                            <SelectItem value="N">Non-Unique</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value && (
                          <button type="button" onClick={() => field.onChange(null)} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Standard Code */}
                <div>
                  <Label>Standard Code</Label>
                  <div className="relative">
                    <Input type="text" className="mt-1" {...register("stdCode")} />
                    {isCheckingCode && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">Checking...</span>}
                  </div>
                </div>

                {/* Default Account Item Type */}
                <div>
                  <Label>{watch("balType") === 3 ? <span className="text-red-500">*</span> : ""} Default Account Item Type</Label>
                  <AccountItemSearchSelect
                    value={watch("defaultAcctItemTypeId")}
                    onChange={(value) => setValue("defaultAcctItemTypeId", value!)}
                    placeholder="Search Default Account Item Type..."
                    error={!!errors.defaultAcctItemTypeId}
                    className="w-full"
                  />
                </div>

                {/* Parent Balance Type */}
                <div>
                  <Label>Parent Balance Type</Label>
                  <Controller
                    name="parentAcctResId"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select
                          value={field.value === null ? "" : String(field.value)} // ← UBAH
                          onValueChange={(val) => {
                            // ← UBAH
                            if (val === "") {
                              field.onChange(null);
                            } else {
                              field.onChange(parseInt(val, 10));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Parent Balance Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {parentList?.length > 0 ? (
                              parentList.map((item) => (
                                <SelectItem key={item.acctResId} value={String(item.acctResId)}>
                                  {item.acctResName}
                                </SelectItem>
                              ))
                            ) : (
                              <p className="p-2 text-sm text-center text-gray-500">Parent Balance Not Found</p>
                            )}
                          </SelectContent>
                        </Select>
                        {field.value !== null && ( // ← UBAH
                          <button type="button" onClick={() => field.onChange(null)} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Is Currency */}
                <div>
                  <Label>Is Currency?</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("isCurrency")} className="mr-1" disabled={balTypeDisabled === 4 || balTypeDisabled === 5} />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("isCurrency")} disabled={balTypeDisabled === 4 || balTypeDisabled === 5} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>

                {/* Is Free Unit */}
                <div>
                  <Label>Is Free Unit?</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("isFreeUnit")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("isFreeUnit")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>

                {/* Payment Force */}
                <div>
                  <Label>Payment Force</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("paymentForce")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("paymentForce")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>

                {/* Maximum Balance */}
                <div>
                  <Label>Maximum Balance</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("maxValue") ?? ""}
                    onValueChange={(values) => setValue("maxValue", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Deduction Value */}
                <div>
                  <Label>Deduction Value</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("acctResFree.value") ?? ""}
                    onValueChange={(values) => setValue("acctResFree.value", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                  {errors.acctResFree?.value && <p className="text-xs text-red-500 mt-1">{errors.acctResFree.value.message}</p>}
                </div>

                {/* (Calculation Unit) Per */}
                <div>
                  <Label>(Calculation Unit) Per</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("acctResFree.rum") ?? ""}
                    onValueChange={(values) => setValue("acctResFree.rum", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                  {errors.acctResFree && !errors.acctResFree.value && !errors.acctResFree.rum && <p className="text-xs text-red-500 mt-1">{errors.acctResFree.message}</p>}
                </div>

                {/* Priority */}
                <div>
                  <Label>Priority</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("priority") ?? ""}
                    onValueChange={(values) => setValue("priority", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Unit Type */}
                <div>
                  <Label>Unit Type</Label>
                  <Controller
                    name="unitTypeId"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select
                          value={field.value === null ? "" : String(field.value)} // ← UBAH
                          onValueChange={(val) => {
                            // ← UBAH
                            if (val === "") {
                              field.onChange(null);
                            } else {
                              field.onChange(parseInt(val, 10));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Unit Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {unitType?.length > 0 ? (
                              unitType.map((item) => (
                                <SelectItem key={item.unitTypeId} value={String(item.unitTypeId)}>
                                  {item.unitTypeName}
                                </SelectItem>
                              ))
                            ) : (
                              <p className="p-2 text-sm text-center text-gray-500">Unit Type Not Found</p>
                            )}
                          </SelectContent>
                        </Select>
                        {field.value !== null && ( // ← UBAH
                          <button type="button" onClick={() => field.onChange(null)} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Transfer Rate */}
                <div>
                  <Label>Transfer Rate</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("unitPrecision") ?? ""}
                    onValueChange={(values) => setValue("unitPrecision", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Ratio Money */}
                <div>
                  <Label>Ratio Money</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("ratioMoney") ?? ""}
                    onValueChange={(values) => setValue("ratioMoney", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Ratio Precision */}
                <div>
                  <Label>Ratio Precision</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("ratioPrecision") ?? ""}
                    onValueChange={(values) => setValue("ratioPrecision", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Max Top Up Amount */}
                <div>
                  <Label>Max Top Up Amount</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("maxChgValue") ?? ""}
                    onValueChange={(values) => setValue("maxChgValue", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Max Expiry Date */}
                <div>
                  <Label>Max Expiry Date (Day)</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("maxExpDate") ?? ""}
                    onValueChange={(values) => setValue("maxExpDate", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Max Adjust Balance */}
                <div>
                  <Label>Max Adjust Balance</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("maxAdjustValue") ?? ""}
                    onValueChange={(values) => setValue("maxAdjustValue", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Reset to Zero */}
                <div>
                  <Label>Reset to Zero</Label>
                  <Controller
                    name="resetZero"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select
                          value={field.value === null ? "" : String(field.value)} // ← UBAH
                          onValueChange={(val) => {
                            // ← UBAH
                            if (val === "") {
                              field.onChange(null);
                            } else {
                              field.onChange(val);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Reset Zero" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y">Clear Bal After Expired</SelectItem>
                            <SelectItem value="N">Can Not Clear Bal After Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value !== null && ( // ← UBAH
                          <button type="button" onClick={() => field.onChange(null)} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Store Unit */}
                <div>
                  <Label>Store Unit</Label>
                  <Controller
                    name="storeUnit"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select
                          value={field.value === null ? "" : String(field.value)} // ← UBAH
                          onValueChange={(val) => {
                            // ← UBAH
                            if (val === "") {
                              field.onChange(null);
                            } else {
                              field.onChange(parseInt(val, 10));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Store Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Currency</SelectItem>
                            <SelectItem value="2">Seconds</SelectItem>
                            <SelectItem value="3">SMS</SelectItem>
                            <SelectItem value="4">Byte</SelectItem>
                            <SelectItem value="5">KB</SelectItem>
                            <SelectItem value="6">MMS</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value !== null && ( // ← UBAH
                          <button type="button" onClick={() => field.onChange(null)} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Accumulation Threshold */}
                <div>
                  <Label>Accumulation Threshold</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("acmThreshold") ?? ""}
                    onValueChange={(values) => setValue("acmThreshold", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Accumulate Type */}
                <div>
                  <Label>Accumulate Type</Label>
                  <Controller
                    name="acmType"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select
                          value={field.value === null ? "" : String(field.value)} // ← UBAH
                          onValueChange={(val) => {
                            // ← UBAH
                            if (val === "") {
                              field.onChange(null);
                            } else {
                              field.onChange(val);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Accumulation Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="D">Day</SelectItem>
                            <SelectItem value="BC">Billing Cycle</SelectItem>
                            <SelectItem value="VC">Variable Cycle</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value !== null && ( // ← UBAH
                          <button type="button" onClick={() => field.onChange(null)} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Accumulate Unit */}
                <div>
                  <Label>Accumulate Unit</Label>
                  <Controller
                    name="acmUnit"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select
                          value={field.value === null ? "" : String(field.value)} // ← UBAH
                          onValueChange={(val) => {
                            // ← UBAH
                            if (val === "") {
                              field.onChange(null);
                            } else {
                              field.onChange(val);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Accumulate Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {acmUnit?.length > 0 ? (
                              acmUnit.map((item) => (
                                <SelectItem key={item.timeUnit} value={String(item.timeUnit)}>
                                  {item.timeUnitName}
                                </SelectItem>
                              ))
                            ) : (
                              <p className="p-2 text-sm text-center text-gray-500">Accumulate Unit Not Found</p>
                            )}
                          </SelectContent>
                        </Select>
                        {field.value !== null && ( // ← UBAH
                          <button type="button" onClick={() => field.onChange(null)} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Accumulation Amount */}
                <div>
                  <Label>Accumulation Amount</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("acmAmount") ?? ""}
                    onValueChange={(values) => setValue("acmAmount", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Ceil Limit */}
                <div>
                  <Label>Ceil Limit</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("ceilLimit") ?? ""}
                    onValueChange={(values) => setValue("ceilLimit", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Floor Limit */}
                <div>
                  <Label>Floor Limit</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("floorLimit") ?? ""}
                    onValueChange={(values) => setValue("floorLimit", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Daily Ceil Limit */}
                <div>
                  <Label>Daily Ceil Limit</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("dailyCeilLimit") ?? ""}
                    onValueChange={(values) => setValue("dailyCeilLimit", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Daily Floor Limit */}
                <div>
                  <Label>Daily Floor Limit</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("dailyFloorLimit") ?? ""}
                    onValueChange={(values) => setValue("dailyFloorLimit", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Grace Period */}
                <div>
                  <Label>Grace Period</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("gracePeriod") ?? ""}
                    onValueChange={(values) => setValue("gracePeriod", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Max Rollover */}
                <div>
                  <Label>Max Rollover</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("maxRollover") ?? ""}
                    onValueChange={(values) => setValue("maxRollover", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Usage Type */}
                <div>
                  <Label>Usage Type</Label>
                  <Controller
                    name="usageType"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select
                          value={field.value === null ? "" : String(field.value)} // ← UBAH
                          onValueChange={(val) => {
                            // ← UBAH
                            if (val === "") {
                              field.onChange(null);
                            } else {
                              field.onChange(parseInt(val, 10));
                            }
                          }}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Usage Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Whatsapp</SelectItem>
                            <SelectItem value="2">Social Network</SelectItem>
                            <SelectItem value="3">Netflix</SelectItem>
                            <SelectItem value="4">Roaming</SelectItem>
                            <SelectItem value="5">General OTTs</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value !== null && ( // ← UBAH
                          <button type="button" onClick={() => field.onChange(null)} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                </div>

                {/* Daily Transfer Threshold */}
                <div>
                  <Label>Daily Transfer Threshold</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("transAcctResCfg.dayThreshold") ?? ""}
                    onValueChange={(values) => setValue("transAcctResCfg.dayThreshold", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Week Transfer Threshold */}
                <div>
                  <Label>Week Transfer Threshold</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("transAcctResCfg.weekThreshold") ?? ""}
                    onValueChange={(values) => setValue("transAcctResCfg.weekThreshold", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Month Transfer Threshold */}
                <div>
                  <Label>Month Transfer Threshold</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("transAcctResCfg.monthThreshold") ?? ""}
                    onValueChange={(values) => setValue("transAcctResCfg.monthThreshold", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Daily Transfer Count */}
                <div>
                  <Label>Daily Transfer Count</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("transAcctResCfg.dayCount") ?? ""}
                    onValueChange={(values) => setValue("transAcctResCfg.dayCount", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Week Transfer Count */}
                <div>
                  <Label>Week Transfer Count</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("transAcctResCfg.weekCount") ?? ""}
                    onValueChange={(values) => setValue("transAcctResCfg.weekCount", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Month Transfer Count */}
                <div>
                  <Label>Month Transfer Count</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("transAcctResCfg.monthCount") ?? ""}
                    onValueChange={(values) => setValue("transAcctResCfg.monthCount", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Min Transfer Residual Balance */}
                <div>
                  <Label>Min Transfer Residual Bal</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("transAcctResCfg.minResidualBal") ?? ""}
                    onValueChange={(values) => setValue("transAcctResCfg.minResidualBal", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Max Transfer Allowed */}
                <div>
                  <Label>Max Transfer Allowed</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("transAcctResCfg.maxAllowed") ?? ""}
                    onValueChange={(values) => setValue("transAcctResCfg.maxAllowed", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Min Transfer Allowed */}
                <div>
                  <Label>Min Transfer Allowed</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("transAcctResCfg.minAllowed") ?? ""}
                    onValueChange={(values) => setValue("transAcctResCfg.minAllowed", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>

                {/* Reward Flag */}
                <div>
                  <Label>Reward Flag</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("rewardFlag")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("rewardFlag")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>

                {/* Unlimited Flag */}
                <div>
                  <Label>Unlimited Flag</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("unlimitedFlag")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("unlimitedFlag")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>

                {/* Balance Aggregation */}
                <div>
                  <Label>Balance Aggregation</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("balanceAggregation")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("balanceAggregation")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>
                {/* Is Customer */}
                <div>
                  <Label>Is Customer?</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("customerFlag")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("customerFlag")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>

                {/* Rollover Flag */}
                <div>
                  <Label>Rollover Flag</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("rolloverFlag")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("rolloverFlag")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>

                {/* Is Overdraft */}
                <div>
                  <Label>Is Overdraft</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("overdraftFlag")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("overdraftFlag")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>
                {/* Adjust Flag */}
                <div>
                  <Label>Adjust Flag</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("adjustFlag")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("adjustFlag")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>
                {/* Free Flag */}
                <div>
                  <Label>Free Flag</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("freeFlag")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("freeFlag")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>
                {/* Clear Flag */}
                <div>
                  <Label>Clear Flag</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input type="radio" value="Y" {...register("clearFlag")} className="mr-1" />
                      Yes
                    </label>
                    <label>
                      <input type="radio" value="N" {...register("clearFlag")} className="mr-1" />
                      No
                    </label>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label>Category</Label>
                  <Input type="text" className="mt-1" {...register("category")} />
                </div>
                {/* Bal Category */}
                <div>
                  <Label>
                    <span className="text-red-500">*</span>Bal Category
                  </Label>
                  <Controller
                    name="balCategory"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Select
                          value={field.value === null ? "" : String(field.value)} // ← UBAH
                          onValueChange={(val) => field.onChange(val ? val : "")}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select Bal Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Monetary</SelectItem>
                            <SelectItem value="S">SMS</SelectItem>
                            <SelectItem value="D">Data</SelectItem>
                            <SelectItem value="V">Voice</SelectItem>
                            <SelectItem value="B">Bonus</SelectItem>
                            <SelectItem value="P">Point</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value && (
                          <button type="button" onClick={() => setValue("balCategory", "", { shouldValidate: true, shouldDirty: true })} className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded">
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    )}
                  />
                  {errors.balCategory && <p className="text-xs text-red-500 mt-1">{errors.balCategory.message}</p>}
                </div>
                {/* Reserve Percentage */}
                <div>
                  <Label>Reserve Percentage</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("reservePercentage") ?? ""}
                    onValueChange={(values) => setValue("reservePercentage", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>
                {/* Adjust Type */}
                <div>
                  <Label>Adjust Type</Label>
                  <div className="flex flex-col gap-1.5 mt-1 border rounded-md p-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" checked={(adjustTypeValue & 1) === 1} onChange={() => toggleAdjustType(1)} />
                      Pre-Paid
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" checked={(adjustTypeValue & 2) === 2} onChange={() => toggleAdjustType(2)} />
                      Hybrid
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" checked={(adjustTypeValue & 4) === 4} onChange={() => toggleAdjustType(4)} />
                      Post-Paid
                    </label>
                  </div>
                </div>
                {/* Remarks */}
                <div>
                  <Label>Remarks</Label>
                  <Textarea className="mt-1" {...register("comments")} />
                </div>

                {/* Clear Days */}
                <div>
                  <Label>Clear Days</Label>
                  <NumericFormat
                    thousandSeparator=","
                    allowNegative={false}
                    customInput={Input}
                    className="mt-1"
                    value={watch("clearDays") ?? ""}
                    onValueChange={(values) => setValue("clearDays", values.value === "" ? null : Number(values.value), { shouldValidate: true, shouldTouch: true })}
                  />
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <DialogFooter className="pt-4 flex justify-end gap-5">
              <Button variant="outline" type="button" onClick={() => handleShowDialog(false, showDialog.mode, null, null)}>
                Cancel
              </Button>
              <AccessWrapper
                hasAccess={
                  showDialog.mode === "create" ? menuPrivAccess.addStatus : menuPrivAccess.editStatus
                  // false
                }
              >
                <Button type="submit">Confirm</Button>
              </AccessWrapper>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BalanceEditDialog;
