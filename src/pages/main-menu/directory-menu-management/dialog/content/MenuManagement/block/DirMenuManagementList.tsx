import { useMemo, useCallback, useState, useEffect } from "react";
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
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { useDirMenuManagement } from "../hook/useDirMenuManagement";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { PrivData, PrivGetDto } from "../hook/DirMenuManagementProvider";
import { Button } from "@/components/ui/button";
import { useCompList } from "@/pages/main-menu/directory-menu-management/hook/useComp";
import { apiConfigRole } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";

const API_URL = apiConfigRole.role;

export const DirMenuManagementList = () => {
  const {
    lastUpdated,
    availablerows,
    selectedAvailable,
    setSelectedAvailable,
    ownedrows,
    loading,
    fetchUserrows,
    selectedRow,
    setSelectedRow,
  } = useDirMenuManagement();
  const { setDesc, setOnConfirm, setShowConfirm } = useCompList();
  const { DeleteData } = useCallApi();

  const [filterBy, setFilterBy] = useState<"Name" | "Url">("Name");
  const [search, setSearch] = useState<string>("");
  const [editingRow, setEditingRow] = useState<PrivData>();
  const [isCreating, setIsCreating] = useState(false);
  const [rows, setRows] = useState<PrivData[]>([]);

  const handleSelectRow = (row: PrivData) => {
    if (row.privId !== selectedRow?.privId) setSelectedRow(row);
  };

  const AvailableColumn = useMemo<ColumnDef<PrivData>[]>(
    () => [
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
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
        cell: ({ row }) => {
          const isSelected = selectedRow?.id === row.original.id;
          return (
            <div
            // onClick={() => handleSelectRow(row.original)}
            // className={`cursor-pointer ${isSelected ? selectedRowHigligt : ""}`}
            >
              {row.original.privName}
            </div>
          );
        },
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
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
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
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
      },
      {
        // accessorFn: (row) => row.privCode,
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Action"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell({ row }) {
          return (
            <div>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => handleDelete(row.original)}
              >
                <KeenIcon icon="trash" />
              </Button>
            </div>
          );
        },
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
      },
    ],
    [selectedAvailable, ownedrows, selectedRow?.id, isCreating],
  );

  useEffect(() => {
    if (rows.length > 0) handleSelectRow(rows[0]);
  }, [rows]);

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
    [availablerows, search, filterBy, lastUpdated, ownedrows, isCreating],
  );
  const handleDelete = (data: PrivData) => {
    setDesc(`Deleting  ${data?.privName}`);
    //  console.log(data);

    setSelectedRow(data);
    setShowConfirm(true);
    setOnConfirm(() => () => onDelete(data));
  };

  const onDelete = async (data: PrivData) => {
    //  console.log(`Deleting  ${data.id} ${data.privName}`);
    try {
      const resp = await DeleteData(
        `${API_URL}/api/dirs/del-menu/${data.privId}`,
        {},
      );

      if (resp?.status) {
        return toast.success(resp.message);
      }
      return toast.error(resp?.message);
    } catch (error) {
      return toast.error("Error deleting data");
    } finally {
      setShowConfirm(false);
      // initializeData();
    }
  };

  return (
    <div className="h-full">
      <div className="flex flex-row py-2 space-x-2 w-full items-center justify-between">
        <div className="flex flex-row py-2 space-x-2 w-1/2 justify-end">
          <div className="flex my-auto w-1/4">
            <Select
              value={filterBy}
              onValueChange={(val: "Name" | "Url") => setFilterBy(val)}
            >
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
        <div>
          <DataGridProvider
            key={`available-features-grid-${search}`}
            columns={AvailableColumn}
            // pagination={{ size: 5 }}
            layout={{ card: false }}
            sorting={[{ id: "menuName", desc: false }]}
            serverSide={true}
            data={rows}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
              return doGetAvailableData(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters,
              );
            }}
            getRowProps={(row) => ({
              className:
                row.original.privId === selectedRow?.privId
                  ? selectedRowHighLight
                  : nonSelectedRowHighLight,
              onClick: () => handleSelectRow(row.original),
            })}
          >
            <div className="h-[200px] overflow-y-auto mb-5 border-2 rounded-md">
              <DataGridTable />
            </div>
            <DataGridPagination />
          </DataGridProvider>
        </div>
      </div>
    </div>
  );
};
