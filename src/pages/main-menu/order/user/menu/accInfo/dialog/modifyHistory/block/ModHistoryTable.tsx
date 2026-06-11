import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { AcctModHisList } from "../models/interfaces";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useOrderUser } from "@/pages/main-menu/order/user/hooks/context";
import ListToolBar from "./ListToolBar";

const API_URL = apiConfigOrder.order;

const ModHistoryTable = () => {
  const { GetData } = useCallApi();
  const { selectedAcc } = useOrderUser();

  const column = useMemo<ColumnDef<AcctModHisList>[]>(
    () => [
      {
        accessorFn: (row) => row.property,
        id: "property",
        header: ({ column }) => (
          <DataGridColumnHeader title="Feature" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.oldValue,
        id: "oldValue",
        header: ({ column }) => (
          <DataGridColumnHeader title="Old Value" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.newValue,
        id: "newValue",
        header: ({ column }) => (
          <DataGridColumnHeader title="New Value" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.partyCodeName,
        id: "partyCodeName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Modify By" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row.updateDate,
        id: "updateDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Modify Date" column={column} />
        ),
        enableHiding: false,
        enableSorting: false,
        filterFn: (row, columnId, value) => {
          const rowDate = new Date(row.getValue(columnId));
          const start = value?.start ? new Date(value.start) : null;
          const end = value?.end ? new Date(value.end) : null;

          if (start && rowDate < start) return false;
          if (end && rowDate > end) return false;

          return true;
        },
      },
    ],
    [],
  );

  const fetch = async (): Promise<AcctModHisList[]> => {
    try {
      const resp = await GetData(
        `${API_URL}/api/order-entry/order/qry-acct-mod-his-detail-by-date-bpn-desc`,
        {
          acctId: selectedAcc?.acctId,
          startDate: "",
          endDate: "",
          attrName: "",
        },
      );

      if (resp.status) return resp.data;

      toast.error(resp.message);
      return [];
    } catch (error) {
      toast.error("Client Side Error");
      return [];
    }
  };

  const acctModList: UseQueryResult<AcctModHisList[]> = useQuery({
    queryKey: ["acct-mod-list"],
    queryFn: fetch,
    // staleTime: 1000 * 1, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  return (
    <div>
      <DataGridProvider
        // key={`available-features-grid-${search}`}
        columns={column}
        toolbar={<ListToolBar />}
        pagination={{ size: 5 }}
        layout={{ card: false }}
        // sorting={[{ id: "custName", desc: false }]}
        serverSide={false}
        data={acctModList.data}
      />
    </div>
  );
};

export default ModHistoryTable;
