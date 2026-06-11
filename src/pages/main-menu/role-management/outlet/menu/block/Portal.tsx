import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMenuList } from "../hook/useMenu";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { Party } from "@/pages/main-menu/portal-management/outlet/component/hook/CompProvider";
import { Loading } from "../../../block/loadingBlock";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { DirMenuManagementData } from "@/pages/main-menu/directory-menu-management/hook/CompProvider";
import { toast } from "sonner";
import { apiConfigRole } from "@/config/api.config";

interface NodeMap {
  [key: number]: NodeMap;
}

const API_URL = apiConfigRole.role;

export const PortalMenu = () => {
  const {
    portals,
    lastUpdated,
    node,
    setNode,
    fetchAvailableMenus,
    loading,
    option,
  } = useMenuList();
  const { selectedRow } = useRoleLayout();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<Party[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const hasFetched = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const { GetData } = useCallApi();
  const [pageSize, setPageSize] = useState(5);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allDir, setAllDir] = useState<DirMenuManagementData[]>([]);

  // Track latest state with refs
  const partysRef = useRef(partys);
  const expandedRef = useRef(expanded);
  useEffect(() => {
    partysRef.current = partys;
    expandedRef.current = expanded;
  }, [partys, expanded]);

  useEffect(() => {
    const initializeData = async () => {
      const newSet: Set<string> = new Set();
      console.log("ini new set", newSet);

      setExpanded(newSet);
      setIsLoading(true);
      try {
        const baseData: Party[] = portals.map((p, index) => ({
          ...p,
          isChild: false,
          partyId: p.partyId ?? index * -1,
          type: p.type ? p.type.toString() : "0",
          parentId: -1,
          level: 0,
          seq: index,
          index: index.toString(),
        }));
        // console.log(baseData, portals);

        setPartys(baseData);
        if (baseData.length > 0) setNode(baseData[0]);
        hasFetched.current = true;
      } finally {
        setIsLoading(false);
      }
    };
    if (!hasFetched.current || selectedRow?.roleId) {
      initializeData();
    }
  }, [portals, selectedRow, option]);

  const fetchAllDirMenu = async () => {
    setIsLoading(true);
    try {
      const resp = await GetData(`${API_URL}/api/dirs/all-dirs-or-menu`, {});

      if (!resp.status) {
        return toast.error(resp.message);
      }
      // const temp = buildNestedMap(resp.data);
      // console.log(temp);

      setAllDir(resp.data);
    } catch (error) {
      console.error("Failed to fetch All Dir");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (allDir.length === 0) {
      fetchAllDirMenu();
    }
  }, []);

  const buildNestedMap = async (items: Party[]) => {
    const childrenMap: NodeMap = {};

    //  console.log(items, allDir);

    // Prepare container for every id
    items.forEach((item) => {
      childrenMap[item.partyId] = {};
    });

    const result: NodeMap = {};

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

    return result;
  };

  // Fetch children nodes
  // Fetch children nodes
  const fetchChildNodes = async (
    portalId: number,
    parentId: number,
    parentIndex: string,
    level: number = 1,
  ): Promise<Party[]> => {
    try {
      // console.log(`Fetching children for parentId: ${parentId}`);
      const res = await GetData(
        `${API_URL}/api/portals/${portalId}/party/${parentId > 0 ? parentId : 0}/dirs`,
        {},
      );

      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      if (parentId <= 0) {
        // console.log(allDir);
        const temp = await buildNestedMap(res.data);
        const children = res.data
          .filter((row: Party) => temp[row.partyId]) // keep only valid rows
          .map((row: Party, index: number) => ({
            ...row,
            isChild: true,
            parentId,
            parentIndex: parentIndex,
            level: level + 1,
            index: `${parentId}-${row.seq}-0`,
          }));

        // console.log(`Fetched ${children.length} children for ${parentId}`);
        return children;
      } else {
        const children = res.data.map((row: Party, index: number) => ({
          ...row,
          isChild: true,
          parentId,
          parentIndex: parentIndex,

          level: level + 1,
          index: `${parentId}-${row.seq}-0`,
        }));
        // console.log(`Fetched ${children.length} children for ${parentId}`);
        return children;
      }
    } catch (error: any) {
      console.error("Error fetching child nodes:", error.message);
      throw error;
    }
  };

  const handleExpand = async (row: Party) => {
    if (allDir.length === 0) return;

    if (isExpanding) return;

    setIsExpanding(true);
    try {
      const wasExpanded = expandedRef.current.has(row.index ?? "0");
      const newExpanded = new Set(expandedRef.current);

      setNode(row);
      // console.log(row);

      await fetchAvailableMenus(row.partyId, row.portalId);

      if (wasExpanded) {
        // Collapse logic

        setPartys((prev) => removeChildrenRecursively(prev, row.index ?? "0"));
        newExpanded.delete(row.index ?? "0");
      } else {
        // Expand logic
        // console.log(row);

        const children = await fetchChildNodes(
          row.portalId || 0,
          row.partyId,
          row.index ?? "",
          row.level ?? 0,
        );

        // console.log(children);

        setPartys((prev) => {
          const withoutChildren = removeChildrenRecursively(
            prev,
            row.index ?? "",
          );
          const parentIndex = withoutChildren.findIndex(
            (p) => p.index === row.index,
          );
          if (parentIndex === -1) return withoutChildren;

          const updated = [...withoutChildren];
          updated.splice(parentIndex + 1, 0, ...children);
          return updated;
        });

        newExpanded.add(row.index ?? "0");
      }

      // Update expanded state in one atomic operation
      setExpanded(newExpanded);
    } finally {
      setIsExpanding(false);
    }
  };
  // Fixed removeChildrenRecursively function
  function removeChildrenRecursively(data: Party[], parentId: string): Party[] {
    // Create a map of partyId to item for quick lookup

    const childrenToRemove = new Set<string>();
    const childIds = new Set<string>();

    data.forEach((item) => {
      if (item.parentIndex === parentId && item.isChild) {
        // console.log(item.partyName, item.partyId);
        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(item.index ?? "");
          return copy;
        });

        childrenToRemove.add(item.index ?? "0");
        childIds.add(item.index ?? "");
      } else if (childIds.has(item.parentIndex ?? "")) {
        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(item.index ?? "");
          return copy;
        });
        childrenToRemove.add(item.index ?? "0");
        childIds.add(item.parentIndex ?? "");
      }
    });
    return data.filter((item) => !childrenToRemove.has(item.index ?? "0"));
  }

  // Column definition
  const AvailableColumn = useMemo<ColumnDef<Party>[]>(
    () => [
      {
        accessorFn: (row) => row.partyName,
        id: "partyName",
        header: () => <div>Portal/Directory Name</div>,

        cell: ({ row }) => {
          const data = row.original;
          const isExpanded = expanded.has(data.index ?? "0");
          const isSelected = data.partyName === node?.partyName;
          const nodeDir = isExpanded ? "down" : "right";

          return (
            <DefaultTooltip placement="top" title={data.partyName}>
              <div
                style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}
                // className={`cursor-pointer ${isSelected ? selectedRowHigligt : ""} w-full overflow-hidden text-ellipsis whitespace-nowrap`}
                // onClick={() => handleExpand(data)}
              >
                <KeenIcon icon={nodeDir} className="inline-block mx-2" />
                {data.partyName}
              </div>
            </DefaultTooltip>
          );
        },
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 w-[300px] text-ellipsis whitespace-nowrap ",
          cellClassName: "max-w-[300px] text-elipsis overflow-hidden",
        },
      },
    ],
    [node?.partyName, expanded], // Add expanded to dependencies
  );

  const suggestions = useMemo(() => {
    // console.log(search, partys);

    if (!search) return [];
    return partys.filter((p) =>
      p.partyName?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, partys]);

  // Data fetching
  const doGetDirectoryPortalData = useCallback(
    async (page: number, limit: number) => {
      if (isLoading) return { data: [], totalCount: 0 };

      try {
        // const filtered = partysRef.current.filter((item) =>
        //   search.trim()
        //     ? item.partyName?.toLowerCase().includes(search.toLowerCase())
        //     : true
        // );

        if (limit !== pageSize) {
          setPageSize(limit);
        }

        return {
          data: partysRef.current,
          totalCount: partysRef.current.length,
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        return { data: [], totalCount: 0 };
      }
    },
    [partys, search],
  );

  const handleSelect = (row: Party) => {
    setSearch(row.partyName ?? "");
    setShowSuggestions(false);
    handleExpand(row);
  };

  return (
    <div className="relative">
      <div className="w-full py-2 relative">
        <label className="input input-sm w-full  flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Portal/Directory Name.."
            className="w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value); // <-- use searchInput for typing
              setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={() => search && setShowSuggestions(true)}
          />
        </label>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-md z-20 max-h-40 overflow-y-auto overflow-x-hidden">
            {suggestions.map((p, idx) => (
              <li
                key={idx}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 w-full overflow-hidden whitespace-nowrap truncate"
                onMouseDown={() => handleSelect(p)} // ✅ onMouseDown avoids blur hiding
              >
                {p.partyName}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* <div className="relative">
        {(isLoading || isExpanding || loading) && <Loading />}
        <div className="max-h-[300px] overflow-y-auto w-full">
          <DataGridProvider
            key={`available-features-grid-${selectedRow?.roleId}-${search}`}
            columns={AvailableColumn}
            pagination={{ size: pageSize }}
            layout={{
              card: false,
            }}
            sorting={[{ id: "name", desc: false }]}
            serverSide={true}
            data={partys}
            onFetchData={({ pageIndex, pageSize }) =>
              doGetDirectoryPortalData(pageIndex + 1, pageSize)
            }
          />
        </div>
      </div> */}
      <div className="relative">
        {(isLoading || isExpanding || loading) && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${search}`}
          columns={AvailableColumn}
          // pagination={{ size: 5 }}
          layout={{ card: false }}
          // sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          data={partys}
          onFetchData={({ pageIndex, pageSize }) => {
            return doGetDirectoryPortalData(pageIndex + 1, pageSize);
          }}
          getRowProps={(row) => ({
            className:
              row.original.index === node?.index
                ? selectedRowHighLight
                : nonSelectedRowHighLight,
            onClick: () => handleExpand(row.original),
          })}
        >
          <div className="h-[300px] overflow-y-auto w-full border-2">
            <DataGridTable />
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};
