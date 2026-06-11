import { apiConfig } from "@/config/api.config";
import { createDefaultDiscountPayload, createDefaultReferenceObject, DiscountPayload, discountPayloadSchema, ReferenceObject } from "../types/form";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
// import { DiscountPayload } from "./DiscountList";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DiscountAPI from "../hooks/DiscountAPI";
import ReferenceObjectForm from "./ReferenceObject";
import { Button } from "@/components/ui/button";
import { useDiscountPriceContext } from "../hooks";
import DiscountDetail from "./DiscountDetail";
import { FaMinus, FaPlus } from "react-icons/fa";
import DiscountConditionForm from "./condition/DiscountCondition";
import ConditionForm from "./ConditionForm";
import { useSyncGroupName } from "../hooks/form/useSyncGroupName";

interface TabularFormProps {
  forms: UseFormReturn<DiscountPayload>;
  isSubmitting: boolean;
  formType: "create" | "update";
  AdditionalForm: {
    isReference: boolean;
    isCalculation: boolean;
    isApplying: boolean;
    setIsReference: React.Dispatch<React.SetStateAction<boolean>>;
    setIsCalculation: React.Dispatch<React.SetStateAction<boolean>>;
    setIsApplying: React.Dispatch<React.SetStateAction<boolean>>;
  };
  setDiscountType: React.Dispatch<React.SetStateAction<"E" | "T">>;
}
const API_URL = apiConfig.service_price_plan;

const TabularForm = ({ forms, isSubmitting, formType, AdditionalForm, setDiscountType }: TabularFormProps) => {
  const { acctItemType, discountTypeList, distributeMethodList } = useDiscountPriceContext();

  const { isApplying, setIsApplying, isCalculation, setIsCalculation, isReference } = AdditionalForm;

  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = forms;

  useSyncGroupName(forms);

  const [isLoading, setIsLoading] = useState(false);
  const discountType = watch("discountType");
  const discountName = watch("discountName");

  const handleCalculationObjectToggle = () => {
    const newState = !isCalculation;
    setIsCalculation(newState);

    if (!newState) {
      // Jika user manual hide dan bukan dari data yang ada, set null
      setValue("calculationObject", null);
    } else if (newState && !watch("calculationObject")) {
      // Jika user manual show dan belum ada data, set default
      setValue("calculationObject", createDefaultReferenceObject());
    }
  };

  const handleApplyingObjectToggle = () => {
    const newState = !isApplying;
    setIsApplying(newState);

    if (!newState) {
      // Jika user manual hide dan bukan dari data yang ada, set null
      setValue("applyingObject", null);
    } else if (newState && !watch("applyingObject")) {
      // Jika user manual show dan belum ada data, set default
      setValue("applyingObject", createDefaultReferenceObject());
    }
  };

  useEffect(() => {
    if (discountType === "T" && formType === "create") {
      setValue("referenceObject", createDefaultReferenceObject());
    }
  }, [discountType, formType, setValue]);

  return (
    <div className="w-3/4 p-6">
      <div className="mb-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">
                  <span className="text-red-500">*</span>Discount Type
                </label>
                <div className="flex mt-1 space-x-4">
                  <label>
                    <input
                      readOnly={formType === "update"}
                      type="radio"
                      value="E"
                      checked={watch("discountType") === "E"}
                      {...register("discountType", {
                        onChange: (e) => {
                          setDiscountType(e.target.value as "E" | "T");
                        },
                      })}
                      className={formType === "update" ? "cursor-not-allowed" : ""}
                    />{" "}
                    Expression
                  </label>
                  <label>
                    <input
                      readOnly={formType === "update"}
                      type="radio"
                      value="T"
                      checked={watch("discountType") === "T"}
                      {...register("discountType", {
                        onChange: (e) => {
                          setDiscountType(e.target.value as "E" | "T");
                        },
                      })}
                      className={formType === "update" ? "cursor-not-allowed" : ""}
                    />{" "}
                    Tabular
                  </label>
                </div>
                {errors.discountType && <p className="text-xs text-red-500">{errors.discountType.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">
                  <span className="text-red-500">*</span>Promotion
                </label>
                <div className="flex mt-1 space-x-4">
                  <label>
                    <input type="radio" value="4" {...register("promotion")} /> Yes
                  </label>
                  <label>
                    <input type="radio" value="1" {...register("promotion")} /> No
                  </label>
                </div>
                {errors.promotion && <p className="text-xs text-red-500">{errors.promotion.message}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              <span className="text-red-500">*</span>Discount Name
            </label>
            <Input type="text" placeholder="Discount Name" className={`w-full px-2 py-1 mt-1 text-sm border rounded ${errors.discountName ? "border-red-500" : ""}`} {...register("discountName")} />
            {errors.discountName && <p className="text-xs text-red-500">{errors.discountName.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              <span className="text-red-500">*</span>Discount Type
            </label>
            <Controller
              control={control}
              name="tabDiscountType"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => {
                    field.onChange(val === "" ? null : val);

                    if (val === "R") {
                      setValue("distributeMethod", "A");
                    } else if (val === "S") {
                      setValue("distributeMethod", "");
                    }
                  }}
                >
                  <SelectTrigger className={`w-full ${errors.tabDiscountType ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select Discount Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {discountTypeList?.length > 0 ? (
                      discountTypeList?.map((item) => (
                        <SelectItem key={item.tabDpType} value={item.tabDpType}>
                          {item.tabDpTypeName}
                        </SelectItem>
                      ))
                    ) : (
                      <p className="p-2 text-sm text-center text-gray-500">Discount Type Not Found</p>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tabDiscountType && <p className="text-xs text-red-500">{errors.tabDiscountType.message}</p>}
          </div>

          <div>
            <label>
              <span className="text-red-500">*</span>Distribute Method
            </label>
            <Controller
              control={control}
              name="distributeMethod"
              render={({ field }) => (
                <Select value={field.value ? field.value : ""} onValueChange={(val) => field.onChange(val)} disabled={watch("tabDiscountType") === "R"}>
                  <SelectTrigger className={`w-full ${errors.distributeMethod ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select Distribute Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {distributeMethodList?.length > 0 ? (
                      distributeMethodList?.map((item) => (
                        <SelectItem key={item.distributeMethod} value={item.distributeMethod}>
                          {item.distributeMethodName}
                        </SelectItem>
                      ))
                    ) : (
                      <p className="p-2 text-sm text-center text-gray-500">Distribute Method Not Found</p>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.distributeMethod && <p className="text-xs text-red-500">{errors.distributeMethod.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium"><span className="text-red-500">*</span> Result Account Item</label>
            <Controller
              name="resultAccountItemType"
              control={control}
              render={({ field }) => (
                <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(Number(val))}>
                  <SelectTrigger className={`w-full ${errors.resultAccountItemType ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select Result Account Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {acctItemType.length > 0 ? (
                      acctItemType.map((item) => (
                        <SelectItem key={item.acctResId} value={String(item.acctResId)}>
                          {item.acctResName}
                        </SelectItem>
                      ))
                    ) : (
                      <p className="p-2 text-sm text-center text-gray-500">Result Account Item Not Found</p>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
             {errors.resultAccountItemType && <p className="text-xs text-red-500">{errors.resultAccountItemType.message}</p>}
          </div>
        </div>
      </div>

      <hr className="my-5 border-separate border-gray-300" />
      <h1>Reference Object</h1>
      <ReferenceObjectForm forms={forms} baseName="referenceObject" />

      <hr className="my-5 border-separate border-gray-300" />
      <div className="flex items-center justify-between">
        <h1>Calculation Object</h1>
        <Button type="button" variant={"outline"} size={"icon"} onClick={handleCalculationObjectToggle}>
          {isCalculation ? <FaMinus className="text-red-500" /> : <FaPlus className="text-red-500" />}
        </Button>
      </div>
      {isCalculation && <ReferenceObjectForm forms={forms} baseName="calculationObject" />}

      <hr className="my-5 border-separate border-gray-300" />
      <div className="flex items-center justify-between">
        <h1>Applying Object</h1>
        <Button type="button" variant={"outline"} size={"icon"} onClick={handleApplyingObjectToggle}>
          {isApplying ? <FaMinus className="text-red-500" /> : <FaPlus className="text-red-500" />}
        </Button>
      </div>
      {isApplying && <ReferenceObjectForm forms={forms} baseName="applyingObject" />}

      <hr className="my-5 border-separate border-gray-300" />
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-800">Discount Detail</h1>
        </div>

        {/* Negative Result */}
        <div className="mb-4">
          <label className="text-sm font-medium">Negative Result</label>
          <div className="flex mt-1 space-x-4">
            <label>
              <input type="radio" value="Y" checked={watch("negativeResult") === "Y"} {...register("negativeResult")} /> Yes
            </label>
            <label>
              <input type="radio" value="N" checked={watch("negativeResult") === "N"} {...register("negativeResult")} /> No
            </label>
          </div>
        </div>

        {/* Remarks */}
        <div className="mb-4">
          <label className="text-sm font-medium">Remarks</label>
          <Input type="text" placeholder="Enter remarks" className="w-full px-2 py-1 mt-1 text-sm border rounded" {...register("remarks")} />
          {errors.remarks && <p className="text-xs text-red-500">{errors.remarks.message}</p>}
        </div>

        <DiscountDetail forms={forms} />
      </div>

      <hr className="my-5 border-separate border-gray-300" />
      <h1 className="mb-3">Discount Condition</h1>
      <ConditionForm forms={forms} />

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant={"outline"} className="px-4 py-2 text-sm" onClick={() => forms.reset()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed">
          {isSubmitting ? (formType === "create" ? "Creating" : "Updating") : formType === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </div>
  );
};

export default TabularForm;
