import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { AccountBalanceDatasProps, BalanceDetail } from "../models/interfaces";
import ListToolBar from "./listTollbar";
import BalanceDialog from "../components/BalanceDialog";
import { useAccountBalance } from "../hooks/context";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { usePayment } from "../../../hooks/PaymentContext";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import PointExchangeDialog from "../components/PointExchangeDialog";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";

const Main = () => {
  const { selectedRow, formatedValue } = usePayment();
  const {
    accountBalanceDatas,
    loading,
    selectedRows,
    setSelectedRows,
    dialogType,
    setDialogType,
    refreshKey,
  } = useAccountBalance();
  const column = useMemo<ColumnDef<AccountBalanceDatasProps>[]>(
    () => [
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
        accessorFn: (row) => row.realBal,
        id: "realBal",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Real-Time Balance"
            column={column}
          />
        ),
        cell({ row }) {
          const grossBal = row.original.grossBal;
          const isCurrency = row.original.isCurrency;
          const raw = grossBal.toString().replace("-", "");

          return (
            <div>{`${grossBal > 0 ? "Debit" : "Credit"} ${isCurrency === "Y" ? formatedValue(grossBal) : raw}`}</div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.reserveBal,
        id: "reserveBal",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Reserved Balance"
            column={column}
          />
        ),
        cell({ row }) {
          const reserveBal = row.original.reserveBal;
          const isCurrency = row.original.isCurrency;
          const raw = reserveBal.toString().replace("-", "");

          return isCurrency === "Y" ? formatedValue(reserveBal) : raw;
        },
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
        cell: ({ row }) => {
          return <div>{row.original.effDate.replace("T", " ")}</div>;
        },
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
        cell: ({ row }) => {
          return <div>{row.original.expDate.replace("T", " ")}</div>;
        },
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
        cell({ row }) {
          return <div>{row.original.isCurrency === "Y" ? "Yes" : "No"}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.acctResDto?.unitTypeDto?.unitTypeName,
        id: "unitTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Unit" column={column} />
        ),
        cell({ row }) {
          return (
            <div>{row.original.acctResDto?.unitTypeDto?.unitTypeName}</div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [accountBalanceDatas, selectedRow],
  );

  return (
    <div className="flex flex-col gap-2">
      {loading && <Loading />}
      <DataGridProvider
        key={`grid-resource-${accountBalanceDatas}-${refreshKey}`}
        data={accountBalanceDatas}
        pagination={{ size: 5 }}
        sorting={[{ id: "acctResId", desc: false }]}
        toolbar={<ListToolBar />}
        layout={{ card: true }}
        columns={column}
        serverSide={false}
        // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => doGetListData(pageIndex + 1, pageSize, sorting, columnFilters)}
        getRowProps={(row) => ({
          className:
            row.original.balId === selectedRows?.balId
              ? selectedRowHighLight
              : nonSelectedRowHighLight,
          onClick: () => setSelectedRows(row.original),
        })}
      >
        {/* <DataGridTable /> */}
      </DataGridProvider>

      <PopUpDialog
        isOpen={dialogType !== null}
        handleDialog={() => setDialogType(null)}
        title="Information"
        type="alert"
        alertType="success"
        desc="Succeed in modifying the balance limit."
      />
      <BalanceDialog />
      <PointExchangeDialog />
    </div>
  );
};

export default Main;
