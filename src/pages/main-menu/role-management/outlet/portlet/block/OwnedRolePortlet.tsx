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
import { usePortletList } from "../hook/usePortlet";
import { Portlet } from "../hook/PortletsProvider";

export const OwnedRolePortlet = () => {
  const { lastUpdated, ownedPortlets, selectedOwned, setSelectedOwned } =
    usePortletList();
  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedValue, setEditedValue] = useState<string>("N");

  // const [selectedUsers, setSelectedUsers] = useState<Portlet[]>([]);

  const OwnedCompColumn = useMemo<ColumnDef<Portlet>[]>(
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
                checked={selectedOwned.some(
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
        id: "portletName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Portlet Name" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.url,
        id: "url",
        header: ({ column }) => (
          <DataGridColumnHeader title="Url" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/2",
        },
      },
    ],
    [selectedOwned, editingRowId, editedValue]
  );

  const doGetOwnedRoleData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Apply filtering first
      // console.log(ownedPortlets);

      let processedData = [...ownedPortlets];

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

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = processedData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: processedData.length,
      };
    },
    [ownedPortlets, search, filterBy]
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: Portlet[]) => {
    return filteredData.every((row) =>
      selectedOwned.some((selected) => selected.portletId === row.portletId)
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: Portlet[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedOwned((prev) =>
        prev.filter(
          (item) =>
            !filteredData.some((row) => row.portletId === item.portletId)
        )
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedOwned,
        ...filteredData.filter(
          (row) => !selectedOwned.some((sel) => sel.portletId === row.portletId)
        ),
      ];
      setSelectedOwned(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: Portlet) => {
    if (selectedOwned.some((p) => p.portletId === row.portletId)) {
      setSelectedOwned((prev) =>
        prev.filter((p) => p.portletId !== row.portletId)
      );
    } else {
      setSelectedOwned((prev) => [...prev, row]);
    }
  };

  return (
    <div>
      <div className="flex flex-row w-full justify-between">
        <div></div>
        <div className="flex flex-row py-2 space-x-2 w-1/2">
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
      </div>

      <DataGridProvider
        key={`available-features-grid-${ownedPortlets.length}-${search}-${filterBy}-${lastUpdated}`}
        columns={OwnedCompColumn}
        pagination={{ size: 5 }}
        layout={{ card: false }}
        sorting={[{ id: "name", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          return doGetOwnedRoleData(
            pageIndex + 1,
            pageSize,
            sorting,
            columnFilters
          );
        }}
      >
        {/* Available Features DataGrid content */}
      </DataGridProvider>
    </div>
  );
};
