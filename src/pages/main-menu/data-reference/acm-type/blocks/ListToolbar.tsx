import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccmTypeStore } from "../stores/accmType.store";
import { useAccumulationApi } from "../api/useAccumulationApi";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const ListToolbar = () => {
  const { table, reload } = useDataGrid();
  const {
    openDialog,
    setSearchDatas,
    searchValue,
    setSearchValue,
    searchDatas,
    menuPrivAccess,
  } = useAccmTypeStore();

  const { getAccumulationTypeList } = useAccumulationApi();

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     table.getColumn("accumulationTypeName")?.setFilterValue(searchValue);
  //     table.setPageIndex(0);
  //   }, 200);

  //   return () => clearTimeout(timer);
  // }, [searchValue, table]);

  return (
    <div className="flex-wrap gap-2 px-5 border-b-0 card-header">
      <div className="flex flex-wrap w-full gap-2 lg:gap-5">
        <div className="flex items-center justify-between w-full">
          <div className="flex w-[50%] gap-3 items-center">
            <label className="w-1/3 overflow-hidden input input-sm">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </label>
          </div>
          <div className="flex items-center flex-shrink-0 gap-3">
            <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
              <Button
                variant="outline"
                size={"sm"}
                className="text-white bg-red-500 whitespace-nowrap hover:text-white hover:bg-red-600"
                onClick={() => openDialog("create")}
              >
                <KeenIcon icon="plus" className="mr-2" />
                Add Data
              </Button>
            </AccessWrapper>
            <DefaultTooltip title={"Refresh"} placement={"top"}>
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
    </div>
  );
};

export default ListToolbar;
