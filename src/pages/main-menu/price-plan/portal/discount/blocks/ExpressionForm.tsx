import { UseFormReturn } from "react-hook-form";
// import { DiscountPayload } from "./DiscountList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import AccountItemSearchSelect from "../../subscription-price/blocks/SelectSearchAccountItemType";
import ExpressionPrice from "./ExpressionPrice";
import { useDiscountPriceContext } from "../hooks";
import { DiscountPayload } from "../types/form";

interface ExpressionFormProps {
  forms: UseFormReturn<DiscountPayload>;
  isSubmitting: boolean;
  scriptToChange: string;
  formType: "create" | "update";
  setDiscountType: React.Dispatch<React.SetStateAction<"E" | "T">>;
}

const ExpressionForm = ({
  forms,
  isSubmitting,
  scriptToChange,
  formType,
  setDiscountType,
}: ExpressionFormProps) => {
  const { acctItemType } = useDiscountPriceContext();

  const {
    register,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = forms;

  return (
    <div className="w-3/4 p-6 space-y-6">
      {/* Header Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Discount Type */}
        <div>
          <label className="text-sm font-medium">
            <span className="text-red-500">*</span> Discount Type
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
          {errors.discountType && (
            <p className="text-xs text-red-500 mt-1">
              {errors.discountType.message}
            </p>
          )}
        </div>

        {/* Promotion */}
        <div>
          <label className="text-sm font-medium">
            <span className="text-red-500">*</span> Promotion
          </label>
          <div className="flex mt-1 space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="4"
                checked={watch("promotion") === "4"}
                {...register("promotion")}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="1"
                checked={watch("promotion") === "1"}
                {...register("promotion")}
                className="mr-2"
              />
              No
            </label>
          </div>
          {errors.promotion && (
            <p className="text-xs text-red-500 mt-1">
              {errors.promotion.message}
            </p>
          )}
        </div>

        {/* Discount Name */}
        <div>
          <label className="text-sm font-medium">
            <span className="text-red-500">*</span> Discount Name
          </label>
          <Input
            type="text"
            placeholder="Enter discount name"
            className={`mt-1 ${errors.discountName ? "border-red-500" : ""}`}
            {...register("discountName")}
          />
          {errors.discountName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.discountName.message}
            </p>
          )}
        </div>

        {/* Result Account Item Type */}
        <div>
          <label className="text-sm font-medium">
            <span className="text-red-500">*</span> Result Account Item
          </label>
          <Controller
            name="resultAccountItemType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(val) =>
                  field.onChange(val ? Number(val) : null)
                }
              >
                <SelectTrigger className={`w-full mt-1 ${errors.resultAccountItemType ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select result account item" />
                </SelectTrigger>
                <SelectContent>
                  {acctItemType.length > 0 ? (
                    acctItemType.map((item) => (
                      <SelectItem key={item.acctResId} value={String(item.acctResId)}>
                        {item.acctResName}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-center text-gray-500">
                      No account item types found
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.resultAccountItemType && (
            <p className="text-xs text-red-500 mt-1">
              {errors.resultAccountItemType.message}
            </p>
          )}
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label className="text-sm font-medium">Remarks</label>
        <Input
          type="text"
          placeholder="Enter remarks (optional)"
          className="mt-1"
          {...register("remarks")}
        />
        {errors.remarks && (
          <p className="text-xs text-red-500 mt-1">{errors.remarks.message}</p>
        )}
      </div>

      {/* Expression Price Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Expression Configuration</h3>
        <ExpressionPrice scriptToChange={scriptToChange} />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? formType === "create"
              ? "Creating..."
              : "Updating..."
            : formType === "create"
              ? "Create Discount"
              : "Update Discount"}
        </Button>
      </div>
    </div>
  );
};

export default ExpressionForm;
