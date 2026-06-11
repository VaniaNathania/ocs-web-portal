import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  useEffect,
} from "react";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useNavigate } from "react-router";
import { SubsDetail } from "@/pages/main-menu/order/models/interfaces";
import { mockDetail } from "../models/mockData";

interface OrderSubsDetailSubsInfoContextType {
  selectedMenu:
    | "detail"
    | "service"
    | "related"
    | "resource"
    | "goods"
    | "tracks"
    | "company"
    | "lifecycle";
  setSelectedMenu: React.Dispatch<
    SetStateAction<
      | "detail"
      | "service"
      | "related"
      | "resource"
      | "goods"
      | "tracks"
      | "company"
      | "lifecycle"
    >
  >;
  detail?: SubsDetail;
  setDetail: React.Dispatch<SetStateAction<SubsDetail | undefined>>;
}

// Create the context with proper typing
export const OrderSubsDetailSubsInfoContext = createContext<
  OrderSubsDetailSubsInfoContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface OrderProviderProps {
  children: ReactNode;
}
export const OrderSubsDetailSubsInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedMenu, setSelectedMenu] = useState<
    | "detail"
    | "service"
    | "related"
    | "resource"
    | "goods"
    | "tracks"
    | "company"
    | "lifecycle"
  >("detail");
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<SubsDetail>();

  const fetchDetail = async () => {
    setDetail(mockDetail);
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const value = { selectedMenu, setSelectedMenu, detail, setDetail };

  return (
    <OrderSubsDetailSubsInfoContext.Provider value={value}>
      {children}
    </OrderSubsDetailSubsInfoContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderSubsDetailSubsInfo = () => {
  const context = useContext(OrderSubsDetailSubsInfoContext);
  if (context === undefined) {
    throw new Error(
      "useOrderSubsDetailSubsInfo must be used within an OrderSubsDetailSubsInfoProvider",
    );
  }
  return context;
};

export default OrderSubsDetailSubsInfoContext;
