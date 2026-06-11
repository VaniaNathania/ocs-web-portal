import { DataGridColumnHeader, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import {
  AccessWrapper,
  menuAccess,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export const ColumnBillingCycleType = (
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    billingCycleType: BillingCycleTypeList | null,
  ) => void,
  handleDetailDialog: (
    show: boolean,
    billingCycleType: BillingCycleTypeList,
  ) => void,
  handleDeleteDialog: (show: boolean, id: number | null) => void,
  doGetBillingCycle: (
    page: number,
    size: number,
    billingCycleTypeId: number,
  ) => Promise<{ data: any[]; totalCount: number }>,
  menuPrivAccess: menuAccess,
): ColumnDef<any>[] => {
  const baseColumns: ColumnDef<any>[] = [
    // {
    //   accessorKey: "billingCycleTypeId",
    //   header: ({ column }) => (
    //     <DataGridColumnHeader title="Billing Cycle Type ID" column={column} />
    //   ),
    //   enableSorting: true,
    //   enableHiding: false,
    //   meta: {
    //     headerClassName: "w-[250px]",
    //   },
    // },
    {
      accessorKey: "billingCycleTypeName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Billing Cycle Type Name" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "billingCycleTypeCode",
      header: ({ column }) => (
        <DataGridColumnHeader title="Billing Cycle Type Code" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "comments",
      header: ({ column }) => (
        <DataGridColumnHeader title="Comments" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataGridColumnHeader title="Quantity" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "timeUnit",
      header: ({ column }) => (
        <DataGridColumnHeader title="Time Unit Name" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "beginDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Begin Date" column={column} />
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
      accessorKey: "operator",
      header: ({ column }) => (
        <DataGridColumnHeader title="Operator" column={column} />
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
      accessorKey: "prodType",
      header: ({ column }) => (
        <DataGridColumnHeader title="Prod Type" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "postpaid",
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
      accessorKey: "custType",
      header: ({ column }) => (
        <DataGridColumnHeader title="Customer Type" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "custTypeName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Customer Type Name" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      id: "actions", // tidak perlu accessorKey
      header: ({ column }) => (
        <DataGridColumnHeader
          title="Actions"
          className="flex items-center justify-center"
          column={column}
        />
      ),
      cell: ({ row }) => {
        const data = row.original; // row.original berisi data BillingCycleTypeList

        return (
          <div className="flex gap-2">
            <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    handleDetailDialog(false, data);
                    const res = await doGetBillingCycle(
                      1,
                      1,
                      data.billingCycleTypeId,
                    ); // cek 1 record aja

                    if (res.totalCount > 0) {
                      toast.warning(
                        "Cannot be edited as it still contains the Billing Cycle.",
                      );
                      return;
                    }
                    handleShowDialog(true, "update", data);
                  } catch (error) {
                    toast.error("Faild to check Billing Cycle.");
                  }
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
            </AccessWrapper>
            <Button
              className="btn btn-sm btn-icon btn-clear btn-light"
              variant="outline"
              size="sm"
              onClick={() => handleDetailDialog(true, data)}
            >
              <KeenIcon icon="eye" />
            </Button>
            <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
              <Button
                className="btn btn-sm btn-icon btn-clear border-light text-red-500 hover:text-red-700 hover:border-red-700"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const res = await doGetBillingCycle(
                      1,
                      1,
                      data.billingCycleTypeId,
                    );
                    if (res.totalCount > 0) {
                      toast.warning(
                        "Cannot be deleted as it still contains the Billing Cycle.",
                      );
                      return;
                    }
                    handleDeleteDialog(true, data.billingCycleTypeId);
                  } catch (error) {
                    toast.error("Faild to check Billing Cycle.");
                  }
                }}
              >
                <KeenIcon icon="trash" />
              </Button>
            </AccessWrapper>

            {/* <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteDialog(data)}
            >
              Delete
            </Button> */}
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
