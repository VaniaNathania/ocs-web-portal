import { useFieldArray, UseFormReturn, useWatch } from "react-hook-form";
import {
  createDefaultInstallmentItems,
  createInstallmentItems,
  createInstallmentPayload,
} from "../types/forms";
import { apiConfig } from "@/config/api.config";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface PhasesTableProps {
  forms: UseFormReturn<createInstallmentPayload>;
  setIsTotalOver: React.Dispatch<React.SetStateAction<boolean>>;
}

const PhasesTable = ({ forms, setIsTotalOver }: PhasesTableProps) => {
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
    name: "instalmentItems",
  });

  const [total, setTotal] = useState(0);

  const addPhases = () => {
    append(createDefaultInstallmentItems());
  };

  const removePhases = (index: number) => {
    remove(index);
    const newErrors = { ...validationErrors };
    delete newErrors[`itemPercent_${index}`];
    delete newErrors[`feePercent_${index}`];
    delete newErrors[`repeatTime_${index}`];
    setValidationErrors(newErrors);
  };

  const hasFieldError = (fieldKey: string) => {
    return validationErrors[fieldKey];
  };

  useEffect(() => {
    watch("instalmentItems")?.forEach((_, idx) => {
      setValue(`instalmentItems.${idx}.seq`, idx + 1);
    });
  }, [watch("instalmentItems"), setValue]);

  useEffect(() => {
    const firstPay = Number(watch("firstPay") ?? 0);
    const items = watch("instalmentItems") ?? [];

    if (items.length > 0) {
      const remaining = 100 - firstPay;
      const perPhase = Math.floor(remaining / items.length);
      let totalAssigned = perPhase * items.length;
      let remainder = remaining - totalAssigned;

      items.forEach((item, index) => {
        const adjustedValue = index < remainder ? perPhase + 1 : perPhase;

        if (item.itemPercent !== adjustedValue) {
          setValue(`instalmentItems.${index}.itemPercent`, adjustedValue, {
            shouldDirty: true,
            shouldValidate: false,
          });
        }
      });
    }
  }, [watch("firstPay"), watch("instalmentItems").length]);

  const instalmentItems = useWatch({ control, name: "instalmentItems" });
  const firstPay = useWatch({ control, name: "firstPay" });
  const isTotalOver = total > 100;

  useEffect(() => {
    const items = instalmentItems ?? [];
    const totalPercent = items.reduce(
      (sum, item) => sum + Number(item.itemPercent ?? 0),
      0
    );

    const newTotal = totalPercent + Number(firstPay ?? 0);
    setTotal(newTotal);

    if (setIsTotalOver) {
      setIsTotalOver(newTotal > 100);
    }
  }, [instalmentItems, firstPay, setTotal, setIsTotalOver]);

  // useEffect(() => {
  //   if (firstPay == null || firstPay === undefined) return;

  //   if (!instalmentItems || instalmentItems.length === 0) {
  //     const remaining = 100 - Number(firstPay ?? 0);
  //     const defaultItem: createInstallmentItems = {
  //       seq: 1,
  //       itemPercent: remaining,
  //       repeatTime: 1,
  //       feePercent: 0,
  //       status: "A",
  //     };

  //     setValue("instalmentItems", [defaultItem], {
  //       shouldDirty: true,
  //       shouldValidate: true,
  //     });
  //   }
  // }, [firstPay, instalmentItems, setValue]);

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        {/* <h2 className="text-sm font-semibold">Discount Detail</h2> */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPhases}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Phases
        </Button>
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-gray-50 border">
          <h1 className="text-sm font-medium text-gray-700">
            Total Percentage:
          </h1>
          <span
            className={`font-semibold text-sm px-2 py-1 rounded ${
              isTotalOver
                ? "text-red-600 bg-red-100"
                : total === 100
                  ? "text-green-700 bg-green-100"
                  : "text-yellow-700 bg-yellow-100"
            }`}
          >
            {total}%
          </span>
          {isTotalOver && (
            <span className="text-xs text-red-600 font-medium ml-2">
              Total cannot exceed 100%
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-700 bg-gray-50">
              <th className="px-3 py-2 font-medium text-left">Sequence No</th>
              <th className="px-3 py-2 font-medium text-left">
                Proportion Value <span className="text-red-600">*</span>
              </th>
              <th className="px-3 py-2 font-medium text-left">
                Percent of Value
              </th>
              <th className="px-3 py-2 font-medium text-left">
                Sub-phase <span className="text-red-600">*</span>
              </th>
              <th className="w-16 px-3 py-2 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => {
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
                  </td>

                  {/* Proportion Value */}
                  <td className="px-3 py-2 align-top">
                    <Input
                      placeholder="Proportion Value"
                      className={`text-xs w-28 ${
                        errors.instalmentItems?.[index]?.itemPercent ||
                        hasFieldError(`itemPercent_${index}`)
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(`instalmentItems.${index}.itemPercent`, {
                        setValueAs: (v) => (v === "" ? 0 : Number(v)),
                      })}
                    />
                    {errors.instalmentItems?.[index]?.itemPercent && (
                      <p className="mt-1 text-xs text-red-500">
                        {
                          errors.instalmentItems[index].itemPercent
                            ?.message as string
                        }
                      </p>
                    )}
                  </td>

                  {/* Percent of Value */}
                  <td className="px-3 py-2 align-top">
                    <Input
                      placeholder="Percent Value"
                      className={`text-xs w-28 ${
                        errors.instalmentItems?.[index]?.feePercent ||
                        hasFieldError(`feePercent_${index}`)
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(`instalmentItems.${index}.feePercent`, {
                        setValueAs: (v) => (v === "" ? 0 : Number(v)),
                      })}
                    />
                    {errors.instalmentItems?.[index]?.feePercent && (
                      <p className="mt-1 text-xs text-red-500">
                        {
                          errors.instalmentItems[index].feePercent
                            ?.message as string
                        }
                      </p>
                    )}
                  </td>

                  {/* Sub-phase */}
                  <td className="px-3 py-2 align-top">
                    <Input
                      placeholder="Sub-phase"
                      className={`text-xs w-28 ${
                        errors.instalmentItems?.[index]?.repeatTime ||
                        hasFieldError(`repeatTime_${index}`)
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      {...register(`instalmentItems.${index}.repeatTime`, {
                        setValueAs: (v) => (v === "" ? null : Number(v)),
                      })}
                    />
                    {errors.instalmentItems?.[index]?.repeatTime && (
                      <p className="mt-1 text-xs text-red-500">
                        {
                          errors.instalmentItems[index].repeatTime
                            ?.message as string
                        }
                      </p>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 text-center align-top">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhases(index)}
                      className="text-red-500 transition-colors hover:text-red-700"
                      // disabled={fields.length === 1}
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
    </div>
  );
};

export default PhasesTable;
