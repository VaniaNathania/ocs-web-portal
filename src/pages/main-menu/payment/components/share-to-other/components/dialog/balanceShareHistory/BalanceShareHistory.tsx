import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { useShareToOther } from "../../../hooks/context";
import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useCallback, useMemo } from "react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { usePayment } from "@/pages/main-menu/payment/hooks/PaymentContext";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { BalShareToOtherHis } from "./models/interfaces";

const API_URL = apiConfig.service_payment;

const BalanceShareHistory = () => {
  const { balHistory, setBalHistory } = useShareToOther();
  const { selectedRow } = usePayment();
  const { GetData } = useCallApi();

  const columns = useMemo<ColumnDef<BalShareToOtherHis>[]>(
    () => [
      {
        accessorFn: (row) => row.prefix,
        id: "prefix",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Prefix" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.accNbr,
        id: "accNbr",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Number" column={column} />
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
        accessorFn: (row) => row.paymentForce,
        id: "paymentForce",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Payment Force"
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
        accessorFn: (row) => row.priority,
        id: "priority",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Priority" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.operationType,
        id: "operationType",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Operation Type"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.recCreatedDate,
        id: "recCreatedDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Operation Date"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.comments,
        id: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Comment" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.operator,
        id: "operator",
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Operator" column={column} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );

  const doGetListData = useCallback(async (page: number, limit: number) => {
    try {
      const payload = {
        search: "",
        page: page,
        size: limit,
        sortBy: "bal_share_id",
        sortDirection: "asc",
        acctId: selectedRow?.acctId,
      };

      const resp = await GetData(
        `${API_URL}/api/payment/qry-bal-share-operation-his`,
        payload,
      );

      if (!resp.status) {
        throw new Error("API error");
      }

      return {
        data: resp.data ?? [],
        totalCount: resp.totalRows ?? 0,
      };
    } catch (error) {
      toast.error("❌ Failed to fetch payment history");
      return { data: [], totalCount: 0 };
    }
  }, []);

  return (
    <DialogWrapper
      isOpen={balHistory}
      handleDialog={setBalHistory}
      title="Balance Share History"
    >
      <DataGridProvider
        columns={columns}
        pagination={{ size: 5 }}
        layout={{ card: false }}
        serverSide={true}
        onFetchData={({ pageIndex, pageSize }) =>
          doGetListData(pageIndex + 1, pageSize)
        }
      />
    </DialogWrapper>
  );
};

export default BalanceShareHistory;
