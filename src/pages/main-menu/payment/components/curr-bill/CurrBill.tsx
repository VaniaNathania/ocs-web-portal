import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
} from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { ProductBase } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePayment } from "../../hooks/PaymentContext";
import {
  formatAmount,
  formatWithLabel,
} from "@/pages/main-menu/order/user/menu/subscriber/components/general";

interface currBill {
  detail: string;
  amount: string;
}

const CurrBillTable = () => {
  const { webRechargeUseQuery } = usePayment();

  const [rows, setRows] = useState<currBill[]>([
    {
      detail: "Pre-balance",
      amount: formatWithLabel(
        webRechargeUseQuery?.data?.billDetail.preBalance ?? 0,
      ),
    },
    {
      detail: "Total Due",
      amount: formatWithLabel(webRechargeUseQuery?.data?.billDetail.due ?? 0),
    },
    {
      detail: "Adjustment",
      amount: formatWithLabel(
        webRechargeUseQuery?.data?.billDetail.adjustCharge ?? 0,
      ),
    },
    {
      detail: "Pending",
      amount: formatWithLabel(
        webRechargeUseQuery?.data?.billDetail.pastAdjustCharge ?? 0,
      ),
    },
    {
      detail: "Received",
      amount: formatWithLabel(
        webRechargeUseQuery?.data?.billDetail.recvCharge ?? 0,
      ),
    },
    {
      detail: "Current Balance",
      amount: formatWithLabel(
        webRechargeUseQuery?.data?.defaultBalInfo?.grossBal ?? 0,
      ),
    },
  ]);

  useEffect(() => {
    setRows([
      {
        detail: "Pre-balance",
        amount: formatWithLabel(
          webRechargeUseQuery?.data?.billDetail.preBalance ?? 0,
        ),
      },
      {
        detail: "Total Due",
        amount: formatWithLabel(webRechargeUseQuery?.data?.billDetail.due ?? 0),
      },
      {
        detail: "Adjustment",
        amount: formatWithLabel(
          webRechargeUseQuery?.data?.billDetail.adjustCharge ?? 0,
        ),
      },
      {
        detail: "Pending",
        amount: formatWithLabel(
          webRechargeUseQuery?.data?.billDetail.pastAdjustCharge ?? 0,
        ),
      },
      {
        detail: "Received",
        amount: formatWithLabel(
          webRechargeUseQuery?.data?.billDetail.recvCharge ?? 0,
        ),
      },
      {
        detail: "Current Balance",
        amount: formatWithLabel(
          webRechargeUseQuery?.data?.defaultBalInfo?.grossBal ?? 0,
        ),
      },
    ]);
  }, [webRechargeUseQuery]);

  const column = useMemo<ColumnDef<currBill>[]>(
    () => [
      {
        accessorFn: (row) => row.detail,
        id: "detail",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Detail" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.amount,
        id: "amount",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Source Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let temp: currBill[] = rows;

      //  console.log(temp);

      let processedData: currBill[] = [...temp];

      // Apply sorting
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        processedData.sort((a, b) => {
          const aValue = a[id as keyof currBill];
          const bValue = b[id as keyof currBill];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return desc
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }

          if (!aValue || !bValue) return 1;

          if (aValue < bValue) return desc ? 1 : -1;
          if (aValue > bValue) return desc ? -1 : 1;
          return 0;
        });
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = processedData.slice(startIndex, endIndex);

      return {
        data: processedData.slice((page - 1) * limit, page * limit),
        totalCount: processedData.length,
      };
    },
    [webRechargeUseQuery],
  );
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-row items-center">
          <Label className="w-32 text-xs">Bill Number</Label>
          <Input
            size={"sm"}
            readOnly
            value={webRechargeUseQuery.data?.billDetail.billNbr}
          />
        </div>
        <div className="flex flex-row items-center">
          <Label className="w-32 text-xs">Current Billing Cycle</Label>
          <Input
            size={"sm"}
            readOnly
            value={`${webRechargeUseQuery.data?.billingCycleDetail.cycleBeginDate.split("T")[0] ?? ""} - ${webRechargeUseQuery.data?.billingCycleDetail.cycleEndDate.split("T")[0] ?? ""}`}
          />
        </div>
      </div>
      <DataGridProvider
        key={`resource-grid-${webRechargeUseQuery}`}
        data={rows}
        columns={column}
        pagination={{ size: 10 }}
        layout={{ card: true }}
        serverSide={false}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListData(pageIndex + 1, pageSize, sorting, columnFilters)
        }
      ></DataGridProvider>
    </div>
  );
};

export default CurrBillTable;
