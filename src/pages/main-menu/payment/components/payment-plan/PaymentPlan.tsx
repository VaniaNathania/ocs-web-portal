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
// import { ProductBase } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { QueryPaymentPlanDto } from "../../models/interface";

interface PaymentPlan {
  billNbr: string;
  seq: number;
  due: number;
  settCharge: number;
  dueDate: string;
}

const API_URL = apiConfig.service_payment;

const PaymentPlanTable = () => {
  const [rows, setRows] = useState<QueryPaymentPlanDto[]>([]);
  const { GetData } = useCallApi();

  const isAllSelected = (filteredData: any[]) => {
    // return filteredData.every((row) =>
    //   selectedOwned.some((selected) => selected.jobId === row.jobId)
    // );
    return true;
  };

  // Toggle all filtered data
  const handleSelectAll = (filteredData: any[]) => {
    // if (isAllSelected(filteredData)) {
    //   setSelectedOwned((prev) =>
    //     prev.filter(
    //       (item) => !filteredData.some((row) => row.jobId === item.jobId)
    //     )
    //   );
    // } else {
    //   // merge and deduplicate
    //   const merged = [
    //     ...selectedOwned,
    //     ...filteredData.filter(
    //       (row) => !selectedOwned.some((sel) => sel.jobId === row.jobId)
    //     ),
    //   ];
    //   setSelectedOwned(merged);
    // }
    return true;
  };

  const column = useMemo<ColumnDef<PaymentPlan>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isAllSelected(
                table.getFilteredRowModel().rows.map((r) => r.original),
              )}
              onChange={() =>
                handleSelectAll(
                  table.getFilteredRowModel().rows.map((r) => r.original),
                )
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        ),
        cell: ({ row }) => {
          const feature = row.original;
          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },
      {
        accessorFn: (row) => row.billNbr,
        id: "billNbr",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Bill Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.seq,
        id: "seq",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Instalment Seq"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.due,
        id: "due",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Due Amount"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.settCharge,
        id: "settCharge",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Settle Charge"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.dueDate,
        id: "dueDate",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Due Date" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  // const doGetListData = useCallback(
  //   async (page: number, limit: number, sorting: any, filter: any) => {
  //     await new Promise((resolve) => setTimeout(resolve, 300));
  //     let temp: QueryPaymentPlanDto[] = [];

  //     let processedData: QueryPaymentPlanDto[] = [...temp];

  //     // Apply sorting
  //     if (sorting && sorting.length > 0) {
  //       const { id, desc } = sorting[0];
  //       processedData.sort((a, b) => {
  //         const aValue = a[id as keyof PaymentPlan];
  //         const bValue = b[id as keyof PaymentPlan];

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

  const doGetListData = useCallback(async (page: number, limit: number) => {
    try {
      const payload = {
        search: "",
        page: page,
        size: limit,
        sortBy: "billNbr",
        sortDirection: "asc",
      };

      const resp = await GetData(
        `${API_URL}/api/payment/query-payment-plan`,
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
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <DataGridProvider
        key={`resource-grid`}
        data={rows}
        // pagination={{ size: 6 }}
        layout={{ card: true }}
        columns={column}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
          doGetListData(pageIndex + 1, pageSize)
        }
      >
        {/* <DataGridTable /> */}
      </DataGridProvider>
    </div>
  );
};

export default PaymentPlanTable;
