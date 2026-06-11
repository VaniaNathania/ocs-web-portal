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
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useOrder } from "../../hooks/orderContext";
import { AccountInfo } from "../../models/interfaces";

interface OrderUserContextType {
  acctList?: UseQueryResult<AccountInfo[]>;
  selectedAcc?: AccountInfo;
  setSelectedAcc: React.Dispatch<SetStateAction<AccountInfo | undefined>>;
  refreshKey: number;
  setRefreshKey: Dispatch<SetStateAction<number>>;
}

// Create the context with proper typing
export const OrderUserContext = createContext<OrderUserContextType | undefined>(
  undefined,
);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderUserProviderProps {
  children: ReactNode;
}
export const OrderUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedUser } = useOrder();
  const { PostData } = useCallApi();
  const [selectedAcc, setSelectedAcc] = useState<AccountInfo>();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const fetchAcctList = async (): Promise<AccountInfo[]> => {
    try {
      const resp = await PostData(
        `${API_ORDER}/api/order-entry/go-shop/qry-acct-detail`,
        { custId: selectedUser?.custId },
      );

      //  console.log(resp);

      if (resp?.status) {
        setSelectedAcc(resp?.data[0]);
        return resp?.data;
      } else {
        setSelectedAcc(undefined);
        return [];
      }
    } catch (error) {
      return [];
    }
  };

  const acctList: UseQueryResult<AccountInfo[]> = useQuery({
    queryKey: ["order-user-acct", selectedUser?.custId, refreshKey],
    queryFn: fetchAcctList,
    enabled: !!selectedUser,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
  });

  useEffect(() => {
    acctList.data?.map((item) => {
      if (item.defaultFlag === "Y") setSelectedAcc(item);
    });
  }, [acctList.fetchStatus]);

  const value = {
    acctList,
    selectedAcc,
    setSelectedAcc,
    refreshKey,
    setRefreshKey,
  };

  return (
    <OrderUserContext.Provider value={value}>
      {children}
    </OrderUserContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderUser = () => {
  const context = useContext(OrderUserContext);
  if (context === undefined) {
    throw new Error("useOrderUser must be used within an OrderUserProvider");
  }
  return context;
};

export default OrderUserContext;
