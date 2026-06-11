import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
// import { ProductBase } from "@/pages/main-menu/order/interfaces";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { BalShareList } from "../share-to-other/models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfig, apiConfigOrder } from "@/config/api.config";
import { usePayment } from "../../hooks/PaymentContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

const API_URL = apiConfig.service_payment;

const ShareFromOtherTable = () => {
  const { PostData } = useCallApi();
  const { selectedRow } = usePayment();
  // const [rows, setRows] = useState<BalShareList[]>([]);
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
        accessorFn: (row) => row.balId,
        id: "balId",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Balance Id"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.ownerPrefix,
        id: "ownerPrefix",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="(Source)Prefix"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.ownerNbr,
        id: "ownerNbr",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="(Source)Number"
            column={column}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      // {
      //   accessorFn: (row) => row.srcAcctNbr,
      //   id: "srcAcctNbr",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader
      //       className=""
      //       title="(Source)Account Number"
      //       column={column}
      //     />
      //   ),
      //   enableSorting: false,
      //   enableHiding: false,
      // },
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
    ],
    [],
  );

  const fetchRow = async (): Promise<BalShareList[]> => {
    try {
      //  console.log(API_URL);

      const resp = await PostData(
        `${API_URL}/api/payment/qryBalShareByUserInfoAPI`,
        {
          acctId: selectedRow?.acctId,
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

  const ShareFromOtherData = useQuery({
    queryKey: ["share-from-other", selectedRow],
    queryFn: () => fetchRow(),
    refetchOnWindowFocus: false,
  });

  const ListToolBar = () => {
    return (
      <div className="p-5">
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => {
            //  console.log("click");

            ShareFromOtherData.refetch();
          }}
        >
          <KeenIcon icon="arrows-circle" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <DataGridProvider
        // key={`resource-grid`}
        data={ShareFromOtherData.data}
        columns={column}
        toolbar={<ListToolBar />}
        serverSide={false}
        layout={{ card: true }}
      />
    </div>
  );
};

export default ShareFromOtherTable;
