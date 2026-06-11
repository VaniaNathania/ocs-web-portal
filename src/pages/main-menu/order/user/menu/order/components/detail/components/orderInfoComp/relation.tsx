import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useOrderOrderDetail } from "../../hooks/context";
import { OrderDetail } from "../../../../models/interfaces";
import TableBuilder from "../tableBuilder";

const RelationOrder = () => {
  const { orderDetail } = useOrderOrderDetail();

  interface PossibleTableItem<K extends keyof OrderDetail> {
    label: string;
    key: K;
  }

  const posibleTable: PossibleTableItem<keyof OrderDetail>[] = [
    { label: "Credit Limit", key: "orderCreditLimitDtoList" },
    { label: "VAS Data", key: "orderDpOfferDtoList" },
    { label: "Fellow Number", key: "orderFellowNbrDtoList" },
    { label: "Goods", key: "orderGoodsDtoList" },
    { label: "Home Zone", key: "orderHomeZoneDtoList" },
    { label: "Reservation", key: "orderResDtoList" },
  ];

  // const a = Object.keys(orderDetail.data?)
  const column = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.orderNbr,
        id: "orderNbr",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order Number" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,

        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.relationName,
        id: "relationName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order Relation Name" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,

        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.eventName,
        id: "eventName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Event Name" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,

        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.accNbr,
        id: "accNbr",
        header: ({ column }) => (
          <DataGridColumnHeader title="Service Number" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,

        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Offer Name" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,

        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
    ],
    [],
  );
  return (
    <div className="flex flex-col p-5 gap-2 border-2 rounded-sm">
      {posibleTable.map((item) => {
        // if(item.key==)
        if (!orderDetail.data) return;
        if (
          !orderDetail.data[item.key] &&
          !Array.isArray(orderDetail.data[item.key])
        )
          return;
        if (orderDetail.data[item.key].length === 0) return;
        return (
          <div className="flex flex-col gap-2">
            <div>{item.label}</div>
            <TableBuilder data={orderDetail.data[item.key]} />
          </div>
        );
      })}
      <div>Relation Order</div>
      <DataGridProvider
        columns={column}
        data={orderDetail.data?.orderAllRelaDto}
      />
    </div>
  );
};

export default RelationOrder;
