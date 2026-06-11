import {
  Controller,
  Path,
  PathValue,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  BwfCondListPayload,
  CreateStepNodePayload,
} from "../../../hooks/stepForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, XCircle } from "lucide-react";
import {
  useFunctionList,
  useRatableEventList,
  useSortOperatorList,
  useZoneMapList,
} from "../../../hooks/useQuery";
import ZoneSelector from "@/components/common/ZoneSelector";
import { useBillingWorkflowStore } from "../../../stores/billingWorkflow.store";
import { useState } from "react";

type ConditionFormProps = {
  onEditing: boolean;
};

const ConditionForm = () => {
  const { control, register, watch, setValue, getValues } =
    useFormContext<CreateStepNodePayload>();
  const { setShowFormCondition, editingCondition, setEditingCondition } =
    useBillingWorkflowStore();

  const { data: ratableEvents = [] } = useRatableEventList();
  const { data: functionList = [] } = useFunctionList();
  const { data: sortOperatorList = [] } = useSortOperatorList();

  const groupIndex = editingCondition?.groupIndex ?? 0;
  const conditionIndex = editingCondition?.conditionIndex ?? 0;

  const { remove: removeCondition } = useFieldArray({
    control,
    name: `bwfCondGroupList.${groupIndex}.bwfCondList`,
  });

  const base =
    `bwfCondGroupList.${groupIndex}.bwfCondList.${conditionIndex}` as const;

  // Simpan original value saat component mount untuk rollback
  const [originalValue] = useState(() => {
    const current = getValues(base);
    return { ...current };
  });

  const func = useWatch({ control, name: `${base}.function` });
  const sortOperator = useWatch({
    control,
    name: `${base}.sortOperator` as Path<CreateStepNodePayload>,
  });
  const isConst = useWatch({
    control,
    name: `${base}.isConst` as Path<CreateStepNodePayload>,
  });
  const rfunction = useWatch({
    control,
    name: `${base}.rfunction` as Path<CreateStepNodePayload>,
  });

  const setFormValue = <TPath extends Path<CreateStepNodePayload>>(
    name: TPath,
    value: PathValue<CreateStepNodePayload, TPath>
  ) => {
    setValue(name, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleSave = () => {
    const currentCondition = getValues(base);

    // Basic validation
    if (!currentCondition.reAttr) {
      alert("Please select Ratable Event");
      return;
    }
    if (!currentCondition.sortOperator) {
      alert("Please select Operator");
      return;
    }

    // Validation untuk Zone
    if (
      (currentCondition.sortOperator === "5" ||
        currentCondition.sortOperator === "6") &&
      !currentCondition.zoneId
    ) {
      alert("Please select Zone");
      return;
    }

    // Validation untuk Constant
    if (currentCondition.isConst === "Y" && !currentCondition.operand) {
      alert("Please enter Value");
      return;
    }

    // Validation untuk Function/Ref
    if (currentCondition.isConst === "N" && !currentCondition.rreAttr) {
      alert("Please select Ref Ratable Event");
      return;
    }

    setShowFormCondition(false);
    setEditingCondition(null);
  };

  const handleCancel = () => {
    const currentCondition = getValues(base);

    // Jika condition baru dan masih kosong, remove dari array
    if (!originalValue.reAttr && !originalValue.sortOperator) {
      removeCondition(conditionIndex);
    } else {
      // Rollback ke nilai original jika sedang edit
      Object.keys(originalValue).forEach((key) => {
        const fieldPath = `${base}.${key}` as Path<CreateStepNodePayload>;
        setFormValue(
          fieldPath,
          originalValue[key as keyof typeof originalValue] as any
        );
      });
    }

    setShowFormCondition(false);
    setEditingCondition(null);
  };

  const getSelectedFunction = (
    functionValue: string
  ): SortFunctionList | null => {
    return functionList.find((f) => f.function === functionValue) || null;
  };

  return (
    <>
      <div className="grid grid-cols-5 gap-6">
        {/* Left Section - Main Condition */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Function */}
            <div>
              <div className="text-xs text-gray-600 mb-1">Function</div>
              <Controller
                control={control}
                name={`${base}.function`}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) =>
                      setFormValue(`${base}.function`, value)
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {functionList.map((option) => (
                        <SelectItem
                          key={option.function}
                          value={option.function}
                        >
                          {option.function}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {/* Ratable Event */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-gray-600">Ratable Event</span>
                <span className="text-red-500 text-xs">*</span>
              </div>
              <Controller
                control={control}
                name={`${base}.reAttr`}
                render={({ field }) => (
                  <Select
                    value={String(field.value || "")}
                    onValueChange={(value) =>
                      setFormValue(`${base}.reAttr`, Number(value))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratableEvents.map((option) => (
                        <SelectItem
                          key={option.reAttr}
                          value={option.reAttr.toString()}
                        >
                          {option.reAttrName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-600 mb-1">Param 1</div>
              <Input
                {...register(`${base}.param1`)}
                className="h-8 text-sm"
                disabled={!func}
              />
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Param 2</div>
              <Input
                {...register(`${base}.param2`)}
                className="h-8 text-sm"
                disabled={
                  !func || (getSelectedFunction(func)?.paramNum || 0) < 2
                }
              />
            </div>
          </div>
        </div>

        {/* Center Section - Operator */}
        <div className="col-span-1 flex flex-col space-y-4 justify-center">
          <div>
            <div className="flex gap-1 mb-2">
              <span className="text-xs text-gray-600">Operator</span>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <Controller
              control={control}
              name={`${base}.sortOperator`}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) =>
                    setFormValue(`${base}.sortOperator`, value)
                  }
                >
                  <SelectTrigger className="h-10 w-40 text-sm">
                    <SelectValue placeholder="Please select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOperatorList.map((option) => (
                      <SelectItem
                        key={option.sortOperator}
                        value={option.sortOperator}
                        className="text-sm"
                      >
                        {option.sortOperatorName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Type Section */}
          <div>
            <div className="text-xs text-gray-600 mb-2">Type</div>
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="Y"
                  checked={isConst === "Y"}
                  onChange={() => setFormValue(`${base}.isConst`, "Y")}
                  className="mr-2 cursor-pointer"
                />
                <span className="text-sm font-medium">Constant</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="N"
                  checked={isConst === "N"}
                  onChange={() => setFormValue(`${base}.isConst`, "N")}
                  className="mr-2 cursor-pointer"
                />
                <span className="text-sm font-medium">Function</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Section - Reference/Zone/Value */}
        <div className="col-span-2 space-y-4">
          {sortOperator === "5" || sortOperator === "6" ? (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-gray-600">Zone</span>
                <span className="text-red-500 text-xs">*</span>
              </div>
              <Controller
                control={control}
                name={`${base}.zoneId`}
                render={({ field }) => (
                  <ZoneSelector
                    value={field.value}
                    onValueChange={(value) =>
                      setFormValue(`${base}.zoneId`, value)
                    }
                    placeholder="Select Zone"
                    className="w-full"
                  />
                )}
              />
            </div>
          ) : isConst === "Y" ? (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-gray-600">Value</span>
                <span className="text-red-500 text-xs">*</span>
              </div>
              <Input
                {...register(`${base}.operand`)}
                className="h-8 text-sm"
                placeholder="Value"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Ref Function</div>
                  <Controller
                    control={control}
                    name={`${base}.rfunction`}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) =>
                          setFormValue(`${base}.rfunction`, value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {functionList.map((option) => (
                            <SelectItem
                              key={option.function}
                              value={option.function}
                            >
                              {option.function}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs text-gray-600">
                      Ref Ratable Event
                    </span>
                    <span className="text-red-500 text-xs">*</span>
                  </div>
                  <Controller
                    control={control}
                    name={`${base}.rreAttr`}
                    render={({ field }) => (
                      <Select
                        value={String(field.value || "")}
                        onValueChange={(value) =>
                          setFormValue(`${base}.rreAttr`, Number(value))
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {ratableEvents.map((option) => (
                            <SelectItem
                              key={option.reAttr}
                              value={option.reAttr.toString()}
                            >
                              {option.reAttrName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Ref P1</div>
                  <Input
                    {...register(`${base}.rparam1`)}
                    className="h-8 text-sm"
                    disabled={!rfunction}
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Ref P2</div>
                  <Input
                    {...register(`${base}.rparam2`)}
                    className="h-8 text-sm"
                    disabled={
                      !rfunction ||
                      (getSelectedFunction(String(rfunction))?.paramNum || 0) <
                        2
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        <Button
          type="button"
          onClick={handleSave}
          size="sm"
          className="bg-green-600 hover:bg-green-700 h-8"
        >
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </>
  );
};

export default ConditionForm;
