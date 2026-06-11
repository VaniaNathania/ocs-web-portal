import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { CreateStepNodePayload } from "../../../hooks/stepForm";
import { useBillingWorkflowStore } from "../../../stores/billingWorkflow.store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const ConditionGroupItem = ({
  group,
  groupIndex,
  onRemoveGroup,
  findRatableEventName,
  findSortOperatorName,
  findZoneMapsName,
}: {
  group: any;
  groupIndex: number;
  onRemoveGroup: (index: number) => void;
  findRatableEventName: (id: number) => string | undefined;
  findSortOperatorName: (id: string) => string | undefined;
  findZoneMapsName: (id: number) => string | undefined;
}) => {
  const { control, watch } = useFormContext<CreateStepNodePayload>();
  const { setShowFormCondition, setEditingCondition, editingCondition } =
    useBillingWorkflowStore();

  const { remove: removeCondition } = useFieldArray({
    control,
    name: `bwfCondGroupList.${groupIndex}.bwfCondList`,
  });

  const conditions = watch(`bwfCondGroupList.${groupIndex}.bwfCondList`);

  const handleRemoveCondition = (conditionIndex: number) => {
    // Jika ini adalah condition terakhir di group, hapus seluruh group
    if (conditions.length === 1) {
      removeCondition(conditionIndex);
      onRemoveGroup(groupIndex);

      // Reset editing state jika sedang edit condition ini
      if (
        editingCondition?.groupIndex === groupIndex &&
        editingCondition?.conditionIndex === conditionIndex
      ) {
        setEditingCondition(null);
        setShowFormCondition(false);
      }
    } else {
      removeCondition(conditionIndex);

      // Reset editing state jika sedang edit condition ini
      if (
        editingCondition?.groupIndex === groupIndex &&
        editingCondition?.conditionIndex === conditionIndex
      ) {
        setEditingCondition(null);
        setShowFormCondition(false);
      }
      // Update editing index jika sedang edit condition setelah yang dihapus
      else if (
        editingCondition?.groupIndex === groupIndex &&
        editingCondition?.conditionIndex > conditionIndex
      ) {
        setEditingCondition({
          groupIndex,
          conditionIndex: editingCondition.conditionIndex - 1,
        });
      }
    }
  };
  // console.log("conditins: ", conditions);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-gray-700">
            Group {groupIndex + 1}
            {groupIndex > 0 && (
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                AND
              </span>
            )}
          </h5>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // appendCondition(createEmptyCondition());

              setEditingCondition({
                groupIndex,
                conditionIndex: conditions.length,
              });

              setShowFormCondition(true);
            }}
            className="px-5"
          >
            OR
          </Button>
        </div>

        <div className="space-y-2">
          {conditions.map((condition, conditionIndex) => (
            <div
              key={conditionIndex}
              className="flex items-center justify-between p-3 bg-white rounded-lg border"
            >
              <div className="flex-1">
                <div className="text-sm">
                  {conditionIndex > 0 && (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mr-2">
                      OR
                    </span>
                  )}

                  <span className="font-medium">
                    {findRatableEventName(condition.reAttr!) ||
                      `Ratable Event ${condition.reAttr}`}
                  </span>

                  {condition.function && (
                    <span className="text-gray-500 ml-2">
                      → {condition.function}
                      {condition.param1 &&
                        `(${condition.param1}${
                          condition.param2 ? `, ${condition.param2}` : ""
                        })`}
                    </span>
                  )}

                  <span className="mx-2 font-medium text-blue-600">
                    {findSortOperatorName(condition.sortOperator) ||
                      condition.sortOperator}
                  </span>

                  {condition.sortOperator === "5" ||
                  condition.sortOperator === "6" ? (
                    <span className="font-medium">
                      {findZoneMapsName(condition.zoneId!) ||
                        `Zone ${condition.zoneId}`}
                    </span>
                  ) : condition.isConst === "Y" ? (
                    <span className="font-medium">{condition.operand}</span>
                  ) : (
                    <span className="text-gray-700">
                      {findRatableEventName(condition.rreAttr!) ||
                        `Ratable Event ${condition.rreAttr}`}
                    </span>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemoveCondition(conditionIndex)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConditionGroupItem;
