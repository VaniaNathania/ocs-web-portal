import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
} from "react";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import { apiConfig, apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  CustomerInfo,
  FeatureSelection,
  OrderSideBar,
} from "@/pages/main-menu/order/models/interfaces";

interface OrderModifyHistoryAccInfoContextType {
  selectedSideBar?: OrderSideBar;
  setSelectedSideBar: React.Dispatch<SetStateAction<OrderSideBar | undefined>>;
  search: string;
  setSearch: React.Dispatch<SetStateAction<string>>;
  searchResult: CustomerInfo[];
  setSearchResult: React.Dispatch<SetStateAction<CustomerInfo[]>>;
  loadingSearch: boolean;

  selectedUser?: CustomerInfo;
  setSelectedUser: React.Dispatch<SetStateAction<CustomerInfo | undefined>>;
}

// Create the context with proper typing
export const OrderModifyHistoryAccInfoContext = createContext<
  OrderModifyHistoryAccInfoContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}

export const OrderModifyHistoryAccInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();
  const [selectedSideBar, setSelectedSideBar] = useState<OrderSideBar>();
  const [search, setSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<CustomerInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<CustomerInfo>();
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

  const value = {
    selectedSideBar,
    setSelectedSideBar,
    search,
    setSearch,
    searchResult,
    setSearchResult,
    loadingSearch,

    selectedUser,
    setSelectedUser,
  };

  return (
    <OrderModifyHistoryAccInfoContext.Provider value={value}>
      {children}
    </OrderModifyHistoryAccInfoContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderModifyHistoryAccInfo = () => {
  const context = useContext(OrderModifyHistoryAccInfoContext);
  if (context === undefined) {
    throw new Error(
      "useOrderModifyHistory must be used within an OrderModifyHistoryProvider",
    );
  }
  return context;
};

export default OrderModifyHistoryAccInfoContext;
