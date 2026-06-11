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

interface ProdStateStackContextType {}

// Create the context with proper typing
export const ProdStateStackContext = createContext<
  ProdStateStackContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}
export const ProdStateStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();

  const value = {};

  return (
    <ProdStateStackContext.Provider value={value}>
      {children}
    </ProdStateStackContext.Provider>
  );
};

// Custom hook to use the context
export const useProdStateStack = () => {
  const context = useContext(ProdStateStackContext);
  if (context === undefined) {
    throw new Error("useProdStateStack must be used within an ProdStateStack");
  }
  return context;
};

export default ProdStateStackContext;
