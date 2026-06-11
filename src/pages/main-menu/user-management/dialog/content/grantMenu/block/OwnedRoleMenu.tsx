import { useMemo, useCallback, useState } from "react";
import {
  DataGridColumnHeader,
  DataGridPagination,
  DataGridProvider,
  DataGridTable,
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
import { useMenuList } from "../hook/useMenu";
import { MenuData } from "../menuInterfaces";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

export const OwnedRoleMenu = () => {
  const {
    lastUpdated,
    ownedMenus,
    selectedOwned,
    setSelectedOwned,
    fetchAll,
    availableMenus,
    loading,
  } = useMenuList();
  const { selectedRow } = useRoleLayout();
  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedValue, setEditedValue] = useState<string>("N");
  const { PutData } = useCallApi();

  // const [selectedUsers, setSelectedUsers] = useState<MenuData[]>([]);

  const OwnedMenuColumn = useMemo<ColumnDef<MenuData>[]>(
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
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 w-[50px] text-center text-ellipsis whitespace-nowrap ",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.privName,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Menu Name" column={column} />
        ),
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.privName}>
              <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {row.original.privName}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 overflow-hidden text-elipsis",
          cellClassName: "text-elipsis overflow-hidden",
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.url,
        id: "url",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Url"
            column={column}
            // className="w-[10px] overflow-clip text-ellipsis"
          />
        ),
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.url}>
              <div className="w-full overflow-hidden text-ellipsis">
                {row.original.url}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 overflow-clip text-elipsis",
          cellClassName: " text-elipsis overflow-hidden",
        },
        enableSorting: true,
        enableHiding: false,
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
                      row.original.autoOpenMenu = editedValue;
                      setEditingRowId(null);
                      handleUpdateAutoOn(row.original);
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
        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100 w-[100px]",
          cellClassName: "",
        },
      },
    ],
    [selectedOwned, editingRowId, editedValue, ownedMenus, availableMenus],
  );

  const doGetOwnedRoleData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Apply filtering first
      // console.log(ownedMenus);

      let processedData = [...ownedMenus];

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
    [ownedMenus, search, filterBy, lastUpdated, availableMenus],
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

  const handleUpdateAutoOn = async (data: MenuData) => {
    data.autoOpenMenu = editedValue;

    const temp = {};
    try {
      //  console.log("🚀 Editing role with data:", {
      //   ...data,
      //   roleId: selectedRow?.roleId,
      //   autoOpenMenu: editedValue,
      // });

      const response = await PutData(`${API_ROLE}/api/roles/menus/autoOpen`, {
        ...data,
        roleId: selectedRow?.roleId,
        autoOpenMenu: editedValue,
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
          key={`available-features-grid-${ownedMenus.length}-${availableMenus.length}-${search}-${filterBy}-${lastUpdated}`}
          columns={OwnedMenuColumn}
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
          <div className="overflow-y-auto h-[300px] border-2">
            <DataGridTable />
          </div>
          {ownedMenus.length > 0 && <DataGridPagination />}
        </DataGridProvider>
      </div>
    </div>
  );
};
