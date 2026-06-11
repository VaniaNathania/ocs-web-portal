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

export interface AccumulationPrice {
  timeSpanUpId: number | null;
  calculateUnit: number;
  adjustMethod: string;
  acctItemTypeId: number | null;
  price: string;
  rangeEffVal: number;
  rangeExpVal: number;
  isConfirmed?: boolean;
}

interface TimeSpanUp {
  timeSpanId: number;
  calculationMethod: string;
  calculationUnit: number;
  price?: string;
  timeSpanName?: string;
  priority?: number;
}

interface AccumTypeList {
  resourceId: number;
  resourceName: string;
  reAttrId?: number;
}

interface AccumulationPriceProps {
  data: AccumulationPrice[];
  onChange: (data: AccumulationPrice[]) => void;
  timeSpanUp: TimeSpanUp[] | null;
  priceId?: string | null;
  onEditingChange?: (isEditing: boolean) => void;
}

interface ExistingAccumulationPrice {
  timeSpanUpId: number | null;
  timeSpanName: string;
  calculateUnit: number;
  adjustMethod: string;
  acctItemTypeId: number | null;
  price: string;
  effValue: number;
  expValue: number;
  timeSpanUpPriority: number;
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const AccumulationPriceComponent: React.FC<AccumulationPriceProps> = ({
  data,
  onChange,
  timeSpanUp = [],
  priceId,
  onEditingChange,
}) => {
  const [accumTypeList, setAccumTypeList] = useState<AccumTypeList[]>([]);
  const [loading, setLoading] = useState(false);
  const { GetData } = useCallApi();
  const [existingDataLoaded, setExistingDataLoaded] = useState(false);

  // Track errors for each item
  const [errors, setErrors] = useState<Record<number, Record<string, boolean>>>(
    {}
  );

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

  const getAccumulationPriceDetail = async () => {
    try {
      setLoading(true);
      const response = await GetData(
        `${API_URL_PRICE_PLAN}/rankprice/acm-up/${priceId}`,
        {}
      );
      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const existingData: AccumulationPrice[] = response.data.map(
          (item: ExistingAccumulationPrice) => ({
            timeSpanUpId: item.timeSpanUpPriority,
            calculateUnit: item.calculateUnit,
            adjustMethod: item.adjustMethod,
            acctItemTypeId: item.acctItemTypeId,
            price: item.price,
            rangeEffVal: item.effValue,
            rangeExpVal: item.expValue,
            isConfirmed: true, // Existing data is already confirmed
          })
        );
        onChange(existingData);
        setExistingDataLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch AccumulationPrice list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (priceId && priceId !== "" && !existingDataLoaded) {
      getAccumulationPriceDetail();
    }
  }, [priceId, existingDataLoaded]);

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
    field: keyof AccumulationPrice,
    value: any
  ) => {
    const newData = [...data];

    if (field === "rangeEffVal" || field === "rangeExpVal") {
      const cleanValue = value.toString().replace(/[^0-9.]/g, "");
      newData[index] = {
        ...newData[index],
        [field]: parseFloat(cleanValue) || 0,
      };
      // Clear error when value is entered
      if (field === "rangeEffVal" && parseFloat(cleanValue) > 0) {
        clearError(index, field);
      }
    } else if (field === "calculateUnit") {
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
        acctItemTypeId: parseInt(cleanValue) || null,
      };
      // Clear error when value is selected
      if (parseInt(cleanValue) > 0) {
        clearError(index, field);
      }
    } else if (field === "timeSpanUpId") {
      // Handle timeSpanUpId using PRIORITY
      if (
        !timeSpanUp ||
        timeSpanUp.length === 0 ||
        value === "" ||
        value === "null"
      ) {
        value = null;
      } else {
        value = parseInt(value);
        // Validate that priority exists in timeSpanUp array
        const existingTimeSpan = timeSpanUp.find((ts) => ts.priority === value);
        if (!existingTimeSpan) {
          value = null;
        }
      }
      newData[index] = { ...newData[index], timeSpanUpId: value };
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
    } else if (field === "adjustMethod") {
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

  const addReference = () => {
    const defaultPriority = timeSpanUp?.[0]?.priority ?? null;

    const newItem: AccumulationPrice = {
      timeSpanUpId: defaultPriority,
      calculateUnit: 0,
      rangeEffVal: 0,
      rangeExpVal: 0,
      price: "",
      adjustMethod: "F",
      acctItemTypeId: null,
      isConfirmed: false,
    };
    onChange([...data, newItem]);
  };

  const removeReference = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const confirmItem = (index: number) => {
    const item = data[index];
    const newErrors: Record<string, boolean> = {};

    // Validasi sebelum confirm
    if (!item.acctItemTypeId || item.acctItemTypeId === 0) {
      toast.error("Please select accumulation type");
      newErrors.acctItemTypeId = true;
    }
    if (!item.rangeEffVal || item.rangeEffVal === 0) {
      toast.error("Please enter range effective value");
      newErrors.rangeEffVal = true;
    }
    if (!item.price || item.price === "") {
      toast.error("Please enter price");
      newErrors.price = true;
    }
    if (!item.adjustMethod || item.adjustMethod === "") {
      toast.error("Please select adjust method");
      newErrors.adjustMethod = true;
    }
    if (!item.calculateUnit || item.calculateUnit === 0) {
      toast.error("Please enter calculation unit");
      newErrors.calculateUnit = true;
    }
    if (
      (item.rangeEffVal ?? 0) > (item.rangeExpVal ?? 0) &&
      (item.rangeExpVal ?? 0) !== 0
    ) {
      toast("Exp value Must be Greater than Eff Value");
      newErrors.rangeExpVal = true;
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
            <div className="col-span-2">Time Span Ref</div>
            <div className="col-span-1">Cal Unit</div>
            <div className="col-span-1">Range Eff</div>
            <div className="col-span-1">Range Exp</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Adjust Method</div>
            <div className="col-span-2">Accumulation Type</div>
            <div className="col-span-1">Actions</div>
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
              {/* Time Span Reference - Using PRIORITY */}
              <div className="col-span-2">
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Time Span" />
                  </SelectTrigger>
                  <SelectContent>
                    {!hasTimeSpanUp ? (
                      <SelectItem value="null" disabled>
                        No Time Span Available
                      </SelectItem>
                    ) : (
                      [
                        <SelectItem key="null" value="null">
                          None
                        </SelectItem>,
                        ...timeSpanUp.map((timeSpanItem) => (
                          <SelectItem
                            key={timeSpanItem.priority}
                            value={timeSpanItem.priority?.toString() || ""}
                          >
                            {timeSpanItem.timeSpanName ||
                              `Priority ${timeSpanItem.priority}`}
                          </SelectItem>
                        )),
                      ]
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Cal Unit */}
              <div className="col-span-1">
                <Input
                  type="text"
                  value={item.calculateUnit?.toString() || ""}
                  onChange={(e) =>
                    updateItem(index, "calculateUnit", e.target.value)
                  }
                  disabled={item.isConfirmed}
                  placeholder="Unit"
                  className={
                    errors[index]?.calculateUnit
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
              </div>

              {/* Range Eff */}
              <div className="col-span-1">
                <Input
                  type="text"
                  value={item.rangeEffVal?.toString() || ""}
                  onChange={(e) =>
                    updateItem(index, "rangeEffVal", e.target.value)
                  }
                  disabled={item.isConfirmed}
                  placeholder="0"
                  className={
                    errors[index]?.rangeEffVal
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
              </div>

              {/* Range Exp */}
              <div className="col-span-1">
                <Input
                  className={
                    errors[index]?.rangeEffVal
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                  type="text"
                  value={item.rangeExpVal?.toString() || ""}
                  onChange={(e) =>
                    updateItem(index, "rangeExpVal", e.target.value)
                  }
                  disabled={item.isConfirmed}
                  placeholder="0"
                />
              </div>

              {/* Price */}
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

              {/* Adjust Method */}
              <div className="col-span-2">
                <Select
                  value={item.adjustMethod || ""}
                  onValueChange={(value) =>
                    updateItem(index, "adjustMethod", value)
                  }
                  disabled={item.isConfirmed}
                >
                  <SelectTrigger
                    className={`w-full ${errors[index]?.adjustMethod ? "border-red-500 focus:ring-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Fixed Value</SelectItem>
                    {/* <SelectItem value="P">Permilage</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

              {/* Accumulation Type */}
              <div className="col-span-2">
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
                    <SelectValue placeholder="Accum Type" />
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

export default AccumulationPriceComponent;
