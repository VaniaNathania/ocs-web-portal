import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, KeenIcon } from "@/components";
import { DeleteAccountItemTypeKey } from "./AccountItemContext";
import {
  AccessWrapper,
  menuAccess,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";

export const ColumnAcctItem = (
  handleDeleteDialog: (
    show: boolean,
    id: number | null,
    deleteType?: DeleteAccountItemTypeKey,
  ) => void,
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    balanceType: AccountItemDetail | null,
  ) => void,
  menuPrivAccess: menuAccess,
): ColumnDef<AccountItemDetail>[] => {
  const baseColumns: ColumnDef<AccountItemDetail>[] = [
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
      accessorKey: "acctResName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Account Balance Type" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },

    {
      accessorKey: "balTypeName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Balance Catalog" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
  ];

  const wrappedColumns = baseColumns.map((col) => {
    // Jangan override kolom actions
    if (col.id === "actions") return col;

    return {
      ...col,
      cell: ({ row, getValue }: any) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleShowDialog(true, "update", row.original);
            // console.log("Row clicked:", row.original);
          }}
          className="cursor-pointer hover:bg-gray-100 w-full h-full"
        >
          {getValue() || "-"}
        </div>
      ),
    };
  });

  const actionsColumn: ColumnDef<AccountItemDetail> = {
    id: "actions",
    header: ({ column }) => (
      <DataGridColumnHeader title="Actions" column={column} />
    ),
    enableSorting: false,
    enableHiding: false,
    cell: (data) => {
      const row = data.row.original;
      return (
        <div className="flex flex-row items-center justify-center">
          <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={() => handleShowDialog(true, "update", row)}
            >
              <KeenIcon icon="notepad-edit" />
            </button>
          </AccessWrapper>
          <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
            <button
              className="btn btn-sm btn-icon btn-clear text-red-500 hover:text-red-700"
              onClick={() =>
                handleDeleteDialog(true, row.acctItemTypeId, "accountItem")
              }
            >
              <KeenIcon icon="trash" />
            </button>
          </AccessWrapper>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[100px] text-center",
      cellClassName: "text-center",
    },
  };

  return [...wrappedColumns, actionsColumn];
};
