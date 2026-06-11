import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useAccountBalanceContext from "../hooks/useAccountBalanceContext";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const ListToolbar = () => {
  const { reload, table } = useDataGrid();
  const { handleShowDialog } = useAccountBalanceContext();
  const { menuPrivAccess } = useAccountConfigLayout();

  const [searchType, setSearchType] = useState<
    "acctResId" | "acctResName" | "both"
  >("acctResName");
  const [acctResIdValue, setAcctResIdValue] = useState<string>("");
  const [acctResNameValue, setAcctResNameValue] = useState<string>("");

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchType === "acctResId") {
        table.getColumn("acctResId")?.setFilterValue(acctResIdValue);
        table.getColumn("acctResName")?.setFilterValue("");
      } else if (searchType === "acctResName") {
        table.getColumn("acctResName")?.setFilterValue(acctResNameValue);
        table.getColumn("acctResId")?.setFilterValue("");
      } else if (searchType === "both") {
        table.getColumn("acctResId")?.setFilterValue(acctResIdValue);
        table.getColumn("acctResName")?.setFilterValue(acctResNameValue);
      }
      table.setPageIndex(0);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [acctResIdValue, acctResNameValue, searchType, table]);

  const handleSearchTypeChange = (
    type: "acctResId" | "acctResName" | "both",
  ) => {
    setSearchType(type);
    // Reset values when changing search type
    if (type !== "acctResId" && type !== "both") {
      setAcctResIdValue("");
    }
    if (type !== "acctResName" && type !== "both") {
      setAcctResNameValue("");
    }
  };

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-3 w-2/3">
            {/* Search Type Selector */}
            <select
              className="select select-sm w-40"
              value={searchType}
              onChange={(e) => handleSearchTypeChange(e.target.value as any)}
            >
              <option value="acctResName">By Name</option>
              <option value="acctResId">By ID</option>
              <option value="both">By ID & Name</option>
            </select>

            {/* Search Inputs */}
            {(searchType === "acctResId" || searchType === "both") && (
              <label className="input input-sm w-48 overflow-hidden">
                <KeenIcon icon="magnifier" />
                <input
                  type="text"
                  placeholder="Search by ID"
                  value={acctResIdValue}
                  onChange={(e) => setAcctResIdValue(e.target.value)}
                />
              </label>
            )}

            {(searchType === "acctResName" || searchType === "both") && (
              <label className="input input-sm w-64 overflow-hidden">
                <KeenIcon icon="magnifier" />
                <input
                  type="text"
                  placeholder="Search by Name"
                  value={acctResNameValue}
                  onChange={(e) => setAcctResNameValue(e.target.value)}
                />
              </label>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
              <Button
                onClick={() => handleShowDialog(true, "create", null, null)}
                className="text-white bg-red-500 whitespace-nowrap hover:text-white hover:bg-red-600"
                size="sm"
              >
                <KeenIcon icon="plus" className="mr-2" />
                Add Data
              </Button>
            </AccessWrapper>

            <DefaultTooltip title="Refresh" placement="top">
              <Button
                variant="outline"
                size="sm"
                onClick={() => reload()}
                className="p-2"
              >
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListToolbar;
