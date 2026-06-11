import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useContext } from "react";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { usePricePlanLayout } from "@/layouts/main-menu/price-plan";
import { PricePlanListContext } from "../hooks/PricePlanContext";

// Custom useDebounce hook
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

type LoadingButton = "reset" | "refresh" | null;
type SearchType = "name" | "code";

const ListToolBar = () => {
  const { table, reload } = useDataGrid();
  const { menuPrivAccess } = usePricePlanLayout();
  const {
    handleAddDialog,
    handleAddAccountDialog,
    applyLevel,
    handleShowPriorityTable,
    setIsSearching,
  } = useContext(PricePlanListContext);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<LoadingButton>(null);
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [searchValue, setSearchValue] = useState<string>("");

  // Debounced value untuk search
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const handleResetData = () => {
    setSearchValue("");
    setSearchType("name");
    table.setColumnFilters([]);
    setIsSearching(false);
    reload();
  };

  const handleAddClick = () => {
    handleAddDialog(true);
  };

  // Effect untuk update isSearching status
  useEffect(() => {
    setIsSearching(searchValue.trim().length > 0);
  }, [searchValue, setIsSearching]);

  // Effect untuk otomatis update columnFilters berdasarkan searchType dan debounced value
  useEffect(() => {
    const filters = [];

    if (debouncedSearchValue.trim()) {
      if (searchType === "name") {
        filters.push({
          id: "pricePlanName",
          value: debouncedSearchValue.trim(),
        });
      } else {
        filters.push({
          id: "pricePlanCode",
          value: debouncedSearchValue.trim(),
        });
      }
    }

    // Update column filters yang akan trigger API call
    table.setColumnFilters(filters);
  }, [debouncedSearchValue, searchType, table]);

  // Reset search value ketika search type berubah
  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type);
    setSearchValue("");
    table.setColumnFilters([]);
  };

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between items-center">
        {/* Left Section - Search Filters */}
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-[60%]">
          {/* Search Type Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-7.5 w-32">
                <KeenIcon
                  icon={searchType === "name" ? "tag" : "code"}
                  className="mr-2"
                />
                {searchType === "name" ? "Name" : "Code"}
                <KeenIcon icon="down" className="ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              <DropdownMenuItem onClick={() => handleSearchTypeChange("name")}>
                <KeenIcon icon="tag" className="mr-2" />
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSearchTypeChange("code")}>
                <KeenIcon icon="code" className="mr-2" />
                Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Input */}
          <div className="flex w-full lg:w-1/3 gap-3 items-center">
            <label className="input input-sm w-full flex items-center gap-2">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder={
                  searchType === "name"
                    ? "Search by Price Plan Name..."
                    : "Search by Price Plan Code..."
                }
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full"
              />
            </label>
          </div>

          {/* Reset Button */}
          <div className="flex gap-2 items-center">
            <DefaultTooltip title="Reset Filter" placement="top">
              <Button
                variant="outline"
                className="h-7.5 disabled:bg-gray-400"
                disabled={isLoading}
                onClick={handleResetData}
              >
                <KeenIcon icon="arrow-circle-left" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex gap-3">
          <AccessWrapper
            hasAccess={menuPrivAccess?.editStatus}
            enabledText="Priority Table"
          >
            {/* <DefaultTooltip title="Priority Table" placement="top"> */}
            <Button
              variant="outline"
              className="h-7.5"
              onClick={() => handleShowPriorityTable(true)}
            >
              Adjust Priority
            </Button>
            {/* </DefaultTooltip> */}
          </AccessWrapper>
          <AccessWrapper
            hasAccess={menuPrivAccess?.addStatus ?? false}
            enabledText="New Data"
          >
            {/* <DefaultTooltip title="New Data" placement="top"> */}
            <Button
              variant="outline"
              className="h-7.5"
              onClick={handleAddClick}
            >
              <KeenIcon icon="plus" />
              New
            </Button>
            {/* </DefaultTooltip> */}
          </AccessWrapper>

          <DefaultTooltip title="Refresh" placement="top">
            <Button
              variant="outline"
              className="h-7.5"
              onClick={() => reload()}
            >
              <KeenIcon icon="arrows-circle" />
            </Button>
          </DefaultTooltip>
        </div>
      </div>
    </div>
  );
};

export { ListToolBar };
