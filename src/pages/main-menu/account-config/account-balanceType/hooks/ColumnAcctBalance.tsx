import { ColumnDef } from "@tanstack/react-table";
import { DeleteAccountConfigTypeKey } from "./AccountBalanceContext";
import { DataGridColumnHeader, KeenIcon } from "@/components";
import useAccountBalanceContext from "./useAccountBalanceContext";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import {
  AccessWrapper,
  menuAccess,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";

export const ColumnAcctBalance = (
  handleDeleteDialog: (
    show: boolean,
    id: number | null,
    deleteType?: DeleteAccountConfigTypeKey,
  ) => void,
  menuPrivAccess: menuAccess,
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    balanceType: AccountBalanceTypeInformation | null,
    acctResId: number | null,
  ) => void,
): ColumnDef<any>[] => {
  // const { setSelectedBalanceType, setSelectedId } = useAccountBalanceContext();
  const baseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "acctResId",
      header: ({ column }) => (
        <DataGridColumnHeader title="Acct Res Id" column={column} />
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
        <DataGridColumnHeader title="Balance Type Name" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "isCurrency",
      header: ({ column }) => (
        <DataGridColumnHeader title="Is Currency" column={column} />
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
    {
      accessorKey: "defaultAcctItemType",
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Default Account Item Type"
          column={column}
        />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "maxValue",
      header: ({ column }) => (
        <DataGridColumnHeader title="Maximum Balance" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "unitTypeId",
      header: ({ column }) => (
        <DataGridColumnHeader title="Unit Type" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataGridColumnHeader title="Priority" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "maxTopupAmount",
      header: ({ column }) => (
        <DataGridColumnHeader title="Max Topup Amount" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "maxExpDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Max Expiration Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "maxAdjustValue",
      header: ({ column }) => (
        <DataGridColumnHeader title="Max Adjust Balance" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "resetZeroName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Reset To Zero" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "acmThreshold",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulate Threshold" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "acmType",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulate Type" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "acmUnitName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulate Unit" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "acmAmount",
      header: ({ column }) => (
        <DataGridColumnHeader title="Accumulate Amount" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "ceilLimit",
      header: ({ column }) => (
        <DataGridColumnHeader title="Ceil Limit" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "floorLimit",
      header: ({ column }) => (
        <DataGridColumnHeader title="Floor Limit" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "dailyCeilLimit",
      header: ({ column }) => (
        <DataGridColumnHeader title="Daily Ceil Limit" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "dailyFloorLimit",
      header: ({ column }) => (
        <DataGridColumnHeader title="Daily Floor Limit" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "dayThreshold",
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Daily Transfer Threshold"
          column={column}
        />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "weekThreshold",
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Weekly Transfer Threshold"
          column={column}
        />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "monthThreshold",
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Monthly Transfer Threshold"
          column={column}
        />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "dayCount",
      header: ({ column }) => (
        <DataGridColumnHeader title="Daily Transfer Count" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "weekCount",
      header: ({ column }) => (
        <DataGridColumnHeader title="Weekly Transfer Count" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "monthCount",
      header: ({ column }) => (
        <DataGridColumnHeader title="Monthly Transfer Count" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "minResidualBal",
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Min Transfer Residual Bal"
          column={column}
        />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "maxAllowed",
      header: ({ column }) => (
        <DataGridColumnHeader title="Max Transfer Allowed" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "minAllowed",
      header: ({ column }) => (
        <DataGridColumnHeader title="Min Transfer Allowed" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "overdraftFlag",
      header: ({ column }) => (
        <DataGridColumnHeader title="Is Overdraft" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "customerFlag",
      header: ({ column }) => (
        <DataGridColumnHeader title="Is Customer" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "reservePercentage",
      header: ({ column }) => (
        <DataGridColumnHeader title="Reserve Percentage" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    // {
    //   id: "actions",
    //   header: ({ column }) => (
    //     <DataGridColumnHeader title="Actions" column={column} />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    //   cell: (data) => {
    //     const row = data.row.original;
    //     // console.log(row);
    //     return (
    //       <>
    //         {/* <button
    //           className="btn btn-sm btn-icon btn-clear btn-light"
    //           onClick={() => handlePriceDialog(true, "update", null, row.priceId)}
    //         >
    //           <KeenIcon icon="notepad-edit" />
    //         </button> */}
    //         <button
    //           className="btn btn-sm btn-icon btn-clear text-red-500 hover:text-red-700"
    //           onClick={() =>
    //             handleDeleteDialog(true, row.priceId, "balanceType")
    //           }
    //         >
    //           <KeenIcon icon="trash" />
    //         </button>
    //       </>
    //     );
    //   },
    //   meta: {
    //     headerClassName: "w-[100px] text-center",
    //     cellClassName: "text-center",
    //   },
    // },
  ];

  const wrappedColumns = baseColumns.map((col) => {
    if (col.id === "actions") return col;

    return {
      ...col,
      cell: ({ row, getValue }: any) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleShowDialog(
              true,
              "update",
              row.original,
              row.original.acctResId,
            ); // ✅ BENAR
          }}
          className="cursor-pointer hover:bg-gray-100 w-full h-full"
        >
          {getValue() || "-"}
        </div>
      ),
    };
  });

  const actionsColumn: ColumnDef<any> = {
    id: "actions",
    header: ({ column }) => (
      <DataGridColumnHeader title="Actions" column={column} />
    ),
    enableSorting: false,
    enableHiding: false,
    cell: (data) => {
      const row = data.row.original;
      return (
        <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
          <button
            className="btn btn-sm btn-icon btn-clear text-red-500 hover:text-red-700"
            onClick={() =>
              handleDeleteDialog(true, row.acctResId, "balanceType")
            }
          >
            <KeenIcon icon="trash" />
          </button>
        </AccessWrapper>
      );
    },
    meta: {
      headerClassName: "w-[100px] text-center",
      cellClassName: "text-center",
    },
  };

  return [actionsColumn, ...wrappedColumns];
};
