import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  useEffect,
  Dispatch,
} from "react";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useNavigate } from "react-router";
import {
  OrderList,
  OrderQuery,
} from "@/pages/main-menu/order/user/menu/order/models/interfaces";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { defaultOrderQuery } from "@/pages/main-menu/order/user/menu/order/models/mock";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useSubscriberListContext } from "../../../../../hooks";

export type menuOrderInfo = "order";
interface OrderSubsDetailOrderInfoContextType {
  selectedMenu: menuOrderInfo;
  setSelectedMenu: React.Dispatch<SetStateAction<menuOrderInfo>>;
  rows: OrderList[];
  setRows: React.Dispatch<SetStateAction<OrderList[]>>;
  totalRows: number;
  setTotalRows: React.Dispatch<SetStateAction<number>>;
  orderItemQuery: OrderQuery;
  setOrderItemQuery: Dispatch<SetStateAction<OrderQuery>>;
  OrderList: UseQueryResult<OrderList[], Error>;
}

// Create the context with proper typing
export const OrderSubsDetailOrderInfoContext = createContext<
  OrderSubsDetailOrderInfoContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}

const API_URL = apiConfigOrder.order;

export const OrderSubsDetailOrderInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedMenu, setSelectedMenu] = useState<menuOrderInfo>("order");
  const [orderItemQuery, setOrderItemQuery] =
    useState<OrderQuery>(defaultOrderQuery);
  const { selectedUser } = useOrder();
  const { selectedSubs } = useSubscriberListContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();

  const fetchOrderData = async () => {
    try {
      setIsLoading(true);
      // console.log("line 178", selectedSubs, selectedOperation);

      if (!selectedUser) return [];
      const resp = await GetData(`${API_URL}/api/order-entry/order/list`, {
        custId: selectedUser.custId,
        ...orderItemQuery,
        subsId: selectedSubs?.subsId,
      });

      if (resp.status) {
        return resp.data;
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
    queryKey: ["Order-List", selectedUser, orderItemQuery],
    queryFn: () => fetchOrderData(),
    enabled: !!selectedUser,
    refetchOnWindowFocus: false,
  });
  const [rows, setRows] = useState<OrderList[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);

  const value = {
    selectedMenu,
    setSelectedMenu,
    rows,
    setRows,
    totalRows,
    setTotalRows,
    orderItemQuery,
    setOrderItemQuery,
    OrderList,
  };

  return (
    <OrderSubsDetailOrderInfoContext.Provider value={value}>
      {children}
    </OrderSubsDetailOrderInfoContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderSubsDetailOrderInfo = () => {
  const context = useContext(OrderSubsDetailOrderInfoContext);
  if (context === undefined) {
    throw new Error(
      "useOrderSubsDetailOrderInfo must be used within an OrderSubsDetailOrderInfoProvider",
    );
  }
  return context;
};

export default OrderSubsDetailOrderInfoContext;
