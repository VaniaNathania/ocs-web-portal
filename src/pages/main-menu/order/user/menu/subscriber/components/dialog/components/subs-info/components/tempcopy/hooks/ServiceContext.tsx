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

interface ServiceContextType {
  selectedMenu: "subscriber" | "order" | "account";
  setSelectedMenu: React.Dispatch<
    SetStateAction<"subscriber" | "order" | "account">
  >;
}

// Create the context with proper typing
export const ServiceContext = createContext<ServiceContextType | undefined>(
  undefined
);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}
export const ServiceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedMenu, setSelectedMenu] = useState<
    "subscriber" | "order" | "account"
  >("subscriber");
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();

  const value = { selectedMenu, setSelectedMenu };

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
};

// Custom hook to use the context
export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error("useService must be used within an ServiceProvider");
  }
  return context;
};

export default ServiceContext;
