import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState } from "react";
import useTcelBalanceAdjustmentContext from "../hooks/useTcelBalanceAjustmentContext";
import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";
import { log } from "console";

interface ListToolbarProps {
  onSearch: (acctNbr: string) => void;
  onClear: () => void;
  currentAcctNbr?: string;
}

export const ListToolbar = ({
  onSearch,
  onClear,
  currentAcctNbr = "",
}: ListToolbarProps) => {
  const [searchValue, setSearchValue] = useState(currentAcctNbr);

  const {
    showAdvancedSearchDialog,
    handleAdvancedSearchDialog,
    handleShowDialog,
    menuPrivAccess,
  } = useTcelBalanceAdjustmentContext();

  
  const { reload } = useDataGrid();

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  const handleClear = () => {
    setSearchValue("");
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-sm flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <input
            placeholder="Enter Account Number..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full input input-sm pr-8"
          />

          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          onClick={handleSearch}
          size="sm"
          variant={"outline"}
          disabled={!searchValue.trim()}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>

        <Button
          onClick={() => handleAdvancedSearchDialog(true)}
          size="sm"
          variant="outline"
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white hover:text-slate-100"
        >
          <Search className="h-4 w-4" />
          Advanced Search
        </Button>

        {/* Add Data */}
        <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white hover:text-slate-100"
            onClick={() => handleShowDialog(true, "create", null)}
            disabled={!currentAcctNbr || currentAcctNbr === ""}
          >
            <KeenIcon icon="plus" className="h-4 w-4" />
            Add Data
          </Button>
        </AccessWrapper>
      </div>

      {/* Refresh Button */}
      <DefaultTooltip title="Refresh" placement="top">
        <Button variant="outline" className="h-7.5" onClick={reload}>
          <KeenIcon icon="arrows-circle" />
        </Button>
      </DefaultTooltip>
    </div>
  );
};
