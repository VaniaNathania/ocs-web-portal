import { useMemo, useCallback, useState, useRef } from "react";
import {
  DataGridColumnHeader,
  DataGridPagination,
  DataGridProvider,
  DataGridTable,
  DefaultTooltip,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { HistoryData } from "../hook/UserGrantHistoryDataProvider";
import { useUserGrantHistoryData } from "../hook/useUserGrantHistory";
import { useTableAtribute } from "../hook/useTableAtribute";

export const HistoryDataList = () => {
  const { availablerows, loading, historyFilter } = useUserGrantHistoryData();

  const { AvailableColumn, doGetAvailableData } = useTableAtribute();

  return (
    <div className="">
      <div className="relative">
        {loading && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${historyFilter}`}
          columns={AvailableColumn}
          pagination={{ size: historyFilter.size }}
          layout={{ card: false }}
          sorting={[{ id: "recId", desc: true }]}
          serverSide={true}
          data={availablerows}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetAvailableData(
              pageIndex + 1,
              pageSize,
              sorting,
              columnFilters
            );
          }}
        >
          {/* <div className="overflow-y-auto h-[500px]">
            <div className="border-2">
              <DataGridTable />
            </div>
          </div>
          {availablerows.length > 0 && <DataGridPagination />} */}
        </DataGridProvider>
      </div>
    </div>
  );
};
