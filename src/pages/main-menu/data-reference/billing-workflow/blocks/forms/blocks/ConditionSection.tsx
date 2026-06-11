import { useFieldArray, useFormContext } from "react-hook-form";
import {
  createEmptyGroupCondition,
  CreateStepNodePayload,
} from "../../../hooks/stepForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBillingWorkflowStore } from "../../../stores/billingWorkflow.store";
import ConditionGroup from "./ConditionGroup";
import ConditionRow from "./ConditionRow";

type ConditionSectionProps = {
  isCreating: boolean;
};

const ConditionSection = ({ isCreating }: ConditionSectionProps) => {
  const { control } = useFormContext<CreateStepNodePayload>();

  const {
    selectedStepNode,
    showFormCondition,
    setShowFormCondition,
    editingCondition,
    setEditingCondition,
  } = useBillingWorkflowStore();

  const { fields: condGroups, append: appendGroup } = useFieldArray({
    control,
    name: "bwfCondGroupList",
  });

  const StepNodeData = selectedStepNode.data;

  const handleAddGroup = () => {
    const newGroup = createEmptyGroupCondition(StepNodeData?.stepId);
    appendGroup(newGroup);
    setShowFormCondition(true);
    setEditingCondition({
      groupIndex: condGroups.length,
      conditionIndex: 0,
    });
  };

  return (
    <>
      {/* Empty State */}
      {condGroups.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <Plus className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">
                No conditions yet
              </h4>
              <p className="text-sm text-gray-500">
                Add your first condition to get started
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAddGroup}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Condition
            </Button>
          </CardContent>
        </Card>
      )}

      {showFormCondition && editingCondition && <ConditionRow />}

      {/* Condition Groups Display */}
      {condGroups.length > 0 && <ConditionGroup />}

      {condGroups.length > 0 && !showFormCondition && (
        <div className="mt-4">
          <Button
            type="button"
            onClick={handleAddGroup}
            variant="outline"
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Group (AND)
          </Button>
        </div>
      )}
    </>
  );
};

export default ConditionSection;
