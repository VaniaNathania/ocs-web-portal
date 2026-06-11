import { DataGridColumnHeader, DefaultTooltip } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useRef } from "react";
import { HistoryData } from "./UserGrantHistoryDataProvider";
import { useUserGrantHistoryData } from "./useUserGrantHistory";

export const useTableAtribute = () => {
  const { historyFilter, availablerows, countAva, setHistoryFilter } =
    useUserGrantHistoryData();

  const AvailableColumn = useMemo<ColumnDef<HistoryData>[]>(
    () => [
      {
        accessorFn: (row) => row.recUserName,
        id: "recUserName",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Operation User Name"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.recUserName}>
              <div className="w-full overflow-hidden text-ellipsis">
                {row.original.recUserName}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "min-w-[50px] w-[50px] max-w-[150px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "min-w-[50px] w-[50px] max-w-[150px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
      {
        accessorFn: (row) => row.recUserCode,
        id: "recUserCode",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Operation User Code"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.recUserCode}>
              <div className="w-full overflow-hidden text-ellipsis">
                {row.original.recUserCode}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "min-w-[50px] w-[50px] max-w-[150px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "min-w-[50px] w-[50px] max-w-[150px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
      {
        accessorFn: (row) => row.recCreateDate,
        id: "recCreateDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Operation Date"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.recCreateDate}>
              <div className="w-full overflow-hidden text-ellipsis">
                {row.original.recCreateDate}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "min-w-[50px] w-[50px] max-w-[150px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "min-w-[50px] w-[50px] max-w-[150px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
      {
        accessorFn: (row) => row.state,
        id: "state",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="State"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.state}>
              <div className="w-full overflow-hidden text-ellipsis">
                {row.original.state}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "min-w-[50px] w-[50px] max-w-[150px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "min-w-[50px] w-[50px] max-w-[150px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
      {
        accessorFn: (row) => row.isLocked,
        id: "isLocked",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Locked"
            className=" sticky"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.isLocked}>
              <div className="w-full overflow-hidden text-ellipsis">
                {row.original.isLocked}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "min-w-[50px] w-[50px] max-w-[150px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "min-w-[50px] w-[50px] max-w-[150px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
      {
        accessorFn: (row) => row.comments,
        id: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Event"
            className=" sticky"
            column={column}
          >
            <div className="w-[80px] overflow-hidden text-ellipsis">
              {column.id}
            </div>
          </DataGridColumnHeader>
        ),
        enableSorting: true,
        enableHiding: false,
        cell({ row }) {
          return (
            <DefaultTooltip placement="top" title={row.original.comments}>
              <div className=" overflow-hidden text-ellipsis">
                {row.original.comments}
              </div>
            </DefaultTooltip>
          );
        },
        meta: {
          headerClassName:
            "w-[80px] overflow-clip text-elipsis whitespace-nowrap",
          cellClassName:
            "w-[80px] text-elipsis overflow-hidden whitespace-nowrap",
        },
      },
    ],
    [historyFilter],
  );

  const hasFetch = useRef(false);
  const doGetAvailableData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      try {
        //  console.log(page, limit, availablerows.length);

        // mark first load
        if (!hasFetch.current) {
          // console.log("test");

          hasFetch.current = true;
        } else {
          // only update query after first load
          if (limit !== historyFilter?.size) {
            // console.log("test");
            //  console.log(limit, availablerows.length);

            setHistoryFilter((prev) => ({ ...prev, size: limit }));
            // if (limit === availablerows.length) {
            // }
          }
          if (page !== historyFilter?.page) {
            // console.log("test");

            setHistoryFilter((prev) => ({ ...prev, page }));
          }

          if (sorting.length > 0) {
            const sortBy = sorting[0].id;
            const sortDirection = sorting[0].desc ? "desc" : "asc";

            if (
              historyFilter?.sortBy !== sortBy ||
              historyFilter?.sortDirection !== sortDirection
            ) {
              // console.log("test");

              setHistoryFilter((prev) => ({ ...prev, sortBy, sortDirection }));
            }
          }
        }

        return {
          data: availablerows,
          pageCount: Math.ceil(countAva / limit),
          totalCount: countAva,
          hasNextPage: page * limit < countAva,
          hasPreviousPage: page > 1,
        };
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        return {
          data: [],
          pageCount: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        };
      }
    },
    [historyFilter, availablerows],
  );
  return { AvailableColumn, doGetAvailableData };
};
