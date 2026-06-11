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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Edit, Save, Trash2 } from "lucide-react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";

// Interface definitions

interface bwfActionItem {
  srcReAttr?: number;
  srcReAttrName?: string;
  objReAttr?: number;
  objReAttrName?: string;
  function: string | null;
  param1: string | null;
  param2: string | null;
  seq: number | null;
  spId: number;
}

interface SysActionListProps {
  bwfActionList: bwfActionItem[];
  onActionListChange: (actionList: bwfActionItem[]) => void;
  onEditingChange?: (isEditing: boolean) => void; // ⬅️ Tambahan
}

const API_URL = apiConfig.service_price_plan;

const SysActionList: React.FC<SysActionListProps> = ({
  bwfActionList,
  onActionListChange,
  onEditingChange,
}) => {
  const { GetData } = useCallApi();
  const [loading, setLoading] = useState(false);

  // State for dropdown data
  const [functionList, setFunctionList] = useState<SortFunctionList[]>([]);
  const [retableEventList, setRetableEventList] = useState<RetableEventList[]>(
    []
  );

  // State for managing actions
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempActionItem, setTempActionItem] = useState<bwfActionItem | null>(
    null
  );
  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(editingIndex !== null);
    }
  }, [editingIndex]);
  useEffect(() => {
    const fetchApiData = async () => {
      setLoading(true);
      try {
        // Fetch Sort Functions
        const functionResponse = await GetData(
          `${API_URL}/trigger/advance-rule/bwf/sortfunction/list`,
          {}
        );
        if (functionResponse.data) {
          setFunctionList(functionResponse.data);
        }

        // Fetch Ratable Events
        const retableEventResponse = await GetData(
          `${API_URL}/trigger/advance-rule/bwf/reattr/list`,
          {}
        );
        if (retableEventResponse.data) {
          setRetableEventList(retableEventResponse.data);
        }
      } catch (error) {
        console.error("Error fetching API data:", error);
        toast.error("Failed to fetch API data");
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, [GetData]);

  //  Create new empty action item
  const createEmptyActionItem = (): bwfActionItem => ({
    srcReAttr: undefined,
    srcReAttrName: "",
    objReAttr: undefined,
    objReAttrName: "",
    function: "",
    param1: "",
    param2: "",
    seq: bwfActionList.length + 1,
    spId: 0,
  });

  // Add new action item
  const handleAddActionItem = () => {
    const newItem = createEmptyActionItem();
    const updatedList = [...bwfActionList, newItem];
    onActionListChange(updatedList);
    setEditingIndex(updatedList.length - 1);
    setTempActionItem({ ...newItem });
  };

  // Delete action item
  const handleDeleteActionItem = (index: number) => {
    const updatedList = bwfActionList.filter((_, i) => i !== index);
    // Update sequence numbers
    const resequencedList = updatedList.map((item, i) => ({
      ...item,
      seq: i + 1,
    }));
    onActionListChange(resequencedList);

    if (editingIndex === index) {
      setEditingIndex(null);
      setTempActionItem(null);
    }
  };

  // Start editing action item
  const handleEditActionItem = (index: number) => {
    setEditingIndex(index);
    setTempActionItem({ ...bwfActionList[index] });
  };

  // Save edited action item
  const handleSaveActionItem = (index: number) => {
    if (!tempActionItem) return;

    // Validate required fields
    if (!tempActionItem.srcReAttr || !tempActionItem.objReAttr) {
      toast.error("Source Re-Attr and Object Re-Attr are required");
      return;
    }

    const updatedList = [...bwfActionList];
    updatedList[index] = { ...tempActionItem };
    onActionListChange(updatedList);

    setEditingIndex(null);
    setTempActionItem(null);
    toast.success("Action item saved successfully");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setTempActionItem(null);
  };

  // Handle field changes during editing
  const handleFieldChange = (
    field: keyof bwfActionItem,
    value: string | number
  ) => {
    if (!tempActionItem) return;

    const updatedItem = { ...tempActionItem, [field]: value };

    // Auto-populate names based on selected re-attr
    if (field === "srcReAttr") {
      const selectedEvent = retableEventList.find(
        (event) => event.reAttr === value
      );
      updatedItem.srcReAttrName = selectedEvent?.reAttrName || "";
    }

    if (field === "objReAttr") {
      const selectedEvent = retableEventList.find(
        (event) => event.reAttr === value
      );
      updatedItem.objReAttrName = selectedEvent?.reAttrName || "";
    }

    // Clear parameters when function changes
    if (field === "function") {
      updatedItem.param1 = "";
      updatedItem.param2 = "";
    }

    setTempActionItem(updatedItem);
  };

  // Get selected function details
  const getSelectedFunctionDetails = (
    functionName: string
  ): SortFunctionList | null => {
    return functionList.find((func) => func.function === functionName) || null;
  };

  // Check if parameter should be enabled
  const isParameterEnabled = (
    selectedFunction: SortFunctionList | null,
    paramNumber: 1 | 2
  ): boolean => {
    if (!selectedFunction) return false;
    return selectedFunction.paramNum >= paramNumber;
  };

  // Get parameter field info
  const getParameterInfo = (
    selectedFunction: SortFunctionList | null,
    paramNumber: 1 | 2
  ) => {
    if (!selectedFunction)
      return {
        name: `Parameter ${paramNumber}`,
        desc: "",
        type: "",
        typeName: "",
      };

    if (paramNumber === 1) {
      return {
        name: selectedFunction.param1Name || `Parameter ${paramNumber}`,
        desc: selectedFunction.param1Desc || "",
        type: selectedFunction.param1ValueType || "",
        typeName: selectedFunction.param1ValueTypeName || "",
      };
    } else {
      return {
        name: selectedFunction.param2Name || `Parameter ${paramNumber}`,
        desc: selectedFunction.param2Desc || "",
        type: selectedFunction.param2ValueType || "",
        typeName: selectedFunction.param2ValueTypeName || "",
      };
    }
  };

  // Render action item row
  const renderActionItemRow = (item: bwfActionItem, index: number) => {
    const isEditing = editingIndex === index;
    const currentItem = isEditing ? tempActionItem : item;
    const selectedFunction = currentItem?.function
      ? getSelectedFunctionDetails(currentItem.function)
      : null;

    if (!currentItem) return null;

    const param1Info = getParameterInfo(selectedFunction, 1);
    const param2Info = getParameterInfo(selectedFunction, 2);
    const isParam1Enabled = isParameterEnabled(selectedFunction, 1);
    const isParam2Enabled = isParameterEnabled(selectedFunction, 2);
    return (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">
              Action Item #{currentItem.seq}
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSaveActionItem(index)}
                    className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    type="reset"
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditActionItem(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteActionItem(index)}
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Re-Attr */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Source Re-Attr <span className="text-red-500">*</span>
              </Label>
              {isEditing ? (
                <Select
                  value={currentItem.srcReAttr?.toString()}
                  onValueChange={(value) =>
                    handleFieldChange("srcReAttr", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Source Re-Attr" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {retableEventList.map((event) => (
                      <SelectItem key={event.reAttr} value={event.reAttr}>
                        {event.reAttrName} ({event.reAttr})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={currentItem.srcReAttr?.toString()}
                  onValueChange={(value) =>
                    handleFieldChange("srcReAttr", value)
                  }
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Template (Optional)" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {retableEventList.map((template) => (
                      <SelectItem key={template.reAttr} value={template.reAttr}>
                        {template.reAttrName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Object Re-Attr */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Object Property <span className="text-red-500">*</span>
              </Label>
              {isEditing ? (
                <Select
                  value={currentItem.objReAttr?.toString()}
                  onValueChange={(value) =>
                    handleFieldChange("objReAttr", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Object Re-Attr" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {retableEventList.map((event) => (
                      <SelectItem key={event.reAttr} value={event.reAttr}>
                        {event.reAttrName} ({event.reAttr})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={currentItem.objReAttr?.toString()}
                  onValueChange={(value) =>
                    handleFieldChange("objReAttr", value)
                  }
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Template (Optional)" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {retableEventList.map((template) => (
                      <SelectItem key={template.reAttr} value={template.reAttr}>
                        {template.reAttrName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Function */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Function</Label>
              {isEditing ? (
                <Select
                  value={currentItem.function!}
                  onValueChange={(value) =>
                    handleFieldChange("function", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Function" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {functionList.map((func) => (
                      <SelectItem key={func.function} value={func.function}>
                        {func.function}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={currentItem.function || "Not selected"}
                  readOnly
                  className="bg-gray-50"
                />
              )}
              {selectedFunction && selectedFunction.comments && (
                <p className="text-xs text-gray-500">
                  {selectedFunction.comments}
                </p>
              )}
            </div>

            {/* Sequence */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sequence</Label>
              <Input value={currentItem.seq!} readOnly className="bg-gray-50" />
            </div>

            {/* Parameter 1 - Always show but can be disabled */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {param1Info.name}
                {isParam1Enabled && <span className="text-red-500"> *</span>}
                {param1Info.typeName && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({param1Info.typeName})
                  </span>
                )}
              </Label>
              <Input
                value={currentItem.param1!}
                onChange={
                  isEditing
                    ? (e) => handleFieldChange("param1", e.target.value)
                    : undefined
                }
                placeholder={
                  param1Info.desc || `Enter ${param1Info.name.toLowerCase()}`
                }
                disabled={!isParam1Enabled || !isEditing}
                className={!isParam1Enabled || !isEditing ? "bg-gray-50" : ""}
                readOnly={!isEditing}
              />
              {param1Info.desc && (
                <p className="text-xs text-gray-500">{param1Info.desc}</p>
              )}
            </div>

            {/* Parameter 2 - Always show but can be disabled */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {param2Info.name}
                {isParam2Enabled && <span className="text-red-500"> *</span>}
                {param2Info.typeName && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({param2Info.typeName})
                  </span>
                )}
              </Label>
              <Input
                value={currentItem.param2!}
                onChange={
                  isEditing
                    ? (e) => handleFieldChange("param2", e.target.value)
                    : undefined
                }
                placeholder={
                  param2Info.desc || `Enter ${param2Info.name.toLowerCase()}`
                }
                disabled={!isParam2Enabled || !isEditing}
                className={!isParam2Enabled || !isEditing ? "bg-gray-50" : ""}
                readOnly={!isEditing}
              />
              {param2Info.desc && (
                <p className="text-xs text-gray-500">{param2Info.desc}</p>
              )}
            </div>
          </div>

          {/* Function Information */}
          {selectedFunction && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h6 className="text-sm font-medium text-blue-800 mb-2">
                Function Details
              </h6>
              <div className="text-xs text-blue-700 space-y-1">
                <div>
                  <strong>Parameters Required:</strong>{" "}
                  {selectedFunction.paramNum}
                </div>
                <div>
                  <strong>Usage:</strong> {selectedFunction.usageFlag}
                </div>
                <div>
                  <strong>Type:</strong> {selectedFunction.functionTypeFlag}
                </div>
                {selectedFunction.comments && (
                  <div>
                    <strong>Description:</strong> {selectedFunction.comments}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h5 className="font-medium text-gray-700">System Action List</h5>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">Loading API data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h5 className="font-medium text-gray-700">System Action List</h5>
        <Button
          type="button"
          size="sm"
          onClick={handleAddActionItem}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={editingIndex !== null}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Action Item
        </Button>
      </div>

      {bwfActionList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 border-2 border-dashed border-gray-200 rounded-md p-8">
              No action items added yet. Click "Add Action Item" to create one.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bwfActionList.map((item, index) => renderActionItemRow(item, index))}
        </div>
      )}

      {editingIndex !== null && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border">
          * You are currently editing an action item. Please save or cancel
          before adding new items.
        </div>
      )}
    </div>
  );
};

export default SysActionList;
