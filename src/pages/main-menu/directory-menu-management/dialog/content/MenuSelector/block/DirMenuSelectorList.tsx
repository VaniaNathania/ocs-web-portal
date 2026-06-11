import { useMemo, useCallback, useState, useEffect } from "react";
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
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useDirMenuSelector } from "../hook/useDirMenuSelector";
import { useCompList } from "@/pages/main-menu/directory-menu-management/hook/useComp";
import {
  PrivData,
  PrivGetDto,
} from "../../MenuManagement/hook/DirMenuManagementProvider";
export const DirMenuSelectorList = () => {
  const {
    lastUpdated,
    availablerows,
    selectedAvailable,
    setSelectedAvailable,
    loading,
    fetchUserrows,
    fetchrows,
  } = useDirMenuSelector();

  const { selectedRow } = useCompList();

  const [filterBy, setFilterBy] = useState<string>("Name");
  const [search, setSearch] = useState<string>("");
  const [ownedPriv, setOwnedPriv] = useState<PrivData[]>([]);
  const [editingRow, setEditingRow] = useState<PrivData>();
  const [isCreating, setIsCreating] = useState(false);

  const AvailableColumn = useMemo<ColumnDef<PrivData>[]>(
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
                  selectedAvailable.some((p) => p.privId === feature.privId) ||
                  ownedPriv.some((p) => p.privId === feature.privId)
                }
                disabled={ownedPriv.some((p) => p.privId === feature.privId)}
                onChange={() => handleSelectRow(feature)}
                // readOnly
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
        accessorFn: (row) => row.privName,
        id: "menuName",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Menu Name"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.url,
        id: "URL",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Menu Url"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.privCode,
        id: "PRIV_CODE",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Privelage Code"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
    ],
    [selectedAvailable, ownedPriv, editingRow?.privId, isCreating],
  );

  const InitOwned = async () => {
    try {
      const resp = await fetchrows();
      setOwnedPriv(resp);
    } catch (error) {
      //  console.log(error);
    }
  };

  useEffect(() => {
    InitOwned();
  }, []);

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      const { id, desc } = sorting[0];

      let payload: Partial<PrivGetDto> = {
        page: page,
        size: limit,
        sortBy: id,
        sortDirection: desc ? "desc" : "asc",
      };

      if (filterBy === "Name") {
        payload = { ...payload, privName: search };
      } else payload = { ...payload, url: search };

      const response = await fetchUserrows(payload);
      // console.log("📥 API Response:", response);

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

      // Apply filtering first
      let processedData = [...list];

      return {
        data: processedData,
        totalCount: totalCount,
      };
    },
    [availablerows, search, filterBy, lastUpdated, ownedPriv, isCreating],
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: PrivData[]) => {
    return filteredData.every((row) =>
      selectedAvailable.some((selected) => selected.id === row.id),
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: PrivData[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedAvailable((prev) =>
        prev.filter(
          (item) => !filteredData.some((row) => row.privId === item.privId),
        ),
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedAvailable,
        ...filteredData.filter(
          (row) => !selectedAvailable.some((sel) => sel.privId === row.privId),
        ),
      ];
      setSelectedAvailable(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: PrivData) => {
    if (selectedAvailable.some((p) => p.privId === row.privId)) {
      setSelectedAvailable((prev) =>
        prev.filter((p) => p.privId !== row.privId),
      );
    } else {
      setSelectedAvailable((prev) => [...prev, row]);
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-row py-2 space-x-2 w-full items-center justify-between">
        <div>{selectedRow?.name}</div>
        <div className="flex flex-row py-2 space-x-2 w-1/2 justify-end">
          <div className="flex my-auto w-1/4">
            <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
              <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
                <SelectValue placeholder="Menu Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Name">Menu Name</SelectItem>
                <SelectItem value="Url">Url</SelectItem>
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
                // value={search}
                onChange={(e) => {
                  if (e.target.value === "") setSearch(e.target.value);
                }}
                onKeyDownCapture={(e) => {
                  if (e.key === "Enter") setSearch(e.currentTarget.value);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="relative">
        {loading && <Loading />}
        <div className="">
          <DataGridProvider
            key={`available-features-grid-${search}`}
            columns={AvailableColumn}
            // pagination={{ size: 5 }}
            layout={{ card: false }}
            sorting={[{ id: "menuName", desc: false }]}
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
            getRowProps={(row) => ({
              className: "",
              onClick: (e: any) => {
                const cellEl = (e.target as HTMLElement).closest(
                  "td[data-column-id]",
                );

                if (!cellEl) return;

                const columnId = (cellEl as HTMLElement).dataset.columnId;
                if (!columnId?.includes("menuName")) {
                  return; // do nothing
                }
                handleSelectRow(row.original);
              },
            })}
          ></DataGridProvider>
        </div>
      </div>
    </div>
  );
};
