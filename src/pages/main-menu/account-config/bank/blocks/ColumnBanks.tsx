import {
  AccessWrapper,
  menuAccess,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  BadgePlus,
} from "lucide-react";

interface ColumnProps {
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update" | "createChild",
    selecedBank: BankRow | null,
  ) => void;
  onDelete: (bankId: number) => void;
  menuPrivAccess: menuAccess;
}

export const ColumnBank = ({
  handleShowDialog,
  onDelete,
  menuPrivAccess,
}: ColumnProps): ColumnDef<BankRow>[] => [
  {
    id: "bankName",
    header: "Bank Name",
    cell: ({ row }) => {
      const hasChildren =
        row.original.subRows && row.original.subRows.length > 0;

      return (
        <div
          style={{
            paddingLeft: `${row.depth * 2}rem`,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {hasChildren ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
          <span className="font-medium text-gray-900">
            {row.original.bankName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "bankCode",
    header: "Bank Code",
    cell: ({ row }) => (
      <span className="text-gray-700">{row.original.bankCode}</span>
    ),
  },
  {
    id: "isSEPABank",
    header: "Is SEPA Bank",
    cell: ({ row }) => (
      <span className="text-gray-700">
        {row.original.directDebitFlag === "Y" ? "Y" : "N"}
      </span>
    ),
  },
  {
    accessorKey: "bic",
    header: "BIC",
    cell: ({ row }) => (
      <span className="text-gray-700">{row.original.bic || "-"}</span>
    ),
  },
  {
    accessorKey: "comments",
    header: "Remarks",
    cell: ({ row }) => (
      <span className="text-gray-500">{row.original.comments || "-"}</span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
          <button
            onClick={() => handleShowDialog(true, "update", row.original)}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4 " />
          </button>
        </AccessWrapper>
        <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
          <button
            onClick={() => handleShowDialog(true, "createChild", row.original)}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors"
            title="Create Child Bank"
          >
            <BadgePlus className="w-4 h-4 " />
          </button>
        </AccessWrapper>
        <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
          <button
            onClick={() => onDelete(row.original.bankId)}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </AccessWrapper>
      </div>
    ),
  },
];
