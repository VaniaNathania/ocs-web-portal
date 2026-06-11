import {
  DataGridColumnHeader,
  DataGridProvider,
  useDataGrid,
} from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { AcctBookResponseDto } from "../models/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useSubscriberListContext } from "../../../../../hooks";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  ContactChannel,
  PaymentHistoryQuery,
} from "@/pages/main-menu/order/user/menu/accInfo/models/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultPaymentQuery } from "@/pages/main-menu/order/user/menu/accInfo/dialog/paymentHistory/models/mock";

const API_URL = apiConfigOrder.order;

interface query extends PaymentHistoryQuery {
  contactChannelName?: string;
}

const defaultQuery: query = { ...defaultPaymentQuery, contactChannelName: "" };

function formatAmount(value: number): string {
  return (value / 100000).toFixed(5);
}

const PaymentInfo = () => {
  const { GetData } = useCallApi();
  const { selectedSubs } = useSubscriberListContext();
  const [tempQuery, setTempQuery] = useState<query>(defaultQuery);
  const [query, setQuery] = useState<query>(defaultQuery);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);

  const fetchContact = async () => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/order/qry-contact-channel-list`,
        { spId: 0 },
      );

      if (!resp.message) return [];
      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const fetchPayment = async () => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/common-service/qry-payment-method`,
        {},
      );

      if (!resp.message) return [];
      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const contactChannel: UseQueryResult<ContactChannel[]> = useQuery({
    queryKey: ["contact-channel"],
    queryFn: fetchContact,
    // staleTime: 1000 * 1, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  const paymentMethod: UseQueryResult<PaymentMethod[]> = useQuery({
    queryKey: ["payment-method"],
    queryFn: fetchPayment,
    // staleTime: 1000 * 1, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  const onFetch = async (page: number, limit: number) => {
    try {
      const resp = await GetData(
        `${API_URL}/account-information/qry-all-payment`,
        {
          subsId: selectedSubs?.subsId,
          acctId: selectedSubs?.acctId,
          sortBy: "ACCT_BOOK_ID",
          sortDirection: "asc",

          // 🔽 paging
          page,
          size: limit,

          // 🔽 query from toolbar
          paymentMethodId: query.paymentMethodId,
          contactChannelId: query.contactChannelId,
          tradeBeginTime: query.tradeBeginTime,
          tradeEndTime: query.tradeEndTime,
          spId: 0,
        },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return {
          data: [],
          total: 0,
        };
      }

      return {
        data: resp.data,
        totalCount: resp.totalRows ?? resp.data.length,
      };
    } catch (error) {
      toast.error("Client Side Error");
      return {
        data: [],
        total: 0,
      };
    }
  };

  const column = useMemo<ColumnDef<AcctBookResponseDto>[]>(
    () => [
      {
        accessorFn: (row) => row.acctBookId,
        id: "acctBookId",
        header: ({ column }) => (
          <DataGridColumnHeader title="transactionId" column={column} />
        ),
        cell: ({ row }) => {
          return (
            <div
            // onClick={() => setSelectedRow(row.original)}
            >
              {row.original.acctBookId}
            </div>
          );
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.accNbr,
        id: "accNbr",
        header: ({ column }) => (
          <DataGridColumnHeader title="Service Number" column={column} />
        ),
        // cell: ({ row }) => {
        //   <Button
        //     variant={"ghost"}
        //     // onClick={() => setSelectedRow(row.original)}
        //   >
        //     {row.original.accNbr}
        //   </Button>;
        // },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.createdDate,
        id: "createdDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Time" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.charge,
        id: "charge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Amount" column={column} />
        ),
        cell: ({ row }) => <div>{formatAmount(row.original.charge ?? 0)}</div>,
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.paymentMethodName,
        id: "paymentMethodName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Method" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },

      {
        accessorFn: (row) => row.preCharge,
        id: "preCharge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Balance(Before)" column={column} />
        ),
        cell: ({ row }) => (
          <div>{formatAmount(row.original.preCharge ?? 0)}</div>
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.afterCharge,
        id: "afterCharge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Balance(After)" column={column} />
        ),
        cell: ({ row }) => (
          <div>{formatAmount(row.original.afterCharge ?? 0)}</div>
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.contactChannelName,
        id: "contactChannelName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Contact Channel" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
    ],
    [],
  );

  return (
    <div className="relative flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-row items-center gap-2">
          <Label className="w-32">Payment Method</Label>
          <Select
            value={tempQuery.paymentMethodId?.toString() ?? ""}
            onValueChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                paymentMethodId: Number(e),
              }))
            }
          >
            <SelectTrigger className="flex-1" size="sm">
              <SelectValue placeholder="Select Contact" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethod.data?.map((item) => (
                <SelectItem
                  key={item.paymentMethodId}
                  value={item.paymentMethodId.toString()}
                >
                  {item.paymentMethodName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Label className="w-32">Contact Channel</Label>
          <Select
            value={tempQuery.paymentMethodId?.toString() ?? ""}
            onValueChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                contactChannelId: Number(e),
              }))
            }
          >
            <SelectTrigger className="flex-1" size="sm">
              <SelectValue placeholder="Select Contact" />
            </SelectTrigger>
            <SelectContent>
              {contactChannel.data?.map((item) => (
                <SelectItem
                  key={item.contactChannelId}
                  value={item.contactChannelId.toString()}
                >
                  {item.contactChannelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div></div>
        <div className="flex flex-row items-center gap-2">
          <Label className="w-32">Start Date</Label>
          <input
            type="datetime-local"
            className="input input-sm bg-white flex-1"
            value={tempQuery.tradeBeginTime ?? ""}
            onChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                tradeBeginTime: e.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <Label className="w-32">End Date</Label>
          <input
            type="datetime-local"
            className="input input-sm bg-white flex-1"
            value={tempQuery.tradeEndTime ?? ""}
            onChange={(e) =>
              setTempQuery((prev) => ({
                ...prev,
                tradeEndTime: e.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-row items-center gap-2 justify-end">
          <Button size={"sm"} onClick={() => setQuery(tempQuery)}>
            Query
          </Button>
          <Button
            size={"sm"}
            variant={"outline"}
            onClick={() => {
              setQuery(defaultPaymentQuery);
              setTempQuery(defaultPaymentQuery);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      <DataGridProvider
        columns={column}
        pagination={{ size: 5 }}
        layout={{ card: false }}
        serverSide
        onFetchData={({ pageIndex, pageSize }) =>
          onFetch(pageIndex + 1, pageSize)
        }
      />
    </div>
  );
};

export default PaymentInfo;
