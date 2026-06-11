import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
} from "react";
import {
  CustomerInfo,
  OrderSideBar,
} from "../../../../../../models/interfaces";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import { apiConfig, apiConfigOrder } from "@/config/api.config";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { PaymentHistoryQuery } from "../../../models/interfaces";
import { defaultPaymentQuery } from "../models/mock";

interface OrderPaymentHistoryAccInfoContextType {
  selectedSideBar?: OrderSideBar;
  setSelectedSideBar: React.Dispatch<SetStateAction<OrderSideBar | undefined>>;
  search: string;
  setSearch: React.Dispatch<SetStateAction<string>>;
  searchResult: CustomerInfo[];
  setSearchResult: React.Dispatch<SetStateAction<CustomerInfo[]>>;
  loadingSearch: boolean;

  selectedUser?: CustomerInfo;
  setSelectedUser: React.Dispatch<SetStateAction<CustomerInfo | undefined>>;

  query: PaymentHistoryQuery;
  setQuery: React.Dispatch<SetStateAction<PaymentHistoryQuery>>;
  fetchSearch: () => void;
}

// Create the context with proper typing
export const OrderPaymentHistoryAccInfoContext = createContext<
  OrderPaymentHistoryAccInfoContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}
export const OrderPaymentHistoryAccInfoProvider = ({
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
  const [query, setQuery] = useState<PaymentHistoryQuery>(defaultPaymentQuery);

  const fetchSearch = async () => {
    try {
      setLoadingSearch(true);
      const payload = {
        custNameAccBerCertNbr: search,
        custType: "A",
        spId: 0,
      };
      const resp = await GetData(
        `${API_ORDER}/api/order-entry/order/qry-all-payment-for-distribution4fish`,
        payload,
      );

      if (!resp.status) {
        return toast.error(resp.message || "Failed to fetch searched data");
      }

      if (resp.data.length === 1) {
        setSelectedUser(resp.data[0]);
        navigate("/order-entry/user");
      }

      setSearchResult(resp.data);
    } catch (error) {
      toast.error("Error on communicating with servers");
      setSearchResult([]);
      return;
    } finally {
      setLoadingSearch(false);
    }
  };

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

    query,
    setQuery,

    fetchSearch,
  };

  return (
    <OrderPaymentHistoryAccInfoContext.Provider value={value}>
      {children}
    </OrderPaymentHistoryAccInfoContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderPaymentHistoryAccInfo = () => {
  const context = useContext(OrderPaymentHistoryAccInfoContext);
  if (context === undefined) {
    throw new Error(
      "useOrderPaymentHistory must be used within an OrderPaymentHistoryProvider",
    );
  }
  return context;
};

export default OrderPaymentHistoryAccInfoContext;
