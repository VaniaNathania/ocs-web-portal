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
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useSubscriberListContext } from "../../../hooks";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { SubsBaseDetail } from "../models/interfaces";

interface OrderSubsDetailContextType {
  selectedMenu: "subscriber" | "order" | "account";
  setSelectedMenu: React.Dispatch<
    SetStateAction<"subscriber" | "order" | "account">
  >;
  subsBaseDetail: UseQueryResult<SubsBaseDetail | undefined>;
}

// Create the context with proper typing
export const OrderSubsDetailContext = createContext<
  OrderSubsDetailContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}
export const OrderSubsDetailProvider = ({
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
  const { selectedSubs } = useSubscriberListContext();

  const fetchSubsbaseDetail = async (): Promise<SubsBaseDetail | undefined> => {
    try {
      const resp = await GetData(
        `${API_ORDER}/api/order-entry/subs-info/qry-subs-detail`,
        { subsId: selectedSubs?.subsId },
      );

      if (!resp.status) {
        toast.error(resp.message);
        return undefined;
      }
      return resp.data;
    } catch (error) {
      return undefined;
    }
  };

  const subsBaseDetail: UseQueryResult<SubsBaseDetail | undefined> = useQuery({
    queryKey: ["subs-base", selectedSubs],
    queryFn: fetchSubsbaseDetail,
    refetchOnWindowFocus: false,
  });

  const value = { selectedMenu, setSelectedMenu, subsBaseDetail };

  return (
    <OrderSubsDetailContext.Provider value={value}>
      {children}
    </OrderSubsDetailContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderSubsDetail = () => {
  const context = useContext(OrderSubsDetailContext);
  if (context === undefined) {
    throw new Error(
      "useOrderSubsDetail must be used within an OrderSubsDetailProvider",
    );
  }
  return context;
};

export default OrderSubsDetailContext;
