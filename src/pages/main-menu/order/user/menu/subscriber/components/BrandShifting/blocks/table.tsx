import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { useCallApi } from "@/hooks";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ListToolbar from "./ListToolbar";
import { brandShiftingDummy } from "../data";
import { useSubscriberListContext } from "../../../hooks";
import { Trash } from "lucide-react";
import { deleteToast } from "@/components/common/DeleteToast";

const BrandShiftingTable = () => {
  const { confirm } = useConfirmDialog();
  const { DeleteData } = useCallApi();
  const { selectedSubs } = useSubscriberListContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const DeleteService = async (id: number): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const response = await DeleteData("", {});

      if (response?.status) {
        toast.success(response.message);
        return true;
      } else {
        toast.error(response?.message);
        return false;
      }
    } catch (error) {
      toast.error("Error Deleting Data. Please Check Your Connection!");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: number) => {
    confirm({
      title: "Delete Service",
      message:
        "Are you sure you want to delete this service type? This action cannot be undone.",
      onConfirm: async () => {
        deleteToast("Service");

        // const success = await DeleteService(id);
        // if (success) triggerReload();
      },
      isDeleting,
    });
  };

  const columns = useMemo<ColumnDef<IBrandShiftingList>[]>(
    () => [
      {
        accessorKey: "brandName",
        header: ({ column }) => (
          <DataGridColumnHeader
            title={selectedSubs?.subsPlanName || "Brand Name"}
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { headerClassName: "w-[250px]" },
        filterFn: (row, id, value) =>
          row
            .getValue<string>("brandName")
            ?.toLowerCase()
            .includes(value.toLowerCase()),
      },
      {
        accessorKey: "brandOTC",
        header: ({ column }) => (
          <DataGridColumnHeader title="OTC" column={column} />
        ),
        enableSorting: true,
        meta: { headerClassName: "w-[120px] text-right" },
        cell: ({ row }) => (
          <span className="text-sm text-orange-500">
            {row.getValue<string>("brandOTC")}
          </span>
        ),
      },
      {
        accessorKey: "brandMRC",
        header: ({ column }) => (
          <DataGridColumnHeader title="MRC" column={column} />
        ),
        enableSorting: true,
        meta: { headerClassName: "w-[120px] text-right" },
        cell: ({ row }) => (
          <span className="text-sm text-orange-500">
            {row.getValue<string>("brandMRC")}
          </span>
        ),
      },
      {
        accessorKey: "effectiveType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Effective Date" column={column} />
        ),
        enableSorting: true,
        meta: {
          headerClassName: "w-[180px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorKey: "effectiveDuration",
        header: ({ column }) => (
          <DataGridColumnHeader title="Effective Duration" column={column} />
        ),
        enableSorting: true,
        meta: {
          headerClassName: "w-[150px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorKey: "remarks",
        header: ({ column }) => (
          <DataGridColumnHeader title="Remarks" column={column} />
        ),
        enableSorting: false,
        meta: {
          headerClassName: "w-[200px]",
        },
        cell: ({ row }) =>
          row.getValue("remarks") ? (
            <span className="text-sm text-gray-600">
              {row.getValue<string>("remarks")}
            </span>
          ) : (
            <span className="text-gray-400 italic">-</span>
          ),
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => handleDelete(Number(row.original.id))}
            >
              <KeenIcon icon="trash" />
            </button>
          </div>
        ),
        meta: {
          headerClassName: "w-[80px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [handleDelete]
  );

  return (
    <DataGridProvider
      // key={reloadKey}
      columns={columns}
      data={brandShiftingDummy}
      pagination={{ size: 10 }}
      // toolbar={<ListToolbar />}
      layout={{ card: true }}
      // sorting={[{ id: "id", desc: false }]}
      serverSide={false}
      // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
      //   doGetListDeposit(pageIndex, pageSize, sorting, columnFilters)
      // }
    />
  );
};

export default BrandShiftingTable;
