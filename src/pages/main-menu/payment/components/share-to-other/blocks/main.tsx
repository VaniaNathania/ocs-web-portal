import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { BalShareList } from "../models/interfaces";
import ListToolBar from "./listtoolbar";
import BalanceShareRule from "../components/dialog/balanceShareRule/BalanceShareRule";
import BalanceShareHistory from "../components/dialog/balanceShareHistory/BalanceShareHistory";
import { useShareToOther } from "../hooks/context";
import { nonSelectedRowHighLight, selectedRowHighLight } from "@/styles/style";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { usePayment } from "../../../hooks/PaymentContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { formatAmount } from "@/pages/main-menu/order/user/menu/subscriber/components/general";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";

const API_URL = apiConfig.service_payment;

const Main = () => {
  const { selectedRow } = usePayment();
  const {
    selectedBal,
    setSelectedBal,
    balShareDelete,
    setBalShareDelete,
    balShare,
  } = useShareToOther();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { GetData, PostData } = useCallApi();

  const fetchRow = async (): Promise<BalShareList[]> => {
    try {
      // console.log(API_URL);
      setIsLoading(true);

      const resp = await GetData(
        `${API_URL}/api/payment/qry-bal-share-to-other`,
        {
          acctId: selectedRow?.acctId,
          // isValidate: true,
        },
      );

      // console.log(resp);

      if (!resp?.status) {
        toast.error(resp?.message);
        return [];
      }
      setSelectedBal(resp.data[0]);
      return resp.data;
    } catch (error) {
      //  console.log(error);

      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const ShareToOtherData = useQuery({
    queryKey: ["share-to-other", selectedRow],
    queryFn: () => fetchRow(),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!balShare) ShareToOtherData.refetch();
  }, [balShare]);

  const deleteRow = async () => {
    try {
      const resp = await PostData(
        `${API_URL}/api/payment/deal-bal-share-to-other`,
        {
          balShare: {
            balShareId: selectedBal?.balShareId,
            processType: "DELETE",
          },
        },
      );

      if (!resp?.status) {
        return toast.error(resp?.message);
      }

      return toast.success(resp.message);
    } catch (error) {
      return toast.error("Error Communicating with server");
    } finally {
      setBalShareDelete(false);
      ShareToOtherData.refetch();
    }
  };

  const column = useMemo<ColumnDef<BalShareList>[]>(
    () => [
      {
        accessorFn: (row) => row.balShareId,
        id: "balShareId",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Bai Share Id"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.acctNbr,
        id: "acctNbr",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Account Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.ceilLimit,
        id: "ceilLimit",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Cycle Upper Limit"
            column={column}
          />
        ),
        cell: ({ row }) => <div>{formatAmount(row.original.ceilLimit)}</div>,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.dailyCeilLimit,
        id: "dailyCeilLimit",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Daily Upper Limit"
            column={column}
          />
        ),
        cell: ({ row }) => (
          <div>{formatAmount(row.original.dailyCeilLimit)}</div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        // accessorFn: (row) => row.usableLimit,
        id: "unit",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Unit" column={column} />
        ),
        cell: ({ row }) => (
          <div>{row.original.acctResDto?.unitTypeDto?.unitTypeName}</div>
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
        accessorFn: (row) => row.shareType,
        id: "shareType",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Share Type"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.accNbr,
        id: "accNbr",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Owner DH" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );
  return (
    <div className="flex flex-col gap-2">
      {isLoading && <Loading />}
      <BalanceShareRule />
      <BalanceShareHistory />
      <PopUpDialog
        desc="This action cannot be undone!"
        isOpen={balShareDelete}
        handleDialog={setBalShareDelete}
        onConfirm={deleteRow}
      />
      <DataGridProvider
        key={`resource-grid`}
        toolbar={<ListToolBar reload={ShareToOtherData.refetch} />}
        data={ShareToOtherData.data}
        columns={column}
        serverSide={false}
        layout={{ card: true }}
        // onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) =>
        //   doGetListData(pageIndex + 1, pageSize, sorting, columnFilters)
        // }
        getRowProps={(row) => ({
          className:
            row.original.balShareId === selectedBal?.balShareId
              ? selectedRowHighLight
              : nonSelectedRowHighLight,
          onClick: () => {
            setSelectedBal(row.original);
            // console.log("ini bal share", row.original);
          },
        })}
      ></DataGridProvider>
    </div>
  );
};

export default Main;
