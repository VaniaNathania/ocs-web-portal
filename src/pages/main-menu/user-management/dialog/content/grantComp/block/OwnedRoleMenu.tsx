import { useMemo, useCallback, useState } from "react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompList } from "../hook/useComp";
import { MenuData } from "../hook/CompProvider";
import { useCallApi } from "@/hooks";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { toast } from "sonner";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

export const OwnedRoleComp = () => {
  const {
    lastUpdated,
    ownedComponents,
    selectedOwned,
    setSelectedOwned,
    loading,
    fetchAll,
  } = useCompList();
  const { selectedRow } = useRoleLayout();
  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedValue, setEditedValue] = useState<string>("N");
  const { PutData } = useCallApi();

  // const [selectedUsers, setSelectedUsers] = useState<MenuData[]>([]);

  const OwnedCompColumn = useMemo<ColumnDef<MenuData>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isAllSelected(
                table.getFilteredRowModel().rows.map((r) => r.original),
              )}
              onChange={() =>
                handleSelectAll(
                  table.getFilteredRowModel().rows.map((r) => r.original),
                )
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        ),
        cell: ({ row }) => {
          const feature = row.original;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectedOwned.some((p) => p.privId === feature.privId)}
                onChange={() => handleSelectRow(feature)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.url,
        id: "url",
        header: ({ column }) => (
          <DataGridColumnHeader title="Menu Name" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "w-[300px] overflow-hidden text-elipsis",
        },
      },
      {
        accessorFn: (row) => row.privName,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Component Name" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => (
          <DefaultTooltip placement="top" title={row.original.privName}>
            <div className="overflow-hidden text-ellipsis whitespace-nowrap w-full">
              {row.original.privName}
            </div>
          </DefaultTooltip>
        ),
        meta: {
          headerClassName:
            "max-w-[200px] min-w-[100px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "max-w-[200px] min-w-[100px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
      {
        accessorFn: (row) => row.privLevel,
        id: "autoOpenMenu",
        header: ({ column }) => (
          <DataGridColumnHeader title="Previlage level" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const isEditing = editingRowId === row.original.privId;
          let strLevel = "Visible";
          let feature = row.original;
          switch (feature.privLevel) {
            case "1":
              strLevel = "Read Only";
              break;
            case "2":
              strLevel = "Hidden";
              break;
            default:
              strLevel = "Visible";
              break;
          }
          return isEditing ? (
            <Select
              value={editedValue}
              onValueChange={(val) => setEditedValue(val)}
            >
              <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
                <SelectValue placeholder="Visible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Visible</SelectItem>
                <SelectItem value="1">Read Only</SelectItem>
                <SelectItem value="2">Hidden</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div>{strLevel}</div>
          );
        },
        meta: {
          headerClassName: "w-[100px] overflow-hidden",
          // cellClassName: "text-center",
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
          const isEditing = editingRowId === row.original.privId;

          return (
            <div className="flex items-center justify-center gap-2">
              {isEditing ? (
                <>
                  <button
                    className="btn btn-sm btn-icon btn-success"
                    onClick={() => {
                      // Save logic here
                      // e.g., update data and clear editingRowId
                      row.original.privLevel = editedValue;
                      setEditingRowId(null);
                      updatePrivLevel(row.original);
                    }}
                  >
                    <KeenIcon icon="check" />
                  </button>
                  <button
                    className="btn btn-sm btn-icon btn-secondary"
                    onClick={() => {
                      setEditingRowId(null);
                    }}
                  >
                    <KeenIcon icon="cross" />
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  title="Edit"
                  onClick={() => {
                    setEditingRowId(row.original.privId);
                    setEditedValue(row.original.autoOpenMenu as "Y" | "N");
                  }}
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [selectedOwned, editingRowId, editedValue],
  );

  const doGetOwnedRoleData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Apply filtering first
      // console.log(ownedComponents);

      let processedData = [...ownedComponents];

      if (search.trim() && filterBy) {
        const keyword = search.toLowerCase();
        processedData = processedData.filter((item) => {
          if (filterBy === "name") {
            return item.privName?.toLowerCase().includes(keyword);
          }
          if (filterBy === "url") {
            return item.url?.toLowerCase().includes(keyword);
          }
          return true;
        });
      }

      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof MenuData];
          const bValue = b[id as keyof MenuData];

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
    [ownedComponents, search, filterBy],
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: MenuData[]) => {
    return filteredData.every((row) =>
      selectedOwned.some((selected) => selected.privId === row.privId),
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: MenuData[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedOwned((prev) =>
        prev.filter(
          (item) => !filteredData.some((row) => row.privId === item.privId),
        ),
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedOwned,
        ...filteredData.filter(
          (row) => !selectedOwned.some((sel) => sel.privId === row.privId),
        ),
      ];
      setSelectedOwned(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: MenuData) => {
    if (selectedOwned.some((p) => p.privId === row.privId)) {
      setSelectedOwned((prev) => prev.filter((p) => p.privId !== row.privId));
    } else {
      setSelectedOwned((prev) => [...prev, row]);
    }
  };

  const updatePrivLevel = async (row: MenuData) => {
    //  console.log(row);
    try {
      //  console.log("🚀 Editing role with data:", {
      //   ...row,
      //   roleId: selectedRow?.roleId,
      //   privLevel: editedValue,
      // });

      const response = await PutData(`${API_ROLE}/api/roles/privlevel`, {
        ...row,
        roleId: selectedRow?.roleId,
        privLevel: editedValue,
      });

      //  console.log("📦 API Response:", response);

      if (response?.status) {
        toast.success("Portal edited successfully!");

        const createActivity = {
          module: "Manage Role Management",
          description: `Edit Role Portal=> ${selectedRow?.roleName}`,
          action: "E",
        };
        doSaveLogActivity(createActivity);

        //  console.log("✅ Role updated successfully");
      } else {
        const errorMessage =
          response?.message || "Failed to Update role. Please try again.";
        toast.error(errorMessage);
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      console.error("❌ Error updating role:", error);
    } finally {
      fetchAll();
    }
  };

  return (
    <div>
      <div className="flex flex-row w-full justify-between">
        <div></div>
        <div className="flex flex-row py-2 space-x-2 w-1/2">
          <div className="flex my-auto w-1/4">
            <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
              <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
                <SelectValue placeholder="Menu Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Menu Name</SelectItem>
                <SelectItem value="url">Menu Url</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-3/4">
            <label className="input input-sm w-full flex items-center gap-2">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder={`Search Menu by ${filterBy}..`}
                className="w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="relative">
        {loading && <Loading />}

        <DataGridProvider
          key={`available-features-grid-${ownedComponents.length}-${search}-${filterBy}-${lastUpdated}`}
          columns={OwnedCompColumn}
          pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetOwnedRoleData(
              pageIndex + 1,
              pageSize,
              sorting,
              columnFilters,
            );
          }}
        >
          {/* Available Features DataGrid content */}
        </DataGridProvider>
      </div>
    </div>
  );
};
