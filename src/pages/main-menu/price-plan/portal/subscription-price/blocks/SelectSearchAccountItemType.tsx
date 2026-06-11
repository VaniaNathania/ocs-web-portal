import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { AcctConfService } from "@/common/api/account-config/endpoints";

// Hook untuk debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

interface AccountItemOption {
  label: string;
  value: number;
}

interface AccountItemSearchSelectProps {
  value?: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  initialData?: {
    id?: number;
    acctResId?: number;
    acctItemTypeName?: string;
    acctResName?: string;
  }[];
}

type RawAccountItemOption = {
  id?: number;
  acctResId?: number;
  acctItemTypeName?: string;
  acctResName?: string;
};

const AccountItemSearchSelect: React.FC<AccountItemSearchSelectProps> = ({
  value,
  onChange,
  placeholder = "Search account item type...",
  disabled = false,
  className = "",
  error = false,
  initialData = [],
}) => {
  const { GET_ACCT_ITEM_TYPE } = AcctConfService();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<AccountItemOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<AccountItemOption | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mapOption = (item: RawAccountItemOption): AccountItemOption | null => {
    const rawValue = item.id ?? item.acctResId;
    const label = item.acctItemTypeName ?? item.acctResName;

    if (typeof rawValue !== "number" || !label) {
      return null;
    }

    return {
      label,
      value: rawValue,
    };
  };

  // API fetch
  const fetchAcctItemType = async (
    search: string
  ): Promise<AccountItemOption[]> => {
    try {
      const response = await GET_ACCT_ITEM_TYPE({
        acctItemTypeName: search || "",
        page: 1,
        size: 100,
        sortBy: "BAL_TYPE",
        sortDirection: "ASC",
        spId: 0,
      });

      if (response.status) {
        return response.data.map((item: any) => ({
          label: item.acctResName ?? item.acctItemTypeName,
          value: item.acctResId,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching account item types:", error);
      return [];
    }
  };

  // Fetch data kalau dropdown buka & ada search
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      setLoading(true);
      try {
        // kalau kosong, ambil semua data
        const mappedOptions = await fetchAcctItemType(
          debouncedSearchTerm || ""
        );
        setOptions(mappedOptions);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    // jalan tiap kali buka dropdown / ganti search
    fetchData();
  }, [debouncedSearchTerm, isOpen]);

  // Handle click luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else {
          setSearchTerm("");
        }
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption]);

  // Sinkronisasi value → selectedOption
  useEffect(() => {
    if (value) {
      let selected: AccountItemOption | null =
        options.find((opt) => opt.value === value) ?? null;

      if (!selected && initialData.length > 0) {
        const initialItem = initialData.find(
          (item) => (item.id ?? item.acctResId) === value
        );
        if (initialItem) {
          selected = mapOption(initialItem);
        }
      }

      setSelectedOption(selected || null);

      if (selected && !isOpen && searchTerm !== selected.label) {
        setSearchTerm(selected.label);
      }
    } else {
      setSelectedOption(null);
      if (!isOpen && searchTerm !== "") {
        setSearchTerm("");
      }
    }
  }, [value, options, initialData, isOpen, searchTerm]);

  // Initial fetch kalau ada value tapi belum ada option
  useEffect(() => {
    const fetchInitialData = async () => {
      if (value && !selectedOption && options.length === 0) {
        setLoading(true);
        try {
          const mappedOptions = await fetchAcctItemType("");
          const selected = mappedOptions.find((opt) => opt.value === value);
          if (selected) {
            setSelectedOption(selected);
            setSearchTerm(selected.label);
          }
        } finally {
          setLoading(false);
        }
      }
    };
    fetchInitialData();
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleOptionClick = (option: AccountItemOption) => {
    setSelectedOption(option);
    setSearchTerm(option.label);
    setIsOpen(false);
    onChange(option.value);
  };

  const handleClear = () => {
    setSelectedOption(null);
    setSearchTerm("");
    setOptions([]);
    onChange(null);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    }
    if (options.length === 0 && !searchTerm) {
      // trigger fetch kosong sekali
      setSearchTerm("");
    }
  };

  const displayValue = searchTerm;

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          className={`
            w-full pl-10 pr-12 py-2 border rounded-md transition-colors
            ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
            }
            ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
            placeholder-gray-400 focus:outline-none focus:ring-2
          `}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          autoComplete="off"
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {selectedOption && !disabled && (
            <button
              type="button"
              className="p-1 mr-1 hover:bg-gray-100 rounded transition-colors"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}

          <div className="p-2">
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Loading...
            </div>
          )}

          {!loading && options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : "No data available"}
            </div>
          )}

          {!loading && options.length > 0 && (
            <div className="py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`
                    w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors
                    ${selectedOption?.value === opt.value ? "bg-blue-100 text-blue-900" : "text-gray-900"}
                  `}
                  onClick={() => handleOptionClick(opt)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountItemSearchSelect;
