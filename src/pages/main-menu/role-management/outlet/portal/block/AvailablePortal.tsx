import { useMemo, useCallback, useState } from "react";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PortalData } from "../hook/PortalProvider";
import { usePortalList } from "../hook/usePortal";
import { Loading } from "../../../block/loadingBlock";
import { useRoleLayout } from "@/layouts/main-menu/role-management";

export const AvailablePortal = () => {
  const { selectedRow } = useRoleLayout();
  const {
    lastUpdated,
    availablePortal,
    selectedAvailable,
    setSelectedAvailable,
    loading,
  } = usePortalList();

  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");

  //   const [selectedPortals, setSelectedPortals] = useState<PortalData[]>([]);

  const AvailableColumn = useMemo<ColumnDef<PortalData>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isAllSelected(
                table.getFilteredRowModel().rows.map((r) => r.original),
              )}
              onChange={() =>
                handleSelectAll(
                  table.getFilteredRowModel().rows.map((r) => r.original),
                )
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        ),
        cell: ({ row }) => {
          const feature = row.original;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectedAvailable.some(
                  (p) => p.portalId === feature.portalId,
                )}
                onChange={() => handleSelectRow(feature)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.portalName,
        id: "portalName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Portal Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.url,
        id: "url",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Url" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const url = row.original.url;
          return <div className="text-gray-600">{url}</div>;
        },
      },
    ],
    [selectedAvailable],
  );

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Apply filtering first
      let processedData = [...availablePortal];

      if (search.trim() && filterBy) {
        const keyword = search.toLowerCase();
        processedData = processedData.filter((item) => {
          if (filterBy === "name") {
            return item.portalName?.toLowerCase().includes(keyword);
          }
          if (filterBy === "url") {
            return item.url?.toLowerCase().includes(keyword);
          }
          return true;
        });
      }

      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof PortalData];
          const bValue = b[id as keyof PortalData];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return desc
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }
          if (aValue && bValue) {
            if (aValue < bValue) return desc ? 1 : -1;
            if (aValue > bValue) return desc ? -1 : 1;
          }
          return 0;
        });
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = processedData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: processedData.length,
      };
    },
    [availablePortal, search, filterBy, selectedRow?.roleId],
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: PortalData[]) => {
    return filteredData.every((row) =>
      selectedAvailable.some((selected) => selected.portalId === row.portalId),
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: PortalData[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedAvailable((prev) =>
        prev.filter(
          (item) => !filteredData.some((row) => row.portalId === item.portalId),
        ),
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedAvailable,
        ...filteredData.filter(
          (row) =>
            !selectedAvailable.some((sel) => sel.portalId === row.portalId),
        ),
      ];
      setSelectedAvailable(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: PortalData) => {
    if (selectedAvailable.some((p) => p.portalId === row.portalId)) {
      setSelectedAvailable((prev) =>
        prev.filter((p) => p.portalId !== row.portalId),
      );
    } else {
      setSelectedAvailable((prev) => [...prev, row]);
    }
  };

  return (
    <div>
      <div className="flex flex-row w-full justify-between">
        <h2 className="my-auto">All Portals</h2>
        <div className="flex flex-row py-2 space-x-2 w-1/2">
          <div className="flex my-auto w-1/4">
            <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
              <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
                <SelectValue placeholder="Portal Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Portal Name</SelectItem>
                <SelectItem value="url">Portal Url</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-3/4">
            <label className="input input-sm w-full flex items-center gap-2">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder={`Search Portal by ${filterBy}..`}
                className="w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="relative">
        {loading && <Loading />}
        <div className="overflow-y-auto max-h-[300px]">
          <DataGridProvider
            key={`available-features-grid-${availablePortal.length}-${search}-${filterBy}-${lastUpdated}`}
            columns={AvailableColumn}
            pagination={{ size: 10 }}
            layout={{ card: false }}
            sorting={[{ id: "name", desc: false }]}
            serverSide={true}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
              return doGetAvailableData(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters,
              );
            }}
          >
            {/* Available Features DataGrid content */}
          </DataGridProvider>
        </div>
      </div>
    </div>
  );
};
