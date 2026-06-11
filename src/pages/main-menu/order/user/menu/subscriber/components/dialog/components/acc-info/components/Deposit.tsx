import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useSubscriberListContext } from "../../../../../hooks";
import { apiConfigOrder } from "@/config/api.config";
import { SelectDepositItemResponseDto } from "../models/interfaces";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const API_URL = apiConfigOrder.order;

const Deposit = () => {
  const { GetData } = useCallApi();
  const { selectedSubs } = useSubscriberListContext();

  const fetchDepoSubs = async (): Promise<SelectDepositItemResponseDto[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/account-information/qry-select-deposit-item`,
        {
          subsId: selectedSubs?.subsId,
        },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return [];
      }

      return resp.data;
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const DepoSubsList = useQuery({
    queryKey: ["Depo-subs", selectedSubs],
    queryFn: fetchDepoSubs,
    refetchOnWindowFocus: false,
  });

  const column = useMemo<ColumnDef<SelectDepositItemResponseDto>[]>(
    () => [
      {
        accessorFn: (row) => row.depositTypeName,
        id: "depositTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Deposit Type" column={column} />
        ),
        cell: ({ row }) => {
          return (
            <Button
              variant={"ghost"}
              size={"sm"}
              // onClick={() => setSelectedRow(row.original)}
            >
              {row.original.depositTypeName}
            </Button>
          );
        },
        meta: {
          cellClassName: "m-0 p-0",
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.submitAmount,
        id: "submitAmount",
        header: ({ column }) => (
          <DataGridColumnHeader title="Amount" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.submitAmount}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.returnAmount,
        id: "returnAmount",
        header: ({ column }) => (
          <DataGridColumnHeader title="Return Amount" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.returnAmount}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.paymentMethodName,
        id: "paymentMethodName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Method" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.paymentMethodName}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.checkOwnerName,
        id: "checkOwnerName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Operator" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.checkOwnerName}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.checkIssueDate,
        id: "checkIssueDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Operation Date" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.checkIssueDate}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.comments,
        id: "comments",
        header: ({ column }) => (
          <DataGridColumnHeader title="Remarks" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.comments}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
    ],
    [],
  );

  return (
    <div className="relative">
      <DataGridProvider
        // key={`available-features-grid-${search}`}
        columns={column}
        pagination={{ size: 5 }}
        layout={{ card: false }}
        // sorting={[{ id: "depositType", desc: false }]}
        data={DepoSubsList.data}
        serverSide={false}
      />
    </div>
  );
};

export default Deposit;
