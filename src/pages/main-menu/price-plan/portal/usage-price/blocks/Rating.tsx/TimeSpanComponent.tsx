import React, { useEffect, useState } from "react";
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

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

export interface TimeSpanUp {
  timeSpanId: number;
  calculationMethod: string;
  calculationUnit: number;
  price?: string;
  timeSpanName?: string;
  priority?: number;
  isConfirmed?: boolean;
}

interface TimeSpanList {
  id: number;
  timeSpanName: string;
}

interface TimeSpanProps {
  data: TimeSpanUp[];
  onChange: (data: TimeSpanUp[]) => void;
  onEditingChange: (isEditing: boolean) => void;
}

const TimeSpanComponent: React.FC<TimeSpanProps> = ({
  data,
  onChange,
  onEditingChange,
}) => {
  const { GetData } = useCallApi();
  const [timeSpanList, setTimeSpanList] = useState<TimeSpanList[]>([]);
  const [loading, setLoading] = useState(false);

  // Track errors for each item
  const [errors, setErrors] = useState<Record<number, Record<string, boolean>>>(
    {}
  );

  const getTimeSpanList = async () => {
    try {
      setLoading(true);
      const response = await GetData(
        `${API_URL_PRICE_PLAN}/rankprice/TimeSpanName/list`,
        {}
      );

      if (response?.data && Array.isArray(response.data)) {
        setTimeSpanList(response.data);
      } else {
        setTimeSpanList([]);
      }
    } catch (error) {
      console.error("Failed to fetch time span list:", error);
      setTimeSpanList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTimeSpanList();
  }, []);

  // Generate next priority number
  const getNextPriority = () => {
    if (data.length === 0) return 1;
    const maxPriority = Math.max(...data.map((item) => item.priority || 0));
    return maxPriority + 1;
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

  // Simplified update function - one function for all field updates
  const updateItem = (index: number, field: keyof TimeSpanUp, value: any) => {
    const newData = [...data];

    if (field === "timeSpanId") {
      const selectedTimeSpan = timeSpanList.find(
        (ts) => ts.id.toString() === value
      );
      newData[index] = {
        ...newData[index],
        timeSpanId: parseInt(value) || 0,
        timeSpanName: selectedTimeSpan?.timeSpanName || "",
      };
      // Clear error when value is selected
      if (parseInt(value) > 0) {
        clearError(index, field);
      }
    } else if (field === "price") {
      const cleanValue = value.toString().replace(/[^0-9.]/g, "");
      newData[index] = {
        ...newData[index],
        price: cleanValue,
      };
      // Clear error when value is entered
      if (cleanValue !== "") {
        clearError(index, field);
      }
    } else if (field === "priority") {
      const cleanValue = value.toString().replace(/[^0-9]/g, "");
      newData[index] = {
        ...newData[index],
        priority: parseInt(cleanValue) || 1,
      };
    } else if (field === "calculationUnit") {
      const cleanValue = value.toString().replace(/[^0-9]/g, "");
      newData[index] = {
        ...newData[index],
        calculationUnit: parseInt(cleanValue) || 0,
      };
      // Clear error when value is entered
      if (parseInt(cleanValue) > 0) {
        clearError(index, field);
      }
    } else if (field === "calculationMethod") {
      newData[index] = { ...newData[index], [field]: value };
      // Clear error when value is selected
      if (value !== "") {
        clearError(index, field);
      }
    } else {
      newData[index] = { ...newData[index], [field]: value };
    }

    onChange(newData);
  };

  const removeItem = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const addNewItem = () => {
    const newItem: TimeSpanUp = {
      timeSpanId: 0,
      calculationMethod: "F",
      calculationUnit: 0,
      price: "",
      priority: getNextPriority(),
      isConfirmed: false,
    };
    onChange([...data, newItem]);
  };

  // Function untuk confirm item
  const confirmItem = (index: number) => {
    const item = data[index];
    const newErrors: Record<string, boolean> = {};

    // Validasi sebelum confirm
    if (!item.timeSpanId || item.timeSpanId === 0) {
      toast("Please select a time span");
      newErrors.timeSpanId = true;
    }

    if (!item.price || item.price === "") {
      toast("Please enter price");
      newErrors.price = true;
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

  // Function untuk edit kembali item yang sudah confirmed
  const editItem = (index: number) => {
    const newData = [...data];
    newData[index] = { ...newData[index], isConfirmed: false };
    onChange(newData);
  };

  // Check apakah masih ada yang belum confirmed
  const hasUnconfirmedItems = data.some((item) => !item.isConfirmed);

  // Update editing state
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
          <h4 className="font-medium text-gray-800">Time Span Accumulation</h4>
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
        <Button type="button" size="sm" onClick={addNewItem} className="gap-2">
          <Plus size={16} />
          Add
        </Button>
      </div>

      {data.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
            <div className="col-span-2">Priority</div>
            <div className="col-span-3">Time Span</div>
            <div className="col-span-2">Calculation Method</div>
            <div className="col-span-2">Calculate Unit</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1">Actions</div>
          </div>

          {data.map((item, index) => (
            <div
              key={`timespan-${index}`}
              className={`grid grid-cols-12 gap-2 items-center p-2 border rounded-md transition-all ${
                item.isConfirmed
                  ? "bg-green-50 border-green-300"
                  : "bg-white border-gray-300 shadow-sm"
              }`}
            >
              <div className="col-span-2">
                <Input
                  type="text"
                  value={item.priority?.toString() || ""}
                  disabled={true}
                  placeholder="Priority"
                  className="bg-gray-100"
                />
              </div>

              <div className="col-span-3">
                <Select
                  value={
                    item.timeSpanId && item.timeSpanId > 0
                      ? item.timeSpanId.toString()
                      : ""
                  }
                  onValueChange={(value) =>
                    updateItem(index, "timeSpanId", value)
                  }
                  disabled={loading || item.isConfirmed}
                >
                  <SelectTrigger
                    className={`w-full ${errors[index]?.timeSpanId ? "border-red-500 focus:ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Select Time Span" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : timeSpanList.length > 0 ? (
                      timeSpanList.map((timeSpan) => (
                        <SelectItem
                          key={timeSpan.id}
                          value={timeSpan.id.toString()}
                        >
                          {timeSpan.timeSpanName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="empty" disabled>
                        No time spans available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Select
                  value={item.calculationMethod || ""}
                  onValueChange={(value) =>
                    updateItem(index, "calculationMethod", value)
                  }
                  disabled={item.isConfirmed}
                >
                  <SelectTrigger
                    className={`w-full ${errors[index]?.calculationMethod ? "border-red-500 focus:ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Fixed Value</SelectItem>
                    {/* <SelectItem value="P">Permilage</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Input
                  type="text"
                  value={item.calculationUnit?.toString() || ""}
                  onChange={(e) =>
                    updateItem(index, "calculationUnit", e.target.value)
                  }
                  disabled={item.isConfirmed}
                  placeholder="Unit"
                  className={
                    errors[index]?.calculationUnit
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
              </div>

              <div className="col-span-2">
                <Input
                  type="text"
                  value={item.price || ""}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  disabled={item.isConfirmed}
                  placeholder="Price"
                  className={
                    errors[index]?.price
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
              </div>

              <div className="col-span-1 flex justify-end gap-1">
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
                      onClick={() => removeItem(index)}
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
                      onClick={() => removeItem(index)}
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
          No time span accumulation added yet. Click "Add" to create one.
        </div>
      )}
    </div>
  );
};

export default TimeSpanComponent;
