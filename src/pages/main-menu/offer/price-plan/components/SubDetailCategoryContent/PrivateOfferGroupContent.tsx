import React, { useState, useMemo, useCallback } from "react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface PrivateOfferGroupData {
  id: string;
  groupName: string;
  description: string;
  offers: number;
  status: string;
  lastModified: string;
}

interface PrivateOfferGroupProps {
  category: string;
}

// Mock data untuk private offer groups
const mockPrivateOfferGroups: PrivateOfferGroupData[] = [
  {
    id: "1",
    groupName: "VIP Customer Group",
    description: "Exclusive offers for VIP customers",
    offers: 5,
    status: "Active",
    lastModified: "2024-02-20",
  },
  {
    id: "2",
    groupName: "Corporate Package",
    description: "Special packages for corporate clients",
    offers: 3,
    status: "Active",
    lastModified: "2024-02-18",
  },
  {
    id: "3",
    groupName: "Student Discount",
    description: "Discounted offers for students",
    offers: 2,
    status: "Inactive",
    lastModified: "2024-02-15",
  },
  {
    id: "4",
    groupName: "Senior Citizen",
    description: "Special offers for senior citizens",
    offers: 4,
    status: "Active",
    lastModified: "2024-02-10",
  },
];

const PrivateOfferGroupContent: React.FC<PrivateOfferGroupProps> = ({
  category,
}) => {
  const [groups, setGroups] = useState<PrivateOfferGroupData[]>(mockPrivateOfferGroups);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter groups based on search
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleAddGroup = () => {
    // console.log("Add new group");
  };

  const handleEditGroup = (groupId: string) => {
    // console.log("Edit group:", groupId);
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "Active":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Inactive":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getOffersBadge = (count: number) => {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
        {count}
      </span>
    );
  };

  // Data Grid Columns
  const columns = useMemo<ColumnDef<PrivateOfferGroupData>[]>(
    () => [
      {
        accessorFn: (row) => row.groupName,
        id: "groupName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Group Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const groupName = row.original.groupName;
          return (
            <div className="font-medium text-gray-900">
              {groupName}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.description,
        id: "description",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Description"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const description = row.original.description;
          return (
            <div className="max-w-xs truncate text-gray-600" title={description}>
              {description}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.offers,
        id: "offers",
        header: ({ column }) => (
          <DataGridColumnHeader
            className="text-center"
            title="Offers"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const offers = row.original.offers;
          return (
            <div className="text-center">
              {getOffersBadge(offers)}
            </div>
          );
        },
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Status" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const status = row.original.status;
          return <span className={getStatusBadge(status)}>{status}</span>;
        },
      },
      {
        accessorFn: (row) => row.lastModified,
        id: "lastModified",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Last Modified"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const lastModified = row.original.lastModified;
          return (
            <div className="text-gray-600">
              {lastModified}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Actions"
            className="text-center"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const group = row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleEditGroup(group.id)}
                title="Edit"
              >
                <KeenIcon icon="notepad-edit" />
              </button>
              <button
                className="btn btn-sm btn-icon btn-clear btn-light"
                onClick={() => handleDeleteGroup(group.id)}
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
      let processedData = [...filteredGroups];

      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof PrivateOfferGroupData];
          const bValue = b[id as keyof PrivateOfferGroupData];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return desc
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
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
    [filteredGroups]
  );

  // Custom toolbar component
  const PrivateOfferGroupToolbar = () => (
    <div className="flex flex-wrap gap-2 lg:gap-5 w-full justify-between item-center p-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Private Offer Groups</h3>
        <span className="text-sm text-gray-500">({category})</span>
      </div>

      <div className="flex w-1/5 gap-3 items-center">
        <label className="input input-sm w-full flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <DefaultTooltip title="Add Group" placement="top">
          <Button
            variant="default"
            className="h-7.5"
            onClick={handleAddGroup}
          >
            <KeenIcon icon="plus" className="mr-2" />
            Add Group
          </Button>
        </DefaultTooltip>

        <DefaultTooltip title="Refresh" placement="top">
          <Button
            variant="outline"
            className="h-7.5"
            onClick={() => window.location.reload()}
          >
            <KeenIcon icon="arrows-circle" />
          </Button>
        </DefaultTooltip>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <DataGridProvider
        columns={columns}
        pagination={{ size: 10 }}
        toolbar={<PrivateOfferGroupToolbar />}
        layout={{ card: true }}
        sorting={[{ id: "groupName", desc: false }]}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
          return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
        }}
      >
        {/* DataGrid content will be rendered here */}
      </DataGridProvider>
    </div>
  );
};

export default PrivateOfferGroupContent;