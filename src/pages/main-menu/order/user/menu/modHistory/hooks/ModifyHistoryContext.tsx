import { DataGridColumnHeader, DataGridProvider } from "@/components";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { createContext, useMemo, useState } from "react";
import { AcctModHisList } from "../../accInfo/dialog/modifyHistory/models/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { useOrderUser } from "../../../hooks/context";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ListToolBar from "../../accInfo/dialog/modifyHistory/block/ListToolBar";
import SelectAccComp from "@/pages/main-menu/order/component/SelectAccComp";

interface ContextProps {
  data: string | null;
  setData: (value: string | null) => void;
}

const InitialProps: ContextProps = {
  data: "",
  setData: () => {},
};

const ModifyHistoryListContext = createContext<ContextProps>(InitialProps);

const API_URL = apiConfigOrder.order;

const ModifyHistoryContextListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { GetData } = useCallApi();
  const { selectedAcc } = useOrderUser();
  const [data, setData] = useState<string | null>(null);

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
    queryKey: ["acct-mod-list", selectedAcc],
    queryFn: fetch,
    // staleTime: 1000 * 1, // 10 minutes (master data rarely changes)
    refetchOnWindowFocus: false,
  });

  const column = useMemo<ColumnDef<AcctModHisList>[]>(
    () => [
      {
        id: "property",
        accessorFn: (row) => row.property,
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Feature Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "oldValue",
        accessorFn: (row) => row.oldValue,
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Old Value"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "newValue",
        accessorFn: (row) => row.newValue,
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="New Value"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "partyCodeName",
        accessorFn: (row) => row.partyCodeName,
        header: ({ column }) => (
          <DataGridColumnHeader className="" title="Modifier" column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "updateDate",
        accessorFn: (row) => row.updateDate,
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Modify Date"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
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

  return (
    <ModifyHistoryListContext.Provider
      value={{
        data,
        setData,
      }}
    >
      <div className="flex flex-col gap-5 m-1 bg-white rounded-md p-2">
        <DataGridProvider
          columns={column}
          // layout={{ card: true }}
          toolbar={<ListToolBar />}
          serverSide={false}
          data={acctModList.data}
        >
          {children}
        </DataGridProvider>
      </div>
    </ModifyHistoryListContext.Provider>
  );
};

export { ModifyHistoryContextListProvider, ModifyHistoryListContext };
