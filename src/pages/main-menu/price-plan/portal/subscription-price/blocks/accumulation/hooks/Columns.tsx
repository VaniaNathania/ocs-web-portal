import { ColumnDef } from "@tanstack/react-table";
import { DeleteSubscriptionTypeKey } from "../../../hooks";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { DataGridColumnHeader, KeenIcon } from "@/components";

export const ColumnAccumulations = (
  handlePriceDialog: (
    show: boolean,
    dialogMode: "create" | "update",
    priceVersion: AccumulationVersion | null,
    priceId: number | null
  ) => void,
  handleDeleteDialog: (
    show: boolean,
    priceId: number | null,
    priceVer: AccumulationVersion | null,
    deleteType?: DeleteSubscriptionTypeKey
  ) => void
): ColumnDef<AccumulationVersion>[] => [
  {
    accessorKey: "resourceName",
    header: ({ column }) => (
      <DataGridColumnHeader title="Accumulation Type" column={column} />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      headerClassName: "w-[250px]",
    },
  },
  {
    accessorKey: "calculateUnit",
    header: ({ column }) => (
      <DataGridColumnHeader title="Calculate Unit" column={column} />
    ),
    cell: ({ row }) => {
      const item = row.original

      return (
        <span>
          {item.accumulation} {item.resourceName} / {item.rum} {item.reAttrName}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: false,
    meta: {
      headerClassName: "w-[250px]",
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataGridColumnHeader title="Actions" column={column} />
    ),
    enableSorting: false,
    enableHiding: false,
    cell: (data) => {
      const row = data.row.original;
      return (
        <>
          <button
            className="btn btn-sm btn-icon btn-clear btn-light"
            onClick={() => handlePriceDialog(true, "update", row, row.priceId)}
          >
            <KeenIcon icon="notepad-edit" />
          </button>
          <button
            className="btn btn-sm btn-icon btn-clear text-red-500 hover:text-red-700"
            onClick={() =>
              handleDeleteDialog(true, row.priceId, row, "priceAccumulation")
            }
          >
            <KeenIcon icon="trash" />
          </button>
        </>
      );
    },
    meta: {
      headerClassName: "w-[100px] text-center",
      cellClassName: "text-center",
    },
  },
];
