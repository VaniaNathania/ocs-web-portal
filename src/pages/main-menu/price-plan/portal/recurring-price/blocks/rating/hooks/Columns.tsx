import { ColumnDef } from "@tanstack/react-table";
import { DeleteRecurringTypeKey } from "../../../hooks";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { DataGridColumnHeader, KeenIcon } from "@/components";
import { PriorityUpdateType } from "../../VersionList";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

export const getColumns = (
  handlePriceDialog: (
    show: boolean,
    mode: "create" | "update",
    type: "version" | "price",
    priceVersion: PriceDetail | null,
    priceId: number | null
  ) => void,
  handleDeleteDialog: (
    show: boolean,
    id: number | null,
    deleteType?: DeleteRecurringTypeKey
  ) => void,
  sortedPrice: PriceDetail[] | null,
  changePricePriority: (
    type: PriorityUpdateType,
    payload: {
      priceId: number;
      newPriority: number;
      oldPriority: number;
      priceVerId: number;
    }
  ) => void
): ColumnDef<PriceDetail>[] => {
  const priceTableData = sortedPrice as PriceDetail[];

  return [
    {
      accessorKey: "priceName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Price Name" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "acctItemTypeName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Account Item Type Name" column={column} />
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
        return (
          <span>
            {/* {row.original.rum} {row.original.acctItemTypeName} /{" "}
            {row.original.valueString} {row.original.reAttrName} */}
            {row.original.value} {row.original.acctItemTypeName} / {row.original.rum}
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
      cell: ({ row }) => {
        const item = row.original;
        // console.log(item);
        const index = priceTableData.findIndex(
          (p) => p.priceId === item.priceId
        );

        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={index === 0}
              onClick={() =>
                changePricePriority("rating", {
                  priceId: item.priceId,
                  newPriority: priceTableData[index - 1].priority,
                  oldPriority: item.priority,
                  priceVerId: item.priceVerId,
                })
              }
              className="h-8 w-8 p-0 hover:bg-slate-100 disabled:opacity-50"
            >
              {/* <KeenIcon icon="arrow-up" className="w-4 h-4" /> */}
              <FaArrowUp />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={index === priceTableData.length - 1}
              onClick={() =>
                changePricePriority("rating", {
                  priceId: item.priceId,
                  newPriority: priceTableData[index + 1].priority,
                  oldPriority: item.priority,
                  priceVerId: item.priceVerId,
                })
              }
              className="h-8 w-8 p-0 hover:bg-slate-100 disabled:opacity-50"
            >
              {/* <KeenIcon icon="arrow-down" className="w-4 h-4" /> */}
              <FaArrowDown />
            </Button>
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() =>
                handlePriceDialog(true, "update", "price", null, item.priceId)
              }
            >
              <KeenIcon icon="notepad-edit" />
            </button>
            <button
              className="btn btn-sm btn-icon btn-clear text-red-500 hover:text-red-700"
              onClick={() =>
                handleDeleteDialog(true, item.priceId, "priceRating")
              }
            >
              <KeenIcon icon="trash" />
            </button>
          </div>
        );
      },
      meta: {
        headerClassName: "w-[100px] text-center",
        cellClassName: "text-center",
      },
    },
  ];
};
