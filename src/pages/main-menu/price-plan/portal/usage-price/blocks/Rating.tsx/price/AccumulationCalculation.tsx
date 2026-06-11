import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";

export interface AccumulationCalculation {
  acctItemTypeId: number|null;
  calculateUnit: number;
  timeSpanUpId: number | null;
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
  timeSpanUp: TimeSpanUp[] | null; // Changed from timeSpanAccumulation to timeSpanUp
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const AccumulationCalculationComponent: React.FC<
  AccumulationCalculationProps
> = ({
  data,
  onChange,
  timeSpanUp = [], // Changed from timeSpanAccumulation to timeSpanUp
}) => {
  const [accumTypeList, setAccumTypeList] = useState<AccumTypeList[]>([]);
  const [loading, setLoading] = useState(false);
  const { GetData } = useCallApi();

  useEffect(() => {
    getAccumulationTypeList();
  }, []);

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

  // Updated to match new field names
  const updateItem = (
    index: number,
    field: keyof AccumulationCalculation,
    value: any
  ) => {
    const newData = [...data];

    // Handle type conversions based on new field names
    if (field === "calculateUnit" || field === "acctItemTypeId") {
      value = parseInt(value) || null;
    } else if (field === "timeSpanUpId") {
      // Handle timeSpanUpId - set to null if no timeSpanUp available or invalid value
      if (
        !timeSpanUp ||
        timeSpanUp.length === 0 ||
        value === "" ||
        value === "null"
      ) {
        value = null;
      } else {
        value = parseInt(value);
        // Check if the index is valid
        if (isNaN(value) || value < 0 || value >= timeSpanUp.length) {
          value = null;
        }
      }
    }

    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addReference = () => {
    const newItem: AccumulationCalculation = {
      timeSpanUpId: 0, // Default to first index
      calculateUnit: 0,
      acctItemTypeId: null,
    };
    onChange([...data, newItem]);
  };

  const removeReference = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const hasTimeSpanUp = timeSpanUp && timeSpanUp.length > 0;

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
          // disabled={!timeSpanUp || timeSpanUp.length === 0}
        >
          Add
        </Button>
      </div>

      {data.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
            <div className="col-span-2">Time Span Reference</div>
            <div className="col-span-1">Cal Unit</div>
            <div className="col-span-2">Accumulation Type</div>
            <div className="col-span-1">Actions</div>
          </div>

          {data.map((item, index) => (
            <div
              key={`reference-${index}`}
              className="grid grid-cols-12 gap-2 items-center p-3 border rounded-md bg-gray-50"
            >
              {/* Time Span Reference Selection - shows timeSpanUp items */}
              <div className="col-span-2">
                <FormControl fullWidth size="small">
                  <InputLabel>Time Span Reference</InputLabel>
                  <Select
                    value={item?.timeSpanUpId?.toString()}
                    onChange={(event: SelectChangeEvent) =>
                      updateItem(index, "timeSpanUpId", event.target.value)
                    }
                    label="Time Span Reference"
                    displayEmpty
                    renderValue={(selected) => {
                      const selectedIndex = parseInt(selected);
                      if (
                        timeSpanUp &&
                        selectedIndex >= 0 &&
                        selectedIndex < timeSpanUp.length
                      ) {
                        const timeSpanItem = timeSpanUp[selectedIndex];
                        return (
                          timeSpanItem.timeSpanName ||
                          `Time Span ${selectedIndex + 1}`
                        );
                      }
                      return <em>Select Time Span Reference</em>;
                    }}
                    sx={{
                      "& .MuiSelect-select": {
                        fontSize: "0.875rem",
                        padding: "8px 12px",
                      },
                    }}
                  >
                    {(timeSpanUp || []).map((timeSpanItem, tsIndex) => (
                      <MenuItem key={tsIndex} value={tsIndex.toString()}>
                        {timeSpanItem.timeSpanName ||
                          `Time Span ${tsIndex + 1}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Cal Unit */}
              <div className="col-span-1">
                <TextField
                  type="number"
                  size="small"
                  value={item.calculateUnit || ""}
                  onChange={(e) =>
                    updateItem(index, "calculateUnit", e.target.value)
                  }
                  placeholder="Cal Unit"
                  inputProps={{ min: 0 }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.875rem",
                      padding: "8px 12px",
                    },
                  }}
                />
              </div>

              {/* Accumulation Type */}
              <div className="col-span-2">
                <FormControl fullWidth size="small">
                  <InputLabel>Accumulation Item Type</InputLabel>
                  <Select
                    value={item.acctItemTypeId?.toString() || ""}
                    onChange={(event: SelectChangeEvent) =>
                      updateItem(index, "acctItemTypeId", event.target.value)
                    }
                    label="Accum Type"
                    disabled={loading}
                    sx={{
                      "& .MuiSelect-select": {
                        fontSize: "0.875rem",
                        padding: "8px 12px",
                      },
                    }}
                  >
                    {accumTypeList.map((accumType) => (
                      <MenuItem
                        key={accumType.resourceId}
                        value={accumType.resourceId.toString()}
                      >
                        {accumType.resourceName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-start">
                <IconButton
                  size="small"
                  onClick={() => removeReference(index)}
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
          No reference accumulation added yet. Click "Add" to create one.
        </div>
      )}
    </div>
  );
};

export default AccumulationCalculationComponent;
