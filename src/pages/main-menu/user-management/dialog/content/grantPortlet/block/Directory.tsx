import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCallApi } from "@/hooks";
import { usePortletList } from "../hook/usePortlet";
import { Portlet } from "../hook/PortletsProvider";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { selectedRowHigligt } from "@/styles/style";
import { apiConfigRole } from "@/config/api.config";

export interface Directory {
  dirId: number; //111006,
  parentId?: number | 0; //111000,
  typeId: string; //"Billing Monitor Center",
  iconUrl: string; //"icon-gene-man-manager",
  state: string; //"A",
  stateDate: string; //"1997-01-01 00:00:00"
  isChild?: boolean;
  level?: number; // To control indentation
}

interface TypeDir {
  typeId: number; //1;
  typeName: string; //"Default Category";
  comments: string; //"Default Category";
  state: string; //"A";
  stateDate: string; //"2023-12-25 15:31:58";
  isChild: boolean;
  parentId: number;
  level: number;
}

const API_ROLE = apiConfigRole.role;

export const DirectoryMenu = () => {
  const { lastUpdated, setAvailablePortlets, loading } = usePortletList();
  const [node, setNode] = useState<TypeDir>();
  const [search, setSearch] = useState<string>("");
  const [partys, setPartys] = useState<TypeDir[]>([]); // Full flattened list
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // Track expanded parent IDs
  const hasFetched = useRef(false);
  const { GetData } = useCallApi();
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async (): Promise<TypeDir[]> => {
    try {
      const res = await GetData(`${API_ROLE}/api/portlets/portlets/types`, {});
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }

      const temp: TypeDir[] = res.data.map((row: TypeDir) => ({
        ...row,
      }));
      return temp;
    } catch (error: any) {
      new Error(error.message || "Error fetching available menus");
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  const fetchCompMenus = async (parentId: number): Promise<Portlet[]> => {
    try {
      const res = await GetData(
        `${API_ROLE}/api/portlets/${0}/types/${parentId}/portlets`,
        {},
      );
      if (!res?.status || !res?.data) {
        throw new Error(
          res?.message || "Failed to fetch available portal data",
        );
      }
      return res.data;
    } catch (error: any) {
      new Error(error.message || "Error fetching available menus");
      // return Mock;
      throw new Error(error.message || "Error fetching available menus");
    }
  };

  const handleExpand = async (row: TypeDir) => {
    setIsExpanding(true);
    try {
      const isExpanded = expanded.has(row.typeName);
      setNode(row);
      const portlet = await fetchCompMenus(row.typeId);
      setAvailablePortlets(portlet);
      //  console.log(row, "expand");

      if (isExpanded) {
        setExpanded((prev) => {
          const copy = new Set(prev);
          copy.delete(row.typeName);
          return copy;
        });
      } else {
        setExpanded((prev) => new Set(prev).add(row.typeName));
      }
    } catch (error) {
      throw new Error("");
    } finally {
      setIsExpanding(false);
    }
  };

  // Column
  const AvailableColumn = useMemo<ColumnDef<TypeDir>[]>(
    () => [
      {
        accessorFn: (row) => row.typeId,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Portal/Directory Name" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          const indent = `${0 * 1.5}rem`;
          const isSelected = row.original.typeId === node?.typeId;

          return (
            <div
              style={{
                paddingLeft: indent,
                cursor: "pointer",
              }}
              onClick={() => handleExpand(data)}
              className={`cursor-pointer ${isSelected ? selectedRowHigligt : ""} w-full overflow-hidden text-ellipsis whitespace-nowrap`}
            >
              <KeenIcon
                icon={expanded.has(data.typeName) ? "down" : "right"}
                className="inline-block mx-2 "
              />
              {data.typeName}
            </div>
          );
        },
      },
    ],
    [expanded],
  );

  const doGetDirectoryPortalData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      let baseData: TypeDir[] = [];
      const baseDir: TypeDir[] = await fetchTypes();

      let curr = 1000; // start from a higher number to avoid conflicts

      baseData = hasFetched.current ? partys : baseDir;

      setNode(baseData[0]);

      let filtered = [...baseData];
      // if (search.trim()) {
      //   const keyword = search.toLowerCase();
      //   filtered = filtered.filter((item) =>
      //     item.typeName?.toLowerCase().includes(keyword)
      //   );
      // }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filtered.slice(startIndex, endIndex);

      setPartys(baseData); // Ensure partys is initialized
      hasFetched.current = true;
      return {
        data: paginatedData,
        totalCount: filtered.length,
      };
    },
    [search, partys],
  );

  return (
    <div>
      <div className="w-full py-2">
        <label className="input input-sm w-full flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder={`Portal/Directory Name..`}
            className="w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="relative">
        {(isExpanding || isExpanding) && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${search}`}
          columns={AvailableColumn}
          pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          data={partys}
          onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
            return doGetDirectoryPortalData(
              pageIndex + 1,
              pageSize,
              sorting,
              columnFilters,
            );
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
