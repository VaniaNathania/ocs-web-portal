import { useEffect, useRef, useState } from "react";
import { FeatureData } from "@/pages/main-menu/offer/main-product/components/DetailCategoryContent/FeatureTabContent";
import { KeenIcon } from "@/components";

interface MultiSelectDropdownProps {
  feature: FeatureData;
  selectedValues: string[];
  defaultValue: string | null;
  onValuesChange: (values: string[]) => void;
  onDefaultValueChange: (value: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ feature, selectedValues, defaultValue, onValuesChange, onDefaultValueChange, isOpen, setIsOpen }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tempSelectedValues, setTempSelectedValues] = useState<string[]>([]);
  const [tempDefaultValue, setTempDefaultValue] = useState<string | null>(null);

  // Sync temporary state saat dropdown dibuka
  useEffect(() => {
    if (isOpen) {
      setTempSelectedValues([...selectedValues]);
      setTempDefaultValue(defaultValue);
    }
  }, [isOpen, selectedValues, defaultValue]);
  
  const handleToggleValue = (value: string) => {
    let newValues;
    if (tempSelectedValues.includes(value)) {
      newValues = tempSelectedValues.filter((v) => v !== value);
      setTempSelectedValues(newValues);

      if (tempDefaultValue === value) {
        setTempDefaultValue(null);
        onDefaultValueChange(null); 
      }
    } else {
      newValues = [...tempSelectedValues, value];
      setTempSelectedValues(newValues);
    }

    onValuesChange(newValues);
  };

  const handleSetDefault = (value: string) => {
    setTempDefaultValue(value);
    onDefaultValueChange(value); 
  };

  useEffect(() => {
    if (isOpen) {
      // Simpan reference ke methods ini agar parent bisa panggil
      (dropdownRef.current as any)?.setAttribute("data-commit", "ready");
    }
  }, [isOpen, tempSelectedValues, tempDefaultValue]);

  const getDisplayText = () => {
    if (selectedValues.length === 0) return "-- Please select --";
    const selectedItems = feature.attrValueList?.filter((item) => selectedValues.includes(String(item.value))) || [];
    return selectedItems.map((item) => item.valueMark).join(", ");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button untuk toggle dropdown */}
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-3 py-1.5 text-left border border-gray-300 rounded bg-white hover:border-gray-400 flex items-center justify-between">
        <span className="truncate text-sm">{getDisplayText()}</span>
        <KeenIcon icon={isOpen ? "up" : "down"} className="ml-2" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-[300px] mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-96 flex">
          {/* Feature Values Column */}
          <div className="flex-1 border-r overflow-y-auto">
            <div className="px-3 py-2 bg-gray-50 font-medium text-sm border-b">Feature Values</div>
            <div className="p-2">
              {feature.attrValueList?.map((item) => {
                const isSelected = tempSelectedValues.includes(String(item.value));
                return (
                  <label key={item.attrValueId} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded">
                    <input type="checkbox" value={String(item.value)} checked={isSelected} onChange={() => handleToggleValue(String(item.value))} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <span className="text-sm">{item.valueMark}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Default Value Column */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 bg-gray-50 font-medium text-sm border-b">Default Value</div>
            <div className="p-2">
              {tempSelectedValues.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-4">Select feature values first</div>
              ) : (
                feature.attrValueList
                  ?.filter((item) => tempSelectedValues.includes(String(item.value)))
                  .map((item) => {
                    const isDefault = tempDefaultValue === String(item.value);
                    return (
                      <label key={`default-${item.attrValueId}`} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded">
                        <input
                          type="radio"
                          name={`default-${feature.attrId}`}
                          value={String(item.value)}
                          checked={isDefault}
                          onChange={() => handleSetDefault(String(item.value))}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm">Default value</span>
                      </label>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
