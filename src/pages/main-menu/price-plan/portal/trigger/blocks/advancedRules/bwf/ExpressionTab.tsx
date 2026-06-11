import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Edit, Save, XCircle } from "lucide-react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import { useTriggerCreateContext } from "../../../hooks";
import ZoneSelector from "@/components/common/ZoneSelector";

interface ExpressionTabProps {
  bwfCondGroupList: bwfCondGroup[] | null;
  onConditionChange: (bwfCondGroupList: bwfCondGroup[]) => void;
  spId: number | null;
  onEditingChange?: (isEditing: boolean) => void;
}

const API_URL = apiConfig.service_price_plan;

const ExpressionTab: React.FC<ExpressionTabProps> = ({
  bwfCondGroupList,
  onConditionChange,
  spId,
  onEditingChange,
}) => {
  const { GetData } = useCallApi();
  const { zoneMap } = useTriggerCreateContext();

  const [conditionGroups, setConditionGroups] = useState<bwfCondGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOperatorChoice, setShowOperatorChoice] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0);

  // API data states
  const [sortOperatorList, setSortOperatorList] = useState<SortOperatorList[]>(
    []
  );
  const [functionList, setFunctionList] = useState<SortFunctionList[]>([]);
  const [ratableEventList, setRatableEventList] = useState<RatableEventList[]>(
    []
  );
  const handleZoneChange = (zoneId: number) => {
    updateTempCondition("zoneId", zoneId || undefined);
  };

  const getZoneNameById = (zoneId: number | undefined): string => {
    if (!zoneId) return "No Zone Selected";
    const zone = zoneMap.find((z) => z.zoneId === zoneId);
    return zone ? zone.zoneName : `Zone ${zoneId}`;
  };
  // Edit/Create mode states
  const [editingCondition, setEditingCondition] = useState<{
    groupIndex: number;
    conditionIndex: number;
  } | null>(null);
  const [creatingCondition, setCreatingCondition] = useState<boolean>(false);
  const [tempCondition, setTempCondition] = useState<bwfCondList | null>(null);

  // Notify parent about editing state
  useEffect(() => {
    const isEditing = editingCondition !== null || creatingCondition;
    onEditingChange?.(isEditing);
  }, [editingCondition, creatingCondition, onEditingChange]);

  // Fetch API data
  useEffect(() => {
    const fetchApiData = async () => {
      setLoading(true);
      try {
        const sortOperatorResponse = await GetData(
          `${API_URL}/trigger/advance-rule/bwf/sortoperator/list`,
          {}
        );
        if (sortOperatorResponse.data) {
          setSortOperatorList(sortOperatorResponse.data);
        }

        const functionResponse = await GetData(
          `${API_URL}/trigger/advance-rule/bwf/sortfunction/list `,
          {}
        );
        if (functionResponse.data) {
          setFunctionList(functionResponse.data);
        }

        const ratableEventResponse = await GetData(
          `${API_URL}/trigger/advance-rule/bwf/reattr/list`,
          {}
        );
        if (ratableEventResponse.data) {
          setRatableEventList(ratableEventResponse.data);
        }
      } catch (error) {
        console.error("Error fetching API data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, []);

  // Helper function to resolve operator name
  const resolveOperatorName = (condition: bwfCondList): bwfCondList => {
    if (!condition.sortOperator) return condition;

    const operator = sortOperatorList.find(
      (op) => String(op.sortOperator) === String(condition.sortOperator)
    );

    return {
      ...condition,
      sortOperatorName:
        operator?.sortOperatorName || condition.sortOperatorName || null,
    };
  };

  // Initialize condition groups from props
  useEffect(() => {
    if (bwfCondGroupList && bwfCondGroupList.length > 0) {
      if (sortOperatorList.length > 0) {
        const resolvedGroups = bwfCondGroupList.map((group) => ({
          ...group,
          bwfCondList: group.bwfCondList.map(resolveOperatorName),
        }));
        setConditionGroups(resolvedGroups);
      }
    } else {
      setConditionGroups([
        {
          bwfCondList: [],
          spId: spId || 0,
        },
      ]);
    }
  }, [bwfCondGroupList, spId, sortOperatorList]);

  // Re-resolve when operator list changes
  useEffect(() => {
    if (conditionGroups.length > 0 && sortOperatorList.length > 0) {
      const resolvedGroups = conditionGroups.map((group) => ({
        ...group,
        bwfCondList: group.bwfCondList.map(resolveOperatorName),
      }));
      setConditionGroups(resolvedGroups);
    }
  }, [sortOperatorList]);

  // Validation function
  const validateCondition = (
    condition: bwfCondList
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!condition.reAttr) {
      errors.push("Ratable Event is required");
    }

    if (!condition.sortOperator) {
      errors.push("Operator is required");
    }

    // Zone operators (5 or 6) - only require zone
    if (condition.sortOperator === "5" || condition.sortOperator === "6") {
      if (!condition.zoneId) {
        errors.push("Zone is required for this operator");
      }
    } else {
      // Non-zone operators - require either constant or function
      if (condition.isConst === "Y") {
        if (!condition.operand || condition.operand.trim() === "") {
          errors.push("Operand is required when using Constant mode");
        }
      } else if (condition.isConst === "N") {
        if (!condition.rreAttr) {
          errors.push(
            "Reference Ratable Event is required when using Function mode"
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Create empty condition template
  const createEmptyCondition = (
    groupSpId: number,
    sequence: number = 1
  ): bwfCondList => ({
    reAttr: undefined,
    reAttrName: null,
    function: null,
    param1: null,
    param2: null,
    sortOperator: undefined,
    sortOperatorName: null,
    isConst: "N",
    rreAttr: undefined,
    rreAttrName: null,
    rfunction: null,
    rparam1: null,
    rparam2: null,
    seq: sequence,
    spId: 0,
    operand: "",
    zoneId: undefined,
  });

  const getSelectedFunction = (
    functionValue: string
  ): SortFunctionList | null => {
    return functionList.find((f) => f.function === functionValue) || null;
  };

  const getTotalConditions = () => {
    return conditionGroups.reduce(
      (total, group) => total + group.bwfCondList.length,
      0
    );
  };

  const startCreatingCondition = () => {
    setCreatingCondition(true);
    setTempCondition(createEmptyCondition(spId || 0, 1));
  };

  const startEditingCondition = (
    groupIndex: number,
    conditionIndex: number
  ) => {
    setEditingCondition({ groupIndex, conditionIndex });
    const condition = conditionGroups[groupIndex].bwfCondList[conditionIndex];
    const resolvedCondition = resolveOperatorName(condition);
    setTempCondition(resolvedCondition);
  };

  const saveCondition = () => {
    if (!tempCondition) return;

    const validation = validateCondition(tempCondition);
    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    const updatedGroups = [...conditionGroups];

    if (creatingCondition) {
      if (
        updatedGroups.length === 0 ||
        updatedGroups[0].bwfCondList.length === 0
      ) {
        if (updatedGroups.length === 0) {
          updatedGroups.push({
            bwfCondList: [tempCondition],
            spId: spId || 0,
          });
        } else {
          updatedGroups[0].bwfCondList.push(tempCondition);
        }
      } else {
        setShowOperatorChoice(true);
        return;
      }
    } else if (editingCondition) {
      updatedGroups[editingCondition.groupIndex].bwfCondList[
        editingCondition.conditionIndex
      ] = tempCondition;
    }

    updatedGroups.forEach((group) => {
      group.bwfCondList.forEach((condition, index) => {
        condition.seq = index + 1;
      });
    });

    setConditionGroups(updatedGroups);
    updateParent(updatedGroups);

    setCreatingCondition(false);
    setEditingCondition(null);
    setTempCondition(null);
    setShowOperatorChoice(false);

    toast.success(
      creatingCondition
        ? "Condition created successfully"
        : "Condition updated successfully"
    );
  };

  const cancelEdit = () => {
    setCreatingCondition(false);
    setEditingCondition(null);
    setTempCondition(null);
    setShowOperatorChoice(false);
  };

  const addConditionWithOperator = (isOr: boolean) => {
    if (!tempCondition) return;

    const updatedGroups = [...conditionGroups];

    if (isOr) {
      const newSequence =
        updatedGroups[selectedGroupIndex].bwfCondList.length + 1;
      tempCondition.seq = newSequence;
      updatedGroups[selectedGroupIndex].bwfCondList.push(tempCondition);
    } else {
      tempCondition.seq = 1;
      const newGroup: bwfCondGroup = {
        bwfCondList: [tempCondition],
        spId: spId || 0,
      };
      updatedGroups.push(newGroup);
    }

    setConditionGroups(updatedGroups);
    updateParent(updatedGroups);

    setCreatingCondition(false);
    setTempCondition(null);
    setShowOperatorChoice(false);

    toast.success("Condition created successfully");
  };

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    const updatedGroups = [...conditionGroups];
    updatedGroups[groupIndex].bwfCondList.splice(conditionIndex, 1);

    if (updatedGroups[groupIndex].bwfCondList.length === 0) {
      if (updatedGroups.length > 1) {
        updatedGroups.splice(groupIndex, 1);
      }
    }

    updatedGroups.forEach((group) => {
      group.bwfCondList.forEach((condition, index) => {
        condition.seq = index + 1;
      });
    });

    setConditionGroups(updatedGroups);
    updateParent(updatedGroups);
    toast.success("Condition removed successfully");
  };

  const updateTempCondition = (field: keyof bwfCondList, value: any) => {
    if (!tempCondition) return;

    const updatedCondition = { ...tempCondition };
    (updatedCondition as any)[field] = value;

    // Handle Ratable Event name resolution
    if (field === "reAttr") {
      const selectedEvent = ratableEventList.find(
        (event) => event.reAttr === Number(value)
      );
      updatedCondition.reAttrName = selectedEvent?.reAttrName || "";
    }

    // Handle Reference Ratable Event name resolution
    if (field === "rreAttr") {
      const selectedEvent = ratableEventList.find(
        (event) => event.reAttr === Number(value)
      );
      updatedCondition.rreAttrName = selectedEvent?.reAttrName || "";
    }

    // Handle Operator name resolution
    if (field === "sortOperator") {
      const selectedOperator = sortOperatorList.find(
        (op) => String(op.sortOperator) === String(value)
      );
      updatedCondition.sortOperatorName =
        selectedOperator?.sortOperatorName || "";

      // Reset fields when operator changes
      // Check if new operator is zone-based (5 or 6)
      if (value === "5" || value === "6") {
        // Zone operators - clear constant and function fields
        updatedCondition.isConst = "N"; // Default to function mode for zone operators
        updatedCondition.operand = ""; // Clear constant value
        updatedCondition.rreAttr = undefined;
        updatedCondition.rreAttrName = null;
        updatedCondition.rfunction = null;
        updatedCondition.rparam1 = null;
        updatedCondition.rparam2 = null;
        // Keep zoneId as is or set to undefined if you want to force reselection
        // updatedCondition.zoneId = undefined;
      } else {
        // Non-zone operators - clear zone field
        updatedCondition.zoneId = undefined;
      }
    }

    // Handle number field conversions
    if (["reAttr", "rreAttr", "zoneId", "spId", "seq"].includes(field)) {
      (updatedCondition as any)[field] =
        value !== "" ? Number(value) : undefined;
    }

    // Reset parameters when function changes
    if (field === "function") {
      updatedCondition.param1 = "";
      updatedCondition.param2 = "";
    }

    if (field === "rfunction") {
      updatedCondition.rparam1 = "";
      updatedCondition.rparam2 = "";
    }

    // Handle isConst changes - this is the main logic you requested
    if (field === "isConst") {
      if (value === "Y") {
        // CONSTANT mode selected - clear function-related fields and zone
        updatedCondition.rfunction = null;
        updatedCondition.rreAttr = undefined;
        updatedCondition.rreAttrName = null;
        updatedCondition.rparam1 = null;
        updatedCondition.rparam2 = null;
        updatedCondition.zoneId = undefined; // Clear zone as well
      } else {
        updatedCondition.operand = "";
        updatedCondition.zoneId = undefined; // Clear zone as well
      }
    }

    if (field === "zoneId" && value) {
      updatedCondition.operand = "";
      updatedCondition.rfunction = null;
      updatedCondition.rreAttr = undefined;
      updatedCondition.rreAttrName = null;
      updatedCondition.rparam1 = null;
      updatedCondition.rparam2 = null;
    }

    setTempCondition(updatedCondition);
  };

  const updateParent = (updatedGroups: bwfCondGroup[]) => {
    onConditionChange(updatedGroups);
  };

  const totalConditions = getTotalConditions();
  const isInEditMode = editingCondition !== null || creatingCondition;

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Condition Groups</h4>
        {totalConditions > 0 && !isInEditMode && (
          <Button
            type="button"
            onClick={startCreatingCondition}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            Add Condition
          </Button>
        )}
      </div>

      {/* Edit Mode Warning */}
      {isInEditMode && (
        <Card className="border-2 border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {creatingCondition
                    ? "Creating new condition"
                    : "Editing condition"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={saveCondition}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={cancelEdit}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operator Choice Modal */}
      {showOperatorChoice && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium mb-4">
                How would you like to add the condition?
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => addConditionWithOperator(true)}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-300"
                >
                  OR (Same Group)
                </Button>
                <Button
                  onClick={() => addConditionWithOperator(false)}
                  variant="outline"
                  className="bg-orange-50 hover:bg-orange-100 border-orange-300"
                >
                  AND (New Group)
                </Button>
                <Button
                  onClick={() => setShowOperatorChoice(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {(creatingCondition || editingCondition) && tempCondition && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h5 className="text-lg font-medium text-gray-800">
                {creatingCondition ? "Create New Condition" : "Edit Condition"}
              </h5>

              {/* Horizontal Form Layout */}
              <div className="grid grid-cols-5 gap-6">
                {/* Left Section - Main Condition */}
                <div className="col-span-2 space-y-4">
                  {/* Ratable Event and Function in one row */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Function */}
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Function</div>
                      <Select
                        value={tempCondition.function || ""}
                        onValueChange={(value) =>
                          updateTempCondition("function", value)
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
                    </div>
                    {/* Ratable Event */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-gray-600">
                          Ratable Event
                        </span>
                        <span className="text-red-500 text-xs">*</span>
                      </div>
                      <Select
                        value={tempCondition.reAttr?.toString() || ""}
                        onValueChange={(value) =>
                          updateTempCondition("reAttr", value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {ratableEventList.map((option) => (
                            <SelectItem
                              key={option.reAttr}
                              value={option.reAttr.toString()}
                            >
                              {option.reAttrName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Parameters */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Parameter 1 */}
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Param 1</div>
                      <Input
                        value={tempCondition.param1 || ""}
                        onChange={(e) =>
                          updateTempCondition("param1", e.target.value)
                        }
                        className="h-8 text-sm"
                        disabled={!tempCondition.function}
                      />
                    </div>

                    {/* Parameter 2 */}
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Param 2</div>
                      <Input
                        value={tempCondition.param2 || ""}
                        onChange={(e) =>
                          updateTempCondition("param2", e.target.value)
                        }
                        className="h-8 text-sm"
                        disabled={
                          !tempCondition.function ||
                          (getSelectedFunction(tempCondition.function!)
                            ?.paramNum || 0) < 2
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Center Section - Operator */}
                <div className="col-span-1 flex flex-col space-y-4 justify-center">
                  {/* Operator Section */}
                  <div>
                    <div className="flex gap-1 mb-2">
                      <span className="text-xs text-gray-600">Operator</span>
                      <span className="text-red-500 text-xs">*</span>
                    </div>
                    <Select
                      value={tempCondition.sortOperator || ""}
                      onValueChange={(value) =>
                        updateTempCondition("sortOperator", value)
                      }
                    >
                      <SelectTrigger className="h-10 w-40 text-sm">
                        <SelectValue placeholder="=" />
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
                  </div>

                  {/* Type Section */}
                  <div>
                    <div className="text-xs text-gray-600 mb-2">Type</div>
                    <div className="flex space-x-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="Y"
                          checked={tempCondition.isConst === "Y"}
                          onChange={() => updateTempCondition("isConst", "Y")}
                          className="mr-2 cursor-pointer"
                        />
                        <span className="text-sm font-medium">Constant</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="N"
                          checked={tempCondition.isConst === "N"}
                          onChange={() => updateTempCondition("isConst", "N")}
                          className="mr-2 cursor-pointer"
                        />
                        <span className="text-sm font-medium">Function</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Section - Reference/Zone/Value */}
                <div className="col-span-2 space-y-4">
                  {/* Type Selection */}

                  {/* Dynamic Content based on operator and type */}
                  {tempCondition.sortOperator === "5" ||
                  tempCondition.sortOperator === "6" ? (
                    // Zone
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-gray-600">Zone</span>
                        <span className="text-red-500 text-xs">*</span>
                      </div>
                      <ZoneSelector
                        value={tempCondition.zoneId}
                        onValueChange={(value) =>
                          updateTempCondition("zoneId", value)
                        }
                        placeholder="Select Zone"
                        className="w-full"
                      />
                    </div>
                  ) : tempCondition.isConst === "Y" ? (
                    // Operand
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-gray-600">Value</span>
                        <span className="text-red-500 text-xs">*</span>
                      </div>
                      <Input
                        value={tempCondition.operand || ""}
                        onChange={(e) =>
                          updateTempCondition("operand", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="Value"
                      />
                    </div>
                  ) : (
                    // Reference Object
                    <div className="space-y-4">
                      {/* Reference Ratable Event and Function in one row */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Reference Function */}
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Ref Function
                          </div>
                          <Select
                            value={tempCondition.rfunction || ""}
                            onValueChange={(value) =>
                              updateTempCondition("rfunction", value)
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
                        </div>
                        {/* Reference Ratable Event */}
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs text-gray-600">
                              Ref Ratable Event
                            </span>
                            <span className="text-red-500 text-xs">*</span>
                          </div>
                          <Select
                            value={tempCondition.rreAttr?.toString() || ""}
                            onValueChange={(value) =>
                              updateTempCondition("rreAttr", value)
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {ratableEventList.map((option) => (
                                <SelectItem
                                  key={option.reAttr}
                                  value={option.reAttr.toString()}
                                >
                                  {option.reAttrName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Reference Parameters */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Reference Parameter 1 */}
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Ref P1
                          </div>
                          <Input
                            value={tempCondition.rparam1 || ""}
                            onChange={(e) =>
                              updateTempCondition("rparam1", e.target.value)
                            }
                            className="h-8 text-sm"
                            disabled={!tempCondition.rfunction}
                          />
                        </div>

                        {/* Reference Parameter 2 */}
                        <div>
                          <div className="text-xs text-gray-600 mb-1">
                            Ref P2
                          </div>
                          <Input
                            value={tempCondition.rparam2 || ""}
                            onChange={(e) =>
                              updateTempCondition("rparam2", e.target.value)
                            }
                            className="h-8 text-sm"
                            disabled={
                              !tempCondition.rfunction ||
                              (getSelectedFunction(tempCondition.rfunction!)
                                ?.paramNum || 0) < 2
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 justify-end">
                <Button
                  onClick={saveCondition}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 h-8"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={cancelEdit}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalConditions === 0 && !isInEditMode && (
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
              onClick={startCreatingCondition}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Condition
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Display existing conditions */}
      {totalConditions > 0 && !isInEditMode && (
        <div className="space-y-4">
          {conditionGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="border-l-4 border-l-blue-500">
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
                </div>

                <div className="space-y-2">
                  {group.bwfCondList.map((condition, conditionIndex) => (
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
                            {condition.reAttrName ||
                              `Ratable Event ${condition.reAttr}`}
                          </span>
                          {condition.function && (
                            <span className="text-gray-500 ml-2">
                              → {condition.function}
                              {condition.param1 &&
                                `(${condition.param1}${condition.param2 ? `, ${condition.param2}` : ""})`}
                            </span>
                          )}
                          <span className="mx-2 font-medium text-blue-600">
                            {condition.sortOperatorName ||
                              condition.sortOperator}
                          </span>
                          {condition.sortOperator === "5" ||
                          condition.sortOperator === "6" ? (
                            <span className="font-medium">
                              {getZoneNameById(condition.zoneId)}
                            </span>
                          ) : condition.isConst === "Y" ? (
                            <span className="font-medium">
                              {condition.operand}
                            </span>
                          ) : (
                            <span className="text-gray-700">
                              {condition.rreAttrName ||
                                `Ratable Event ${condition.rreAttr}`}
                              {condition.rfunction && (
                                <span className="text-gray-500 ml-2">
                                  → {condition.rfunction}
                                  {condition.rparam1 &&
                                    `(${condition.rparam1}${condition.rparam2 ? `, ${condition.rparam2}` : ""})`}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() =>
                            startEditingCondition(groupIndex, conditionIndex)
                          }
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() =>
                            removeCondition(groupIndex, conditionIndex)
                          }
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpressionTab;
