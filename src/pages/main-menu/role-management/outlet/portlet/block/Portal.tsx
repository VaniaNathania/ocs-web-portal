import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePortletList } from "../hook/usePortlet";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { useCallApi } from "@/hooks";
import { Party } from "../hook/PortletsProvider";
import { RoleSPID } from "../../../component/sideBarListContextTable";
import { Loading } from "../../../block/loadingBlock";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

export const PortalMenu = () => {
  const { portals, lastUpdated, node, setNode, fetchAvailableMenus, loading } =
    usePortletList();
  const { selectedRow } = useRoleLayout();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<Party[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [temp, setTemp] = useState<RoleSPID>();
  const hasFetched = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const { GetData } = useCallApi();
  const [pageSize, setPageSize] = useState(5);

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
          isChild: false,
          partyId: p.partyId ?? 0,
          type: p.type ? p.type.toString() : "0",
          level: 0,
        }));

        setPartys(baseData);
        if (baseData.length > 0) setNode(baseData[0]);
        hasFetched.current = true;
        setTemp(selectedRow); // Update temp reference
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [portals, selectedRow]); // Only run when these change

  // Handle expand/collapse - properly memoized
  const handleExpand = useCallback(
    async (row: Party) => {
      setIsExpanding(true);
      // console.log(row);

      if (isExpanding) return;

      // setIsExpanding(true);
      try {
        const isExpanded = expandedRef.current.has(row.partyName);
        await setNode(row);
        await fetchAvailableMenus();

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
        id: "partyName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Portal/Directory Name" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const data = row.original;
          const isExpanded = expandedRef.current.has(data.partyName);
          const isSelected = data.partyName === node?.partyName;

          return (
            <div
              style={{ paddingLeft: `${(data.level ?? 0) * 1.5}rem` }}
              // className={`cursor-pointer ${isSelected ? "underline" : ""}`}
              // onClick={() => handleExpand(data)}
            >
              <KeenIcon icon="menu" className="inline-block mr-2" />
              {data.partyName}
            </div>
          );
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
          data: filtered,
          totalCount: filtered.length,
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        return { data: [], totalCount: 0 };
      }
    },
    [partys, search]
  );

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="relative">
      <div className="w-full py-2">
        <label className="input input-sm w-full flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Portal/Directory Name.."
            className="w-full"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
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
          getRowProps={(row) => ({
            className:
              row.original.partyName === node?.partyName
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
