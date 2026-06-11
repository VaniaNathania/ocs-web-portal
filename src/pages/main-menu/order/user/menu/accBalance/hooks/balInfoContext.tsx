import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
} from "react";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useNavigate } from "react-router";

interface OrderAccBalContextType {}

// Create the context with proper typing
export const OrderAccBalContext = createContext<
  OrderAccBalContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}
export const OrderAccBalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();

  const value = {};

  return (
    <OrderAccBalContext.Provider value={value}>
      {children}
    </OrderAccBalContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderBalInfo = () => {
  const context = useContext(OrderAccBalContext);
  if (context === undefined) {
    throw new Error(
      "useOrderBalInfo must be used within an OrderBalInfoProvider"
    );
  }
  return context;
};

export default OrderAccBalContext;
