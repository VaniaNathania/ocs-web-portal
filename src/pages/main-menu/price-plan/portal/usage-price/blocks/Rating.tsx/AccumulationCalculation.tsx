import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, Edit2 } from "lucide-react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export interface AccumulationCalculation {
  acctItemTypeId: number;
  calculateUnit: number | null;
  timeSpanUpId: number;
  isConfirmed?: boolean;
}

interface TimeSpanUp {
  timeSpanId: number;
  calculationMethod: string;
  calculationUnit: number;
  price?: string;
  timeSpanName?: string;
}

interface AccumTypeList {
  resourceId: number;
  resourceName: string;
  reAttrId?: number;
}

interface AccumulationCalculationProps {
  data: AccumulationCalculation[];
  onChange: (data: AccumulationCalculation[]) => void;
  timeSpanUp: TimeSpanUp[] | null;
  onEditingChange?: (isEditing: boolean) => void;
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const AccumulationCalculationComponent: React.FC<
  AccumulationCalculationProps
> = ({ data, onChange, timeSpanUp = [], onEditingChange }) => {
  const [accumTypeList, setAccumTypeList] = useState<AccumTypeList[]>([]);
  const [loading, setLoading] = useState(false);
  const { GetData } = useCallApi();

  // Track errors for each item
  const [errors, setErrors] = useState<Record<number, Record<string, boolean>>>(
    {},
  );

  useEffect(() => {
    getAccumulationTypeList();
  }, []);

  const getAccumulationTypeList = async () => {
    try {
      setLoading(true);
      const response = await GetData(
        `${API_URL_PRICE_PLAN}/price/accumulation-type/list`,
        {},
      );
      setAccumTypeList(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch accumulation list:", error);
      setAccumTypeList([]);
    } finally {
      setLoading(false);
    }
  };

  // Clear error when field is updated
  const clearError = (index: number, field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[index]) {
        const itemErrors = { ...newErrors[index] };
        delete itemErrors[field];
        if (Object.keys(itemErrors).length === 0) {
          delete newErrors[index];
        } else {
          newErrors[index] = itemErrors;
        }
      }
      return newErrors;
    });
  };

  const updateItem = (
    index: number,
    field: keyof AccumulationCalculation,
    value: any,
  ) => {
    const newData = [...data];

    if (field === "calculateUnit") {
      const cleanValue = value.toString().replace(/[^0-9]/g, "");
      newData[index] = {
        ...newData[index],
        calculateUnit: parseInt(cleanValue) || 0,
      };
      // Clear error when value is entered
      if (parseInt(cleanValue) > 0) {
        clearError(index, field);
      }
    } else if (field === "acctItemTypeId") {
      const cleanValue = value.toString().replace(/[^0-9]/g, "");
      newData[index] = {
        ...newData[index],
        acctItemTypeId: parseInt(cleanValue),
      };
      // Clear error when value is selected
      if (parseInt(cleanValue) > 0) {
        clearError(index, field);
      }
    } else if (field === "timeSpanUpId") {
      if (
        !timeSpanUp ||
        timeSpanUp.length === 0 ||
        value === "" ||
        value === "null"
      ) {
        value = null;
      } else {
        value = parseInt(value);
        if (isNaN(value) || value < 0 || value >= timeSpanUp.length) {
          value = null;
        }
      }
      newData[index] = { ...newData[index], timeSpanUpId: value };
    } else {
      newData[index] = { ...newData[index], [field]: value };
    }

    onChange(newData);
  };

  const addReference = () => {
    const newItem: AccumulationCalculation = {
      timeSpanUpId: 0,
      calculateUnit: 0,
      acctItemTypeId: 0,
      isConfirmed: false,
    };
    onChange([...data, newItem]);
  };

  const removeReference = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const confirmItem = (index: number) => {
    const item = data[index];
    //  console.log("coba kita liat bro", item);
    const newErrors: Record<string, boolean> = {};

    // Validasi sebelum confirm
    if (!item.acctItemTypeId || item.acctItemTypeId === 0) {
      toast("Please select accumulation type");
      newErrors.acctItemTypeId = true;
    }
    if (item.timeSpanUpId === null) {
      toast("Please enter Time Span Refrence");
      newErrors.timeSpanUpId = true;
    }

    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, [index]: newErrors }));
      return;
    }

    // Clear errors for this item if validation passes
    setErrors((prev) => {
      const newErrorsState = { ...prev };
      delete newErrorsState[index];
      return newErrorsState;
    });

    const newData = [...data];
    newData[index] = { ...newData[index], isConfirmed: true };
    onChange(newData);
  };

  const editItem = (index: number) => {
    const newData = [...data];
    newData[index] = { ...newData[index], isConfirmed: false };
    onChange(newData);
  };

  const hasTimeSpanUp = timeSpanUp && timeSpanUp.length > 0;
  const hasUnconfirmedItems = data.some((item) => !item.isConfirmed);

  useEffect(() => {
    onEditingChange?.(data.length > 0 && hasUnconfirmedItems);
  }, [data, hasUnconfirmedItems, onEditingChange]);

  return (
    <div className="space-y-4">
      {/* Header dengan border highlight saat ada data */}
      <div
        className={`flex justify-between items-center p-4 rounded-lg transition-all ${
          data.length > 0 && hasUnconfirmedItems
            ? "bg-blue-50 border-2 border-blue-300"
            : data.length > 0 && !hasUnconfirmedItems
              ? "bg-green-50 border-2 border-green-300"
              : "bg-gray-50 border border-gray-200"
        }`}
      >
        <div>
          <h4 className="font-medium text-gray-800">Reference Accumulation</h4>
          {data.length > 0 && hasUnconfirmedItems && (
            <p className="text-xs text-blue-600 mt-1">
              ⚠️ Please confirm all items to enable other sections
            </p>
          )}
          {data.length > 0 && !hasUnconfirmedItems && (
            <p className="text-xs text-green-600 mt-1">
              ✓ All items confirmed. You can now access other sections.
            </p>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addReference}
          className="gap-2"
        >
          <Plus size={16} />
          Add
        </Button>
      </div>

      {data.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
            <div className="col-span-3">Time Span Reference</div>
            <div className="col-span-3">Cal Unit</div>
            <div className="col-span-4">Accumulation Type</div>
            <div className="col-span-2">Actions</div>
          </div>

          {data.map((item, index) => (
            <div
              key={`reference-${index}`}
              className={`grid grid-cols-12 gap-2 items-center p-2 border rounded-md transition-all ${
                item.isConfirmed
                  ? "bg-green-50 border-green-300"
                  : "bg-white border-gray-300 shadow-sm"
              }`}
            >
              {/* Time Span Reference */}
              <div className="col-span-3">
                <Select
                  value={
                    item.timeSpanUpId !== null
                      ? item.timeSpanUpId.toString()
                      : "null"
                  }
                  onValueChange={(value) =>
                    updateItem(index, "timeSpanUpId", value)
                  }
                  disabled={!hasTimeSpanUp || item.isConfirmed}
                >
                  <SelectTrigger
                    className={`w-full ${errors[index]?.timeSpanUpId ? "border-red-500 ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select Time Span" />
                  </SelectTrigger>
                  <SelectContent>
                    {!hasTimeSpanUp ? (
                      <SelectItem value="null" disabled>
                        No Time Span Available
                      </SelectItem>
                    ) : (
                      [
                        ...timeSpanUp.map((timeSpanItem, tsIndex) => (
                          <SelectItem key={tsIndex} value={tsIndex.toString()}>
                            {timeSpanItem.timeSpanName ||
                              `Time Span ${tsIndex + 1}`}
                          </SelectItem>
                        )),
                      ]
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Cal Unit */}
              <div className="col-span-3">
                <Input
                  type="text"
                  value={item.calculateUnit?.toString() || ""}
                  onChange={(e) =>
                    updateItem(index, "calculateUnit", e.target.value)
                  }
                  disabled={item.isConfirmed}
                  placeholder="Unit"
                />
              </div>

              {/* Accumulation Type */}
              <div className="col-span-4">
                <Select
                  value={item.acctItemTypeId?.toString() || ""}
                  onValueChange={(value) =>
                    updateItem(index, "acctItemTypeId", value)
                  }
                  disabled={loading || item.isConfirmed}
                >
                  <SelectTrigger
                    className={`w-full ${errors[index]?.acctItemTypeId ? "border-red-500 focus:ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select Accum Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : accumTypeList.length > 0 ? (
                      accumTypeList.map((accumType) => (
                        <SelectItem
                          key={accumType.resourceId}
                          value={accumType.resourceId.toString()}
                        >
                          {accumType.resourceName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>
                        No types available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end gap-1">
                {!item.isConfirmed ? (
                  <>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => confirmItem(index)}
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Confirm"
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeReference(index)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => editItem(index)}
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeReference(index)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
          No reference accumulation added yet. Click "Add" to create one.
        </div>
      )}
    </div>
  );
};

export default AccumulationCalculationComponent;
