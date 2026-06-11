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
import { toast } from "sonner";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import {
  nonSelectedRowHighLight,
  selectedRowHighLight,
  selectedRowHigligt,
} from "@/styles/style";
import { apiConfigRole } from "@/config/api.config";

export interface Directory {
  dirId: number;
  parentId?: number;
  dirName: string;
  iconUrl: string;
  state: string;
  stateDate: string;
  isChild?: boolean;
  level?: number;
}

const API_ROLE = apiConfigRole.role;

export const DirectoryMenu = () => {
  const { portals, lastUpdated, fetchAvailableMenusDir, dir, setDir } =
    useMenuList();
  const { selectedRow } = useRoleLayout();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<Directory[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const hasFetched = useRef(false);
  const { GetData } = useCallApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchChildNodes = useCallback(
    async (parentId: number, level: number = 1): Promise<Directory[]> => {
      try {
        const res = await GetData(`${API_ROLE}/api/dirs/${parentId}/dirs`, {});

        if (!res?.status || !res?.data) {
          throw new Error(res?.message || "Failed to fetch directory data");
        }

        return res.data.map((row: Directory) => ({
          ...row,
          isChild: true,
          parentId,
          level,
        }));
      } catch (error: any) {
        console.error("Error fetching child nodes:", error.message);
        return []; // Return empty array instead of mock data
      }
    },
    [GetData],
  );

  // Recursively remove all children of given parentId
  const removeChildrenRecursively = (
    data: Directory[],
    parentId: number,
  ): Directory[] => {
    const childIds = new Set<number>();
    const collectChildren = (id: number) => {
      data.forEach((item) => {
        if (item.parentId === id) {
          childIds.add(item.dirId);
          collectChildren(item.dirId);
        }
      });
    };
    collectChildren(parentId);

    return data.filter((item) => !childIds.has(item.dirId));
  };

  const handleExpand = async (row: Directory) => {
    setIsExpanding(true);

    try {
      const isExpanded = expanded.has(row.dirName);
      setDir(row);

      // Fetch available menus if needed
      fetchAvailableMenusDir(row.dirId);
      // if (row.dirId !== 0) {
      // }

      if (isExpanded) {
        // Collapse — remove all nested children
        setPartys((prev) => removeChildrenRecursively(prev, row.dirId));
        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(row.dirName);
          return copy;
        });
      } else {
        // Expand — fetch and insert children
        let children: Directory[];

        children = await fetchChildNodes(row.dirId, (row.level ?? 0) + 1);
        setPartys((prev) => {
          // Remove existing children first to avoid duplicates
          const withoutChildren = removeChildrenRecursively(prev, row.dirId);
          const index = withoutChildren.findIndex((p) => p.dirId === row.dirId);

          if (index === -1) return withoutChildren;

          // Insert new children after parent
          const updated = [...withoutChildren];
          updated.splice(index + 1, 0, ...children);
          return updated;
        });

        setExpanded((prev) => new Set(prev).add(row.dirName));
      }
    } catch (error) {
      toast.error("Error expanding data");
    } finally {
      setIsExpanding(false);
    }
  };

  // Initialize data
  const initializeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rootNode: Directory = {
        dirId: 0,
        dirName: "Root of Directory & Menu",
        iconUrl: "",
        state: "A",
        stateDate: new Date().toISOString(),
        level: 0,
      };
      // console.log("init", rootNode);

      await partys.push(rootNode);
      setDir(rootNode);
      handleExpand(rootNode);
      hasFetched.current = true;
    } catch (error) {
      toast.error("Failed to initialize root");
    } finally {
      // console.log(partys);
      setIsLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   initializeData();
  // }, []);

  // Column definition
  const AvailableColumn = useMemo<ColumnDef<Directory>[]>(
    () => [
      {
        accessorFn: (row) => row.dirName,
        id: "dirName",
        header: () => <div>Portal/Directory Name</div>,

        cell: ({ row }) => {
          const data = row.original;
          const isExpanded = expanded.has(data.dirName);
          const isSelected = dir?.dirName === data.dirName;
          const nodeDir = isExpanded ? "down" : "right";
          const icons = data.dirId != null ? nodeDir : "menu";

          return (
            <DefaultTooltip placement="top" title={data.dirName}>
              <div
                style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}
                // className={`cursor-pointer ${isSelected ? selectedRowHigligt : ""} w-full overflow-hidden text-ellipsis whitespace-nowrap`}
                // onClick={() => handleExpand(data)}
              >
                <KeenIcon icon={icons} className="inline-block mx-2" />
                {data.dirName}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 w-[300px] text-ellipsis whitespace-nowrap ",
          cellClassName: "max-w-[300px] text-elipsis overflow-hidden",
        },
      },
    ],
    [expanded, dir?.dirName],
  );

  const doGetDirectoryPortalData = useCallback(
    async (page: number, limit: number) => {
      if (!hasFetched.current) {
        await initializeData();
      }

      let filtered = [...partys];
      return {
        data: filtered,
        totalCount: filtered.length,
      };
    },
    [search, partys, initializeData],
  );

  const suggestions = useMemo(() => {
    if (!search) return [];
    return partys.filter((p) =>
      p.dirName?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, partys]);

  const handleSelect = (row: Directory) => {
    setSearch(row.dirName ?? "");
    setShowSuggestions(false);
    handleExpand(row);
  };

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
                {p.dirName}
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
          // sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          data={partys}
          onFetchData={({ pageIndex, pageSize }) => {
            return doGetDirectoryPortalData(pageIndex + 1, pageSize);
          }}
          getRowProps={(row) => ({
            className:
              row.original.dirId === dir?.dirId
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
