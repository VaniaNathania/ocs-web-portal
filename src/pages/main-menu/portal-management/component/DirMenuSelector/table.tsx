import { useCallApi } from "@/hooks";
import { usePortalLayout } from "@/layouts/main-menu/portal-management";
import { DirMenuManagementData } from "@/pages/main-menu/directory-menu-management/hook/CompProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Party } from "../../outlet/component/hook/CompProvider";
import { apiConfigRole } from "@/config/api.config";
import { ColumnDef } from "@tanstack/react-table";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  KeenIcon,
} from "@/components";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/common/Loading";
import Footer from "./footer";
import { toast } from "sonner";

interface NodeMap {
  [key: number]: NodeMap;
}

export interface Selector extends DirMenuManagementData {
  addCascade?: boolean;
}

const API_URL = apiConfigRole.role;

const Table = () => {
  const { allDir, showDirMenuSelector, selectedDir, selectedRow } =
    usePortalLayout();
  const [search, setSearch] = useState<string>("");

  const { GetData } = useCallApi();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [owned, setOwned] = useState<Party[]>([]);
  const [available, setAvailable] = useState<Selector[]>([]);

  const [selected, setSelected] = useState<Selector[]>([]);

  const buildNestedMap = async (items: Party[]) => {
    const childrenMap: NodeMap = {};

    // Prepare container for every id
    items.forEach((item) => {
      childrenMap[item.partyId] = {};
    });

    const result: NodeMap = {};

    //  console.log(items, allDir);

    items.forEach((item) => {
      const data = allDir.find((dir) => dir.id === item.partyId);
      if (data) {
        if (data.parentId) {
          // Place this data under its parent
          if (!childrenMap[data.parentId]) {
            childrenMap[data.parentId] = {};
          }
          childrenMap[data.parentId][data.id] = childrenMap[data.id];
        } else {
          // Root-level (no parent)
          result[data.id] = childrenMap[data.id];
        }
      }
    });

    //  console.log(result);

    return result;
  };

  const fetchChildNodes = async (
    portalId: number,
    parentId: number,
    level: number = 1,
  ) => {
    try {
      setIsLoading(true);
      // console.log(`Fetching children for parentId: ${parentId}`);
      const res = await GetData(
        `${API_URL}/api/portals/${portalId}/party/${parentId > 0 ? parentId : 0}/dirs`,
        {},
      );

      const menuRes = await GetData(
        `${API_URL}/api/portals/portals/${portalId}/party/${parentId > 0 ? parentId : 0}/menus`,
        {},
      );

      if (!menuRes?.status || !menuRes?.data) {
        throw new Error(menuRes?.message || "Failed to fetch portal data");
      }

      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      const childMenu: Party[] = menuRes.data.map(
        (row: any, index: number) => ({
          ...row,
          isChild: true,
          partyName: row.privName,
          parentId,
          level: level + 1,
          index: `${parentId}-${row.seq}-${row.partyId}`,
        }),
      );
      if (parentId === 0) {
        const temp = await buildNestedMap(res.data);
        // console.log(temp);
        const children = res.data
          .filter((row: Party) => temp[row.partyId]) // keep only valid rows
          .map((row: Party, index: number) => ({
            ...row,
            isChild: true,
            parentId,
            level: level + 1,
            index: `${parentId}-${row.seq}-${row.partyId}`,
          }));

        const tempChild: Party[] = [...childMenu, ...children].sort(
          (a, b) => a.seq - b.seq,
        );

        // console.log(`Fetched ${children.length} children for ${parentId}`);
        setOwned(tempChild);
      } else {
        const children = res.data.map((row: Party, index: number) => ({
          ...row,
          isChild: true,
          parentId,
          level: level + 1,
          index: `${parentId}-${row.seq}-${row.partyId}`,
        }));
        const tempChild: Party[] = [...childMenu, ...children].sort(
          (a, b) => a.seq - b.seq,
        );

        // console.log(`Fetched ${children.length} children for ${parentId}`);
        setOwned(tempChild);
      }
    } catch (error: any) {
      console.error("Error fetching child nodes:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllDirMenu = async () => {
    try {
      const resp = await GetData(`${API_URL}/api/dirs/all-dirs-or-menu`, {
        parentId: selectedDir?.partyId != 0 ? selectedDir?.partyId : undefined,
      });

      if (!resp.status) {
        return toast.error(resp.message);
      }
      // const temp = buildNestedMap(resp.data);
      // console.log(temp);
      const temp = resp.data.filter((item: DirMenuManagementData) => {
        if (selectedDir?.partyId === 0) return item.parentId === null;
        return true;
      });
      setAvailable(temp);

      // setAllDir(resp.data);
    } catch (error) {
      console.error("Failed to fetch All Dir");
    }
  };

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: Selector[]) => {
    return filteredData.every(
      (row) =>
        selected.some((item) => item.id === row.id) ||
        owned.some((item) => item.partyId === row.id),
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: Selector[]) => {
    if (isAllSelected(filteredData)) {
      setSelected((prev) =>
        prev.filter((item) => !filteredData.some((row) => row.id === item.id)),
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...filteredData.filter(
          (row) => !owned.some((sel) => sel.partyId === row.id),
        ),
      ];
      setSelected(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: Selector) => {
    if (selected.some((p) => p.id === row.id)) {
      setSelected((prev) => prev.filter((p) => p.id !== row.id));
    } else {
      setSelected((prev) => [...prev, row]);
    }
  };

  const column = useMemo<ColumnDef<Selector>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <div className="flex items-center justify-center sticky">
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
                checked={
                  selected.some((p) => p.id === feature.id) ||
                  owned.some((p) => p.partyId === feature.id)
                }
                disabled={owned.some((p) => p.partyId === feature.id)}
                // onChange={() => handleSelectRow(feature)}
                readOnly
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center sticky top-0 bg-gray-100 z-10",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Name"
            className=" sticky"
            column={column}
          />
        ),
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
        cell: ({ row }) => {
          return (
            <div
            // onClick={() => handleSelectRow(row.original)}
            // className={`cursor-pointer ${isSelected ? selectedRowHigligt : ""}`}
            >
              {row.original.name}
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        // accessorFn: (row) => row.privCode,
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Add Cascade"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell({ row }) {
          if (row.original.type === "1") return;
          return (
            <div>
              <Input
                type="checkbox"
                className="w-4 h-4"
                onChange={(e) => (row.original.addCascade = e.target.checked)}
              />
            </div>
          );
        },
        meta: {
          headerClassName: "sticky top-0 bg-gray-100 z-10",
        },
      },
    ],
    [selected, available, owned, search],
  );

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      let processedData = [
        ...available.filter((item) => item.name.toLowerCase().includes(search)),
      ];

      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof Selector];
          const bValue = b[id as keyof Selector];

          const aVal = aValue ?? "";
          const bVal = bValue ?? "";

          if (typeof aVal === "string" && typeof bVal === "string") {
            return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
          }

          if (typeof aVal === "number" && typeof bVal === "number") {
            return desc ? bVal - aVal : aVal - bVal;
          }

          return 0;
        });
      }

      //  console.log(processedData, search);

      return {
        data: processedData,
        totalCount: processedData.length,
      };
    },
    [available, owned, selected, search],
  );
  useEffect(() => {
    if (showDirMenuSelector) {
      fetchChildNodes(selectedRow?.portalId ?? 0, selectedDir?.partyId ?? 0, 0);

      fetchAllDirMenu();

      // console.log("yg bisa dipilih", temp);
    }
  }, [showDirMenuSelector]);

  //   useEffect(() => {
  //   //  console.log(owned);
  //   }, [owned]);

  return (
    <div className="h-full">
      <div className="flex flex-row py-2 space-x-2 w-full items-center justify-between">
        <div className="flex flex-col">
          <div className="text-xl">{selectedRow?.portalName}</div>
          <div className="text-xs">{selectedDir?.partyName}</div>
        </div>
        <div className="flex flex-row py-2 space-x-2 w-1/2 justify-end">
          <label className="input input-sm w-full flex items-center gap-2">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder={`Search...`}
              className="w-full"
              // value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </label>
        </div>
      </div>

      <div className="relative">
        {isLoading && <Loading />}
        <div className="">
          <DataGridProvider
            key={`available-features-grid-${search}`}
            columns={column}
            // pagination={{ size: 5 }}
            layout={{ card: false }}
            sorting={[{ id: "name", desc: false }]}
            serverSide={true}
            data={available}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
              return doGetAvailableData(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters,
              );
            }}
            getRowProps={(row) => ({
              className: "",
              onClick: (e: any) => {
                const cellEl = (e.target as HTMLElement).closest(
                  "td[data-column-id]",
                );

                if (!cellEl) return;

                const columnId = (cellEl as HTMLElement).dataset.columnId;
                if (columnId?.includes("action")) {
                  return; // do nothing
                }
                handleSelectRow(row.original);
              },
            })}
          >
            <div className="h-[300px] overflow-y-auto">
              <DataGridTable />
            </div>
          </DataGridProvider>
        </div>
      </div>
      <Footer owned={selected} />
    </div>
  );
};

export default Table;
