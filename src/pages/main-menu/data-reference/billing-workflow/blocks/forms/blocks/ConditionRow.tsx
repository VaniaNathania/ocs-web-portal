import { Card, CardContent } from "@/components/ui/card";
import { useWorkflowAdditionalApi } from "../../../api/useBillingWorkflowAPI";
import { useEffect, useState } from "react";
import { FunctionList } from "../../../utils/workflow.data";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CreateStepNodePayload } from "../../../hooks/stepForm";
import { useBillingWorkflowStore } from "../../../stores/billingWorkflow.store";
import ConditionForm from "./ConditionForm";

type ConditionProps = {
  showFormCondition: boolean;
};

const ConditionRow = () => {
  const { GetFunctionCondition, GetRatableEvent, GetShortOperator } =
    useWorkflowAdditionalApi();
  const {
    setShowFormCondition,
    showFormCondition,
    showStepDialog: showDialog,
    editingCondition,
  } = useBillingWorkflowStore();

  const { control, watch } = useFormContext<CreateStepNodePayload>();
  const groupIndex = editingCondition?.groupIndex || 0;

  const {
    fields: conditions,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: `bwfCondGroupList.${groupIndex}.bwfCondList`,
  });

  const isCreating = showDialog.mode === "create";

  return (
    <>
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h5 className="text-lg font-medium text-gray-800">
              {isCreating ? "Create New Condition" : "Edit Condition"}
            </h5>

            <ConditionForm />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ConditionRow;
