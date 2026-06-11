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

interface OrderSubsDetailAccInfoContextType {
  selectedMenu: menu;
  setSelectedMenu: React.Dispatch<SetStateAction<menu>>;
}

// Create the context with proper typing
export const OrderSubsDetailAccInfoContext = createContext<
  OrderSubsDetailAccInfoContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

export type menu = "deposit" | "payment" | "debt" | "acct info" | "acct bal";

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}
export const OrderSubsDetailAccInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedMenu, setSelectedMenu] = useState<menu>("deposit");
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();

  const value = { selectedMenu, setSelectedMenu };

  return (
    <OrderSubsDetailAccInfoContext.Provider value={value}>
      {children}
    </OrderSubsDetailAccInfoContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderSubsDetailAccInfo = () => {
  const context = useContext(OrderSubsDetailAccInfoContext);
  if (context === undefined) {
    throw new Error(
      "useOrderSubsDetailAccInfo must be used within an OrderSubsDetailAccInfoProvider"
    );
  }
  return context;
};

export default OrderSubsDetailAccInfoContext;
