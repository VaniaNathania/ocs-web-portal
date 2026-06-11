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

export interface RankUp {
  timeSpanUpId: number | null; // Changed to allow null
  calculationUnit: number;
  adjustMethod: string;
  price: string;
  rangeEffVal: number;
  rangeExpVal: number;
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

interface RankUpProps {
  data: RankUp[];
  onChange: (data: RankUp[]) => void;
  timeSpanUp: TimeSpanUp[] | null;
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const RankUpComponent: React.FC<RankUpProps> = ({
  data,
  onChange,
  timeSpanUp = [],
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
        {},
      );
      //  console.log("AccumType API Response:", response);
      setAccumTypeList(response?.data || []);
    } catch (error) {
      console.error("Failed to fetch accumulation list:", error);
      setAccumTypeList([]);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index: number, field: keyof RankUp, value: any) => {
    const newData = [...data];

    // Handle type conversions based on field types
    if (field === "rangeEffVal" || field === "rangeExpVal") {
      value = parseFloat(value) || 0;
    } else if (field === "calculationUnit") {
      value = parseInt(value) || 0;
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
    const newItem: RankUp = {
      timeSpanUpId: !timeSpanUp || timeSpanUp.length === 0 ? null : 0, // Set null if no timeSpanUp
      calculationUnit: 0,
      rangeEffVal: 0,
      rangeExpVal: 0,
      price: "",
      adjustMethod: "",
    };
    onChange([...data, newItem]);
  };

  const removeReference = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  // Check if timeSpanUp is available and has data
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
        >
          Add
        </Button>
      </div>

      {data.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 px-2">
            <div className="col-span-2">Time Span Reference</div>
            <div className="col-span-2">Cal Unit</div>
            <div className="col-span-1">Range Eff</div>
            <div className="col-span-1">Range Exp</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Adjust Method</div>
            <div className="col-span-1">Actions</div>
          </div>

          {data.map((item, index) => (
            <div
              key={`reference-${index}`}
              className="grid grid-cols-12 gap-2 items-center p-3 border rounded-md bg-gray-50"
            >
              {/* Time Span Reference Selection */}
              <div className="col-span-2">
                <FormControl fullWidth size="small">
                  <InputLabel>Time Span Reference</InputLabel>
                  <Select
                    value={
                      item.timeSpanUpId !== null
                        ? item.timeSpanUpId.toString()
                        : "null"
                    }
                    onChange={(event: SelectChangeEvent) =>
                      updateItem(index, "timeSpanUpId", event.target.value)
                    }
                    label="Time Span Reference"
                    displayEmpty
                    disabled={!hasTimeSpanUp} // Disable if no timeSpanUp data
                    renderValue={(selected) => {
                      if (!hasTimeSpanUp) {
                        return (
                          <em style={{ color: "#999" }}>
                            No Time Span Available
                          </em>
                        );
                      }

                      if (selected === "null" || selected === "") {
                        return <em>Select Time Span Reference</em>;
                      }

                      const selectedIndex = parseInt(selected);
                      if (
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
                    {!hasTimeSpanUp ? (
                      <MenuItem value="null" disabled>
                        <em>No Time Span Available</em>
                      </MenuItem>
                    ) : (
                      [
                        <MenuItem key="null" value="null">
                          <em>None</em>
                        </MenuItem>,
                        ...timeSpanUp.map((timeSpanItem, tsIndex) => (
                          <MenuItem key={tsIndex} value={tsIndex.toString()}>
                            {timeSpanItem.timeSpanName ||
                              `Time Span ${tsIndex + 1}`}
                          </MenuItem>
                        )),
                      ]
                    )}
                  </Select>
                </FormControl>
              </div>

              {/* Cal Unit */}
              <div className="col-span-2">
                <TextField
                  type="number"
                  size="small"
                  value={item.calculationUnit || ""}
                  onChange={(e) =>
                    updateItem(index, "calculationUnit", e.target.value)
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

              {/* Range Eff Value */}
              <div className="col-span-1">
                <TextField
                  type="number"
                  size="small"
                  value={item.rangeEffVal || ""}
                  onChange={(e) =>
                    updateItem(index, "rangeEffVal", e.target.value)
                  }
                  placeholder="Range Eff"
                  inputProps={{ step: "0.01" }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.875rem",
                      padding: "8px 12px",
                    },
                  }}
                />
              </div>

              {/* Range Exp Value */}
              <div className="col-span-1">
                <TextField
                  type="number"
                  size="small"
                  value={item.rangeExpVal || ""}
                  onChange={(e) =>
                    updateItem(index, "rangeExpVal", e.target.value)
                  }
                  placeholder="Range Exp"
                  inputProps={{ step: "0.01" }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.875rem",
                      padding: "8px 12px",
                    },
                  }}
                />
              </div>

              {/* Price */}
              <div className="col-span-2">
                <TextField
                  size="small"
                  value={item.price || ""}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  placeholder="Price"
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "0.875rem",
                      padding: "8px 12px",
                    },
                  }}
                />
              </div>

              {/* Adjust Method */}
              <div className="col-span-2">
                <FormControl fullWidth size="small">
                  <InputLabel>Adjust Method</InputLabel>
                  <Select
                    value={item.adjustMethod || ""}
                    onChange={(event: SelectChangeEvent) =>
                      updateItem(index, "adjustMethod", event.target.value)
                    }
                    label="Adjust Method"
                    sx={{
                      "& .MuiSelect-select": {
                        fontSize: "0.875rem",
                        padding: "8px 12px",
                      },
                    }}
                  >
                    <MenuItem value="F">Fixed Value</MenuItem>
                    <MenuItem value="P">Permillage</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end">
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

export default RankUpComponent;
