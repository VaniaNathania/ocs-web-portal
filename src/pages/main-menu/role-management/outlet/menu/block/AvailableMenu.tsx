import { useMemo, useCallback, useState } from "react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  DefaultTooltip,
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
import { useMenuList } from "../hook/useMenu";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { MenuData } from "../menuInterfaces";
import { Loading } from "../../../block/loadingBlock";

export const AvailableMenu = () => {
  const {
    lastUpdated,
    availableMenus,
    selectedAvailable,
    setSelectedAvailable,
    ownedMenus,
    loading,
  } = useMenuList();
  const { selectedRow } = useRoleLayout();

  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");

  //   const [selectedPortals, setSelectedPortals] = useState<MenuData[]>([]);

  const AvailableColumn = useMemo<ColumnDef<MenuData>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <div className="flex items-center justify-center sticky">
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
                  selectedAvailable.some((p) => p.privId === feature.privId) ||
                  ownedMenus.some((p) => p.privId === feature.privId)
                }
                disabled={ownedMenus.some((p) => p.privId === feature.privId)}
                onChange={() => handleSelectRow(feature)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        // meta: {
        //   headerClassName: "w-[50px] text-center",
        //   cellClassName: "text-center",
        // },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 w-[50px] text-center text-ellipsis whitespace-nowrap ",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.privName,
        id: "privName",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Menu Name"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.privName}>
              <div className="w-full overflow-hidden text-ellipsis">
                {row.original.privName}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 min-w-[50px] w-[50px] max-w-[150px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "min-w-[50px] w-[50px] max-w-[150px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
      {
        accessorFn: (row) => row.url,
        id: "url",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=" sticky"
            title="Menu Url"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.url}>
              <div className="w-full overflow-hidden text-ellipsis">
                {row.original.url}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 min-w-[50px] w-[50px] max-w-[150px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "min-w-[50px] w-[50px] max-w-[150px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
    ],
    [selectedAvailable, ownedMenus]
  );

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Apply filtering first
      let processedData = [...availableMenus];

      if (search.trim() && filterBy) {
        const keyword = search.toLowerCase();
        processedData = processedData.filter((item) => {
          if (filterBy === "name") {
            return item.privName?.toLowerCase().includes(keyword);
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
          const aValue = a[id as keyof MenuData];
          const bValue = b[id as keyof MenuData];

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
        data: processedData,
        totalCount: processedData.length,
      };
    },
    [availableMenus, search, filterBy, lastUpdated, ownedMenus]
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: MenuData[]) => {
    return filteredData.every((row) =>
      selectedAvailable.some((selected) => selected.privId === row.privId)
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: MenuData[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedAvailable((prev) =>
        prev.filter(
          (item) => !filteredData.some((row) => row.privId === item.privId)
        )
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedAvailable,
        ...filteredData.filter(
          (row) => !selectedAvailable.some((sel) => sel.privId === row.privId)
        ),
      ];
      setSelectedAvailable(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: MenuData) => {
    if (selectedAvailable.some((p) => p.privId === row.privId)) {
      setSelectedAvailable((prev) =>
        prev.filter((p) => p.privId !== row.privId)
      );
    } else {
      setSelectedAvailable((prev) => [...prev, row]);
    }
  };

  return (
    <div className="">
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
          key={`available-features-grid-${availableMenus.length}-${search}-${filterBy}-${lastUpdated}`}
          columns={AvailableColumn}
          pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          data={availableMenus}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetAvailableData(
              pageIndex + 1,
              pageSize,
              sorting,
              columnFilters
            );
          }}
        >
          <div className="overflow-y-auto h-[300px] border-2">
            <DataGridTable />
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};
