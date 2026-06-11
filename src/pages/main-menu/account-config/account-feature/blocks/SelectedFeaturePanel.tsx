import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

interface Props {
  selectedDisplay: ISelectedFeatureDisplay[];
  onRemove: (id: number) => void;
  onClearAll: () => void;
  onAttrValueChange: (attrId: number, value: string | null) => void;
  isFetching?: boolean;
}

const SelectedFeaturePanel = ({
  selectedDisplay,
  onRemove,
  onClearAll,
  onAttrValueChange,
  isFetching = false,
}: Props) => {
  const { watch } = useFormContext();

  const formValues = watch("acctAttrRequestDtos") || [];

  // Get current attrValue dari form untuk attrId tertentu
  const getAttrValue = (attrId: number): string | null => {
    const item = formValues.find((f: any) => f.attrId === attrId);
    return item?.attrValue || null;
  };

  const renderInputField = (featureDisplay: ISelectedFeatureDisplay) => {
    const currentValue = getAttrValue(featureDisplay.attrId);
    // const isRequired = featureDisplay.nullable === "N";

    return (
      <div className="space-y-2">
        {/* <div className="space-y-1">
          {isRequired && (
            <span className="text-xs text-red-500">* Required</span>
          )}
        </div> */}

        {featureDisplay.attrValueOptions &&
          featureDisplay.attrValueOptions.length > 0 && (
            <Select
              value={currentValue || ""}
              onValueChange={(value) =>
                onAttrValueChange(featureDisplay.attrId, value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select from suggested values..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">None</SelectItem>
                {featureDisplay.attrValueOptions.map((option) => (
                  <SelectItem
                    key={option.attrValueId}
                    value={option.valueMark || ""}
                  >
                    {option.valueMark}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-hidden border border-gray-300 rounded-lg bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-300 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">
          Selected Feature ({selectedDisplay.length})
        </h3>
        {selectedDisplay.length > 0 && (
          <button
            onClick={onClearAll}
            className="px-3 py-1 text-sm text-red-600 transition-colors rounded hover:text-red-800 hover:bg-red-50"
            disabled={isFetching}
          >
            Clear
          </button>
        )}
      </div>

      <div className="overflow-y-auto max-h-[420px] p-2">
        {selectedDisplay.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {isFetching ? "Loading features..." : "No record to view"}
          </div>
        ) : (
          selectedDisplay.map((item) => (
            <div
              key={item.attrId}
              className="p-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">
                      {item.attrName}
                    </span>
                    {/* {item.nullable === "N" && (
                      <span className="px-1.5 py-0.5 text-xs font-medium text-red-600 bg-red-50 rounded">
                        Required
                      </span>
                    )} */}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.attrCode} • Type: {item.inputType}
                  </p>
                  {item.comments && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {item.comments}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemove(item.attrId)}
                  className="p-1 text-gray-400 transition-colors rounded hover:text-red-500 hover:bg-red-50"
                  disabled={isFetching}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3">{renderInputField(item)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SelectedFeaturePanel;
