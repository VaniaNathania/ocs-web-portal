import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
} from "react";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useNavigate } from "react-router";
import { OrderDetail } from "../../../models/interfaces";
import { useOrderListContext } from "../../../hooks";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface OrderOrderDetailContextType {
  selectedMenu: "order" | "charge";
  setSelectedMenu: React.Dispatch<SetStateAction<"order" | "charge">>;
  orderDetail: UseQueryResult<OrderDetail | undefined>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

// Create the context with proper typing
export const OrderOrderDetailContext = createContext<
  OrderOrderDetailContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

export const OrderOrderDetailProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedOrder } = useOrderListContext();

  const [selectedMenu, setSelectedMenu] = useState<"order" | "charge">("order");
  const fetchRow = async (): Promise<OrderDetail | undefined> => {
    setIsLoading(true);
    try {
      const response = await GetData(
        `${API_ORDER}/api/order-entry/order/query-order-detail`,
        {
          orderItemId: selectedOrder?.orderItemId,
        },
      );

      if (response?.data) {
        return response.data;
      } else {
        console.warn("⚠️ No available data or invalid data format:", response);
        return undefined;
      }
    } catch (error) {
      console.error("❌ Available Features API Error:", error);
      toast.error("Error loading available feature data");
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const orderDetail: UseQueryResult<OrderDetail | undefined> = useQuery({
    queryKey: ["order-detail"],
    queryFn: () => fetchRow(),
    staleTime: 1 * 1000,
    refetchOnWindowFocus: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();

  const value = {
    selectedMenu,
    setSelectedMenu,
    orderDetail,
    isLoading,
    setIsLoading,
  };

  return (
    <OrderOrderDetailContext.Provider value={value}>
      {children}
    </OrderOrderDetailContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderOrderDetail = () => {
  const context = useContext(OrderOrderDetailContext);
  if (context === undefined) {
    throw new Error(
      "useOrderOrderDetail must be used within an OrderOrderDetailProvider",
    );
  }
  return context;
};

export default OrderOrderDetailContext;
