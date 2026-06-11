import { useCallback, useEffect, useMemo, useState } from "react";
import { WholesaleMonitorList } from "../models/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import ListToolBar from "./listToolBar";
import { nonSelectedRowHighLight } from "@/styles/style";
import { useWholesaleMonitor } from "../hooks/context";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";

const API_URL = apiConfigOrder.order;

const Table = () => {
  const { setShowDetail, setSelectedRow, query, stateRec } = useWholesaleMonitor();
  const { GetData } = useCallApi();
  const column = useMemo<ColumnDef<WholesaleMonitorList>[]>(
    () => [
      {
        accessorFn: (row) => row.wholesaleCode,
        id: "wholesaleCode",
        header: ({ column }) => <DataGridColumnHeader className="" title="Batch No." column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.eventName,
        id: "eventName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Subscription Event" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.state,
        id: "state",
        header: ({ column }) => <DataGridColumnHeader className="" title="State" column={column} />,
        cell: ({ row }) => <div>{stateRec[row.original.state]}</div>,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.createdDate,
        id: "createdDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Created Time" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.keyStaff,
        id: "keyStaff",
        header: ({ column }) => <DataGridColumnHeader className="" title="Operator" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.reqDate,
        id: "reqDate",
        header: ({ column }) => <DataGridColumnHeader className="" title="Run Time" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.comments,
        id: "comments",
        header: ({ column }) => <DataGridColumnHeader className="" title="Remarks" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        // accessorFn: (row) => row.comments,
        id: "action",
        header: ({ column }) => <DataGridColumnHeader className="" title="Action" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => {
                setShowDetail(true);
                setSelectedRow(row.original);
              }}
            >
              <KeenIcon icon="notepad" />
            </Button>
          );
        },
        meta: {
          cellClassName: "text-center",
          headerClassName: "text-center",
        },
      },
    ],
    [stateRec],
  );

  const doGetListData = useCallback(
    async (page: number, limit: number) => {
      try {
        //  console.log("ini query", query);

        const payload = {
          ...query,
          spId: 0,
          pageNumber: page,
          pageSize: limit,
        };

        const resp = await GetData(`${API_URL}/api/order-entry/order/qry-wholesale-list`, payload);

        if (!resp.status) {
          throw new Error("API error");
        }

        const result = await resp.data;

        return {
          data: result.content ?? [],
          totalCount: result.totalElements ?? 0,
        };
      } catch (error) {
        toast.error("Failed to fetch data");
        return { data: [], totalCount: 0 };
      }
    },
    [query],
  );
  return (
    <DataGridProvider<WholesaleMonitorList>
      key={`resource-grid-${JSON.stringify(query)}`}
      // data={rows}
      toolbar={<ListToolBar />}
      getRowProps={(row) => ({
        className: nonSelectedRowHighLight,
        onDoubleClick: () => {
          setShowDetail(true);
          setSelectedRow(row.original);
        },
      })}
      onFetchData={({ pageIndex, pageSize }) => doGetListData(pageIndex, pageSize)}
      layout={{ card: true }}
      columns={column}
      serverSide={true}
    />
  );
};

export default Table;
