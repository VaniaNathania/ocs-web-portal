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
import { useMenuList } from "../hook/useMenu";
import { MenuData } from "../menuInterfaces";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { Loading } from "../../../block/loadingBlock";
import { Button } from "@/components/ui/button";
import { AccessWrapper } from "../../../hook/useRoleCheck";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

interface privilage {
  readStatus: "Y" | "N";
  editStatus: "Y" | "N";
  addStatus: "Y" | "N";
  deleteStatus: "Y" | "N";
}

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
  const { selectedRow, menuPrivAccess } = useRoleLayout();
  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedValue, setEditedValue] = useState<string>("N");
  const [editPriv, setEditPriv] = useState<privilage>({
    addStatus: "N",
    readStatus: "N",
    editStatus: "N",
    deleteStatus: "N",
  });
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
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.privName,
        id: "privName",
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
          headerClassName: "max-w-[400px] overflow-hidden text-elipsis",
          cellClassName: "max-w-[400px] text-elipsis overflow-hidden",
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
          headerClassName: "max-w-[200px] overflow-clip text-elipsis",
          cellClassName: "max-w-[200px] text-elipsis overflow-hidden",
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "Privilege",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader title="Privilege" column={column} />
        ),
        cell: ({ row }) => {
          const feature = row.original;
          const rowData: privilage = {
            addStatus: feature.addStatus,
            readStatus: feature.readStatus,
            editStatus: feature.editStatus,
            deleteStatus: feature.deleteStatus,
          };
          const isEditing = editingRowId === row.original.privId;
          const currVal = isEditing ? editPriv : rowData;

          const togglePrivilege = (
            type: "addStatus" | "editStatus" | "readStatus" | "deleteStatus",
          ) => {
            if (!isEditing) return;
            // console.log(type);
            (feature[type] = feature[type] === "Y" ? "N" : "Y"),
              // flip the value "Y" ↔ "N"
              setEditPriv((prev) => ({
                ...prev,
                [type]: prev[type] === "Y" ? "N" : "Y",
              }));
          };

          return (
            <div className="flex items-center justify-center space-x-2">
              {/* Read */}
              <DefaultTooltip placement="top" title="Read">
                <div className="relative">
                  {feature.readStatus !== "Y" && (
                    <span
                      className={`absolute w-0.5 h-1/2 translate-x-1/2 translate-y-1/2 right-1/2 -rotate-45 ${
                        isEditing ? "bg-slate-400" : "bg-slate-300"
                      }`}
                    />
                  )}
                  <Button
                    variant={feature.readStatus === "Y" ? "default" : "ghost"}
                    className="h-[30px] w-[30px]"
                    disabled={!isEditing}
                    onClick={() => togglePrivilege("readStatus")}
                  >
                    <KeenIcon
                      icon="eye"
                      className={feature.readStatus === "Y" ? "text-white" : ""}
                    />
                  </Button>
                </div>
              </DefaultTooltip>

              {/* Add */}
              <DefaultTooltip placement="top" title="Add">
                <div className="relative">
                  {feature.addStatus !== "Y" && (
                    <span
                      className={`absolute w-0.5 h-1/2 translate-x-1/2 translate-y-1/2 right-1/2 -rotate-45 ${
                        isEditing ? "bg-slate-400" : "bg-slate-300"
                      }`}
                    />
                  )}
                  <Button
                    variant={feature.addStatus === "Y" ? "default" : "ghost"}
                    className="h-[30px] w-[30px]"
                    disabled={!isEditing}
                    onClick={() => togglePrivilege("addStatus")}
                  >
                    <KeenIcon
                      icon="plus"
                      className={feature.addStatus === "Y" ? "text-white" : ""}
                    />
                  </Button>
                </div>
              </DefaultTooltip>

              {/* Edit */}
              <DefaultTooltip placement="top" title="Edit">
                <div className="relative">
                  {feature.editStatus !== "Y" && (
                    <span
                      className={`absolute w-0.5 h-1/2 translate-x-1/2 translate-y-1/2 right-1/2 -rotate-45 ${
                        isEditing ? "bg-slate-400" : "bg-slate-300"
                      }`}
                    />
                  )}
                  <Button
                    variant={feature.editStatus === "Y" ? "default" : "ghost"}
                    className="h-[30px] w-[30px]"
                    disabled={!isEditing}
                    onClick={() => togglePrivilege("editStatus")}
                  >
                    <KeenIcon
                      icon="notepad-edit"
                      className={feature.editStatus === "Y" ? "text-white" : ""}
                    />
                  </Button>
                </div>
              </DefaultTooltip>

              {/* Delete */}
              <DefaultTooltip placement="top" title="Delete">
                <div className="relative">
                  {feature.deleteStatus !== "Y" && (
                    <span
                      className={`absolute w-0.5 h-1/2 translate-x-1/2 translate-y-1/2 right-1/2 -rotate-45 ${
                        isEditing ? "bg-slate-400" : "bg-slate-300"
                      }`}
                    />
                  )}
                  <Button
                    variant={feature.deleteStatus === "Y" ? "default" : "ghost"}
                    className="h-[30px] w-[30px]"
                    disabled={!isEditing}
                    onClick={() => togglePrivilege("deleteStatus")}
                  >
                    <KeenIcon
                      icon="trash"
                      className={
                        feature.deleteStatus === "Y" ? "text-white" : ""
                      }
                    />
                  </Button>
                </div>
              </DefaultTooltip>
            </div>
          );
        },

        meta: {
          headerClassName: "w-fit text-center",
          cellClassName: "text-center",
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
          const feature = row.original;

          return (
            <div className="flex items-center justify-center gap-2">
              {isEditing ? (
                <>
                  <button
                    className="btn btn-sm btn-icon btn-success"
                    onClick={() => {
                      setEditingRowId(null);
                      handleUpdateAccess(feature);
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
                <AccessWrapper hasAccess={menuPrivAccess?.editStatus ?? false}>
                  <button
                    className="btn btn-sm btn-icon btn-clear btn-light"
                    title="Edit"
                    onClick={() => {
                      setEditingRowId(row.original.privId);
                      setEditPriv({
                        addStatus: feature.addStatus,
                        readStatus: feature.readStatus,
                        editStatus: feature.editStatus,
                        deleteStatus: feature.deleteStatus,
                      });
                      setEditedValue(row.original.autoOpenMenu as "Y" | "N");
                    }}
                  >
                    <KeenIcon icon="notepad-edit" />
                  </button>
                </AccessWrapper>
              )}
            </div>
          );
        },
        meta: {
          headerClassName: "w-[100px]",
        },
      },
    ],
    [selectedOwned, editingRowId, editedValue, ownedMenus, availableMenus],
  );

  const doGetOwnedRoleData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));
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

  const handleUpdateAccess = async (data: MenuData) => {
    data.autoOpenMenu = editedValue;

    try {
      // console.log("🚀 Editing role with data:", {
      //   ...data,
      //   roleId: selectedRow?.roleId,
      //   autoOpenMenu: editedValue,
      // });

      const response = await PutData(
        `${API_ROLE}/api/roles/menus/access/update`,
        {
          ...data,
          roleId: selectedRow?.roleId,
          autoOpenMenu: editedValue,
        },
      );

      // console.log("📦 API Response:", response);

      if (response?.status) {
        toast.success("Role edited successfully!");

        const createActivity = {
          module: "Manage Role Management",
          description: `Edit Role Menu=> ${selectedRow?.roleName} menu ${data.privName}`,
          action: "E",
        };
        doSaveLogActivity(createActivity);

        // console.log("✅ Role updated successfully");
      } else {
        const errorMessage =
          response?.message || "Failed to Update role. Please try again.";
        toast.error(errorMessage);
        // console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Something went wrong. Please try again.";
      toast.error(errorMessage);
      // console.error("❌ Error updating role:", error);
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
          {/* Available Features DataGrid content */}
        </DataGridProvider>
      </div>
    </div>
  );
};
