import { useMemo, useCallback, useState } from "react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePortletList } from "../hook/usePortlet";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { Portlet } from "../hook/PortletsProvider";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

export const AvailablePortlet = () => {
  const {
    lastUpdated,
    availablePortlets,
    selectedAvailable,
    setSelectedAvailable,
    ownedPortlets,
    loading,
  } = usePortletList();

  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");

  //   const [selectedPortals, setSelectedPortals] = useState<Portlet[]>([]);

  const AvailableColumn = useMemo<ColumnDef<Portlet>[]>(
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
                table.getFilteredRowModel().rows.map((r) => r.original)
              )}
              onChange={() =>
                handleSelectAll(
                  table.getFilteredRowModel().rows.map((r) => r.original)
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
                checked={
                  selectedAvailable.some(
                    (p) => p.portletId === feature.portletId
                  ) ||
                  ownedPortlets.some((p) => p.portletId === feature.portletId)
                }
                disabled={ownedPortlets.some(
                  (p) => p.portletId === feature.portletId
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
        accessorFn: (row) => row.portletName,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Portlet Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => (
          <div
            className="overflow-hidden text-ellipsis whitespace-nowrap w-11/12"
            title={row.original.portletName}
          >
            {row.original.portletName}
          </div>
        ),
        meta: {
          headerClassName: "w-[50px]",
          cellClassName: "w-[50px]",
          className: "w-[50px]",
        },
      },
      {
        accessorFn: (row) => row.url,
        id: "url",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Url" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => (
          <div
            className="overflow-hidden text-ellipsis w-11/12"
            title={row.original.url}
          >
            {row.original.url}
          </div>
        ),
      },
    ],
    [selectedAvailable, ownedPortlets]
  );

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Apply filtering first
      let processedData = [...availablePortlets];

      if (search.trim() && filterBy) {
        const keyword = search.toLowerCase();
        processedData = processedData.filter((item) => {
          if (filterBy === "name") {
            return item.portletName?.toLowerCase().includes(keyword);
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
          const aValue = a[id as keyof Portlet];
          const bValue = b[id as keyof Portlet];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return desc
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }

          if (aValue < bValue) return desc ? 1 : -1;
          if (aValue > bValue) return desc ? -1 : 1;
          return 0;
        });
      }

      return {
        data: processedData,
        totalCount: processedData.length,
      };
    },
    [availablePortlets, search, filterBy]
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: Portlet[]) => {
    return filteredData.every((row) =>
      selectedAvailable.some((selected) => selected.portletId === row.portletId)
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: Portlet[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedAvailable((prev) =>
        prev.filter(
          (item) =>
            !filteredData.some((row) => row.portletId === item.portletId)
        )
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedAvailable,
        ...filteredData.filter(
          (row) =>
            !selectedAvailable.some((sel) => sel.portletId === row.portletId)
        ),
      ];
      setSelectedAvailable(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: Portlet) => {
    if (selectedAvailable.some((p) => p.portletId === row.portletId)) {
      setSelectedAvailable((prev) =>
        prev.filter((p) => p.portletId !== row.portletId)
      );
    } else {
      setSelectedAvailable((prev) => [...prev, row]);
    }
  };

  return (
    <div>
      <div className="flex flex-row py-2 space-x-2 w-full">
        <div className="flex my-auto w-1/4">
          <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Menu Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Menu Name</SelectItem>
              <SelectItem value="url">Menu Url</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-3/4">
          <label className="input input-sm w-full flex items-center gap-2">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder={`Search Menu by ${filterBy}..`}
              className="w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="relative">
        {loading && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${search}`}
          columns={AvailableColumn}
          pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          data={availablePortlets}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetAvailableData(
              pageIndex + 1,
              pageSize,
              sorting,
              columnFilters
            );
          }}
        >
          <div className="h-[300px] overflow-y-auto w-full border-2">
            <DataGridTable />
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};
