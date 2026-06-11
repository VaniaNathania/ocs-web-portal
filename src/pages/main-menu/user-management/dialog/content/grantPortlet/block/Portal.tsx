import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePortletList } from "../hook/usePortlet";
import { useCallApi } from "@/hooks";
import { Party } from "../hook/PortletsProvider";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { selectedRowHigligt } from "@/styles/style";

export const PortalMenu = () => {
  const { portals, lastUpdated, node, setNode, fetchAvailableMenus, loading } =
    usePortletList();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<Party[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const hasFetched = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const { GetData } = useCallApi();
  const [pageSize, setPageSize] = useState(5);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Track the latest state with refs to avoid stale closures
  const partysRef = useRef(partys);
  const expandedRef = useRef(expanded);
  useEffect(() => {
    partysRef.current = partys;
    expandedRef.current = expanded;
  }, [partys, expanded]);

  // Initialize data - runs only when portals or selectedRow changes
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const baseData = portals.map((p) => ({
          ...p,
          partyName: p.portalName,
          isChild: false,
          partyId: p.partyId ?? 0,
          type: p.type ? p.type.toString() : "0",
          level: 0,
        }));

        setPartys(baseData);
        if (baseData.length > 0) setNode(baseData[0]);
        hasFetched.current = true;
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [portals]); // Only run when these change

  // Handle expand/collapse - properly memoized
  const handleExpand = useCallback(
    async (row: Party) => {
      setIsExpanding(true);
      // console.log(row);

      if (isExpanding) return;

      // setIsExpanding(true);
      try {
        const isExpanded = expandedRef.current.has(row.partyName);
        setNode(row);
        // await fetchAvailableMenus();

        if (isExpanded) {
          // setPartys((prev) => removeChildrenRecursively(prev, row.partyId));
          setExpanded((prev) => {
            const updated = new Set(prev);
            updated.delete(row.partyName);
            return updated;
          });
        } else {
          setExpanded((prev) => new Set(prev).add(row.partyName));
        }
      } finally {
        setIsExpanding(false);
      }
    },
    [
      // fetchChildNodes,
      // fetchAvailableMenus,
      // removeChildrenRecursively,
      isExpanding,
    ]
  );

  // Column definition - properly memoized
  const AvailableColumn = useMemo<ColumnDef<Party>[]>(
    () => [
      {
        accessorFn: (row) => row.partyName,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Portal/Directory Name" column={column} />
        ),
        cell: ({ row }) => {
          const data = row.original;
          const isExpanded = expandedRef.current.has(data.partyName);
          const isSelected = data.partyName === node?.partyName;

          return (
            <div
              style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}
              className={`cursor-pointer ${isSelected ? selectedRowHigligt : ""} w-full overflow-hidden text-ellipsis whitespace-nowrap`}
              onClick={() => handleExpand(data)}
            >
              <KeenIcon icon="menu" className="inline-block mx-2" />
              {data.partyName}
            </div>
          );
        },
        meta: {
          headerClassName:
            "sticky top-0 z-10 bg-gray-100 w-[300px] text-ellipsis whitespace-nowrap ",
          cellClassName: "max-w-[300px] text-elipsis overflow-hidden",
        },
      },
    ],
    [node?.partyName, expanded]
  );

  // Data fetching - optimized with refs
  const doGetDirectoryPortalData = useCallback(
    async (page: number, limit: number) => {
      if (isLoading) return { data: [], totalCount: 0 };

      try {
        const filtered = partysRef.current.filter((item) =>
          search.trim()
            ? item.partyName?.toLowerCase().includes(search.toLowerCase())
            : true
        );

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
    [partys, search]
  );

  const suggestions = useMemo(() => {
    // console.log(search, partys);

    if (!search) return [];
    return partys.filter((p) =>
      p.partyName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, partys]);

  const handleSelect = (row: Party) => {
    setSearch(row.partyName ?? "");
    setShowSuggestions(false);
    handleExpand(row);
  };

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
      <div className="relative">
        {(isLoading || isExpanding) && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${search}`}
          columns={AvailableColumn}
          pagination={{ size: 5 }}
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
