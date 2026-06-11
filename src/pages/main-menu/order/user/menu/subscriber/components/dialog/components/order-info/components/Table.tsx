import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useOrderSubsDetailOrderInfo } from "../hooks/SubsDetailOrderInfoContext";
import { OrderList } from "@/pages/main-menu/order/user/menu/order/models/interfaces";
import Query from "./Query";

const Table = () => {
  const { OrderList, orderItemQuery } = useOrderSubsDetailOrderInfo();

  const columns = useMemo<ColumnDef<OrderList>[]>(
    () => [
      {
        accessorFn: (row) => row.orderNbr,
        accessorKey: "orderNbr",
        header: "Order Number",
        filterFn: "includesString",
      },
      {
        accessorFn: (row) => row.offerName,
        accessorKey: "offerName",
        header: "Offer Name",
      },
      {
        accessorFn: (row) => row.accNbr,
        accessorKey: "accNbr",
        header: "Service Number",
      },
      {
        accessorFn: (row) => row.subsEventId,
        accessorKey: "subsEventId",
        cell: ({ row }) => <div>{row.original.eventName}</div>,
        filterFn: "equals",
        header: "Event Name",
      },
      // {
      //   accessorFn: (row) => row.orderState,
      //   accessorKey: "orderState",
      //   header: "State",
      // },
      {
        accessorFn: (row) => row.orderState,
        accessorKey: "orderState",
        header: "State Name",
        cell: ({ row }) => <div>{row.original.orderStateName}</div>,
        filterFn: "arrIncludesSome",
      },
      {
        accessorFn: (row) => row.createdMan,
        accessorKey: "createdMan",
        header: "Created By",
      },
      {
        accessorFn: (row) => row.acceptChannelName,
        accessorKey: "acceptchannelName",
        header: "Accept Channel",
      },
      {
        accessorFn: (row) => row.createdDate,
        accessorKey: "createdDate",
        header: "Created Time",
      },
      {
        accessorFn: (row) => row.completedDate,
        accessorKey: "completedDate",
        header: "Completed Time",
      },
    ],
    [orderItemQuery],
  );
  return (
    <div className="">
      <DataGridProvider
        key={`order-list-detail`}
        columns={columns}
        layout={{ card: true }}
        toolbar={<Query />}
        serverSide={false}
        rowSelection={true}
        data={OrderList.data}
      />
    </div>
  );
};

export default Table;
