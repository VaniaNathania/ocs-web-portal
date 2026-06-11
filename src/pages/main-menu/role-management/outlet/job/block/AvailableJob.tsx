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
import { JobData } from "../hook/JobProvider";
import { useJobList } from "../hook/useJob";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

export const AvailableJob = () => {
  const {
    lastUpdated,
    selectedAvailable,
    setSelectedAvailable,
    countAva,
    setCountAva,
  } = useJobList();
  const { selectedRow } = useRoleLayout();

  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const { GetData } = useCallApi();

  //   const [selectedPortals, setSelectedPortals] = useState<JobData[]>([]);

  const AvailableColumn = useMemo<ColumnDef<JobData>[]>(
    () => [
      {
        id: "jobId",
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
                  (p) => p.jobId === feature.jobId,
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
        accessorFn: (row) => row.jobName,
        id: "jobName",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Job Name" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.jobName,
        id: "jobCode",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Job Code" column={column} />
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
    [selectedAvailable],
  );

  const doGetAvailableData = useCallback(
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
          params = { ...pageDTO, jobName: search, jobCode: "" };
        else params = { ...pageDTO, jobCode: search, jobName: "" };
      }

      // console.log("📡 API Request params:", params);

      let list: JobData[] = [];
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
        `${API_ROLE}/api/stafforg/jobs/${selectedRow?.roleId}/ungrant/filter`,
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

      setCountAva(totalCount);

      return {
        data: Array.isArray(list) ? list : [],
        pageCount: Math.ceil(totalCount / limit), // Tambahkan pageCount
        totalCount: totalCount,
        hasNextPage: page * limit < totalCount,
        hasPreviousPage: page > 1,
      };
    },
    [search, filterBy, selectedRow, lastUpdated],
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: JobData[]) => {
    return filteredData.every((row) =>
      selectedAvailable.some((selected) => selected.jobId === row.jobId),
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: JobData[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedAvailable((prev) =>
        prev.filter(
          (item) => !filteredData.some((row) => row.jobId === item.jobId),
        ),
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedAvailable,
        ...filteredData.filter(
          (row) => !selectedAvailable.some((sel) => sel.jobId === row.jobId),
        ),
      ];
      setSelectedAvailable(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: JobData) => {
    if (selectedAvailable.some((p) => p.jobId === row.jobId)) {
      setSelectedAvailable((prev) => prev.filter((p) => p.jobId !== row.jobId));
    } else {
      setSelectedAvailable((prev) => [...prev, row]);
    }
  };

  return (
    <div>
      <div className="flex flex-row w-full justify-between">
        <h2 className="my-auto">Ungranted Job{`(${countAva})`}</h2>
        <div className="flex flex-row py-2 space-x-2 w-1/2">
          <div className="flex my-auto w-1/4">
            <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
              <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
                <SelectValue placeholder="Job Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Job Name</SelectItem>
                <SelectItem value="code">Job Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-3/4">
            <label className="input input-sm w-full flex items-center gap-2">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder={`Search Job by ${filterBy}..`}
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
        columns={AvailableColumn}
        pagination={{ size: 5 }}
        layout={{ card: false }}
        sorting={[{ id: "jobName", desc: false }]}
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
  );
};
