import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useOrderOrderDetail } from "../../hooks/context";
import { OrderFeeDetailRespDtoList } from "../../../../models/interfaces";

const Table = () => {
  const { orderDetail } = useOrderOrderDetail();

  const column = useMemo<ColumnDef<OrderFeeDetailRespDtoList>[]>(
    () => [
      {
        accessorFn: (row) => row.acctResName,
        id: "acctResName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Account Item Type" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,

        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.receivableCharge,
        id: "receivableCharge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Amount Receivable" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,

        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.promotionCharge,
        id: "promotionCharge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Discount Amount" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,

        meta: {
          headerClassName: "sticky top-0 z-10 bg-gray-100",
        },
      },
      {
        accessorFn: (row) => row.receivedCharge,
        id: "receivedCharge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Amount Received" column={column} />
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
    <DataGridProvider
      columns={column}
      data={orderDetail.data?.orderFeeRespDto.orderFeeDetailRespDtoList}
    />
  );
};

export default Table;
