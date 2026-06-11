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
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useUserGrantIPLimit } from "../hook/useUserGrantIPLimit";
import { IPLimit } from "../hook/UserGrantIPLimitProvider";

export const IPLimitList = () => {
  const {
    lastUpdated,
    availablerows,
    selectedAvailable,
    setSelectedAvailable,
    ownedrows,
    loading,
    fetchUserrows,
  } = useUserGrantIPLimit();

  const [filterBy, setFilterBy] = useState<string>("Start IP");
  const [search, setSearch] = useState<string>("");
  const [valChange, setValChange] = useState<IPLimit>();
  const [editedValue, setEditedValue] = useState<string>("N");
  const [editingRow, setEditingRow] = useState<IPLimit>({
    iPLimitId: -1,
    startIP: "",
    endIP: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRow = (row: IPLimit) => {
    //  console.log("Creating row:", row);
    // 🔥 call your API here
    setIsCreating(false);
    setEditingRow({ iPLimitId: -1, startIP: "", endIP: "" });
  };

  const handleUpdateRow = (row: IPLimit) => {
    //  console.log("Updating row:", row);
    // 🔥 call your API here
    setEditingRow({ iPLimitId: -1, startIP: "", endIP: "" });
  };

  //   const [selectedPortals, setSelectedPortals] = useState<IPLimit[]>([]);

  const AvailableColumn = useMemo<ColumnDef<IPLimit>[]>(
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
                checked={
                  selectedAvailable.some(
                    (p) => p.iPLimitId === feature.iPLimitId,
                  ) || ownedrows.some((p) => p.iPLimitId === feature.iPLimitId)
                }
                disabled={ownedrows.some(
                  (p) => p.iPLimitId === feature.iPLimitId,
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
        accessorFn: (row) => row.startIP,
        id: "startIP",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Start IP"
            className=" sticky"
            column={column}
          />
        ),
        cell: ({ row }) => {
          if (row.original.iPLimitId === editingRow.iPLimitId) {
            return (
              <input
                type="text"
                value={editingRow.startIP}
                onChange={(e) =>
                  setEditingRow(
                    (prev) => (prev = { ...prev, startIP: e.target.value }),
                  )
                }
                className="input input-sm"
              />
            );
          }
          return row.original.startIP;
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.endIP,
        id: "endIP",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="End IP"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          if (row.original.iPLimitId === editingRow.iPLimitId) {
            return (
              <input
                type="text"
                value={editingRow.endIP}
                onChange={(e) =>
                  setEditingRow(
                    (prev) => (prev = { ...prev, endIP: e.target.value }),
                  )
                }
                className="input input-sm"
              />
            );
          }
          return row.original.endIP;
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Actions"
            className="text-center"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const isEditing = editingRow.iPLimitId === row.original.iPLimitId;

          return (
            <div className="flex items-center justify-center gap-2">
              {isEditing ? (
                <>
                  <button
                    className="btn btn-sm btn-icon btn-success"
                    onClick={() => {
                      if (isCreating) {
                        handleCreateRow(editingRow);
                      } else {
                        handleUpdateRow(editingRow);
                      }
                    }}
                  >
                    <KeenIcon icon="check" />
                  </button>
                  <button
                    className="btn btn-sm btn-icon btn-secondary"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingRow({ iPLimitId: -1, startIP: "", endIP: "" });
                    }}
                  >
                    <KeenIcon icon="cross" />
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  title="Edit"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingRow(row.original);
                  }}
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [selectedAvailable, ownedrows, editingRow.iPLimitId, isCreating],
  );
  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay

      const response = await fetchUserrows();

      //  console.log("📥 API Response:", response);

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch offer data");
      }

      // ✅ PERBAIKAN: Handle berbagai struktur response
      const responseData = response?.data;
      let list = [];
      let totalCount = 0;

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

      const newRows: IPLimit = {
        iPLimitId: -1,
        startIP: "",
        endIP: "",
      };
      // Apply filtering first
      let processedData = isCreating ? [newRows, ...list] : [...list];

      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof IPLimit];
          const bValue = b[id as keyof IPLimit];

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
    [availablerows, search, filterBy, lastUpdated, ownedrows, isCreating],
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: IPLimit[]) => {
    return filteredData.every((row) =>
      selectedAvailable.some(
        (selected) => selected.iPLimitId === row.iPLimitId,
      ),
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: IPLimit[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedAvailable((prev) =>
        prev.filter(
          (item) =>
            !filteredData.some((row) => row.iPLimitId === item.iPLimitId),
        ),
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedAvailable,
        ...filteredData.filter(
          (row) =>
            !selectedAvailable.some((sel) => sel.iPLimitId === row.iPLimitId),
        ),
      ];
      setSelectedAvailable(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: IPLimit) => {
    if (selectedAvailable.some((p) => p.iPLimitId === row.iPLimitId)) {
      setSelectedAvailable((prev) =>
        prev.filter((p) => p.iPLimitId !== row.iPLimitId),
      );
    } else {
      setSelectedAvailable((prev) => [...prev, row]);
    }
  };

  return (
    <div className="h-full">
      <button
        className="btn btn-sm btn-primary mb-2"
        onClick={() => {
          setIsCreating(true);
          setEditingRow({ iPLimitId: -1, startIP: "", endIP: "" });
        }}
      >
        + Add New Row
      </button>

      <div className="flex flex-row py-2 space-x-2 w-full">
        <div className="flex my-auto w-1/4">
          <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Start IP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Start IP">Start IP</SelectItem>
              <SelectItem value="End IP">End IP</SelectItem>
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
        <div className="h-[100%] overflow-y-auto">
          <DataGridProvider
            key={`available-features-grid-${lastUpdated}`}
            columns={AvailableColumn}
            pagination={{ size: 5 }}
            layout={{
              card: true,
              cellBorder: true,
              classes: { table: "" },
            }}
            sorting={[{ id: "name", desc: false }]}
            serverSide={true}
            data={availablerows}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
              return doGetAvailableData(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters,
              );
            }}
          ></DataGridProvider>
        </div>
      </div>
    </div>
  );
};
