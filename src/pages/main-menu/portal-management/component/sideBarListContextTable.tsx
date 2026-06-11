import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState } from "react";
import { usePortalList } from "../hook/usePortalList";
import {
  PortalMgrCompData,
  usePortalLayout,
} from "@/layouts/main-menu/portal-management";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";

interface SideBarListProps {
  filter: string;
  search: string;
}

const SideBatListTable = ({ search, filter }: SideBarListProps) => {
  const { menuPrivAccess, handleDeleteDialog, selectedRow, setSelectedRow } =
    usePortalLayout();
  const { rows, loading, error, lastUpdated } = usePortalList();
  const [pageSize, setPageSize] = useState(5);

  const handleSelectToEdit = (val: any) => {
    setSelectedRow(val);
    // console.log(val);
  };

  const availableColumns = useMemo<ColumnDef<PortalMgrCompData>[]>(
    () => [
      {
        accessorFn: (row) => row.portalName,
        id: "portalName",
        // size: 300, // ~30%
        header: ({ column }) => (
          <DataGridColumnHeader title="Portal Name" column={column} />
        ),
        cell: ({ row }) => {
          const isSelected = selectedRow?.portalId === row.original.portalId;
          return <div>{row.original.portalName}</div>;
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.portalId,
        id: "portalId",
        // size: 300, // ~30%
        header: ({ column }) => (
          <DataGridColumnHeader title="Portal Id" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
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
          <div className="flex items-center justify-center gap-2">
            {/* <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              title="Edit"
              onClick={() => handleSelectToEdit(row.original)}
            >
              <KeenIcon icon="notepad-edit" />
            </button> */}
            {/* <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                title="Copy"
                onClick={() => handleToCopy(row.original)}
              >
                <KeenIcon icon="copy" />
              </button>
            </AccessWrapper> */}
            <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                title="Delete"
                onClick={() => handleDeleteDialog(true, row.original)}
              >
                <KeenIcon icon="trash" />
              </button>
            </AccessWrapper>
          </div>
        ),
      },
    ],
    [selectedRow?.portalName],
  );

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, columnFilter: any) => {
      try {
        const tempRole = await rows;
        let processedData = [...tempRole];
        // console.log(processedData, rows, "ini di doget");

        if (search.trim() && filter) {
          const keyword = search.toLowerCase();
          processedData = processedData.filter((item) => {
            if (filter === "name") {
              return item.portalName?.toLowerCase().includes(keyword);
            }
            if (filter === "url") {
              return item.url?.toLowerCase().includes(keyword);
            }
            return true;
          });
        }

        // Sorting logic
        if (sorting && sorting.length > 0) {
          const { id, desc } = sorting[0];
          processedData.sort((a, b) => {
            const aValue = a[id as keyof PortalMgrCompData];
            const bValue = b[id as keyof PortalMgrCompData];

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
    [rows, search, filter, lastUpdated],
  );

  return (
    <DataGridProvider
      key={`available-features-grid-${search}-${filter}-${rows.length}-${lastUpdated}`}
      columns={availableColumns}
      pagination={{ size: pageSize }}
      layout={{ card: false }}
      sorting={[{ id: "portalName", desc: false }]}
      serverSide={true}
      rowSelection={true}
      data={rows}
      getRowProps={(row) => ({
        className:
          row.original.portalId === selectedRow?.portalId
            ? selectedRowHighLight
            : nonSelectedRowHighLight,
        onClick: () => handleSelectToEdit(row.original),
      })}
      // onRowSelectionChange={(row) => setSelectedRow((prev) => (prev = row))}
      onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
        doGetAvailableData(pageIndex + 1, pageSize, sorting, columnFilters)
      }
    />
  );
};

export { SideBatListTable };
