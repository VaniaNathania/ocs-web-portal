import { useMemo, useCallback, useState } from "react";
import {
  DataGridColumnHeader,
  DataGridPagination,
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
import { useDirMenuBindPortal } from "../hook/useUserGrantPortal";
import { useCallApi } from "@/hooks";
import { PortalData } from "@/pages/main-menu/role-management/outlet/portal/hook/PortalProvider";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

export const AvailableGrantPortal = () => {
  const {
    lastUpdated,
    selectedAvailable,
    setSelectedAvailable,
    availablerows,
    loading,
  } = useDirMenuBindPortal();

  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const { GetData } = useCallApi();

  //   const [selectedPortals, setSelectedPortals] = useState<PortalData[]>([]);

  const AvailableColumn = useMemo<ColumnDef<PortalData>[]>(
    () => [
      {
        id: "portalId",
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
                checked={selectedAvailable.some(
                  (p) => p.portalId === feature.portalId
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
          <DataGridColumnHeader
            className=""
            title="Portal Url"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [selectedAvailable]
  );

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, columnFilter: any) => {
      try {
        const tempRole = await availablerows;
        let processedData = [...tempRole];
        // console.log(processedData, roles, "ini di doget");

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

        // Sorting logic
        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof PortalData];
            const bValue = b[id as keyof PortalData];

            if (aValue === undefined || bValue === undefined) return 0;

            if (typeof aValue === "string" && typeof bValue === "string") {
              return desc
                ? bValue.localeCompare(aValue)
                : aValue.localeCompare(bValue);
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
              return desc ? bValue - aValue : aValue - bValue;
            }

            return 0;
          });
        }

        return {
          data: processedData,
          totalCount: processedData.length,
        };
      } catch (err: any) {
        console.error("❌ Error fetching offer data:", err);

        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [availablerows, search, filterBy, lastUpdated]
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: PortalData[]) => {
    return filteredData.every((row) =>
      selectedAvailable.some((selected) => selected.portalId === row.portalId)
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: PortalData[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedAvailable((prev) =>
        prev.filter(
          (item) => !filteredData.some((row) => row.portalId === item.portalId)
        )
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedAvailable,
        ...filteredData.filter(
          (row) =>
            !selectedAvailable.some((sel) => sel.portalId === row.portalId)
        ),
      ];
      setSelectedAvailable(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: PortalData) => {
    if (selectedAvailable.some((p) => p.portalId === row.portalId)) {
      setSelectedAvailable((prev) =>
        prev.filter((p) => p.portalId !== row.portalId)
      );
    } else {
      setSelectedAvailable((prev) => [...prev, row]);
    }
  };

  return (
    <div>
      <div className="flex flex-row w-full justify-between">
        <h2 className="my-auto">Ungranted Portals</h2>
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
                placeholder={`Search User by ${filterBy}..`}
                className="w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="relative ">
        {loading && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${search}`}
          columns={AvailableColumn}
          // pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "roleName", desc: false }]}
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
          getRowProps={(row) => ({
            className: "",
            onClick: () => handleSelectRow(row.original),
          })}
        >
          <div className="h-[300px] overflow-y-auto w-full border-2">
            <DataGridTable />
          </div>
          {/* <DataGridPagination /> */}
        </DataGridProvider>
      </div>
    </div>
  );
};
