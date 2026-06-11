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

interface DetailContextType {
  selectedMenu: "subscriber" | "order" | "account";
  setSelectedMenu: React.Dispatch<
    SetStateAction<"subscriber" | "order" | "account">
  >;
}

// Create the context with proper typing
export const DetailContext = createContext<DetailContextType | undefined>(
  undefined
);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}
export const DetailProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedMenu, setSelectedMenu] = useState<
    "subscriber" | "order" | "account"
  >("subscriber");
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();

  const value = { selectedMenu, setSelectedMenu };

  return (
    <DetailContext.Provider value={value}>{children}</DetailContext.Provider>
  );
};

// Custom hook to use the context
export const useDetail = () => {
  const context = useContext(DetailContext);
  if (context === undefined) {
    throw new Error("useDetail must be used within an DetailProvider");
  }
  return context;
};

export default DetailContext;
