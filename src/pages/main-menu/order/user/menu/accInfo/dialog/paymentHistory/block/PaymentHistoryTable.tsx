import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { PaymentHistoryList } from "../../../models/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useOrderUser } from "@/pages/main-menu/order/user/hooks/context";
import { useOrderPaymentHistoryAccInfo } from "../hook/paymentHistoryContext";

const API_URL = apiConfigOrder.order;

const PaymentHistoryTable = () => {
  const { selectedAcc } = useOrderUser();
  const { query } = useOrderPaymentHistoryAccInfo();
  const { GetData } = useCallApi();

  const columns = useMemo<ColumnDef<PaymentHistoryList>[]>(
    () => [
      {
        accessorFn: (row) => row.paymentId,
        id: "pay.paymentId",
        header: ({ column }) => (
          <DataGridColumnHeader title="Transaction Id" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.createdDate,
        id: "createdDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Date" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.charge,
        id: "cha.charge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Amount" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        id: "paymentMethod",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Method" column={column} />
        ),
        cell: ({ row }) => <div>{row.original.paymentMethodName}</div>,
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Expiry Date" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.contactChannelName,
        id: "contactChannelName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Contact" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.userCode,
        id: "userCode",
        header: ({ column }) => (
          <DataGridColumnHeader title="Staff Code" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.preCharge,
        id: "preCharge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Balance(before)" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.afterCharge,
        id: "afterCharge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Balance(after)" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
    ],
    [],
  );

  const doGetListData = useCallback(
    async (page: number, limit: number) => {
      try {
        const payload = {
          acctNbr: selectedAcc?.acctNbr,
          paymentMethodId: query.paymentMethodId,
          acctId: selectedAcc?.acctId,
          paymentId: query.paymentId,
          contactChannelId: query.contactChannelId,
          tradeBeginTime: query.tradeBeginTime,
          tradeEndTime: query.tradeEndTime,
          pageNumber: page,
          pageSize: limit,
        };

        const resp = await GetData(
          `${API_URL}/api/order-entry/order/qry-all-payment-for-distribution4fish`,
          payload,
        );

        if (!resp.status) {
          throw new Error("API error");
        }

        const result = await resp.data;

        return {
          data: result.content ?? [],
          totalCount: result.totalElements ?? 0,
        };
      } catch (error) {
        toast.error("❌ Failed to fetch payment history");
        return { data: [], totalCount: 0 };
      }
    },
    [query],
  );

  return (
    <DataGridProvider
      key={JSON.stringify(query)}
      columns={columns}
      pagination={{ size: 5 }}
      layout={{ card: false }}
      serverSide
      onFetchData={({ pageIndex, pageSize }) =>
        doGetListData(pageIndex + 1, pageSize)
      }
    />
  );
};

export default PaymentHistoryTable;
