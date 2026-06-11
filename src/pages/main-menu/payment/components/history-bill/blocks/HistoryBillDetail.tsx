import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useHistoryBillContext } from "../hooks/context";
import { Label } from "@/components/ui/label";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { usePayment } from "../../../hooks/PaymentContext";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { AcctItemList, BillAcctItemProps } from "../interface/interface";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";

const HistoryBillDetail = () => {
  const { formatedValue, webRechargeUseQuery } = usePayment();
  const {
    isOpen,
    setIsOpen,
    isLoading,
    billAcctItem,
    billDetailTable,
    selectedDetailRow,
    setSelectedDetailRow,
  } = useHistoryBillContext();

  const rmFromBillCyc = billAcctItem?.billingCycleName.replace("From ", "");
  const finalBillCyc = rmFromBillCyc?.replace("to", "-");

  const amount =
    (billAcctItem?.preBalance ?? 0) +
    (billAcctItem?.due ?? 0) +
    (billAcctItem?.adjustCharge ?? 0) +
    (billAcctItem?.settCharge ?? 0) +
    (billAcctItem?.recvCharge ?? 0);

  const column = useMemo<ColumnDef<AcctItemList>[]>(
    () => [
      {
        accessorFn: (row) => row.acctId,
        id: "servNumber",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Service Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <div>
              {webRechargeUseQuery?.data?.subsList.map((item) => item.accNbr)}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.acctItemTypeName,
        id: "acctItemTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Account Item Type"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.charge,
        id: "charge",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Amount" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          // const item = row.original;
          const amount = row.original.charge;

          return formatedValue(amount, "default");
        },
      },
    ],
    [billDetailTable],
  );

  return (
    <DialogWrapper
      isOpen={isOpen}
      handleDialog={setIsOpen}
      title="Historcal Bills Detail"
      size={{ width: "5xl" }}
    >
      {isLoading && <Loading />}
      <div className="p-3">
        <div className="py-3">
          <div className="flex items-center gap-2">
            <Label>Billing Cycle:</Label>
            <div className="text-sm">{finalBillCyc}</div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center gap-1">
              <Label>Pre-balance</Label>
              <span className="text-sm text-blue-500">{`${formatedValue(billAcctItem?.preBalance, "preBalAndTotal")}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Label>+Total Due</Label>
              <span className="text-sm text-blue-500">{`${formatedValue(billAcctItem?.due, "historical")}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Label>+Adjustment</Label>
              <span className="text-sm text-blue-500">{`${formatedValue(billAcctItem?.adjustCharge, "historical")}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Label>+Pending</Label>
              <span className="text-sm text-red-500">{`${formatedValue(billAcctItem?.settCharge ?? 0, "historical")}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Label>+Received</Label>
              <span className="text-sm text-blue-500">{`${formatedValue(billAcctItem?.recvCharge, "historical")}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Label>=Current Balance</Label>
              <span className="text-sm text-blue-500">{`${formatedValue(amount, "preBalAndTotal")}`}</span>
            </div>
          </div>
        </div>

        <div className="">
          <DataGridProvider
            key={`resource-grid`}
            data={billDetailTable}
            pagination={{ size: 5 }}
            layout={{ card: true }}
            columns={column}
            serverSide={false}
            getRowProps={(row) => ({
              className:
                row.original.acctId === selectedDetailRow?.acctId
                  ? selectedRowHighLight
                  : nonSelectedRowHighLight,
              onClick: () => setSelectedDetailRow(row.original),
            })}
          >
            {/* <DataGridTable /> */}
          </DataGridProvider>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default HistoryBillDetail;
