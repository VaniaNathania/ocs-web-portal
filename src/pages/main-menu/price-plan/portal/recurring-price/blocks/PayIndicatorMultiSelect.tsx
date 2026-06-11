import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, X, Check } from "lucide-react";

interface PayIndicatorOption {
  id: string;
  label: string;
  bit: number; // for positions in binary string
}

interface PayIndicatorMultiSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const payIndicatorOptions: PayIndicatorOption[] = [
  { id: "balance_share", label: "Balance Share Not Allowed", bit: 2 },
  {
    id: "subscription_account",
    label: "Subscription Account Not Allowed",
    bit: 1,
  },
  { id: "default_account", label: "Default Account Not Allowed", bit: 0 },
];

const PayIndicatorMultiSelect: React.FC<PayIndicatorMultiSelectProps> = ({
  value = "000",
  onChange,
  placeholder = "Select pay indicators...",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert binary string to selected options
  const binaryToSelectedOptions = (binaryStr: string): string[] => {
    const selected: string[] = [];
    const binary = binaryStr.padStart(3, "0");

    payIndicatorOptions.forEach((option) => {
      const bitPosition = 2 - option.bit; // reverse because we read left to right
      if (binary[bitPosition] === "1") selected.push(option.id);
    });

    return selected;
  };

  // Convert selected options to binary string
  const selectedOptionsToBinary = (selected: string[]): string => {
    const binaryArray = ["0", "0", "0"];
    selected.forEach((optionId) => {
      const option = payIndicatorOptions.find((opt) => opt.id === optionId);
      if (option) {
        const bitPosition = 2 - option.bit;
        binaryArray[bitPosition] = "1";
      }
    });
    return binaryArray.join("");
  };

  useEffect(() => {
    setSelectedOptions(binaryToSelectedOptions(value));
  }, [value]);

  const toggleOption = (optionId: string) => {
    if (disabled) return;
    const newSelected = selectedOptions.includes(optionId)
      ? selectedOptions.filter((id) => id !== optionId)
      : [...selectedOptions, optionId];

    setSelectedOptions(newSelected);
    onChange(selectedOptionsToBinary(newSelected));
  };

  const removeOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleOption(optionId);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSelectedLabels = () =>
    selectedOptions
      .map(
        (id) => payIndicatorOptions.find((opt) => opt.id === id)?.label || ""
      )
      .filter(Boolean);

  const selectedLabels = getSelectedLabels();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`
          w-full min-h-[44px] px-3 py-2 border rounded-lg bg-white
          flex items-center justify-between cursor-pointer transition-colors
          ${disabled ? "bg-gray-100 border-gray-200 cursor-not-allowed" : "border-gray-300 hover:border-gray-400 focus-within:border-blue-500"}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label, idx) => {
              const option = payIndicatorOptions.find(
                (opt) => opt.label === label
              );
              return (
                <span
                  key={option?.id || idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full"
                >
                  {label}
                  {!disabled && (
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-blue-900"
                      onClick={(e) => removeOption(option!.id, e)}
                    />
                  )}
                </span>
              );
            })
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={"w-4 h-4 text-gray-400 ml-2"} />
      </div>

      {/* <div className="text-xs text-gray-500 mt-1">Value: {value}</div> */}

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="max-h-48 overflow-y-auto">
            {payIndicatorOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={`
                    px-3 py-2 flex items-center justify-between cursor-pointer
                    ${isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}
                  `}
                  onClick={() => toggleOption(option.id)}
                >
                  <span className="text-sm">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              );
            })}
          </div>

          {selectedOptions.length > 0 && (
            <div className="border-t border-gray-200">
              <button
                type="button"
                className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                onClick={() => {
                  setSelectedOptions([]);
                  onChange("000");
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayIndicatorMultiSelect;
