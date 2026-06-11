import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useSubscriberListContext } from "../../../../../hooks";
import { apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { QryOweAcctItemListResponseDto } from "../models/interfaces";

const API_URL = apiConfigOrder.order;

const DebtInfo = () => {
  const { GetData } = useCallApi();
  const { selectedSubs } = useSubscriberListContext();

  const fetchDebtSubs = async (): Promise<QryOweAcctItemListResponseDto[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/account-information/qry-owe-acct-item-list`,
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

  const DebtSubsList = useQuery({
    queryKey: ["Debt-subs", selectedSubs],
    queryFn: fetchDebtSubs,
    refetchOnWindowFocus: false,
  });

  const column = useMemo<ColumnDef<QryOweAcctItemListResponseDto>[]>(
    () => [
      {
        accessorFn: (row) => row.acctItemTypeName,
        id: "acctItemTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Account Item Type" column={column} />
        ),
        cell: ({ row }) => {
          return (
            <Button
              variant={"ghost"}
              size={"sm"}
              // onClick={() => setSelectedRow(row.original)}
            >
              {row.original.acctItemTypeName}
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
        accessorFn: (row) => row.charge,
        id: "charge",
        header: ({ column }) => (
          <DataGridColumnHeader title="Charge" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.charge}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.createdDate,
        id: "createdDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created Time" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.createdDate}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.stateName,
        id: "stateName",
        header: ({ column }) => (
          <DataGridColumnHeader title="State" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.stateName}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.stateDate,
        id: "stateDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="State Time" column={column} />
        ),
        cell: ({ row }) => {
          <Button
            variant={"ghost"}
            // onClick={() => setSelectedRow(row.original)}
          >
            {row.original.stateDate}
          </Button>;
        },
        enableHiding: false,
        enableSorting: false,
      },
    ],
    [],
  );

  return (
    <div className="relative flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-row items-center gap-2">
          <Label className="w-32">Start Date</Label>
          <Input
            className="flex-1"
            size={"sm"}
            // value={mockSIM.iccid}
            disabled
          />
        </div>
        <div className="flex flex-row items-center gap-2">
          <Label className="w-32">End Date</Label>
          <Input
            className="flex-1"
            size={"sm"}
            // value={mockSIM.iccid}
            disabled
          />
        </div>
        <div className="flex flex-row items-center gap-2 justify-end">
          <Button size={"sm"}>Query</Button>
          <Button size={"sm"} variant={"outline"}>
            Reset
          </Button>
        </div>
      </div>
      <DataGridProvider
        // key={`available-features-grid-${search}`}
        columns={column}
        pagination={{ size: 5 }}
        layout={{ card: false }}
        data={DebtSubsList.data}
        sorting={[{ id: "transactionId", desc: false }]}
        serverSide={false}
      />
    </div>
  );
};

export default DebtInfo;
