import { useFieldArray, useFormContext } from "react-hook-form";
import {
  BwfCondGroupListPayload,
  CreateStepNodePayload,
} from "../../../hooks/stepForm";
import { useBillingWorkflowStore } from "../../../stores/billingWorkflow.store";
import {
  useRatableEventList,
  useSortOperatorList,
  useZoneMapList,
} from "../../../hooks/useQuery";
import ConditionGroupItem from "./ConditionGroupItem";

type ConditionProps = {
  groupData: BwfCondGroupListPayload[];
};

const ConditionGroup = () => {
  const { setShowFormCondition, setEditingCondition, editingCondition } =
    useBillingWorkflowStore();

  const { control } = useFormContext<CreateStepNodePayload>();

  const { data: ratableEvents = [] } = useRatableEventList();
  const { data: sortOperators = [] } = useSortOperatorList();
  const { data: zoneMaps = [] } = useZoneMapList();

  const { fields: groupData, remove: removeGroup } = useFieldArray({
    control,
    name: "bwfCondGroupList",
  });

  const findRatableEventName = (ratableEventId: number) =>
    ratableEvents.find((e) => e.reAttr === ratableEventId)?.reAttrName;

  const findSortOperatorName = (sortOperatorId: string) =>
    sortOperators.find((o) => o.sortOperator === sortOperatorId)
      ?.sortOperatorName;

  const findZoneMapsName = (zoneId: number) =>
    zoneMaps.find((z) => z.zoneId === zoneId)?.zoneName;

  return (
    <div className="space-y-5 mt-5">
      {groupData.map((group, groupIndex) => (
        <ConditionGroupItem
          key={groupIndex}
          group={group}
          groupIndex={groupIndex}
          onRemoveGroup={removeGroup}
          findRatableEventName={findRatableEventName}
          findSortOperatorName={findSortOperatorName}
          findZoneMapsName={findZoneMapsName}
        />
      ))}
    </div>
  );
};

export default ConditionGroup;
