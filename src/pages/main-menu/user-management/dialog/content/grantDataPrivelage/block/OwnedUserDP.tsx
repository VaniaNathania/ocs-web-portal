import { useMemo, useCallback, useState } from "react";
import {
  DataGridColumnHeader,
  DataGridInner,
  DataGridInnerCard,
  DataGridPagination,
  DataGridProvider,
  DataGridTable,
  DataGridToolbar,
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
import { useCallApi } from "@/hooks";
import { useUserGrantDP } from "../hook/useUserGrantDP";
import { UserDataPriv } from "../hook/UserGrantDPProvider";

export const OwnedUserDP = () => {
  const {
    lastUpdated,
    selectedOwned,
    setSelectedOwned,
    countOwned,
    setCountOwned,
    fetchUserrows,
  } = useUserGrantDP();
  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const { GetData } = useCallApi();

  const OwnedUserColumn = useMemo<ColumnDef<UserDataPriv>[]>(
    () => [
      {
        id: "privId",
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
                checked={selectedOwned.some((p) => p.privId === feature.privId)}
                onChange={() => handleSelectRow(feature)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center sticky top-0 z-10 bg-gray-100",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.privName,
        id: "privName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="sticky top-0 z-10"
            title="Privelage Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.privCode,
        id: "privCode",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="sticky top-0 z-10"
            title="Privelage Code"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.type,
        id: "type",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="sticky top-0 z-10"
            title="Data type"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.comments,
        id: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="sticky top-0 z-10"
            title="Remarks"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
    ],
    [selectedOwned],
  );

  const doGetOwnedRoleData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      //  console.log(page, limit, sorting, filter);

      const pageDTO = {
        search: search,
        page: page,
        size: limit,
        sortBy: sorting[0].id,
        sortDirection: sorting[0].desc ? "desc" : "asc",
      };

      let params = {};

      if (filterBy) {
        if (filterBy === "name") params = { ...pageDTO, roleName: search };
        else params = { ...pageDTO, roleCode: search };
      }

      // console.log("📡 API Request params:", params);

      const response = await fetchUserrows();

      // console.log("📥 API Response:", response);

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch offer data");
      }

      // ✅ PERBAIKAN: Handle berbagai struktur response
      const responseData = response?.data;
      let list = [];
      let totalCount = 0;

      //  console.log(responseData);

      if (responseData) {
        // Coba berbagai kemungkinan struktur data
        list =
          responseData.list ||
          responseData.data ||
          responseData.content ||
          responseData ||
          [];
        totalCount =
          responseData.totalCount ||
          responseData.totalRows ||
          responseData.total ||
          responseData.totalElements ||
          responseData.count ||
          (Array.isArray(list) ? list.length : 0);
      }

      setCountOwned(totalCount);

      return {
        data: Array.isArray(list) ? list : [],
        pageCount: Math.ceil(totalCount / limit), // Tambahkan pageCount
        totalCount: totalCount,
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1,
      };
    },
    [search, filterBy],
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: UserDataPriv[]) => {
    return filteredData.every((row) =>
      selectedOwned.some((selected) => selected.privId === row.privId),
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: UserDataPriv[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedOwned((prev) =>
        prev.filter(
          (item) => !filteredData.some((row) => row.privId === item.privId),
        ),
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedOwned,
        ...filteredData.filter(
          (row) => !selectedOwned.some((sel) => sel.privId === row.privId),
        ),
      ];
      setSelectedOwned(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: UserDataPriv) => {
    if (selectedOwned.some((p) => p.privId === row.privId)) {
      setSelectedOwned((prev) => prev.filter((p) => p.privId !== row.privId));
    } else {
      setSelectedOwned((prev) => [...prev, row]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex flex-row w-full justify-between pb-2">
        <h2 className="my-auto overflow-hidden text-ellipsis w-1/3 whitespace-nowrap">
          Granted Privelage
        </h2>
        <div className="flex flex-row py-2 space-x-2 w-2/3">
          <div className="flex my-auto w-1/4">
            <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
              <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
                <SelectValue placeholder="Privelage Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Privelage Name</SelectItem>
                <SelectItem value="code">Privelage Code</SelectItem>
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

      {/* Scrollable Table Area */}
      <div className="overflow-hidden">
        <DataGridProvider
          key={`available-features-grid-${countOwned}-${search}-${filterBy}-${lastUpdated}`}
          columns={OwnedUserColumn}
          pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "roleName", desc: false }]}
          serverSide={true}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetOwnedRoleData(
              pageIndex + 1,
              pageSize,
              sorting,
              columnFilters,
            );
          }}
        >
          <div className="h-full overflow-auto">
            <DataGridTable />
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};
