import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoleLayout } from "@/layouts/main-menu/role-management";
import { RoleSPID } from "../../../component/sideBarListContextTable";
import { useCallApi } from "@/hooks";
import { usePortletList } from "../hook/usePortlet";
import { Portlet } from "../hook/PortletsProvider";
import { Loading } from "../../../block/loadingBlock";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { apiConfigRole } from "@/config/api.config";

const API_ROLE = apiConfigRole.role;

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

export const DirectoryMenu = () => {
  const { lastUpdated, setAvailablePortlets, loading } = usePortletList();
  const { selectedRow } = useRoleLayout();
  const [node, setNode] = useState<TypeDir>();
  const [search, setSearch] = useState<string>("");
  const [temp, setTemp] = useState<RoleSPID>();
  const [partys, setPartys] = useState<TypeDir[]>([]); // Full flattened list
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // Track expanded parent IDs
  const hasFetched = useRef(false);
  const { GetData } = useCallApi();
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    fetchTypes;
  }, [selectedRow?.roleId]);

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
        `${API_ROLE}/api/portlets/${selectedRow?.roleId}/types/${parentId}/portlets`,
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
        id: "typeId",
        header: ({ column }) => (
          <DataGridColumnHeader title="Portal/Directory Name" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const data = row.original;
          const indent = `${0 * 1.5}rem`;

          return (
            <div
              style={{
                paddingLeft: indent,
                cursor: "pointer",
              }}
              // onClick={() => handleExpand(data)}
              // className={
              //   row.original.typeId === node?.typeId ? "underline" : ""
              // }
            >
              <KeenIcon
                icon={expanded.has(data.typeName) ? "down" : "right"}
                className="inline-block mr-2 "
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

      if (selectedRow?.roleId == temp?.roleId) {
        // console.log(selectedRow?.roleName, temp?.roleName);
        // console.log(partys.length);
        let curr = 1000; // start from a higher number to avoid conflicts

        baseData = hasFetched.current ? partys : baseDir;

        setNode(baseData[0]);
      } else {
        let curr = 1000;

        baseData = hasFetched.current ? partys : baseDir;
        setNode(baseData[0]);
      }

      let filtered = [...baseData];
      // if (search.trim()) {
      //   const keyword = search.toLowerCase();
      //   filtered = filtered.filter((item) =>
      //     item.typeName?.toLowerCase().includes(keyword)
      //   );
      // }

      // const startIndex = (page - 1) * limit;
      // const endIndex = startIndex + limit;
      // const paginatedData = filtered.slice(startIndex, endIndex);

      setPartys(baseData); // Ensure partys is initialized
      // setSelectedTemp(selectedRow);
      setTemp(selectedRow);
      hasFetched.current = true;
      return {
        data: filtered,
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

      {/* <DataGridProvider
        key={`available-features-grid-${search}-${lastUpdated}-${partys.length}`}
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
            columnFilters
          );
        }}
      /> */}
      <div className="relative">
        {(loading || isExpanding) && <Loading />}
        <DataGridProvider
          key={`available-features-grid-${search}`}
          columns={AvailableColumn}
          pagination={{ size: 5 }}
          layout={{ card: false }}
          sorting={[{ id: "name", desc: false }]}
          serverSide={true}
          data={partys}
          getRowProps={(row) => ({
            className:
              row.original.typeId === node?.typeId
                ? selectedRowHighLight
                : nonSelectedRowHighLight,
            onClick: () => handleExpand(row.original),
          })}
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
