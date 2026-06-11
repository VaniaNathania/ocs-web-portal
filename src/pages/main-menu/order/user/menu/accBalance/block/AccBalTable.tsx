import {
  DataGridColumnHeader,
  DataGridInner,
  DataGridProvider,
  DataGridToolbar,
} from "@/components";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { toast } from "sonner";
import { AccBalList, AccBalProps } from "../models/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { useQuery } from "@tanstack/react-query";
import { usePayment } from "@/pages/main-menu/payment/hooks/PaymentContext";

const API_URL = apiConfigOrder.order;

export function formatAmount(value: number): string {
  return (value / 100000).toFixed(5);
}

const AccBalTable = ({ acctId }: AccBalProps) => {
  const { GetData } = useCallApi();
  // const { webRechargeUseQuery } = usePayment();

  const fetchAccBal = async (): Promise<AccBalList[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/order/web-qry-bal-list-filter-all-expire`,
        { acctId: acctId },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }

      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const AccBalList = useQuery({
    queryKey: ["acc-bal", acctId],
    queryFn: fetchAccBal,
    refetchOnWindowFocus: false,
  });
  const column = useMemo<ColumnDef<AccBalList>[]>(
    () => [
      {
        accessorFn: (row) => row.acctResName,
        id: "acctResName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Balance Type" column={column} />
        ),
        enableHiding: false,
        // enableSorting: false,
      },
      {
        accessorFn: (row) => row.realBal,
        id: "realBal",
        header: ({ column }) => (
          <DataGridColumnHeader title="Real Time Balance" column={column} />
        ),
        cell: ({ row }) => (
          <div>
            {row.original.isCurrency === "Y"
              ? formatAmount(row.original.grossBal ?? 0).replace("-", "Credit ")
              : row.original.grossBal.toString().replace("-", "Credit ")}
          </div>
        ),
        enableHiding: false,
        // enableSorting: false,
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Effective Date" column={column} />
        ),
        cell: ({ row }) => <div>{row.original.effDate.replace("T", " ")}</div>,
        enableHiding: false,
        // enableSorting: false,
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Expire Date" column={column} />
        ),
        cell: ({ row }) => <div>{row.original.expDate.replace("T", " ")}</div>,
        enableHiding: false,
        // enableSorting: false,
      },
      {
        accessorFn: (row) => row.isCurrency,
        id: "isCurrency",
        header: ({ column }) => (
          <DataGridColumnHeader title="Is Curency" column={column} />
        ),
        enableHiding: false,
        // enableSorting: false,
      },
    ],
    [],
  );

  return (
    <div>
      <DataGridProvider
        columns={column}
        pagination={{ size: 5 }}
        sorting={[{ id: "effDate", desc: true }]}
        layout={{ card: true }}
        serverSide={false}
        data={AccBalList.data}
      />
    </div>
  );
};

export default AccBalTable;
