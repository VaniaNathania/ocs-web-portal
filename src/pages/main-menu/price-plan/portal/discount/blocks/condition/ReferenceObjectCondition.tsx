import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import DiscountAPI from "../../hooks/DiscountAPI";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ReferenceObjectConditionForm = () => {
  const { watch, setValue, register, control } = useFormContext();
  const { GetReferenceCondition, GetParameterCondition, GetOperatorCondition } =
    DiscountAPI();
  const conditions: Condition[] =
    watch("referenceObject.insertDiscountConditionGroup") || [];

  const [referenceCondition, setReferenceCondition] = useState<
    {
      dpRefCondId: number;
      dpRefCondName: string;
      dpRefCondParamNum: number;
    }[]
  >([]);
  const [selectedReferenceCondition, setSelectedReferenceCondition] = useState<{
    dpRefCondId: number;
    dpRefCondName: string;
    dpRefCondParamNum: number;
  } | null>(null);
  const [conditionParameter, setConditionParameter] = useState<
    {
      attrId: number;
      attrName: string;
    }[]
  >([]);
  const [operatorParameter, setOperatorParameter] = useState<
    {
      sortOperator: string;
      sortOperatorName: string;
    }[]
  >([]);

  const addGroup = () => {
    const newGrpId =
      conditions.length > 0
        ? Math.max(...conditions.map((c) => c.grpId)) + 1
        : 1;

    const newCondition: Condition = {
      grpId: newGrpId,
      seqNo: 1,
      sortOperator: "AND",
      ldpRefCondId: 0,
      lparam1: "",
      rval: "",
    };

    setValue("referenceObject.insertDiscountConditionGroup", [
      ...conditions,
      newCondition,
    ]);
  };

  const addCondition = (grpId: number) => {
    const groupConditions = conditions.filter((c) => c.grpId === grpId);
    const nextSeqNo = groupConditions.length + 1;

    const newCondition: Condition = {
      grpId,
      seqNo: nextSeqNo,
      sortOperator: "AND",
      ldpRefCondId: 0,
      lparam1: "",
      rval: "",
    };

    setValue("referenceObject.insertDiscountConditionGroup", [
      ...conditions,
      newCondition,
    ]);
  };

  const removeCondition = (grpId: number, seqNo: number) => {
    const newConditions = conditions.filter(
      (c) => !(c.grpId === grpId && c.seqNo === seqNo)
    );
    setValue("referenceObject.insertDiscountConditionGroup", newConditions);
  };

  const groups = conditions.reduce<Record<number, Condition[]>>((acc, c) => {
    if (!acc[c.grpId]) acc[c.grpId] = [];
    acc[c.grpId].push(c);
    return acc;
  }, {});

  const fetchReferenceCondition = async () => {
    try {
      const response = await GetReferenceCondition();

      if (response.status) {
        setReferenceCondition(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching reference condition.");
    }
  };

  const fetchConditionParameter = async () => {
    try {
      const response = await GetParameterCondition();

      if (response.status) {
        setConditionParameter(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching condition parameter.");
    }
  };

  const fetchOperatorParameter = async () => {
    try {
      const response = await GetOperatorCondition();

      if (response.status) {
        setOperatorParameter(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching operator parameter.");
    }
  };

  useEffect(() => {
    fetchReferenceCondition();
    fetchConditionParameter();
    fetchOperatorParameter();
  }, []);

  return (
    <div className="w-full p-6 border rounded-lg shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Discount</h2>

      {Object.entries(groups).map(([grpId, groupConditions], idx) => (
        <div key={grpId} className="p-4 mb-6 border rounded-lg">
          <div className="flex items-center gap-5 my-3">
            <div className="font-semibold">Group {idx + 1}</div>
          </div>

          {groupConditions.map((condition, condIdx) => (
            <div key={condIdx} className="flex items-center gap-2 mb-2">
              <Controller
                control={control}
                name={`referenceObject.insertDiscountConditionGroup.${conditions.findIndex(
                  (c) =>
                    c.grpId === condition.grpId && c.seqNo === condition.seqNo
                )}.ldpRefCondId`}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) =>
                      field.onChange(val === "" ? null : Number(val))
                    }
                  >
                    <SelectTrigger className="w-1/4">
                      <SelectValue placeholder="Reference Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {referenceCondition.length > 0 ? (
                        referenceCondition.map((item) => (
                          <SelectItem
                            key={item.dpRefCondId}
                            value={String(item.dpRefCondId)}
                          >
                            {item.dpRefCondName}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="p-2 text-sm text-center text-gray-500">
                          Reference Condition Not Found
                        </p>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                control={control}
                name={`referenceObject.insertDiscountConditionGroup.${conditions.findIndex(
                  (c) =>
                    c.grpId === condition.grpId && c.seqNo === condition.seqNo
                )}.lparam1`}
                render={({ field }) => {
                  const selectedRefCond = referenceCondition.find(
                    (c) =>
                      c.dpRefCondId ===
                      watch(
                        `referenceObject.insertDiscountConditionGroup.${conditions.findIndex(
                          (c) =>
                            c.grpId === condition.grpId &&
                            c.seqNo === condition.seqNo
                        )}.ldpRefCondId`
                      )
                  );

                  const isDisabled = selectedRefCond?.dpRefCondParamNum === 0;

                  if (isDisabled && field.value !== null) {
                    field.onChange(null);
                  }

                  return (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) =>
                        field.onChange(val === "" ? null : val)
                      }
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="w-1/4">
                        <SelectValue placeholder="Parameter Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionParameter.length > 0 ? (
                          conditionParameter.map((item) => (
                            <SelectItem
                              key={item.attrId}
                              value={String(item.attrId)}
                            >
                              {item.attrName}
                            </SelectItem>
                          ))
                        ) : (
                          <p className="p-2 text-sm text-center text-gray-500">
                            Parameter Condition Not Found
                          </p>
                        )}
                      </SelectContent>
                    </Select>
                  );
                }}
              />

              <Controller
                control={control}
                name={`referenceObject.insertDiscountConditionGroup.${conditions.findIndex(
                  (c) =>
                    c.grpId === condition.grpId && c.seqNo === condition.seqNo
                )}.sortOperator`}
                render={({ field }) => (
                  <Select
                    value={field.value ? field.value : ""}
                    onValueChange={(val) =>
                      field.onChange(val === "" ? null : val)
                    }
                  >
                    <SelectTrigger className="w-1/4">
                      <SelectValue placeholder="Operator Value" />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorParameter.length > 0 ? (
                        operatorParameter.map((item) => (
                          <SelectItem
                            key={item.sortOperator}
                            value={item.sortOperator}
                          >
                            {item.sortOperatorName}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="p-2 text-sm text-center text-gray-500">
                          Operator Parameter Not Found
                        </p>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />

              <Input
                type="text"
                placeholder="Value"
                {...register(
                  `referenceObject.insertDiscountConditionGroup.${conditions.findIndex(
                    (c) =>
                      c.grpId === condition.grpId && c.seqNo === condition.seqNo
                  )}.rval`
                )}
              />

              <button
                type="button"
                onClick={() =>
                  removeCondition(condition.grpId, condition.seqNo)
                }
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addCondition(Number(grpId))}
            className="mt-2 text-sm text-blue-500"
          >
            + And
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="font-medium text-green-600"
      >
        + OR
      </button>
    </div>
  );
};

export default ReferenceObjectConditionForm;
