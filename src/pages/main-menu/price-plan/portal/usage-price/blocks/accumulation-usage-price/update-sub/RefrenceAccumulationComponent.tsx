import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Plus, Trash2, CheckCircle, Edit } from "lucide-react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { TimeSpanUpdateAccumulation } from "./TimeSpanComponent";
import { Input } from "@/components/ui/input";

export interface ReferenceUpdateAccumulation {
  acmTimeSpanId: number | null;
  effValue: number;
  expValue: number;
  resourceId: number;
  calculationMethod: string;
  accumulation: string;
  calculateUnit: number;
}

interface TimeSpanAccumulation {
  timeSpanId: number;
  calculationMethod: string;
  valueString: string;
  calculationUnit: number;
  priority?: number;
  timeSpanName?: string;
}

interface AccumTypeList {
  resourceId: number;
  resourceName: string;
  reAttrId?: number;
}

interface ExistingReferenceData {
  acmRefId: number;
  priceVerId: number;
  resourceId: number;
  resourceName: string;
  adjustMethod: string;
  acmTimeSpanId: number;
  rate: number;
  rum: number;
  effValue: number;
  expValue: number;
  acmTimeSpanPriority: number;
}

interface ReferenceItemState {
  index: number;
  isConfirmed: boolean;
  fieldErrors: {
    resourceId: boolean;
    accumulation: boolean;
    calculateUnit: boolean;
  };
}

interface ReferenceUpdateAccumulationProps {
  data: ReferenceUpdateAccumulation[];
  onChange: (data: ReferenceUpdateAccumulation[]) => void;
  timeSpanAccumulation: TimeSpanUpdateAccumulation[];
  priceVerId: number;
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const ReferenceUpdateAccumulationComponent: React.FC<
  ReferenceUpdateAccumulationProps
> = ({ data, onChange, timeSpanAccumulation = [], priceVerId }) => {
  const [accumTypeList, setAccumTypeList] = useState<AccumTypeList[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemStates, setItemStates] = useState<{
    [key: number]: ReferenceItemState;
  }>({});

  const dataInitialized = useRef(false);
  const lastPriceVerId = useRef<number | null>(null);

  const { GetData } = useCallApi();

  useEffect(() => {
    getAccumulationTypeList();
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
      getReferenceDetail();
      lastPriceVerId.current = priceVerId;
    }

    if (priceVerId && priceVerId > 0 && data.length > 0) {
      dataInitialized.current = true;
      lastPriceVerId.current = priceVerId;
    }
  }, [priceVerId, data.length]);

  const getReferenceDetail = async () => {
    if (!priceVerId || priceVerId === 0) return;

    try {
      setLoading(true);
      const response = await GetData(
        `${API_URL_PRICE_PLAN}/price/acm-ref/list`,
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
        // Convert existing data to component format
        const existingData: ReferenceUpdateAccumulation[] = response.data.map(
          (item: ExistingReferenceData) => ({
            acmTimeSpanId: item.acmTimeSpanPriority,
            effValue: item.effValue,
            expValue: item.expValue,
            resourceId: item.resourceId,
            calculationMethod: item.adjustMethod,
            accumulation: item.rate.toString(),
            calculateUnit: item.rum,
          })
        );

        // Initialize item states as confirmed for existing data
        const initialItemStates: { [key: number]: ReferenceItemState } = {};
        existingData.forEach((_, index) => {
          initialItemStates[index] = {
            index,
            isConfirmed: true,
            fieldErrors: {
              resourceId: false,
              accumulation: false,
              calculateUnit: false,
            },
          };
        });
        setItemStates(initialItemStates);

        onChange(existingData);
      }

      dataInitialized.current = true;
    } catch (error) {
      console.error("Failed to fetch existing reference data:", error);
      dataInitialized.current = true;
    } finally {
      setLoading(false);
    }
  };

  const getAccumulationTypeList = async () => {
    try {
      setLoading(true);
      const response = await GetData(
        `${API_URL_PRICE_PLAN}/price/accumulation-type/list`,
        {}
      );
      setAccumTypeList(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch accumulation list:", error);
      setAccumTypeList([]);
    } finally {
      setLoading(false);
    }
  };

  // Function untuk validate item dan return field errors
  const validateItem = (index: number) => {
    const item = data[index];
    const fieldErrors = {
      resourceId: !item.resourceId || item.resourceId === 0,
      accumulation: !item.accumulation || item.accumulation.trim() === "",
      calculateUnit: !item.calculateUnit || item.calculateUnit <= 0,
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
          resourceId: false,
          accumulation: false,
          calculateUnit: false,
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
          resourceId: false,
          accumulation: false,
          calculateUnit: false,
        },
      },
    }));
  };

  // Clear field errors ketika user mulai edit
  const clearFieldError = (
    index: number,
    field: keyof ReferenceItemState["fieldErrors"]
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

  // Simplified single update function
  const updateItem = (
    index: number,
    field: keyof ReferenceUpdateAccumulation,
    value: any
  ) => {
    const newData = [...data];

    if (field === "effValue" || field === "expValue") {
      const parsed = parseFloat(value);
      value = isNaN(parsed) ? "" : parsed; // "" kalau kosong, angka kalau valid
    } else if (field === "acmTimeSpanId") {
      value = isNaN(parseInt(value)) ? null : parseInt(value);
    } else if (field === "resourceId") {
      value = parseInt(value) || 0;
      clearFieldError(index, "resourceId");
    } else if (field === "calculateUnit") {
      value = parseInt(value) || 0;
      clearFieldError(index, "calculateUnit");
    } else if (field === "accumulation") {
      // Allow numbers and decimal point
      value = value.toString().replace(/[^0-9.-]/g, "");
      clearFieldError(index, "accumulation");
    }

    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addReference = () => {
    const newItem: ReferenceUpdateAccumulation = {
      acmTimeSpanId: null,
      effValue: 0,
      expValue: 0,
      resourceId: 0,
      calculationMethod: "F",
      accumulation: "",
      calculateUnit: 0,
    };

    setItemStates((prev) => ({
      ...prev,
      [data.length]: {
        index: data.length,
        isConfirmed: false,
        fieldErrors: {
          resourceId: false,
          accumulation: false,
          calculateUnit: false,
        },
      },
    }));

    onChange([...data, newItem]);
  };

  const removeReference = (index: number) => {
    const newItemStates = { ...itemStates };
    delete newItemStates[index];

    // Re-index item states after removal
    const reIndexedStates: { [key: number]: ReferenceItemState } = {};
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
    onChange(data.filter((_, i) => i !== index));
  };

  // Show loading state only when initially fetching data (not when switching tabs)
  if (loading && !dataInitialized.current) {
    return (
      <div className="flex justify-center items-center py-8">
        <CircularProgress size={24} />
        <Typography className="ml-2 text-sm">
          Loading reference accumulation data...
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-800">Reference Accumulation</h4>
        <Button
          variant="contained"
          size="small"
          onClick={addReference}
          startIcon={<Plus />}
          sx={{ backgroundColor: "primary.main" }}
        >
          Add
        </Button>
      </div>

      {data.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
            <div className="col-span-2">Time Span Reference</div>
            <div className="col-span-1">Eff Value</div>
            <div className="col-span-1">Exp Value</div>
            <div className="col-span-2">Accumulation Type *</div>
            <div className="col-span-2">Calculation Method</div>
            <div className="col-span-2">Accumulation *</div>
            <div className="col-span-1">Calculate Unit *</div>
            <div className="col-span-1">Actions</div>
          </div>

          {data.map((item, index) => {
            const isConfirmed = itemStates[index]?.isConfirmed || false;
            const fieldErrors = itemStates[index]?.fieldErrors || {
              resourceId: false,
              accumulation: false,
              calculateUnit: false,
            };

            return (
              <div
                key={`reference-${index}-${item.acmTimeSpanId}-${item.resourceId}`} // More unique key
                className="grid grid-cols-12 gap-2 items-center p-3 border rounded-md bg-gray-50"
              >
                {/* Time Span Reference Selection - shows timeSpanName based on priority */}
                <div className="col-span-2">
                  <FormControl fullWidth size="small">
                    <Select
                      value={
                        item.acmTimeSpanId !== null
                          ? item.acmTimeSpanId.toString()
                          : ""
                      }
                      onChange={(event: SelectChangeEvent) => {
                        updateItem(
                          index,
                          "acmTimeSpanId",
                          parseInt(event.target.value)
                        );
                      }}
                      label="Time Span Reference"
                      displayEmpty
                      disabled={isConfirmed}
                      renderValue={(selected) => {
                        const selectedPriority = parseInt(selected);
                        if (!isNaN(selectedPriority)) {
                          const foundTimeSpan = timeSpanAccumulation.find(
                            (ts) => ts.priority === selectedPriority
                          );
                          return (
                            foundTimeSpan?.timeSpanName ||
                            `Priority ${selectedPriority}`
                          );
                        }
                        return <em>Select Time Span Reference</em>;
                      }}
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
                      {timeSpanAccumulation.map((ts) => (
                        <MenuItem
                          key={ts.priority}
                          value={ts.priority?.toString() || ""}
                        >
                          {ts.timeSpanName || `Priority ${ts.priority}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Eff Value */}
                <div className="col-span-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={item.effValue ?? ""}
                    onChange={(e) =>
                      updateItem(index, "effValue", e.target.value)
                    }
                    placeholder="Eff Value"
                    disabled={isConfirmed}
                    className="text-sm px-3 py-2 disabled:bg-gray-100"
                  />
                </div>

                {/* Exp Value */}
                <div className="col-span-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={item.expValue ?? ""}
                    onChange={(e) =>
                      updateItem(index, "expValue", e.target.value)
                    }
                    placeholder="EXP Value"
                    disabled={isConfirmed}
                    className="text-sm px-3 py-2 disabled:bg-gray-100"
                  />
                </div>

                {/* Accumulation Type */}
                <div className="col-span-2">
                  <FormControl fullWidth size="small">
                    <Select
                      value={
                        item.resourceId && item.resourceId > 0
                          ? item.resourceId.toString()
                          : ""
                      }
                      onChange={(event: SelectChangeEvent) =>
                        updateItem(index, "resourceId", event.target.value)
                      }
                      label="Accumulation Type"
                      disabled={loading || isConfirmed}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected || selected === "") {
                          return <em>Select Type</em>;
                        }
                        const selectedAccum = accumTypeList.find(
                          (acc) => acc.resourceId.toString() === selected
                        );
                        return selectedAccum
                          ? selectedAccum.resourceName
                          : selected;
                      }}
                      sx={{
                        "& .MuiSelect-select": {
                          fontSize: "0.875rem",
                          padding: "8px 12px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: fieldErrors.resourceId
                            ? "#f44336"
                            : undefined,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: fieldErrors.resourceId
                            ? "#f44336"
                            : undefined,
                        },
                        "&.Mui-disabled": {
                          backgroundColor: isConfirmed ? "#f5f5f5" : "inherit",
                        },
                      }}
                    >
                      {loading ? (
                        <MenuItem value="" disabled>
                          Loading...
                        </MenuItem>
                      ) : accumTypeList.length > 0 ? (
                        accumTypeList.map((accumType) => (
                          <MenuItem
                            key={accumType.resourceId}
                            value={accumType.resourceId.toString()}
                          >
                            {accumType.resourceName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          No accumulation types available
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
                      onChange={(event: SelectChangeEvent) =>
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

                {/* Accumulation */}
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={item.accumulation ?? ""}
                    onChange={(e) =>
                      updateItem(index, "accumulation", e.target.value)
                    }
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val === "") return; // biarin kosong
                      const num = parseFloat(val);
                      if (!isNaN(num)) {
                        updateItem(index, "accumulation", num.toString());
                      }
                    }}
                    className={`w-full px-2 py-2 text-sm border rounded focus:outline-none transition-colors ${
                      isConfirmed
                        ? "bg-gray-100 border-gray-300 text-gray-600"
                        : fieldErrors.accumulation
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                    }`}
                  />
                </div>

                {/* Calculate Unit */}
                <div className="col-span-1">
                  <TextField
                    type="number"
                    size="small"
                    value={item.calculateUnit || ""}
                    onChange={(e) =>
                      updateItem(index, "calculateUnit", e.target.value)
                    }
                    placeholder="1"
                    disabled={isConfirmed}
                    inputProps={{ min: 1 }}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "0.875rem",
                        padding: "8px 12px",
                      },
                      "& .MuiInputBase-root": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: fieldErrors.calculateUnit
                            ? "#f44336"
                            : undefined,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: fieldErrors.calculateUnit
                            ? "#f44336"
                            : undefined,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: fieldErrors.calculateUnit
                            ? "#f44336"
                            : undefined,
                        },
                        "&.Mui-disabled": {
                          backgroundColor: isConfirmed ? "#f5f5f5" : "inherit",
                        },
                      },
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-between">
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
                    onClick={() => removeReference(index)}
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
          No reference accumulation added yet. Click "Add" to create one.
        </div>
      )}
    </div>
  );
};

export default ReferenceUpdateAccumulationComponent;
