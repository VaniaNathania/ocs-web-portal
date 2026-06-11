import { DataGridColumnHeader, DataGridInner, DataGridProvider, DataGridTable, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { ProductBase } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { HisBillByCount } from "../interface/interface";
import { useHistoryBillContext } from "../hooks/context";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { usePayment } from "../../../hooks/PaymentContext";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import HistoryBillDetail from "./HistoryBillDetail";

const Main = () => {
  const { formatedValue } = usePayment();
  const { hisBillByCountDatas, isLoading, selectedItem, setSelectedItem, setIsOpen, isOpen } = useHistoryBillContext();
  const column = useMemo<ColumnDef<HisBillByCount>[]>(
    () => [
      {
        accessorFn: (row) => row.billingCycleName,
        id: "billingCycleName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Billing Cycle" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const rmFromBillCyc = row.original.billingCycleName.replace("From ", "");
          const finalBillCyc = rmFromBillCyc.replace("to", "-");

          return <div>{finalBillCyc}</div>;
        },
      },
      {
        accessorFn: (row) => row.billNbr,
        id: "billNbr",
        header: ({ column }) => <DataGridColumnHeader className="" title="Billing Number" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.billExDto,
        id: "ComStructure",
        header: ({ column }) => <DataGridColumnHeader className="" title="Comunication Structure" column={column} />,
        cell(props) {},
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.recvCharge,
        id: "recvCharge",
        header: ({ column }) => <DataGridColumnHeader className="" title="Amount" column={column} />,
        cell({ row }) {
          const data = row.original;
          const preBalance = data.preBalance;
          const due = data.due;
          const adjustment = data.adjustCharge;
          const pending = data.settCharge;
          const decBalance = data.recvCharge;

          const amount = (preBalance ?? 0) + (due ?? 0) + (adjustment ?? 0) + (pending ?? 0) + (decBalance ?? 0);

          const isIncrease = amount.toString().includes("-");

          return <div>{`${isIncrease ? "Increase" : ""} ${formatedValue(amount)}`}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [hisBillByCountDatas],
  );

  // const doGetListData = useCallback(async (page: number, limit: number, sorting: any, filter: any) => {
  //   await new Promise((resolve) => setTimeout(resolve, 300));
  //   let temp: HistoryBill[] = mockHisBill;

  //   let processedData: HistoryBill[] = [...temp];

  //   // Apply sorting
  //   if (sorting && sorting.length > 0) {
  //     const { id, desc } = sorting[0];
  //     processedData.sort((a, b) => {
  //       const aValue = a[id as keyof HistoryBill];
  //       const bValue = b[id as keyof HistoryBill];

  //       if (typeof aValue === "string" && typeof bValue === "string") {
  //         return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
  //       }

  //       if (!aValue || !bValue) return 1;

  //       if (aValue < bValue) return desc ? 1 : -1;
  //       if (aValue > bValue) return desc ? -1 : 1;
  //       return 0;
  //     });
  //   }

  //   // Apply pagination
  //   const startIndex = (page - 1) * limit;
  //   const endIndex = startIndex + limit;
  //   const paginatedData = processedData.slice(startIndex, endIndex);

  //   return {
  //     data: processedData.slice((page - 1) * limit, page * limit),
  //     totalCount: processedData.length,
  //   };
  // }, []);
  return (
    <div className="flex flex-col gap-2">
      {isLoading && <Loading />}
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-2">
          <div className="font-bold">Recent Bills</div>
        </div>
      </div>

      <DataGridProvider
        key={`resource-grid-${hisBillByCountDatas}`}
        data={hisBillByCountDatas}
        pagination={{ size: 5 }}
        layout={{ card: true }}
        columns={column}
        serverSide={false}
        // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => doGetListData(pageIndex + 1, pageSize, sorting, columnFilters)}
        getRowProps={(row) => ({
          className: row.original.billId === selectedItem?.billId ? selectedRowHighLight : nonSelectedRowHighLight,
          onClick: () => setSelectedItem(row.original),
          onDoubleClick: () => {
            setIsOpen(true);
            setSelectedItem(row.original);
          },
        })}
      >
        {/* <DataGridTable /> */}
      </DataGridProvider>

      <div className="flex gap-1 text-sm">
        <KeenIcon icon="information" className="text-sm text-blue-600" />
        <span className="text-blue-500">Note: Double click for detail.</span>
      </div>

      <HistoryBillDetail />
    </div>
  );
};

export default Main;
