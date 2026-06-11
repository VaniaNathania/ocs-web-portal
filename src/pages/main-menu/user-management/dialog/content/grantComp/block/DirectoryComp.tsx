import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { useCompList } from "../hook/useComp";
import { toast } from "sonner";
import { CompDir, MenuData } from "../hook/CompProvider";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { selectedRowHigligt } from "@/styles/style";
import { apiConfigRole } from "@/config/api.config";

export interface Directory {
  dirId: number; //111006,
  parentId?: number | 0; //111000,
  dirName: string; //"Billing Monitor Center",
  iconUrl: string; //"icon-gene-man-manager",
  state: string; //"A",
  stateDate: string; //"1997-01-01 00:00:00"
  isChild?: boolean;
  level?: number; // To control indentation
}

const API_ROLE = apiConfigRole.role;

export const DirectoryMenu = () => {
  const {
    portals,
    lastUpdated,
    availableComponents,
    setAvailableComponents,
    noMenu,
  } = useCompList();
  // const { selectedRow } = useRoleLayout();
  const [node, setNode] = useState<CompDir>();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<CompDir[]>([]); // Full flattened list
  const [expanded, setExpanded] = useState<Set<number>>(new Set()); // Track expanded parent IDs
  const hasFetched = useRef(false);
  const { GetData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    // console.log(search, partys);

    if (!search) return [];
    return partys.filter(
      (p) =>
        p.dirName?.toLowerCase().includes(search.toLowerCase()) ||
        p.privName?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, partys]);

  const handleSelect = (row: CompDir) => {
    setSearch(row.dirName ?? row.privName ?? "");
    setShowSuggestions(false);
    handleExpand(row);
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // console.log(portals);

        const baseData: CompDir[] = portals.map((p, index) => ({
          ...p,
          index: index, //
          parentIndex: -1,
          dirId: p.portalId, //2;
          parentId: -1, //99;
          dirName: p.portalName, //"Privilege Management";
          state: p.state, //"A";
          stateDate: p.stateDate, //"2023-12-25 15:32:37";
          url: p.url, //"cvbs/modules/billing/ruleconfig/views/StatisticTypeView",
          isChild: false,
          level: 0,
        }));
        setPartys(baseData);
        //  console.log(baseData);

        if (baseData.length > 0) {
          setNode(baseData[0]);
          hasFetched.current = true;
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (!hasFetched.current) {
      initializeData();
    }
  }, [portals]);
  const fetchChildNodes = async (
    parentId: number,
    level: number = 1,
    index: number,
  ): Promise<CompDir[]> => {
    try {
      const res = await GetData(`${API_ROLE}/api/dirs/${parentId}/dirs`, {});
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }

      return res.data;
      // return temp.length ? temp : Mock;
      // return temp;
    } catch (error: any) {
      new Error(error.message || "Error fetching available menus");
      throw new Error(error.message || "Error fetching available menus");
      // return Mock;
    }
  };

  const fetchChildMenus = async (
    parentId: number,
    level: number = 1,
    index: number,
  ): Promise<CompDir[]> => {
    try {
      const res = await GetData(
        `${API_ROLE}/api/roles/dirs/${parentId}/menus`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }

      return res.data;
      // return temp.length ? temp : Mock;
      // return temp;
    } catch (error: any) {
      new Error(error.message || "Error fetching available menus");
      toast.error(error.message || "Error fetching available menus");
      //  console.log("error");

      throw new Error(error.message || "Error fetching available menus");
      // return Mock;
    }
  };

  const fetchAll = async (
    parentId: number,
    level: number = 1,
    index: number,
  ): Promise<CompDir[]> => {
    try {
      const [nodes, menus] = await Promise.all([
        fetchChildNodes(parentId, level, index),
        fetchChildMenus(parentId, level, index),
      ]);
      let temp: CompDir[] = [];

      let curr = 1;

      const tempNode: CompDir[] = nodes.map((row: CompDir) => ({
        ...row,
        index: index * 100 + curr++,
        parentIndex: index,
        isChild: true,
        parentId,
        level,
      }));

      const tempMenus: CompDir[] = menus.map((row: CompDir) => ({
        ...row,
        index: index * 100 + curr++,
        parentIndex: index,
        isChild: true,
        parentId,
        level,
      }));

      temp = [...tempNode, ...tempMenus];

      return temp;
    } catch (err: any) {
      toast.error("Failed fetch to expand nodes");
      // return [];
      throw err;
    }
  };

  const fetchCompMenus = async (parentId: number): Promise<MenuData[]> => {
    try {
      const res = await GetData(
        `${API_ROLE}/api/roles/menus/${0}/menus/${parentId}/components`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      // console.log(res.data);

      // console.log(temp);

      // return res.data.length ? res.data : Mock;
      return res.data;
    } catch (error: any) {
      new Error(error.message || "Error fetching available menus");
      // return Mock;
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  // Recursively remove all children of given parentId
  const removeChildrenRecursively = (
    data: CompDir[],
    parentId: number,
  ): CompDir[] => {
    const childIds = new Set<number>();
    const collectChildren = (id: number) => {
      // console.log(data, parentId);

      data.forEach((item) => {
        if (item.parentIndex === id) {
          childIds.add(item.index);
          collectChildren(item.index); // Recursively collect
        }
      });
    };
    collectChildren(parentId);

    return data.filter((item) => !childIds.has(item.index));
  };

  const handleExpand = async (row: CompDir) => {
    setIsExpanding(true);
    //  console.log(row.index);

    try {
      const isExpanded = expanded.has(row.index);
      setNode(row);

      if (isExpanded) {
        setPartys((prev) => removeChildrenRecursively(prev, row.index));
        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(row.index);
          return copy;
        });
      } else {
        let children: CompDir[] = [];
        if (row.dirId != null) {
          setAvailableComponents([]);
          const temp = await fetchAll(
            row.dirId,
            (row.level ?? 0) + 1,
            row.index,
          );

          children = [...temp];
        } else if (row.privId) {
          setNode(row);
          const menusCOmp = await fetchCompMenus(row.privId);
          setAvailableComponents(menusCOmp);
          //  console.log(menusCOmp, "menusComp");
        }
        setPartys((prev) => {
          const index = prev.findIndex((p) => p.index === row.index);
          const updated = [...prev];
          updated.splice(index + 1, 0, ...children);
          return updated;
        });
        if (row.dirId != null)
          setExpanded((prev) => new Set(prev).add(row.index));
      }
    } catch (error) {
      toast.error("Failed to expand directory");
    } finally {
      setIsExpanding(false);
      //  console.log(availableComponents);

      // console.log(row, node);
    }
  };

  // Column
  const AvailableColumn = useMemo<ColumnDef<CompDir>[]>(
    () => [
      {
        accessorFn: (row) => row.dirName,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Portal/Directory Name" column={column} />
        ),
        cell: ({ row }) => {
          const data = row.original;
          const isExpanded = expanded.has(data.index);
          const isSelected = node?.index === data.index;
          const nodeDir = isExpanded ? "down" : "right";
          const icons = data.dirId != null ? nodeDir : "menu";

          return (
            <div
              style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}
              className={`cursor-pointer ${isSelected ? selectedRowHigligt : ""} w-full overflow-hidden text-ellipsis whitespace-nowrap`}
              onClick={() => handleExpand(data)}
            >
              <KeenIcon icon={icons} className="inline-block mx-2" />
              {data.dirName ?? data.privName}
            </div>
          );
        },
        enableHiding: false,
        enableSorting: false,
      },
    ],
    [expanded, node?.index],
  );

  const doGetDirectoryPortalData = useCallback(
    async (page: number, limit: number) => {
      return {
        data: partys,
        totalCount: partys.length,
      };
    },
    [partys, search], // Proper dependencies
  );

  return (
    <div>
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
                {p.dirName ?? p.privName}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        {(isLoading || isExpanding) && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${search}`}
          columns={AvailableColumn}
          // pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          data={partys}
          onFetchData={({ pageIndex, pageSize }) => {
            return doGetDirectoryPortalData(pageIndex + 1, pageSize);
          }}
        >
          <div className="h-[300px] overflow-y-auto w-full border-2">
            <DataGridTable />
          </div>
        </DataGridProvider>
      </div>
    </div>
  );
};
