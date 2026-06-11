import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Plus, Trash2, GripVertical, CheckCircle, Edit } from "lucide-react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Input } from "@/components/ui/input";

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

export interface TimeSpanUpdateAccumulation {
  timeSpanId: number;
  calculationMethod: string;
  valueString: string;
  calculationUnit: number;
  priority?: number;
  timeSpanName?: string;
}

interface TimeSpanList {
  id: number;
  timeSpanName: string;
}

interface ExistingTimeSpanData {
  acmTimeSpanId: number;
  priceVerId: number;
  timeSpanName: string;
  adjustMethod: string;
  timeSpanId: number;
  rate: number;
  priority: number;
  rum: number;
}

interface TimeSpanItemState {
  index: number;
  isConfirmed: boolean;
  fieldErrors: {
    timeSpanId: boolean;
    valueString: boolean;
    calculationUnit: boolean;
  };
}

interface TimeSpanProps {
  data: TimeSpanUpdateAccumulation[];
  onChange: (data: TimeSpanUpdateAccumulation[]) => void;
  priceVerId: number;
}

const TimeSpanUpdateComponent: React.FC<TimeSpanProps> = ({
  data,
  onChange,
  priceVerId,
}) => {
  const { GetData } = useCallApi();
  const [timeSpanList, setTimeSpanList] = useState<TimeSpanList[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingDataLoaded, setExistingDataLoaded] = useState(false);
  const [itemStates, setItemStates] = useState<{
    [key: number]: TimeSpanItemState;
  }>({});

  // Use ref to track if data has been initialized to prevent re-fetching
  const dataInitialized = useRef(false);
  const lastPriceVerId = useRef<number | null>(null);

  // Fetch available time span list
  const getTimeSpanList = async () => {
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
  };

  // Fetch existing time span data for this priceVerId
  const getTimeDetail = async () => {
    if (!priceVerId || priceVerId === 0) return;

    try {
      setLoading(true);
      const response = await GetData(
        `${API_URL_PRICE_PLAN}/price/acm-time-span/list`,
        {
          priceVerId: priceVerId,
          spId: 0,
        }
      );

      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        // Convert existing data to component format - only include the required fields
        const existingData: TimeSpanUpdateAccumulation[] = response.data.map(
          (item: ExistingTimeSpanData) => ({
            timeSpanId: item.timeSpanId,
            calculationMethod: item.adjustMethod,
            valueString: item.rate.toString(),
            calculationUnit: item.rum,
            priority: item.priority,
            timeSpanName: item.timeSpanName,
          })
        );

        // Sort by priority to ensure correct order
        existingData.sort((a, b) => (a.priority || 0) - (b.priority || 0));

        // Initialize item states as confirmed for existing data
        const initialItemStates: { [key: number]: TimeSpanItemState } = {};
        existingData.forEach((_, index) => {
          initialItemStates[index] = {
            index,
            isConfirmed: true,
            fieldErrors: {
              timeSpanId: false,
              valueString: false,
              calculationUnit: false,
            },
          };
        });
        setItemStates(initialItemStates);

        onChange(existingData);
      }
      dataInitialized.current = true;
    } catch (error) {
      console.error("Failed to fetch existing time span data:", error);
      dataInitialized.current = true;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTimeSpanList();
  }, []);

  // Load existing reference data only when priceVerId changes and data hasn't been initialized
  useEffect(() => {
    // Only fetch if:
    // 1. priceVerId exists and > 0
    // 2. priceVerId has changed from the last one
    // 3. Current data array is empty (meaning no user modifications yet)
    if (
      priceVerId &&
      priceVerId > 0 &&
      lastPriceVerId.current !== priceVerId &&
      data.length === 0
    ) {
      getTimeDetail();
      lastPriceVerId.current = priceVerId;
    }

    // If priceVerId exists but data is not empty, just mark as initialized
    if (priceVerId && priceVerId > 0 && data.length > 0) {
      dataInitialized.current = true;
      lastPriceVerId.current = priceVerId;
    }
  }, [priceVerId, data.length]);

  // Function untuk validate item dan return field errors
  const validateItem = (index: number) => {
    const item = data[index];
    const fieldErrors = {
      timeSpanId: !item.timeSpanId || item.timeSpanId === 0,
      valueString: !item.valueString || item.valueString.trim() === "", // hapus check "< 0"
      calculationUnit: !item.calculationUnit || item.calculationUnit <= 0,
    };

    return fieldErrors;
  };

  // Function untuk confirm item
  const confirmItem = (index: number) => {
    const fieldErrors = validateItem(index);
    const hasErrors = Object.values(fieldErrors).some((error) => error);

    if (hasErrors) {
      // Set error state untuk field yang bermasalah
      setItemStates((prev) => ({
        ...prev,
        [index]: { index, isConfirmed: false, fieldErrors },
      }));
      return;
    }

    // Confirm item jika semua validasi lolos
    setItemStates((prev) => ({
      ...prev,
      [index]: {
        index,
        isConfirmed: true,
        fieldErrors: {
          timeSpanId: false,
          valueString: false,
          calculationUnit: false,
        },
      },
    }));
  };

  // Function untuk edit item (unlock)
  const editItem = (index: number) => {
    setItemStates((prev) => ({
      ...prev,
      [index]: {
        index,
        isConfirmed: false,
        fieldErrors: {
          timeSpanId: false,
          valueString: false,
          calculationUnit: false,
        },
      },
    }));
  };

  // Clear field errors ketika user mulai edit
  const clearFieldError = (
    index: number,
    field: keyof TimeSpanItemState["fieldErrors"]
  ) => {
    if (itemStates[index]?.fieldErrors[field]) {
      setItemStates((prev) => ({
        ...prev,
        [index]: {
          ...prev[index],
          fieldErrors: {
            ...prev[index].fieldErrors,
            [field]: false,
          },
        },
      }));
    }
  };

  // Get next priority number
  const getNextPriority = (): number => {
    if (data.length === 0) return 1;
    const maxPriority = Math.max(...data.map((item) => item.priority || 0));
    return maxPriority + 1;
  };

  // Update item function - ensures only required fields are maintained
  const updateItem = (
    index: number,
    field: keyof TimeSpanUpdateAccumulation,
    value: any
  ) => {
    const newData = [...data];

    // Handle specific field transformations
    if (field === "valueString") {
      value = value.toString().replace(/[^0-9.-]/g, "");
      clearFieldError(index, "valueString");
    } else if (field === "calculationUnit") {
      value = value.toString().replace(/[^0-9]/g, "");
      value = parseInt(value) || 0;
      clearFieldError(index, "calculationUnit");
    } else if (field === "timeSpanId") {
      clearFieldError(index, "timeSpanId");
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
    const newItemStates = { ...itemStates };
    delete newItemStates[index];

    // Re-index item states after removal
    const reIndexedStates: { [key: number]: TimeSpanItemState } = {};
    Object.keys(newItemStates).forEach((key) => {
      const numKey = parseInt(key);
      if (numKey > index) {
        reIndexedStates[numKey - 1] = {
          ...newItemStates[numKey],
          index: numKey - 1,
        };
      } else if (numKey < index) {
        reIndexedStates[numKey] = newItemStates[numKey];
      }
    });

    setItemStates(reIndexedStates);

    const newData = data.filter((_, i) => i !== index);
    // Recalculate priorities after removal
    const updatedData = newData.map((item, idx) => ({
      ...item,
      priority: idx + 1,
    }));
    onChange(updatedData);
  };

  const addNewItem = () => {
    const newItem: TimeSpanUpdateAccumulation = {
      timeSpanId: 0,
      calculationMethod: "F",
      valueString: "",
      calculationUnit: 0,
      priority: getNextPriority(),
    };

    // Add new item state as unconfirmed
    setItemStates((prev) => ({
      ...prev,
      [data.length]: {
        index: data.length,
        isConfirmed: false,
        fieldErrors: {
          timeSpanId: false,
          valueString: false,
          calculationUnit: false,
        },
      },
    }));

    onChange([...data, newItem]);
  };

  if (loading && !dataInitialized.current) {
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
        >
          Add
        </Button>
      </div>

      {data.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
            <div className="col-span-1">Priority</div>
            <div className="col-span-3">Time Span *</div>
            <div className="col-span-2">Calculation Method</div>
            <div className="col-span-2">Accumulation *</div>
            <div className="col-span-2">Calculate Unit *</div>
            <div className="col-span-2">Actions</div>
          </div>

          {data.map((item, index) => {
            const isConfirmed = itemStates[index]?.isConfirmed || false;
            const fieldErrors = itemStates[index]?.fieldErrors || {
              timeSpanId: false,
              valueString: false,
              calculationUnit: false,
            };

            return (
              <div
                key={`timespan-${index}`}
                className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-gray-50"
              >
                {/* Priority - Read only, auto-generated */}
                <div className="col-span-1 flex items-center gap-1">
                  <GripVertical
                    className="text-gray-400 cursor-move"
                    size={16}
                  />
                  <div className="w-full px-2 py-2 text-sm bg-gray-100 border border-gray-200 rounded text-center text-gray-600 font-medium">
                    {item.priority || 0}
                  </div>
                </div>

                {/* Time Span Selection */}
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
                      displayEmpty
                      disabled={isConfirmed}
                      renderValue={(selected) => {
                        if (!selected || selected === "") {
                          return (
                            <em
                              style={{ color: "#9e9e9e", fontStyle: "italic" }}
                            >
                              Select Time Span
                            </em>
                          );
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
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: fieldErrors.timeSpanId
                            ? "#f44336"
                            : undefined,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: fieldErrors.timeSpanId
                            ? "#f44336"
                            : undefined,
                        },
                        "&.Mui-disabled": {
                          backgroundColor: isConfirmed ? "#f5f5f5" : "inherit",
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
                      value={item.calculationMethod || ""}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "calculationMethod",
                          event.target.value
                        )
                      }
                      label="Method"
                      disabled={isConfirmed}
                      sx={{
                        "& .MuiSelect-select": {
                          fontSize: "0.875rem",
                          padding: "8px 12px",
                        },
                        "&.Mui-disabled": {
                          backgroundColor: isConfirmed ? "#f5f5f5" : "inherit",
                        },
                      }}
                    >
                      <MenuItem value="F">Fixed Value</MenuItem>
                      <MenuItem value="P">Permilage</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                {/* Accumulation Value */}
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={item.valueString ?? ""}
                    onChange={(e) =>
                      updateItem(index, "valueString", e.target.value)
                    }
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val === "") return; // biarin kosong
                      const num = parseFloat(val);
                      if (!isNaN(num)) {
                        updateItem(index, "valueString", num.toString());
                      }
                    }}
                    className={`w-full px-2 py-2 text-sm border rounded focus:outline-none transition-colors ${
                      isConfirmed
                        ? "bg-gray-100 border-gray-300 text-gray-600"
                        : fieldErrors.valueString
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                    }`}
                  />
                </div>
                {/* Calculate Unit */}
                <div className="col-span-2">
                  <input
                    type="text"
                    className={`w-full px-2 py-2 text-sm border rounded focus:outline-none transition-colors ${
                      isConfirmed
                        ? "bg-gray-100 border-gray-300 text-gray-600"
                        : fieldErrors.calculationUnit
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                    }`}
                    value={item.calculationUnit?.toString() || ""}
                    onChange={(e) =>
                      updateItem(index, "calculationUnit", e.target.value)
                    }
                    placeholder="1"
                    disabled={isConfirmed}
                  />
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {isConfirmed ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle size={18} className="text-green-600" />
                        <IconButton
                          size="small"
                          onClick={() => editItem(index)}
                          title="Edit item"
                          sx={{
                            color: "primary.main",
                            padding: "2px",
                          }}
                        >
                          <Edit size={14} />
                        </IconButton>
                      </div>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => confirmItem(index)}
                        sx={{
                          fontSize: "0.75rem",
                          padding: "4px 8px",
                          minWidth: "auto",
                          backgroundColor: "#1976d2",
                          "&:hover": {
                            backgroundColor: "#1565c0",
                          },
                        }}
                      >
                        Check
                      </Button>
                    )}
                  </div>

                  <IconButton
                    size="small"
                    onClick={() => removeItem(index)}
                    sx={{
                      color: "error.main",
                      padding: "4px",
                    }}
                    title="Delete item"
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.length === 0 && dataInitialized.current && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-md">
          No time span accumulation added yet. Click "Add" to create one.
        </div>
      )}
    </div>
  );
};

export default TimeSpanUpdateComponent;
