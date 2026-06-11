import {
  DataGridColumnHeader,
  DataGridProvider,
  DataGridTable,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import {
  BalanceDetail,
  mockAccountBallDetail,
  mockHisBill,
} from "../../../interfaces";
import ListToolbar from "./ListToolbar";
import { useBillDetailContext } from "../hooks/context";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const Main = () => {
  const { allAcctItemDatas, isOpen, setIsOpen, isLoading } =
    useBillDetailContext();
  const column = useMemo<ColumnDef<BalanceDetail>[]>(() => {
    const baseColumn: ColumnDef<BalanceDetail>[] = [
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
          const isCredit = row.original.realBal.toString().includes("-");
          const realBal = row.original.realBal.toString().replace("-", "");
          const realBalSlice = [
            realBal.slice(0, 1),
            realBal.slice(1, realBal.length),
          ];
          const realBalStr =
            realBalSlice[1] != ""
              ? realBalSlice.join(".")
              : realBalSlice.join("");
          //  console.log(realBalStr, realBalSlice);

          return (
            <div>{`${isCredit ? "Credit " : ""}${realBalStr[0] !== "0" ? realBalStr : "0.00000"}`}</div>
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
          const isCredit = row.original.reserveBal.toString().includes("-");
          const reserveBal = row.original.reserveBal
            .toString()
            .replace("-", "");
          const reserveBalSlice = [
            reserveBal.slice(0, 1),
            reserveBal.slice(1, reserveBal.length),
          ];
          const reserveBalStr =
            reserveBalSlice.length > 1
              ? reserveBalSlice.join(".")
              : reserveBalSlice.join("");
          return (
            <div>{`${isCredit ? "Credit " : ""}${reserveBalStr[0] !== "0" ? reserveBalStr : "0.00000"}`}</div>
          );
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
        accessorFn: (row) => row.acctRes.unitType.unitTypeName,
        id: "unitTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Unit" column={column} />
        ),
        cell({ row }) {
          return <div>{row.original.acctRes.unitType.unitTypeName}</div>;
        },
        enableSorting: false,
        enableHiding: false,
      },
    ];

    return allAcctItemDatas.length > 0 ? baseColumn : [];
  }, [allAcctItemDatas]);

  return (
    <div className="flex flex-col gap-2">
      {isLoading && <Loading />}
      <DataGridProvider
        key={`resource-grid-${allAcctItemDatas}`}
        data={allAcctItemDatas}
        pagination={{ size: 5 }}
        layout={{ card: true }}
        toolbar={<ListToolbar />}
        columns={column}
        serverSide={false}
        // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
        //   doGetListData(pageIndex + 1, pageSize, sorting, columnFilters)
        // }
        // getRowProps={(row) => ({
        //   className: row.original.acctResId === selectedRows?.acctResId ? selectedRowHighLight : nonSelectedRowHighLight,
        //   onClick: () => setSelectedRows(row.original),
        // })}
      >
        {/* <DataGridTable /> */}
      </DataGridProvider>

      <PopUpDialog
        title="Information"
        type="alert"
        desc="Please select at least one condition"
        isOpen={isOpen}
        handleDialog={setIsOpen}
      />
    </div>
  );
};

export default Main;
