import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
} from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
// import { ProductBase } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePayment } from "../../hooks/PaymentContext";
import { PresentFeeInstData } from "../../models/interface";

interface bonusRule {
  topUpEventName: string;
  priceName: string;
  sum: number;
  balTypeName: string;
  isCurency: "Y" | "N";
  effDate: string;
  expDate: string;
  extDate: string;
}

const API_URL = apiConfig.service_payment;

const BonusRuleTable = () => {
  const { selectedRow, webRechargeUseQuery, form } = usePayment();
  const { PostData } = useCallApi();
  const column = useMemo<ColumnDef<PresentFeeInstData>[]>(
    () => [
      {
        accessorFn: (row) => row.reName,
        id: "reName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Top Up Event"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.priceName,
        id: "priceName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Price Name"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.basicPresentCharge,
        id: "basicPresentCharge",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Sum" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.acctResName,
        id: "acctResName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Balance Type"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.isCurrency,
        id: "isCurrency",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Is Currency"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Effective Date"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Expiry Date"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.stateDate,
        id: "stateDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Extended Days"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const fetchRow = async (): Promise<PresentFeeInstData[]> => {
    try {
      // console.log(API_URL);

      const resp = await PostData(
        `${API_URL}/api/payment/web-qry-recharge-bonus`,
        {
          charge: Number(form?.submitAmount ?? "0") * 100000,
          contact_channel_id: 0,
          spId: "0",
          subs_id: webRechargeUseQuery?.data?.subsList[0]?.subsId,
        },
      );

      //  console.log(resp);

      if (!resp?.status) {
        toast.error(resp?.message);
        return [];
      }
      return resp.data ?? [];
    } catch (error) {
      //  console.log(error);

      return [];
    }
  };

  const BonusData = useQuery({
    queryKey: ["bonus-pay", webRechargeUseQuery],
    queryFn: () => fetchRow(),
    refetchOnWindowFocus: false,
  });

  // const doGetListData = useCallback(
  //   async (page: number, limit: number, sorting: any, filter: any) => {
  //     await new Promise((resolve) => setTimeout(resolve, 300));
  //     let temp: bonusRule[] = rows;

  //   //  console.log(temp);

  //     let processedData: bonusRule[] = [...temp];

  //     // Apply sorting
  //     if (sorting && sorting.length > 0) {
  //       const { id, desc } = sorting[0];
  //       processedData.sort((a, b) => {
  //         const aValue = a[id as keyof bonusRule];
  //         const bValue = b[id as keyof bonusRule];

  //         if (typeof aValue === "string" && typeof bValue === "string") {
  //           return desc
  //             ? bValue.localeCompare(aValue)
  //             : aValue.localeCompare(bValue);
  //         }

  //         if (!aValue || !bValue) return 1;

  //         if (aValue < bValue) return desc ? 1 : -1;
  //         if (aValue > bValue) return desc ? -1 : 1;
  //         return 0;
  //       });
  //     }

  //     // Apply pagination
  //     const startIndex = (page - 1) * limit;
  //     const endIndex = startIndex + limit;
  //     const paginatedData = processedData.slice(startIndex, endIndex);

  //     return {
  //       data: processedData.slice((page - 1) * limit, page * limit),
  //       totalCount: processedData.length,
  //     };
  //   },
  //   [],
  // );
  return (
    <div className="flex flex-col gap-2">
      <DataGridProvider
        key={`resource-grid`}
        data={BonusData.data}
        pagination={{ size: 6 }}
        columns={column}
        serverSide={false}
        layout={{ card: true }}
      ></DataGridProvider>
    </div>
  );
};

export default BonusRuleTable;
