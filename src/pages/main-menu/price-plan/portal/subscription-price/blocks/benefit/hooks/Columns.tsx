import { DataGridColumnHeader, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { DeleteSubscriptionTypeKey } from "../../../hooks";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { PriorityUpdateType } from "../../VersionList";

export const ColumnsSubscriptionBenefit = (
  handleBenefitPriceDialog: (
    show: boolean,
    mode: "create" | "update",
    type: "version" | "price",
    priceId: PriceBenefit | null
  ) => void,
  handleDeleteDialog: (
    show: boolean,
    selectedPrice: PriceBenefit | null,
    deleteType?: DeleteSubscriptionTypeKey
  ) => void,
  sortedPrice: PriceBenefit[] | null,
  changePricePriority: (
    type: PriorityUpdateType,
    payload: {
      priceId: number;
      newPriority: number;
      oldPriority: number;
      priceVerId: number;
    }
  ) => void
): ColumnDef<PriceBenefit>[] => {
  const priceTableData = sortedPrice as PriceBenefit[];

  return [
    {
      accessorKey: "priceName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "acctItemTypeName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Result Account Item Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      id: "calculateUnit",
      header: ({ column }) => (
        <DataGridColumnHeader title="Calculate Unit" column={column} />
      ),
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return `${item.rum} ${item.acctResName} / ${item.value} ${item.reAttrName}`;
      },
      meta: { headerClassName: "w-[250px]" },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
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
                changePricePriority("benefit", {
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
                changePricePriority("benefit", {
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
              onClick={() => {
                handleBenefitPriceDialog(true, "update", "price", item);
              }}
            >
              <KeenIcon icon="notepad-edit" />
            </button>
            <button
              className="btn btn-sm btn-icon btn-clear text-red-500 hover:text-red-700"
              onClick={() => {
                handleDeleteDialog(true, item, "priceBenefit");
              }}
            >
              <KeenIcon icon="trash" />
            </button>
          </div>
        );
      },
    },
  ];
};
