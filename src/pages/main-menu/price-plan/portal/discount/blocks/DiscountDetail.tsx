import { Controller, useFieldArray, UseFormReturn } from "react-hook-form";
// import { DiscountPayload } from "./DiscountList";
import { apiConfig } from "@/config/api.config";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createDefaultDiscountDetail, DiscountPayload } from "../types/form";
import { Plus, X } from "lucide-react";
import DiscountAPI from "../hooks/DiscountAPI";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDiscountPriceContext } from "../hooks";
import { NumericFormat } from "react-number-format";

interface DiscountDetailProps {
  forms: UseFormReturn<DiscountPayload>;
}

const API_URL = apiConfig.service_price_plan;

const DiscountDetail = ({ forms }: DiscountDetailProps) => {
  const { discountMethodList, setDiscountMethodList } =
    useDiscountPriceContext();
  const { GetDiscountMethodList } = DiscountAPI();
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const {
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = forms;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "discountDetail",
  });
  const discountDetail = watch(["discountDetail"]);

  const validateRanges = () => {
    const newErrors: { [key: string]: string } = {};
    const currentDiscountDetail = watch("discountDetail") || [];

    currentDiscountDetail.forEach((detail, index) => {
      const sval = parseFloat(detail.sval) || 0;
      const endVal = parseFloat(detail.eval) || 0;

      // Validate: sval should not be less than eval in the same index
      if (sval && endVal && sval >= endVal) {
        newErrors[`sval_${index}`] = `Start Value must be less than End Value`;
      }

      // Validate: sval should not be less than eval from previous index
      if (index > 0) {
        const prevDetail = currentDiscountDetail[index - 1];
        const prevEval = parseFloat(prevDetail.eval) || 0;

        if (sval && prevEval && sval < prevEval) {
          newErrors[`sval_${index}_prev`] =
            `Start Value must be greater than or equal to previous End Value (${prevEval})`;
        }
      }

      // Additional validation: eval should be greater than sval
      if (sval && endVal && endVal <= sval) {
        newErrors[`eval_${index}`] =
          `End Value must be greater than Start Value (${sval})`;
      }
    });

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      // Only validate when sval or eval fields change
      if (name && (name.includes(".sval") || name.includes(".eval"))) {
        validateRanges();
      }
    });

    validateRanges();

    return () => subscription.unsubscribe();
  }, [watch]);

  const addDiscountDetail = () => {
    if (fields.length === 0) {
      fetchDiscountMethod();
    }
    append(createDefaultDiscountDetail());
  };

  const removeDiscountDetail = (index: number) => {
    remove(index);
    const newErrors = { ...validationErrors };
    delete newErrors[`sval_${index}`];
    delete newErrors[`sval_${index}_prev`];
    delete newErrors[`eval_${index}`];
    setValidationErrors(newErrors);
  };

  const fetchDiscountMethod = async () => {
    try {
      const response = await GetDiscountMethodList();

      if (response.status) {
        setDiscountMethodList(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching discount method list.");
      console.error("Error fetching on DiscountDetail: ", error);
    }
  };

  useEffect(() => {
    fetchDiscountMethod();
  }, []);

  useEffect(() => {
    watch("discountDetail")?.forEach((_, idx) => {
      setValue(`discountDetail.${idx}.seqNo`, idx + 1);
    });
  }, [watch("discountDetail"), setValue]);

  const hasFieldError = (fieldKey: string) => {
    return validationErrors[fieldKey];
  };
  //  console.log(watch());
  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        {/* <h2 className="text-sm font-semibold">Discount Detail</h2> */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDiscountDetail}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Detail
        </Button>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-700 bg-gray-50">
              <th className="px-3 py-2 font-medium text-left">Seq No</th>
              <th className="px-3 py-2 font-medium text-left">Start Value</th>
              <th className="px-3 py-2 font-medium text-left">End Value</th>
              <th className="px-3 py-2 font-medium text-left">
                Discount Method
              </th>
              <th className="px-3 py-2 font-medium text-left">
                Discount Values
              </th>
              <th className="w-16 px-3 py-2 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
              const isRatingUsageValue =
                watch(`discountDetail.${index}.disctCalcMethod`) === "5";

              const isPercentage =
                watch(`discountDetail.${index}.disctCalcMethod`) === "1";

              const isFixedAmount =
                watch(`discountDetail.${index}.disctCalcMethod`) === "2";

              const isSummation =
                watch(`discountDetail.${index}.disctCalcMethod`) === "3";

              const isCeilAndFloor =
                watch(`discountDetail.${index}.disctCalcMethod`) === "4";

              return (
                <tr
                  key={field.id}
                  className="transition-shadow bg-white rounded-md shadow-sm"
                >
                  {/* Sequence Number */}
                  <td className="px-3 py-2 align-top">
                    <Input
                      type="number"
                      className="w-20 text-xs"
                      value={index + 1}
                      readOnly
                    />
                    {errors.discountDetail?.[index]?.seqNo && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.discountDetail[index]?.seqNo?.message}
                      </p>
                    )}
                  </td>

                  {/* Start Value */}
                  <td className="px-3 py-2 align-top">
                    <Input
                      placeholder="Start Value"
                      className={`text-xs w-28 ${
                        errors.discountDetail?.[index]?.sval ||
                        hasFieldError(`sval_${index}`) ||
                        hasFieldError(`sval_${index}_prev`)
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(`discountDetail.${index}.sval`)}
                    />
                    {/* Show validation errors */}
                    {hasFieldError(`sval_${index}`) && (
                      <p className="mt-1 text-xs text-red-500">
                        {validationErrors[`sval_${index}`]}
                      </p>
                    )}
                    {hasFieldError(`sval_${index}_prev`) && (
                      <p className="mt-1 text-xs text-red-500">
                        {validationErrors[`sval_${index}_prev`]}
                      </p>
                    )}
                  </td>

                  {/* End Value */}
                  <td className="px-3 py-2 align-top">
                    <Input
                      placeholder="End Value"
                      className={`text-xs w-28 ${
                        errors.discountDetail?.[index]?.eval ||
                        hasFieldError(`eval_${index}`)
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(`discountDetail.${index}.eval`)}
                    />
                    {/* Show validation errors */}
                    {hasFieldError(`eval_${index}`) && (
                      <p className="mt-1 text-xs text-red-500">
                        {validationErrors[`eval_${index}`]}
                      </p>
                    )}
                  </td>

                  {/* Discount Method */}
                  <td className="px-3 py-2 align-top">
                    <Controller
                      name={`discountDetail.${index}.disctCalcMethod`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-40 text-xs">
                            <SelectValue placeholder="Select Method" />
                          </SelectTrigger>
                          <SelectContent className="text-xs">
                            {discountMethodList.length > 0 ? (
                              discountMethodList.map((method) => (
                                <SelectItem
                                  key={method.disctCalcMethod}
                                  value={method.disctCalcMethod}
                                >
                                  {method.disctCalcMethodName}
                                </SelectItem>
                              ))
                            ) : (
                              <p className="px-2 py-1 text-gray-400">
                                No discount method found
                              </p>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.discountDetail?.[index]?.disctCalcMethod && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.discountDetail[index]?.disctCalcMethod?.message}
                      </p>
                    )}
                  </td>

                  {/* Discount Values */}
                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-col gap-1">
                      {isRatingUsageValue && (
                        <>
                          <Controller
                            name={`discountDetail.${index}.discountValue.refValue`}
                            control={control}
                            render={({ field }) => (
                              <NumericFormat
                                value={field.value ?? ""}
                                onValueChange={(values) =>
                                  field.onChange(
                                    values.floatValue != null
                                      ? String(values.floatValue)
                                      : "",
                                  )
                                }
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="$ "
                                decimalScale={5}
                                fixedDecimalScale={false}
                                allowNegative={false}
                                placeholder="Enter Price"
                                className="input text-xs w-36 transition-colors border-gray-20 focus:border-blue-500 focus:ring-blue-200"
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                          <Input
                            type="number"
                            placeholder="Base Value"
                            className="text-xs w-36"
                            {...register(
                              `discountDetail.${index}.discountValue.refFloorValue`,
                            )}
                          />
                          <Input
                            type="number"
                            placeholder="Unit Value"
                            className="text-xs w-36"
                            {...register(
                              `discountDetail.${index}.discountValue.refCellValue`,
                            )}
                          />
                        </>
                      )}
                      {isPercentage && (
                        <Input
                          type="number"
                          placeholder="Percent Value (%)"
                          className="text-xs w-36"
                          {...register(
                            `discountDetail.${index}.discountValue.refValue`,
                          )}
                        />
                      )}
                      {isFixedAmount && (
                        <Input
                          type="number"
                          placeholder="Fixed Value"
                          className="text-xs w-36"
                          {...register(
                            `discountDetail.${index}.discountValue.refValue`,
                          )}
                        />
                      )}
                      {isSummation && (
                        <Input
                          type="number"
                          placeholder="Summation Value"
                          className="text-xs w-36"
                          {...register(
                            `discountDetail.${index}.discountValue.refValue`,
                          )}
                        />
                      )}
                      {isCeilAndFloor && (
                        <>
                          <Input
                            type="number"
                            placeholder="Floor Value"
                            className="text-xs w-36"
                            {...register(
                              `discountDetail.${index}.discountValue.refFloorValue`,
                            )}
                          />
                          <Input
                            type="number"
                            placeholder="Ceiling Value"
                            className="text-xs w-36"
                            {...register(
                              `discountDetail.${index}.discountValue.refCellValue`,
                            )}
                          />
                        </>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 text-center align-top">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDiscountDetail(index)}
                      className="text-red-500 transition-colors hover:text-red-700"
                    >
                      <X size={16} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Display array-level errors */}
      {errors.discountDetail?.message && (
        <p className="mt-2 text-xs text-red-500">
          {errors.discountDetail.message}
        </p>
      )}
    </div>
  );
};

export default DiscountDetail;
