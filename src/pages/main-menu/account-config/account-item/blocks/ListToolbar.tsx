import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useAccountItemContext from "../hooks/useAccountItemContext";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const ListToolbar = () => {
  const { showDialog, handleShowDialog } = useAccountItemContext();
  const { menuPrivAccess } = useAccountConfigLayout();
  const { reload, table } = useDataGrid();
  const [searchValue, setSearchValue] = useState<string>(
    (table.getColumn("acctResName")?.getFilterValue() as string) ?? "",
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      table.getColumn("acctResName")?.setFilterValue(searchValue);
      table.setPageIndex(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchValue, table]);

  return (
    <div className="px-5 py-4 border-b-0 card-header">
      <div className="flex flex-col w-full gap-4 sm:flex-row">
        {/* Search Section */}
        <div className="flex-1 min-w-0">
          <label className="flex items-center w-full max-w-md gap-2 input input-sm">
            <KeenIcon
              icon="magnifier"
              className="flex-shrink-0 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Account Item"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 min-w-0"
            />
          </label>
        </div>

        {/* Actions Section */}
        <div className="flex items-center flex-shrink-0 gap-3">
          <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
            <Button
              variant={"outline"}
              size="sm"
              onClick={() => handleShowDialog(true, "create", null)}
              className="text-white bg-red-500 whitespace-nowrap hover:text-white hover:bg-red-600"
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
  );
};

export default ListToolbar;
