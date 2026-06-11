import { DataGridColumnHeader, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import {
  AccessWrapper,
  menuAccess,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export const ColumnBillingCycle = (
  handleBasicShowDialog: (
    show: boolean,
    mode: "create" | "update",
    billingCycleType: BillingCycleList | null,
  ) => void,
  handleCycleDelete: (
    show: boolean,
    typeId: number | null,
    basicId: number | null,
    mode: "mono" | "multi",
  ) => void,
  setSelectedStateFlag: (value: string | null) => void,
  menuPrivAccess: menuAccess,
): ColumnDef<any>[] => {
  const baseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "cycleBeginDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Start Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "cycleEndDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="End Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "debtDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Debt Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "documentDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Document Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "invoiceDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Invoice Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "notificationDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Notification Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "originDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Origin Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "postingDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Posting Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "runDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Run Date" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "state",
      header: ({ column }) => (
        <DataGridColumnHeader title="State" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "stateFlag",
      header: ({ column }) => (
        <DataGridColumnHeader title="Post Paid" column={column} />
      ),
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
      cell: ({ row }) => {
        const data = row.original;
        const isTopRow = row.index === 0; // ✅ hanya baris pertama boleh delete

        return (
          <div className="flex gap-2">
            {/* Tombol Edit */}
            <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleBasicShowDialog(true, "update", data),
                    setSelectedStateFlag(data.stateFlag);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
            </AccessWrapper>

            {/* Tombol Delete */}
            <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
              <Button
                className={`btn btn-sm btn-icon btn-clear border-light ${
                  isTopRow
                    ? "text-red-500 hover:text-red-700 hover:border-red-700"
                    : "opacity-50 cursor-not-allowed"
                }`}
                variant="outline"
                size="sm"
                disabled={!isTopRow}
                onClick={() => {
                  if (isTopRow) {
                    handleCycleDelete(true, null, data.billingCycleId, "mono");
                  } else {
                    toast.error(
                      "Only the topmost billing cycle can be deleted.",
                    );
                  }
                }}
                title={
                  isTopRow
                    ? "Delete this billing cycle"
                    : "Only the topmost billing cycle can be deleted"
                }
              >
                <KeenIcon icon="trash" />
              </Button>
            </AccessWrapper>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      meta: {
        headerClassName: "w-[150px]",
      },
    },
  ];
  return baseColumns;
};
