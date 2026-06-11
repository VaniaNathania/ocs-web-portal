import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

export interface TimeSpanUp {
  timeSpanId: number;
  calculationMethod: string;
  price: string;
  calculationUnit: number;
  priority?: number;
  timeSpanName?: string;
}

interface TimeSpanList {
  id: number;
  timeSpanName: string;
}

interface TimeSpanProps {
  data: TimeSpanUp[];
  onChange: (data: TimeSpanUp[]) => void;
  priceId: string | null;
}

interface ExistingTimeSpanData {
  calculationMethod: string;
  calculateUnit: number;
  timeSpanUpName: string;
  timeSpanUpId: number;
  price: string;
  priority: number;
  rum: number;
}

const TimeSpanComponent: React.FC<TimeSpanProps> = ({
  data,
  onChange,
  priceId,
}) => {
  const { GetData } = useCallApi();
  const [timeSpanList, setTimeSpanList] = useState<TimeSpanList[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingDataLoaded, setExistingDataLoaded] = useState(false);

  const getTimeSpanList = useCallback(async () => {
    try {
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
    }
  }, [GetData]);

  // const getTimeDetail = useCallback(async () => {
  //   if (!priceId || priceId === "" || existingDataLoaded) return;

  //   try {
  //     setLoading(true);
  //     const response = await GetData(
  //       `${API_URL_PRICE_PLAN}/rankprice/time-span/${priceId}`,
  //       {}
  //     );

  //     if (
  //       response?.data &&
  //       Array.isArray(response.data) &&
  //       response.data.length > 0
  //     ) {
  //       const existingData: TimeSpanUp[] = response.data.map(
  //         (item: ExistingTimeSpanData) => {
  //           // Cari matching timeSpanList berdasarkan timeSpanUpName
  //           const matchingTimeSpan = timeSpanList.find(
  //             (ts) => ts.timeSpanName === item.timeSpanUpName
  //           );
            
  //           return {
  //             timeSpanId: matchingTimeSpan ? matchingTimeSpan.id : 0, // Gunakan id dari timeSpanList, bukan timeSpanUpId
  //             calculationMethod: item.calculationMethod,
  //             price: item.price.toString(),
  //             calculationUnit: item.calculateUnit,
  //             priority: item.priority,
  //             timeSpanName: item.timeSpanUpName, // Simpan nama untuk display
  //           };
  //         }
  //       );
  //       existingData.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  //       onChange(existingData);
  //     }

  //     setExistingDataLoaded(true);
  //   } catch (error) {
  //     console.error("Failed to fetch existing time span data:", error);
  //     setExistingDataLoaded(true);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [priceId, existingDataLoaded, GetData, onChange, timeSpanList]);

  useEffect(() => {
    getTimeSpanList();
  }, [getTimeSpanList]);

  // useEffect(() => {
    
  //     getTimeDetail();
    
  // }, [getTimeDetail]);

  useEffect(() => {
    setExistingDataLoaded(false);
  }, [priceId]);

  // Calculate next priority based on existing data
  const getNextPriority = (): number => {
    if (data.length === 0) return 1;
    const maxPriority = Math.max(...data.map((item) => item.priority || 0));
    return maxPriority + 1;
  };

  // Simplified update function
  const updateItem = (index: number, field: keyof TimeSpanUp, value: any) => {
    const newData = [...data];

    // Handle specific field transformations
    if (field === "price" || field === "calculationUnit") {
      value = value.toString().replace(/[^0-9.]/g, "");
      if (field === "calculationUnit") {
        value = parseFloat(value) || 0;
      }
    } else if (field === "timeSpanId") {
      // Handle timeSpan selection - update both timeSpanId and timeSpanName
      const selectedTimeSpan = timeSpanList.find(
        (ts) => ts.id.toString() === value
      );
      if (selectedTimeSpan) {
        newData[index] = {
          ...newData[index],
          timeSpanId: selectedTimeSpan.id,
          timeSpanName: selectedTimeSpan.timeSpanName,
        };
        onChange(newData);
        return;
      }
    }

    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const removeItem = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    // Recalculate priorities after removal
    const updatedData = newData.map((item, idx) => ({
      timeSpanId: item.timeSpanId,
      calculationMethod: item.calculationMethod,
      price: item.price.toString(),
      calculationUnit: item.calculationUnit,
      priority: idx + 1,
      timeSpanName: item.timeSpanName,
    }));
    onChange(updatedData);
  };

  const addNewItem = () => {
    const newItem: TimeSpanUp = {
      timeSpanId: 0,
      calculationMethod: "F",
      calculationUnit: 0,
      price: "",
      priority: getNextPriority(),
    };
    onChange([...data, newItem]);
  };

  // Move item up or down (for future drag-and-drop functionality)
  const moveItem = (fromIndex: number, toIndex: number) => {
    const newData = [...data];
    const [movedItem] = newData.splice(fromIndex, 1);
    newData.splice(toIndex, 0, movedItem);

    // Reassign priorities
    const updatedData = newData.map((item, i) => ({
      ...item,
      priority: i + 1,
    }));

    onChange(updatedData);
  };

  if (loading && !existingDataLoaded) {
    return (
      <div className="flex justify-center items-center py-8">
        <CircularProgress size={24} />
        <Typography className="ml-2 text-sm">
          Loading time span data...
        </Typography>
      </div>
    );
  }

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
          disabled={loading}
        >
          Add
        </Button>
      </div>

      {data.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
            <div className="col-span-1">Priority</div>
            <div className="col-span-3">Time Span</div>
            <div className="col-span-2">Calculation Method</div>
            <div className="col-span-2">Calculate Unit</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Actions</div>
          </div>

          {data.map((item, index) => (
            <div
              key={`timespan-${index}-${item.priority || 0}`}
              className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-gray-50"
            >
              {/* Priority - Now properly managed */}
              <div className="col-span-1 flex items-center gap-1">
                <GripVertical className="text-gray-400 cursor-move" size={16} />
                <div className="w-full px-2 py-2 text-sm bg-gray-100 border border-gray-200 rounded text-center text-gray-600 font-medium">
                  {item.priority || 0}
                </div>
              </div>

              {/* Time Span Selection */}
              <div className="col-span-3">
                <FormControl fullWidth size="small">
                  <Select
                    value={(() => {
                      // Jika timeSpanId ada dan > 0, gunakan itu
                      if (item.timeSpanId && item.timeSpanId > 0) {
                        // Verifikasi bahwa ID ini masih ada di timeSpanList
                        const exists = timeSpanList.find(ts => ts.id === item.timeSpanId);
                        return exists ? item.timeSpanId.toString() : "";
                      }
                      return "";
                    })()}
                    onChange={(event) =>
                      updateItem(index, "timeSpanId", event.target.value)
                    }
                    displayEmpty
                    MenuProps={{ disableAutoFocusItem: true }}
                    renderValue={(selected) => {
                      if (!selected || selected === "") {
                        return (
                          <em className="text-gray-400">Select Time Span</em>
                        );
                      }

                      // Tampilkan timeSpanName yang sudah tersimpan
                      if (item.timeSpanName) {
                        return item.timeSpanName;
                      }

                      // Fallback: cari dari timeSpanList
                      const selectedTimeSpan = timeSpanList.find(
                        (ts) => ts.id.toString() === selected
                      );
                      return selectedTimeSpan ? selectedTimeSpan.timeSpanName : selected;
                    }}
                    sx={{
                      "& .MuiSelect-select": {
                        fontSize: "0.875rem",
                        padding: "8px 12px",
                      },
                    }}
                  >
                    {timeSpanList.length > 0 ? (
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

              {/* Calculation Method */}
              <div className="col-span-2">
                <FormControl fullWidth size="small">
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={item.calculationMethod || "F"}
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

              {/* Calculate Unit */}
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

              {/* Price */}
              <div className="col-span-2">
                <input
                  type="text"
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition-colors"
                  value={item.price || ""}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  placeholder="Price"
                />
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end gap-1">
                {/* Move Up */}
                <IconButton
                  size="small"
                  onClick={() => moveItem(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  sx={{ color: "primary.main" }}
                  title="Move Up"
                >
                  <span className="text-xs">↑</span>
                </IconButton>

                {/* Move Down */}
                <IconButton
                  size="small"
                  onClick={() =>
                    moveItem(index, Math.min(data.length - 1, index + 1))
                  }
                  disabled={index === data.length - 1}
                  sx={{ color: "primary.main" }}
                  title="Move Down"
                >
                  <span className="text-xs">↓</span>
                </IconButton>

                {/* Delete */}
                <IconButton
                  size="small"
                  onClick={() => removeItem(index)}
                  sx={{ color: "error.main" }}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.length === 0 && existingDataLoaded && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
          No time span accumulation added yet. Click "Add" to create one.
        </div>
      )}
    </div>
  );
};

export default TimeSpanComponent;