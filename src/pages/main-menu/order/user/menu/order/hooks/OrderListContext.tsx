import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { DataGridProvider } from "@/components";
import { nonSelectedRowHighLight } from "@/styles/style";
import { ColumnDef } from "@tanstack/react-table";
import { OrderList, OrderQuery } from "../models/interfaces";
import { apiConfigOrder } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ListToolBar from "../components/listToolBar";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { defaultOrderQuery } from "../models/mock";

interface ContextProps {
  showDetail: boolean;
  setShowDetail: Dispatch<SetStateAction<boolean>>;
  showSearch: boolean;
  setShowSearch: Dispatch<SetStateAction<boolean>>;
  refreshKey: number;
  setRefreshKey: Dispatch<SetStateAction<number>>;
  orderItemQuery: OrderQuery;
  setOrderItemQuery: Dispatch<SetStateAction<OrderQuery>>;
  selectedOrder?: OrderList;
  setSelectedOrder: Dispatch<SetStateAction<OrderList | undefined>>;
  // OrderList: UseQueryResult<OrderList[], Error>;
}

const API_URL = apiConfigOrder.order;

const OrderListContext = createContext<ContextProps | undefined>(undefined);

const OrderListContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderList>();
  const [orderItemQuery, setOrderItemQuery] =
    useState<OrderQuery>(defaultOrderQuery);

  const { GetData } = useCallApi();
  const { selectedUser } = useOrder();

  const fetchOrderData = async () => {
    try {
      setIsLoading(true);
      // console.log("line 178", selectedSubs, selectedOperation);
      let Order: Record<number, OrderList> = JSON.parse(
        localStorage.getItem("ORDER") ?? "{}",
      );
      let cust: Record<number, number[]> = JSON.parse(
        localStorage.getItem("CUST_ORDER") ?? "{}",
      );

      const custOrder = cust[selectedUser?.custId ?? 0] ?? [];
      //  console.log("ini data", Order, cust, custOrder);

      const localCust: OrderList[] = [];

      custOrder.forEach((cs) => localCust.push(Order[cs]));
      //  console.log(localCust);

      if (!selectedUser) return [];
      const resp = await GetData(`${API_URL}/api/order-entry/order/list`, {
        custId: selectedUser.custId,
        ...orderItemQuery,
      });

      if (resp.status) {
        const list: OrderList[] = resp?.data ?? [];
        let processed = [...list, ...localCust];
        //  console.log(processed);

        return processed;
      }
      toast.error(resp.message);
      return [];
    } catch (error) {
      toast.error("Failed to Fetch data");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const OrderList: UseQueryResult<OrderList[], Error> = useQuery({
    queryKey: ["Order-List", selectedUser, refreshKey],
    queryFn: () => fetchOrderData(),
    enabled: !!selectedUser,
    refetchOnWindowFocus: false,
  });

  const columns = useMemo<ColumnDef<OrderList>[]>(
    () => [
      {
        // accessorFn: (row) => row.orderNbr,
        accessorKey: "orderNbr",
        header: "Order Number",
        filterFn: "includesString",
      },
      {
        // accessorFn: (row) => row.offerName,
        accessorKey: "offerName",
        header: "Offer Name",
      },
      {
        // accessorFn: (row) => row.accNbr,
        accessorKey: "accNbr",
        header: "Service Number",
      },
      {
        // accessorFn: (row) => row.subsEventId,
        accessorKey: "subsEventId",
        cell: ({ row }) => <div>{row.original.eventName}</div>,
        filterFn: "equals",
        header: "Event Name",
      },
      // {
      //   accessorFn: (row) => row.orderState,
      //   accessorKey: "orderState",
      //   header: "State",
      // },
      {
        // accessorFn: (row) => row.orderState,
        accessorKey: "orderState",
        header: "State Name",
        cell: ({ row }) => <div>{row.original.orderStateName}</div>,
        filterFn: "arrIncludesSome",
      },
      {
        // accessorFn: (row) => row.createdMan,
        accessorKey: "createdMan",
        header: "Created By",
      },
      {
        // accessorFn: (row) => row.acceptChannelName,
        accessorKey: "acceptchannelName",
        header: "Accept Channel",
      },
      {
        // accessorFn: (row) => row.createdDate,
        accessorKey: "createdDate",
        header: "Created Time",
      },
      {
        // accessorFn: (row) => row.completedDate,
        accessorKey: "completedDate",
        header: "Completed Time",
      },
    ],
    [],
  );

  return (
    <OrderListContext.Provider
      value={{
        showDetail,
        setShowDetail,
        showSearch,
        setShowSearch,
        refreshKey,
        setRefreshKey,
        orderItemQuery,
        setOrderItemQuery,
        selectedOrder,
        setSelectedOrder,
        // OrderList,
      }}
    >
      <div>
        {/* <div className="flex-1 pt-0 overflow-y-auto"> */}
        {isLoading && <Loading />}
        <DataGridProvider
          data={OrderList.data ?? []}
          columns={columns}
          pagination={{ size: 10 }}
          layout={{ card: true }}
          toolbar={<ListToolBar />}
          sorting={[{ id: "orderNbr", desc: true }]}
          // serverSide={false}
          getRowProps={(row) => ({
            className: nonSelectedRowHighLight,
            onDoubleClick: () => {
              setShowDetail(true);
              setSelectedOrder(row.original);
            },
          })}
        >
          {children}
        </DataGridProvider>
        {/* </div> */}
      </div>
    </OrderListContext.Provider>
  );
};

export { OrderListContext, OrderListContextProvider };
