import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { DeleteSubscriptionTypeKey } from "./SubscriptionCreateContext";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useSubscriptionPriceCreateContext } from "./useSubscriptionCreateContext";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { PriorityUpdateType } from "../blocks/VersionList";

const API_URL = apiConfig.service_price_plan;

export const getColumns = (
  handleEditPriceDialog: (show: boolean, priceId: number | null) => void,
  handleDeleteDialog: (
    show: boolean,
    id: number | null,
    deleteType?: DeleteSubscriptionTypeKey
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
      accessorKey: "calculateUnit",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Calculate Unit
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },

      cell: ({ row }) => {
        const item = row.original
        return (
          <span>
            {item.value} {item.acctItemTypeName} /{" "}
            {item.rum} {item.reAttrName}
          </span>
        );
      },
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
              onClick={() => {
                handleEditPriceDialog(true, item.priceId);
              }}
            >
              <KeenIcon icon="notepad-edit" />
            </button>
            <button
              className="btn btn-sm btn-icon btn-clear text-red-500 hover:text-red-700"
              onClick={() => {
                handleDeleteDialog(true, item.priceId, "priceRating");
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
