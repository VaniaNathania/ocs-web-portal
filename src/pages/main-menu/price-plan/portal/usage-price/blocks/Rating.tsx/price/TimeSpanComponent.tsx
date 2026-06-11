// Versi yang disederhanakan tanpa banyak handler
import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

export interface TimeSpanUp {
  timeSpanId: number;
  calculationMethod: string;
  calculationUnit: number|null;
  price?: string;
  timeSpanName?: string;
  priority?: number;
}

interface TimeSpanList {
  id: number;
  timeSpanName: string;
}

interface TimeSpanProps {
  data: TimeSpanUp[];
  onChange: (data: TimeSpanUp[]) => void;
}

const TimeSpanComponent: React.FC<TimeSpanProps> = ({ data, onChange }) => {
  const { GetData } = useCallApi();
  const [timeSpanList, setTimeSpanList] = useState<TimeSpanList[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Simplified update function - one function for all field updates
  const updateItem = (index: number, field: keyof TimeSpanUp, value: any) => {
    const newData = [...data];

    // Handle specific field transformations
    if (field === "calculationUnit") {
      value = value.toString().replace(/[^0-9.]/g, "");
      value = parseFloat(value) || 0;
    } else if (field === "price") {
      // Format price input - allow numbers and decimal
      value = value.toString().replace(/[^0-9.]/g, "");
    } else if (field === "timeSpanId") {
      const selectedTimeSpan = timeSpanList.find(
        (ts) => ts.id.toString() === value
      );
      newData[index] = {
        ...newData[index],
        [field]: parseInt(value) || 0,
        timeSpanName: selectedTimeSpan?.timeSpanName || "", // Simpan nama juga
      };
      onChange(newData);
      return;
    }

    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const removeItem = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };
  const getNextPriority = () => {
    if (data.length === 0) return 1;
    const maxPriority = Math.max(...data.map((item) => item.priority || 0));
    return maxPriority + 1;
  };
  const addNewItem = () => {
    const newItem: TimeSpanUp = {
      timeSpanId: 0,
      calculationMethod: "F",
      calculationUnit: null,
      price: "",
      priority: getNextPriority(),
    };
    onChange([...data, newItem]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-800">Time Span Accumulation</h4>
        <Button
          variant="contained"
          size="small"
          onClick={addNewItem}
          startIcon={<Plus />}
          sx={{ backgroundColor: "primary.main" }}
        >
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
            <div className="col-span-1"></div>
          </div>

          {data.map((item, index) => (
            <div
              key={`timespan-${index}`}
              className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-gray-50"
            >
                            <div className="col-span-2">
                <input
                  type="text"
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
                  value={item.priority?.toString() || ""}
                  onChange={(e) =>
                    updateItem(index, "priority", e.target.value)
                  }
                  disabled={true}
                  placeholder="Priority"
                />
              </div>
              <div className="col-span-3">
                <FormControl fullWidth size="small">
                  <Select
                    value={
                      item.timeSpanId && item.timeSpanId > 0
                        ? item.timeSpanId.toString()
                        : ""
                    }
                    onChange={(event) =>
                      updateItem(index, "timeSpanId", event.target.value)
                    }
                    label="Time Span"
                    disabled={loading}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected || selected === "") {
                        return <em>Select Time Span</em>;
                      }
                      const selectedTimeSpan = timeSpanList.find(
                        (ts) => ts.id.toString() === selected
                      );
                      return selectedTimeSpan
                        ? selectedTimeSpan.timeSpanName
                        : selected;
                    }}
                    sx={{
                      "& .MuiSelect-select": {
                        fontSize: "0.875rem",
                        padding: "8px 12px",
                      },
                    }}
                  >
                    {loading ? (
                      <MenuItem value="" disabled>
                        Loading...
                      </MenuItem>
                    ) : timeSpanList.length > 0 ? (
                      timeSpanList.map((timeSpan) => (
                        <MenuItem
                          key={timeSpan.id}
                          value={timeSpan.id.toString()}
                        >
                          {timeSpan.timeSpanName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No time spans available
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </div>

              <div className="col-span-2">
                <FormControl fullWidth size="small">
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={item.calculationMethod || ""}
                    onChange={(event) =>
                      updateItem(index, "calculationMethod", event.target.value)
                    }
                    label="Method"
                    sx={{
                      "& .MuiSelect-select": {
                        fontSize: "0.875rem",
                        padding: "8px 12px",
                      },
                    }}
                  >
                    <MenuItem value="F">Fixed Value</MenuItem>
                    <MenuItem value="P">Permilage</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
                  value={item.calculationUnit?.toString() || ""}
                  onChange={(e) =>
                    updateItem(index, "calculationUnit", e.target.value)
                  }
                  placeholder="Unit"
                />
              </div>

              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
                  value={item.price || ""}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  placeholder="Price"
                />
              </div>

              <div className="col-span-1 flex justify-end">
                <IconButton
                  size="small"
                  onClick={() => removeItem(index)}
                  sx={{ color: "error.main" }}
                >
                  <Trash2 size={16} />
                </IconButton>
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
