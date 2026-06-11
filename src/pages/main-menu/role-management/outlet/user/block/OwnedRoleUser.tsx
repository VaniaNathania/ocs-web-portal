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
import { UserData } from "../hook/UserProvider";
import { useUserList } from "../hook/useUser";
import { useCallApi } from "@/hooks";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

export const OwnedRoleUser = () => {
  const {
    lastUpdated,
    selectedOwned,
    setSelectedOwned,
    countOwned,
    setCountOwned,
  } = useUserList();
  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const { selectedRow } = useRoleLayout();
  const { GetData } = useCallApi();

  const OwnedUserColumn = useMemo<ColumnDef<UserData>[]>(
    () => [
      {
        id: "userId",
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
                checked={selectedOwned.some((p) => p.userId === feature.userId)}
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
        accessorFn: (row) => row.userName,
        id: "userName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="User Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.userCode,
        id: "userCode",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="User Code"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.state,
        id: "state",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="State" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <div>{row.original.state === "A" ? "Active" : "Non-Active"}</div>
          );
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
        if (filterBy === "name")
          params = { ...pageDTO, userName: search, userCode: "" };
        else params = { ...pageDTO, userCode: search, userName: "" };
      }

      let list: UserData[] = [];
      let totalCount = 0;

      if (!selectedRow?.roleId) {
        return {
          data: Array.isArray(list) ? list : [],
          pageCount: Math.ceil(totalCount / limit), // Tambahkan pageCount
          totalCount: totalCount,
          hasNextPage: page * limit < totalCount,
          hasPreviousPage: page > 1,
        };
      }

      const response = await GetData(
        `${API_ROLE}/api/roles/${selectedRow?.roleId}/users/grant/filter`,
        params,
      );

      // console.log("📥 API Response:", response);

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch offer data");
      }

      // ✅ PERBAIKAN: Handle berbagai struktur response
      const responseData = response?.data;

      if (responseData) {
        // Coba berbagai kemungkinan struktur data
        list =
          responseData.list ||
          responseData.data ||
          responseData.content ||
          responseData ||
          [];
        totalCount = response.totalRows || 0;
        responseData.totalCount ||
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
    [search, filterBy, selectedRow?.roleId, lastUpdated],
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: UserData[]) => {
    return filteredData.every((row) =>
      selectedOwned.some((selected) => selected.userId === row.userId),
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: UserData[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedOwned((prev) =>
        prev.filter(
          (item) => !filteredData.some((row) => row.userId === item.userId),
        ),
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedOwned,
        ...filteredData.filter(
          (row) => !selectedOwned.some((sel) => sel.userId === row.userId),
        ),
      ];
      setSelectedOwned(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: UserData) => {
    if (selectedOwned.some((p) => p.userId === row.userId)) {
      setSelectedOwned((prev) => prev.filter((p) => p.userId !== row.userId));
    } else {
      setSelectedOwned((prev) => [...prev, row]);
    }
  };

  return (
    <div>
      <div className="flex flex-row w-full justify-between">
        <h2 className="my-auto">Users of the Roles{`(${countOwned})`}</h2>
        <div className="flex flex-row py-2 space-x-2 w-1/2">
          <div className="flex my-auto w-1/4">
            <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
              <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
                <SelectValue placeholder="User Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">User Name</SelectItem>
                <SelectItem value="code">User Code</SelectItem>
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

      <DataGridProvider
        key={`available-features-grid-${search}-${filterBy}-${selectedRow?.roleName}-${lastUpdated}`}
        columns={OwnedUserColumn}
        pagination={{ size: 5 }}
        layout={{ card: false }}
        sorting={[{ id: "userName", desc: false }]}
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
        {/* Available Features DataGrid content */}
      </DataGridProvider>
    </div>
  );
};
