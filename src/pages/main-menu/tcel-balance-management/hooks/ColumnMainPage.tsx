import { DataGridColumnHeader, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import useTcelBalanceAdjustmentContext from "./useTcelBalanceAjustmentContext";
import {
  AccessWrapper,
  menuAccess,
} from "../../role-management/hook/useRoleCheck";

export const ColumnMainPage = (
  handleShowDialog: (show: boolean, mode: "create" | "update" | "detail", data?: any) => void,
  doGetBillingCycle: (
    acctId: number,
    page: number,
    size: number,
  ) => Promise<{ data: any[]; totalCount: number }>,
  menuPrivAccess: menuAccess,
): ColumnDef<any>[] => {
  const baseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "acctNbr",
      header: ({ column }) => (
        <DataGridColumnHeader title="Account Number" column={column} />
      ),
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "acctName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Account Name" column={column} />
      ),
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "balType",
      header: ({ column }) => (
        <DataGridColumnHeader title="Balance Type" column={column} />
      ),
      cell: ({ getValue }) => getValue() || "-",
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "effDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Effective Date" column={column} />
      ),
      cell: ({ getValue }) => getValue() || "-",
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "expDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Expired Date" column={column} />
      ),
      cell: ({ getValue }) => getValue() || "-",
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
            <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                variant="outline"
                size="sm"
                onClick={async () => {
                  handleShowDialog(true, "update", data);
                }}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
            </AccessWrapper>
            <Button
              className="btn btn-sm btn-icon btn-clear btn-light"
              variant="outline"
              size="sm"
              onClick={() => handleShowDialog(true, "detail", data)}
            >
              <KeenIcon icon="eye" />
            </Button>
            {/* <Button
              className="btn btn-sm btn-icon btn-clear border-light text-red-500 hover:text-red-700 hover:border-red-700"
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const res = await doGetBillingCycle(
                    1,
                    1,
                    data.billingCycleTypeId
                  );
                  if (res.totalCount > 0) {
                    toast.warning(
                      "Cannot be deleted as it still contains the Billing Cycle."
                    );
                    return;
                  }
                  handleDeleteDialog(true, "update");
                } catch (error) {
                  toast.error("Faild to check Billing Cycle.");
                }
              }}
            >
              <KeenIcon icon="trash" />
            </Button> */}

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
