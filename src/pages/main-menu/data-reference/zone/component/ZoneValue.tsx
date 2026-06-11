import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useZoneMainListContext } from "../hooks/useZoneContext";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { ZoneValue as ZoneData } from "../hooks/ZoneContext";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

const ZoneValue = () => {
  const {
    selectedItem,
    handleSelectedItem,
    handleExportZoneValue,
    handleAddBatchZoneValue,
    handleDeleteBatchZoneValue,
    setValueDetail,
    selectedChildrenSide,
    refreshTrigger,
    onSubmitSuccess,
    setShowDeleteZoneValueDetail,
    menuPrivAccess
  } = useZoneMainListContext();

  const { GetData, DeleteData } = useCallApi();
  const [zoneValue, setZoneValue] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const doGetListData = useCallback(
    async (zoneId: number, page: number, limit: number, sorting: any, filter: any) => {
      setLoading(true);
      try {
        const sortField = sorting?.[0]?.sort ?? "ZONE_ID";
        const sortDirection = sorting?.[0]?.asc ? "asc" : "desc";

        const response = await GetData(`${API_URL_REF}/api/zone/qry-zone-value`, {
          zoneId,
          value: searchTerm,
          spId: 0,
          page,
          size: limit,
          sortBy: sortField,
          sortDirection,
        });

        const responseData: ZoneData[] = response.data ?? [];

        setZoneValue(responseData);
        return responseData;
      } catch (error: any) {
        // console.error("Error fetching zone value", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [GetData, searchTerm]
  );

  // Clear search when zone changes
  useEffect(() => {
    setSearchInput("");
    setSearchTerm("");
  }, [selectedChildrenSide?.zoneId]);

  const handleEditZoneValue = useCallback(
    (row: ZoneData) => {
      handleSelectedItem(row);
      setValueDetail("edit");
    },
    [handleSelectedItem, setValueDetail]
  );

  const handleDeleteZoneValue = useCallback(
    async (row: ZoneData) => {
      if (!row?.value) {
        toast.error("No zone value selected for deletion");
        return;
      }

      if (!window.confirm(`Are you sure you want to delete zone value "${row.value}"?`)) {
        return;
      }

      try {
        const response = await DeleteData(
          `${API_URL_REF}/api/zone/del-zone-value?zoneId=${row.zoneId}&seq=${row.seq}`,
          {}
        );

        if (response?.status) {
          toast.success("Zone value deleted successfully!");
          onSubmitSuccess();
        } else {
          const errorMessage = "Could not delete zone value. Please try again.";
          toast.error(errorMessage);
        }
      } catch (error: any) {
        // console.error("Error deleting zone value:", error);
        const errorMessage = error?.message || "An error occurred while deleting";
        toast.error(errorMessage);
      }
    },
    [DeleteData, onSubmitSuccess]
  );

  const column = useMemo<ColumnDef<ZoneData>[]>(
    () => [
      {
        id: "value",
        accessorFn: (row) => row.value,
        header: ({ column }) => <DataGridColumnHeader column={column} className="" title="Zone Value" />,
        cell: ({ row }) => {
          const isSelected = selectedItem?.value === row.original.value;
          const zoneValue = row.original.value;

          return (
            <div
              className={`text-gray-800 cursor-pointer p-2 rounded ${isSelected ? "bg-red-500 text-white font-semibold" : "hover:bg-gray-50"
                }`}
              onClick={() => handleSelectedItem(row.original)}
            >
              {zoneValue}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "effDate",
        accessorFn: (row) => row.effDate,
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Date" column={column} />,
        cell: ({ row }) => {
          return <div>{row.original.effDate?.split("T")[0]}</div>;
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "expDate",
        accessorFn: (row) => row.expDate,
        header: ({ column }) => <DataGridColumnHeader className="" title="Expiry Date" column={column} />,
        cell: ({ row }) => {
          return <div>{row.original.expDate?.split("T")[0]}</div>;
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "comments",
        accessorFn: (row) => row.comments,
        header: ({ column }) => <DataGridColumnHeader className="" title="Remarks" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "operation",
        accessorFn: (row) => row.operType,
        header: ({ column }) => <DataGridColumnHeader className="text-center" title="Operation" column={column} />,
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
              <Button
                variant="ghost"
                className="text-lg"
                title="Edit Zone Value"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditZoneValue(row.original);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <Button
                variant="ghost"
                className="text-red-500 text-lg"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectedItem(row.original);
                  setShowDeleteZoneValueDetail(true);
                }}
              >
                <KeenIcon icon="trash" />
              </Button>
              </AccessWrapper>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [selectedItem, handleEditZoneValue, handleDeleteZoneValue, handleSelectedItem, setShowDeleteZoneValueDetail]
  );

  // Fetch data when zoneId or refreshTrigger changes
  useEffect(() => {
    if (selectedChildrenSide?.zoneId) {
      doGetListData(selectedChildrenSide.zoneId, 1, 10000, [{ sort: "ZONE_ID", asc: true }], []);
    }
  }, [selectedChildrenSide?.zoneId, refreshTrigger, doGetListData]);

  useEffect(() => {
    if (zoneValue.length > 0) {
      const isSelectedItemInList =
        selectedItem &&
        zoneValue.some(
          (item) =>
            item.value === selectedItem.value && item.zoneId === selectedItem.zoneId && item.seq === selectedItem.seq
        );

      if (!selectedItem || !isSelectedItemInList) {
        handleSelectedItem(zoneValue[0]);
      }
    } else {
      if (selectedItem) {
        handleSelectedItem(null as any);
      }
    }
  }, [zoneValue, selectedItem, handleSelectedItem]);

  return (
    <div className="flex-1 w-full px-2">
      <div className="relative border-[1px] shadow-md h-full pb-5 p-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
          <h2 className="text-sm font-bold">Zone Value</h2>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="relative">
                <label className="input input-sm h-8 flex items-center gap-2 w-48 lg:w-64">
                  <KeenIcon icon="magnifier" />
                  <input
                    type="text"
                    placeholder="Search Zone Value..."
                    className="grow text-xs"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </label>
              </div>
            </div>

          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
            <Button variant="default" className="h-8 text-sm w-full sm:w-auto" onClick={() => setValueDetail("add")}>
              New Data
            </Button>
          </AccessWrapper>
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
            <Button
              variant="outline"
              className="h-8 text-sm w-full sm:w-auto"
              onClick={() => handleExportZoneValue(true)}
            >
              Export
            </Button>
          </AccessWrapper>
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
            <Button
              variant="outline"
              className="h-8 text-sm w-full sm:w-auto"
              onClick={() => handleAddBatchZoneValue(true)}
            >
              Batch Add Zone Value
            </Button>
          </AccessWrapper>
          <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
            <Button
              variant="outline"
              className="text-sm h-8 w-full sm:w-auto"
              onClick={() => handleDeleteBatchZoneValue(true)}
            >
              Batch Delete Zone Value
            </Button>
          </AccessWrapper>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataGridProvider
            key={`zoneGrid-${selectedChildrenSide?.zoneId ?? 0}`}
            columns={column}
            data={zoneValue}
            layout={{ card: true }}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
              doGetListData(selectedChildrenSide.zoneId, pageIndex + 1, pageSize, sorting, columnFilters)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ZoneValue;
