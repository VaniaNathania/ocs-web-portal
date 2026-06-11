import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { DataGridColumnHeader, DataGridProvider, DefaultTooltip, KeenIcon } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface OfferStatusData {
  id: string;
  actionType: string;
  createdDate: string;
  staffName: string;
}

interface OfferStatusManageProps {
  category: string;
  rowData: any;
  onClose?: () => void;
}

// Mock data untuk offer status
const mockOfferStatus: OfferStatusData[] = [
  {
    id: "1",
    actionType: "STS",
    createdDate: "2025-01-15",
    staffName: "Rara",
  },
  {
    id: "2",
    actionType: "Shilby",
    createdDate: "2025-01-15",
    staffName: "Rere",
  },
  {
    id: "3",
    actionType: "Nitro",
    createdDate: "2025-01-15",
    staffName: "Roro",
  },
  {
    id: "4",
    actionType: "Activate",
    createdDate: "2025-01-14",
    staffName: "Admin",
  },
  {
    id: "5",
    actionType: "Deactivate",
    createdDate: "2025-01-13",
    staffName: "Manager",
  },
];

const OfferStatusManage: React.FC<OfferStatusManageProps> = ({ category, rowData, onClose }) => {
  const [offerStatus, setOfferStatus] = useState<OfferStatusData[]>(mockOfferStatus);
  const [searchValue, setSearchValue] = useState("");

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Filter data based on search
  const filteredOfferStatus = useMemo(() => {
    if (!searchValue) return offerStatus;

    return offerStatus.filter((item) => {
      const matchesSearch =
        item.actionType.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.createdDate.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.staffName.toLowerCase().includes(searchValue.toLowerCase());
      return matchesSearch;
    });
  }, [offerStatus, searchValue]);

  const handleAddNew = () => {
    // console.log("Add new offer status for category:", category);
  };

  const handleEdit = (id: string) => {
    // console.log("Edit offer status:", id);
  };

  const handleDelete = (id: string) => {
    setOfferStatus((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRefresh = () => {
    // console.log("Refresh data for category:", category);
    // Refresh logic here
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Data Grid Columns
  const columns = useMemo<ColumnDef<OfferStatusData>[]>(
    () => [
      {
        accessorFn: (row) => row.actionType,
        id: "actionType",
        header: ({ column }) => <DataGridColumnHeader className="" title="Action Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.createdDate,
        id: "createdDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Created Date" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.staffName,
        id: "staffName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Staff Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "Options",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader title="Options" className="text-center" column={column} />,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleEdit(item.id)}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleDelete(item.id)}
                title="Delete"
              >
                <KeenIcon icon="trash" />
              </button>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    []
  );

  // Function untuk handle data dengan client-side filtering
  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Apply filtering first
      let processedData = [...filteredOfferStatus];

      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof OfferStatusData];
          const bValue = b[id as keyof OfferStatusData];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
          }

          if (aValue < bValue) return desc ? 1 : -1;
          if (aValue > bValue) return desc ? -1 : 1;
          return 0;
        });
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = processedData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        totalCount: processedData.length,
      };
    },
    [filteredOfferStatus]
  );

  // Custom toolbar component
  const OfferStatusToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between item-center p-4">
      <div className="flex w-1/5 gap-3 items-center">
        <label className="input input-sm w-full flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="w-full"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <DefaultTooltip title="New Data" placement="top">
          <Button variant="outline" className="h-7.5" onClick={handleAddNew}>
            <KeenIcon icon="plus" />
            New
          </Button>
        </DefaultTooltip>

        <DefaultTooltip title="Refresh" placement="top">
          <Button variant="outline" className="h-7.5" onClick={handleRefresh}>
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );

  return (
    <div className="h-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header info with close button */}
      <div className="bg-gray-50 p-4 border-b rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Offer Status Management</h3>
            <p className="text-sm text-gray-600">
              Managing offer status for: <span className="font-medium">{category}</span>
            </p>
            {rowData && (
              <p className="text-sm text-gray-600">
                Product Code: <span className="font-medium">{rowData.code}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Data Grid with card layout */}
      <div className="p-4">
        <DataGridProvider
          columns={columns}
          pagination={{ size: 10 }}
          toolbar={<OfferStatusToolbar />}
          layout={{ card: true }}
          sorting={[{ id: "createdDate", desc: true }]}
          serverSide={true}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
          }}
        >
          {/* DataGrid content will be rendered here */}
        </DataGridProvider>
      </div>
    </div>
  );
};

export default OfferStatusManage;
