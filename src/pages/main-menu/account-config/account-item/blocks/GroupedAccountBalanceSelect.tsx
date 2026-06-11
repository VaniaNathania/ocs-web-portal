import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";

const API_URL = apiConfig.service_price_plan;

interface SearchBalancedType {
  acctResId: number;
  balType: number;
  balTypeName: string;
  acctResName: string;
  refillable: string;
  unitTypeId: number | null;
  unitTypeName?: string | null;
}

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const SearchableGroupedBalanceSelect: React.FC<Props> = ({
  value,
  onValueChange,
  placeholder = "Select Account Balance Type",
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [listBalanceType, setListBalanceType] = useState<SearchBalancedType[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const { GetData } = useCallApi();

  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const fetchBalanceType = useCallback(
    async (acctResName = "") => {
      try {
        setIsLoading(true);
        const params: Record<string, any> = {
          page: 1,
          size: 100,
          order_field: "ACCT_RES_ID",
          order_direction: "DESC",
        };
        if (acctResName.trim()) params.acctResName = acctResName.trim();

        const res: any = await GetData(
          `${API_URL}/account-balance/balance-type-with-mvno`,
          params
        );
        setListBalanceType(res?.data ?? []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch balance type");
      } finally {
        setIsLoading(false);
      }
    },
    [GetData]
  );

  useEffect(() => {
    if (debouncedSearchTerm.trim().length === 0) {
      fetchBalanceType();
    } else if (debouncedSearchTerm.trim().length >= 3) {
      fetchBalanceType(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, fetchBalanceType]);

  const groupedData = useMemo(() => {
    return listBalanceType.reduce<Record<string, SearchBalancedType[]>>(
      (groups, item) => {
        if (!groups[item.balTypeName]) groups[item.balTypeName] = [];
        groups[item.balTypeName].push(item);
        return groups;
      },
      {}
    );
  }, [listBalanceType]);

  return (
    <Select
      value={value}
      onValueChange={(val) => onValueChange(val)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className="max-h-[300px] overflow-y-auto">
        {/* Input search */}
        <div className="p-2 sticky top-0 bg-white z-10 border-b">
          <Input
            placeholder="Search balance type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            className="h-8 text-sm"
            autoComplete="off"
            autoFocus
          />
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Loading...
          </div>
        ) : Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            No data found
          </div>
        ) : (
          Object.entries(groupedData).map(([balTypeName, items]) => (
            <SelectGroup key={balTypeName}>
              <SelectLabel className="text-red-600 font-semibold py-2 pl-3">
                {balTypeName}
              </SelectLabel>
              {items.map((item) => (
                <SelectItem
                  key={item.acctResId}
                  value={item.acctResId.toString()}
                  className="pl-6 py-2 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span>{item.acctResName}</span>
                    {item.unitTypeName && (
                      <span className="text-xs text-gray-500">
                        {item.unitTypeName}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default SearchableGroupedBalanceSelect;
