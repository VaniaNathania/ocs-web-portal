import { DataGridColumnHeader, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import {
  AccessWrapper,
  menuAccess,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

export const ColumnChannel = (
  handleShowDialog: (
    show: boolean,
    mode: "create" | "update",
    selectedChannel: ChannelContactList | null,
  ) => void,
  menuPrivAccess: menuAccess,
): ColumnDef<any>[] => {
  const baseColumns: ColumnDef<any>[] = [
    {
      accessorKey: "contactChannelName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Contact Channel Name" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "systemReserve",
      header: ({ column }) => (
        <DataGridColumnHeader title="Contact Channel Name" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "channelTypeName",
      header: ({ column }) => (
        <DataGridColumnHeader title="Channel Type Name" column={column} />
      ),
      enableSorting: true,
      enableHiding: false,
      meta: {
        headerClassName: "w-[250px]",
      },
    },
    {
      accessorKey: "contactChannelCode",
      header: ({ column }) => (
        <DataGridColumnHeader title="Contact Channel Code" column={column} />
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
        <DataGridColumnHeader title="Comment" column={column} />
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
        <DataGridColumnHeader
          title="Actions"
          className="flex items-center justify-center"
          column={column}
        />
      ),
      cell: ({ row }) => {
        const data = row.original;

        return (
          <div className="flex gap-2">
            <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
              <Button
                className="btn btn-sm btn-icon btn-clear btn-light"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    handleShowDialog(true, "update", data);
                  } catch (error) {
                    toast.error("Failed to check Channel.");
                  }
                }}
              >
                <KeenIcon icon="notepad-edit" />
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
