import { useCallback, useContext, useMemo, useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { PricePlanListContext } from "../hooks/PricePlanContext";
import { ColumnDef } from "@tanstack/react-table";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

const API_URL = apiConfig.service_price_plan;

interface PricePlanItem {
  pricePlanId: number;
  pricePlanName: string;
  pricePlanType: string;
  pricePlanCode: string;
  effDate: string;
  expDate: string | null;
  priority: number;
}

const PriorityTableDialog = () => {
  const {
    showPriorityTable,
    handleShowPriorityTable,
    applyLevel,
    pricePlanTypeId,
  } = useContext(PricePlanListContext);
  const { GetData, PutData } = useCallApi();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);
  const handleEdit = (pricePlanId: number, currentPriority: number) => {
    setEditingId(pricePlanId);
    setEditValue(currentPriority.toString());
  };

  const handleSave = async (pricePlanId: number) => {
    try {
      setIsUpdating(true);
      const newPriority = parseInt(editValue);

      const response = await PutData(`${API_URL}/priceplan/priority/update`, {
        newPriority,
        pricePlanId,
      });

      if (response?.status === true) {
        toast.success(response?.message || "Priority updated successfully");
        setEditingId(null);
        setEditValue("");
      } else {
        toast.error(response?.message || "Failed to update Balance Type");
      }

      handleRefresh();
    } catch (error) {
      console.error("Error updating priority:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const columns = useMemo<ColumnDef<PricePlanItem>[]>(
    () => [
      {
        accessorFn: (row) => row.priority,
        id: "priority",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Priority" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "w-1/12",
          cellClassName: "w-1/12",
        },
        cell: (data: any) => {
          const row = data.row.original;
          const isEditing = editingId === row.pricePlanId;

          return (
            <div className="flex items-center justify-center gap-2">
              {isEditing ? (
                <>
                  <NumericFormat
                    value={editValue}
                    onValueChange={(values) => setEditValue(values.value)}
                    thousandSeparator={false}
                    allowNegative={false}
                    autoFocus
                    className="w-16 text-center"
                  />

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave(row.pricePlanId)}
                    disabled={isUpdating}
                    className="p-1 h-7 w-7"
                  >
                    <KeenIcon icon="check" className="text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="p-1 h-7 w-7"
                  >
                    <KeenIcon icon="cross" className="text-red-600" />
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-center">{row.priority || "-"}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(row.pricePlanId, row.priority)}
                    className="p-1 h-7 w-7"
                  >
                    <KeenIcon icon="pencil" className="text-blue-600" />
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.pricePlanName,
        id: "pricePlanName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Price Plan Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-3/12",
          cellClassName: "w-3/12",
        },
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <p
              className={`${row.pricePlanName ? "" : "text-center"} whitespace-nowrap`}
            >
              {row.pricePlanName || "-"}
            </p>
          );
        },
      },
      {
        accessorFn: (row) => row.pricePlanType,
        id: "pricePlanType",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Price Plan Type"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-2/12",
          cellClassName: "w-2/12",
        },
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <p
              className={`${row.pricePlanType ? "" : "text-center"} whitespace-nowrap`}
            >
              {row.pricePlanType || "-"}
            </p>
          );
        },
      },
      {
        accessorFn: (row) => row.pricePlanCode,
        id: "pricePlanCode",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Price Plan Code"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: "w-2/12",
          cellClassName: "w-2/12",
        },
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <p
              className={`${row.pricePlanCode ? "" : "text-center"} whitespace-nowrap`}
            >
              {row.pricePlanCode || "-"}
            </p>
          );
        },
      },
      {
        id: "validPeriod",
        header: ({ column }) => (
          <DataGridColumnHeader title="Valid Period" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          if (item.expDate == null) {
            return `${item.effDate} -`;
          }
          return `${item.effDate} - ${item.expDate}`;
        },
        meta: {
          headerClassName: "w-3/12",
          cellClassName: "w-3/12",
        },
      },
    ],
    [editingId, editValue, isUpdating]
  );

  const doGetPriorityList = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        sorting =
          sorting.length === 0 ? [{ id: "priority", desc: false }] : sorting;

        let pricePlanName = "";
        let pricePlanCode = "";

        if (filter && Array.isArray(filter)) {
          const nameFilter = filter.find((f) => f.id === "pricePlanName");
          const codeFilter = filter.find((f) => f.id === "pricePlanCode");

          pricePlanName = nameFilter ? nameFilter.value : "";
          pricePlanCode = codeFilter ? codeFilter.value : "";
        }

        const endpoint =
          applyLevel === "A"
            ? `${API_URL}/priceplan/AcctPricePlan/list`
            : `${API_URL}/priceplan/SubsPricePlan/list`;

        const response = await GetData(endpoint, {
          pricePlanType: null,
          spId: 0,
          pricePlanName: pricePlanName,
          pricePlanCode: pricePlanCode,
          size: limit,
          page: page + 1,
          order_field: "priority",
          order_direction: "ASC",
        });

        return {
          data: response?.data || [],
          totalCount: response?.totalRows || 0,
        };
      } catch (error) {
        console.error("Error fetching priority list:", error);
        return { data: [], totalCount: 0 };
      }
    },
    [applyLevel, pricePlanTypeId, GetData]
  );

  const handleDialogClose = (open: boolean) => {
    // Jika sedang edit, prevent close
    if (editingId !== null) {
      return;
    }
    handleShowPriorityTable(open);
  };

  return (
    <Dialog open={showPriorityTable} onOpenChange={handleDialogClose}>
      <DialogContent
        className="max-w-[1400px] flex flex-col p-0 overflow-hidden max-h-[95vh]"
        onInteractOutside={(e) => {
          // Prevent closing saat sedang edit
          if (editingId !== null) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing dengan ESC saat sedang edit
          if (editingId !== null) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="relative p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Price Plan Priority
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                View price plans ordered by priority
                {editingId !== null && (
                  <span className="text-orange-600 font-medium ml-2">
                    (Editing mode - complete or cancel to close)
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="p-6 overflow-auto">
          <DataGridProvider
            key={`${refreshKey}`}
            columns={columns}
            pagination={{ size: 10 }}
            layout={{ card: true }}
            sorting={[{ id: "priority", desc: false }]}
            serverSide={true}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
              doGetPriorityList(pageIndex, pageSize, sorting, columnFilters)
            }
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { PriorityTableDialog };
