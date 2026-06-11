import {
  DataGridColumnHeader,
  DataGridPagination,
  DataGridProvider,
  DataGridTable,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRoleList } from "../hook/useRolesList";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { AccessWrapper } from "../hook/useRoleCheck";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { Button } from "@/components/ui/button";

export interface RoleSPID {
  roleId: number | null;
  roleName: string;
  roleCode: string;
  comments?: string;
  isLocked: string;
  appId: number;
  isCopy?: boolean;
}

interface SideBarListProps {
  selectedRow: any;
  setSelectedRow: (updater: (prev: any) => any) => void;
  filter: string;
  search: string;
}

const SideBatListTable = ({
  selectedRow,
  setSelectedRow,
  search,
  filter,
}: SideBarListProps) => {
  const { roles, loading, error, lastUpdated } = useRoleList();
  const [pageSize, setPageSize] = useState(5);
  const { menuPrivAccess } = useRoleLayout();

  // console.log(menuPrivAccess);

  const handleSelectToEdit = (val: any) => {
    setSelectedRow(val);
    // console.log(val);
  };

  const handleToCopy = (val: RoleSPID) => {
    // console.log("test");

    const temp: RoleSPID = {
      roleId: val.roleId,
      roleName: val.roleName + "-copy",
      roleCode: val.roleCode + "-copy",
      comments: val.comments,
      isLocked: val.isLocked,
      appId: val.appId,
      isCopy: true,
    };

    // console.log(temp);

    setSelectedRow((prev) => (prev = temp));
  };

  const { handleDeleteDialog } = useRoleLayout();

  const availableColumns = useMemo<ColumnDef<RoleSPID>[]>(
    () => [
      {
        accessorFn: (row) => row.roleName,
        id: "roleName",
        // size: 300, // ~30%
        header: ({ column }) => (
          <DataGridColumnHeader title="Role Name" column={column} />
        ),
        cell: ({ row }) => {
          const isSelected = selectedRow?.roleId === row.original.roleId;
          return (
            <div
            // onClick={() => handleSelectToEdit(row.original)}
            // className={isSelected ? selectedRowHigligt : "cursor-pointer"}
            >
              {row.original.roleName}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,

        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
      },
      {
        accessorFn: (row) => row.roleCode,
        id: "roleCode",
        // size: 300,
        header: ({ column }) => (
          <DataGridColumnHeader title="Code" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
      },
      {
        accessorFn: (row) => row.isLocked,
        id: "isLocked",
        // size: 100,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Locked"
            // className="w-1/4"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div>{row.original.isLocked === "Y" ? "Yes" : "No"}</div>
        ),
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
      },
      {
        id: "options",
        // size: 300,
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Options"
            className="text-center"
            column={column}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2 z-5">
            {/* Edit */}
            {/* <AccessWrapper hasAccess={menuPrivAccess?.editStatus ?? false}>
              <Button
                size={"sm"}
                variant={"ghost"}
                // className="btn btn-sm btn-icon btn-clear btn-light"
                title="Edit"
                onClick={() => handleSelectToEdit(row.original)}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
            </AccessWrapper> */}

            {/* Copy */}
            {/* <AccessWrapper hasAccess={menuPrivAccess?.addStatus ?? false}>
              <Button
                size={"sm"}
                variant={"ghost"}
                // className="btn btn-sm btn-icon btn-clear btn-light"
                title="Copy"
                onClick={() => handleToCopy(row.original)}
              >
                <KeenIcon icon="copy" />
              </Button>
            </AccessWrapper> */}

            {/* Delete */}
            <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus ?? false}>
              <Button
                size={"sm"}
                variant={"ghost"}
                // className="btn btn-sm btn-icon btn-clear btn-light "
                title="Delete"
                onClick={() => handleDeleteDialog(true, row.original)}
              >
                <KeenIcon icon="trash" />
              </Button>
            </AccessWrapper>
          </div>
        ),
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
      },
    ],
    [selectedRow?.roleId]
  );

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, columnFilter: any) => {
      try {
        const tempRole = await roles;
        let processedData = [...tempRole];
        // console.log(processedData, roles, "ini di doget");

        if (search.trim() && filter) {
          const keyword = search.toLowerCase();
          processedData = processedData.filter((item) => {
            if (filter === "name") {
              return item.roleName?.toLowerCase().includes(keyword);
            }
            if (filter === "code") {
              return item.roleCode?.toLowerCase().includes(keyword);
            }
            return true;
          });
        }

        // Sorting logic
        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof RoleSPID];
            const bValue = b[id as keyof RoleSPID];

            if (aValue === undefined || bValue === undefined) return 0;

            if (typeof aValue === "string" && typeof bValue === "string") {
              return desc
                ? bValue.localeCompare(aValue)
                : aValue.localeCompare(bValue);
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
              return desc ? bValue - aValue : aValue - bValue;
            }

            return 0;
          });
        }

        if (limit !== pageSize) {
          setPageSize(limit);
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = processedData.slice(startIndex, endIndex);
        setSelectedRow((prev) => (prev = paginatedData[0]));

        return {
          data: paginatedData,
          totalCount: processedData.length,
        };
      } catch (err: any) {
        console.error("❌ Error fetching offer data:", err);

        return {
          data: [],
          totalCount: 0,
        };
      }
    },
    [roles, search, filter, lastUpdated]
  );

  return (
    <DataGridProvider
      key={`available-features-grid-${search}-${filter}-${roles.length}-${lastUpdated}`}
      columns={availableColumns}
      pagination={{ size: pageSize }}
      layout={{ card: false }}
      sorting={[{ id: "roleName", desc: false }]}
      serverSide={true}
      onRowSelectionChange={(props) => props}
      rowSelection={true}
      data={roles}
      getRowProps={(row) => ({
        className:
          row.original.roleId === selectedRow?.roleId
            ? selectedRowHighLight
            : nonSelectedRowHighLight,
        onClick: () => {
          if (row.original.roleId !== selectedRow.roleId)
            setSelectedRow((prev) => (prev = row.original));
        },
      })}
      // onRowSelectionChange={(row) => setSelectedRow((prev) => (prev = row))}
      onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
        doGetAvailableData(pageIndex + 1, pageSize, sorting, columnFilters)
      }
    >
      <div className="overflow-y-auto h-[350px] border-2">
        <DataGridTable />
      </div>
      <DataGridPagination />
    </DataGridProvider>
  );
};

export { SideBatListTable };
