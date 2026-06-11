import { useMemo, useCallback, useState } from "react";
import {
  DataGridColumnHeader,
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
import { useCompList } from "../hook/useComp";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { MenuData } from "../hook/CompProvider";
import { Loading } from "../../../block/loadingBlock";

export const AvailableComp = () => {
  const {
    lastUpdated,
    availableComponents,
    selectedAvailable,
    setSelectedAvailable,
    noMenu,
    ownedComponents,
    loading,
  } = useCompList();
  const { selectedRow } = useRoleLayout();

  const [filterBy, setFilterBy] = useState<string>("name");
  const [search, setSearch] = useState<string>("");
  const [showNoMenu, setShowNoMenu] = useState<boolean>(false);
  const [updateToggle, setupdateToggle] = useState(Date.now());

  const toggleCheck = (privId: number) => {
    // Create a new array so React detects the change
    const updated = availableComponents.map((comp) =>
      comp.privId === privId
        ? { ...comp, privLevel: comp.privLevel === "0" ? "1" : "0" }
        : comp
    );

    // Update the state from useCompList (you may need to expose a setter there)
    // Example: setAvailableComponents(updated);

    // Force table to re-render
    setupdateToggle(Date.now());
  };

  //   const [selectedPortals, setSelectedPortals] = useState<MenuData[]>([]);
  const toggleShowNoMenu = () => {
    // console.log(showNoMenu);

    setShowNoMenu(!showNoMenu);
  };

  const AvailableColumn = useMemo<ColumnDef<MenuData>[]>(
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
                table.getFilteredRowModel().rows.map((r) => r.original)
              )}
              onChange={() =>
                handleSelectAll(
                  table.getFilteredRowModel().rows.map((r) => r.original)
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
                  selectedAvailable.some((p) => p.privId === feature.privId) ||
                  ownedComponents.some((p) => p.privId === feature.privId)
                }
                disabled={ownedComponents.some(
                  (p) => p.privId === feature.privId
                )}
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
          <DataGridColumnHeader
            className=""
            title="Component Name"
            column={column}
            filter={false}
          />
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
            "min-w-[150px] w-[150px] max-w-[600px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "min-w-[150px] w-[150px] max-w-[600px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
      {
        accessorFn: (row) => row.privLevel,
        id: "privLevel",
        header: ({ column }) => (
          <DataGridColumnHeader title="Read Only" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const feature = row.original;
          const toggleCheck = () => {
            // console.log("test", feature.privLevel, updateToggle);

            if (feature.privLevel === "0") feature.privLevel = "1";
            else feature.privLevel = "0";

            setupdateToggle(Date.now());
          };
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={feature.privLevel == "1"}
                onChange={() => toggleCheck()}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "max-w-[50px] text-center overflow-clip",
          cellClassName: "max-w-[50px] text-center overflow-clip",
        },
      },
    ],
    [selectedAvailable, updateToggle, ownedComponents]
  );

  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // console.log(availableComponents, noMenu);

      // Apply filtering first
      let processedData = showNoMenu
        ? [...availableComponents, ...noMenu]
        : [...availableComponents];

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

      // // Apply pagination
      // const startIndex = (page - 1) * limit;
      // const endIndex = startIndex + limit;
      // const paginatedData = processedData.slice(startIndex, endIndex);

      return {
        data: processedData,
        totalCount: processedData.length,
      };
    },
    [availableComponents, search, filterBy, showNoMenu]
  );

  // Check if all visible rows are selected
  const isAllSelected = (filteredData: MenuData[]) => {
    return filteredData.every((row) =>
      selectedAvailable.some((selected) => selected.privId === row.privId)
    );
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: MenuData[]) => {
    if (isAllSelected(filteredData)) {
      setSelectedAvailable((prev) =>
        prev.filter(
          (item) => !filteredData.some((row) => row.privId === item.privId)
        )
      );
    } else {
      // merge and deduplicate
      const merged = [
        ...selectedAvailable,
        ...filteredData.filter(
          (row) => !selectedAvailable.some((sel) => sel.privId === row.privId)
        ),
      ];
      setSelectedAvailable(merged);
    }
  };

  // Toggle single row
  const handleSelectRow = (row: MenuData) => {
    if (selectedAvailable.some((p) => p.privId === row.privId)) {
      setSelectedAvailable((prev) =>
        prev.filter((p) => p.privId !== row.privId)
      );
    } else {
      setSelectedAvailable((prev) => [...prev, row]);
    }
  };

  return (
    <div>
      <div className="flex flex-row py-2 space-x-2 w-full text-sm">
        <div className="flex my-auto w-1/6 items-center space-x-2 ">
          <div className="whitespace-nowrap text-ellipsis overflow-hidden ">
            No Menu
          </div>
          <input
            type="checkbox"
            onChange={() => toggleShowNoMenu()}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
        <div className="w-5/6 ">
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

      {/* <div className="relative">
        {loading && <Loading />}
        <div className="max-h-[300px] overflow-y-auto w-full">
          <DataGridProvider
            key={`available-features-grid-${availableComponents.length}-${search}-${filterBy}-${lastUpdated}-${showNoMenu}`}
            columns={AvailableColumn}
            pagination={{ size: 5 }}
            layout={{ card: false }}
            sorting={[{ id: "name", desc: false }]}
            serverSide={true}
            data={availableComponents}
            onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
              return doGetAvailableData(
                pageIndex + 1,
                pageSize,
                sorting,
                columnFilters
              );
            }}
          >
            
          </DataGridProvider>
        </div>
      </div> */}
      <div className="relative">
        {loading && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${availableComponents.length}-${search}-${filterBy}-${lastUpdated}-${showNoMenu}`}
          columns={AvailableColumn}
          pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          data={availableComponents}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetAvailableData(
              pageIndex + 1,
              pageSize,
              sorting,
              columnFilters
            );
          }}
        >
          <div className="overflow-y-auto h-[300px] border-2">
            <DataGridTable />
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};
