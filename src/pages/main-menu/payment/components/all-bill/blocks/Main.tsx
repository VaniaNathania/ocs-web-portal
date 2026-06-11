import { DataGridColumnHeader, DataGridProvider, DataGridTable } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useAllBillContext } from "../hooks/AllBillContext";
import { AllBillProps } from "../interface/interface";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { usePayment } from "../../../hooks/PaymentContext";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const Main = () => {
  const { selectedRows, setSelectedRows, allBillDatas, loading } = useAllBillContext();
  const { formatedValue } = usePayment();

  const column = useMemo<ColumnDef<AllBillProps>[]>(
    () => [
      {
        accessorFn: (row) => row.billId,
        id: "billId",
        header: ({ column }) => <DataGridColumnHeader className="" title="Bill ID" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.billNbr,
        id: "billNbr",
        header: ({ column }) => <DataGridColumnHeader className="" title="Bill Number" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        // accessorFn: (row) => row.comstruct,
        id: "comstruct",
        header: ({ column }) => <DataGridColumnHeader className="" title="Comunication Structure" column={column} />,
        cell(props) {},
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.billingCycleName,
        id: "billingCycleName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Billing Cycle" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => formatedValue(row.due),
        id: "due",
        header: ({ column }) => <DataGridColumnHeader className="" title="Due Amount" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => formatedValue(row.settCharge),
        id: "settCharge",
        header: ({ column }) => <DataGridColumnHeader className="" title="Settle Charge" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => formatedValue(row.adjustCharge),
        id: "adjustCharge",
        header: ({ column }) => <DataGridColumnHeader className="" title="Adjust Amount" column={column} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        // accessorFn: (row) => row.se,
        id: "state",
        header: ({ column }) => <DataGridColumnHeader className="" title="State" column={column} />,
        cell(props) {
          return <div>{props.row.original.adjustCharge > 0 ? "Not Settled" : "Settled"}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [allBillDatas],
  );

  return (
    <div className="flex flex-col gap-2">
      {loading && <Loading />}
      <DataGridProvider<AllBillProps>
        key={`resource-grid-${allBillDatas}`}
        data={allBillDatas}
        pagination={{ size: 5 }}
        layout={{ card: true }}
        columns={column}
        serverSide={false}
        // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => doGetListData(pageIndex + 1, pageSize, sorting, columnFilters)}
        getRowProps={(row) => ({
          className: row.original.billId === selectedRows?.billId ? selectedRowHighLight : nonSelectedRowHighLight,
          onClick: () => setSelectedRows(row.original),
        })}
      >
        {/* <DataGridTable /> */}
      </DataGridProvider>
    </div>
  );
};

export default Main;
