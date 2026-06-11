import React, { createContext, useContext } from "react";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import { apiConfigOrder } from "@/config/api.config";
import { useNavigate } from "react-router";
import { MasterAccForm } from "../models/interfaces";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface OrderAccInfoContextType {
  accInfoUseQuery: UseQueryResult<MasterAccForm>;
}

// Create the context with proper typing
export const OrderAccInfoContext = createContext<
  OrderAccInfoContextType | undefined
>(undefined);

const API_ORDER = apiConfigOrder.order;

export const OrderAccInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const navigate = useNavigate();

  const fetchInitialDataUseQuery = async (): Promise<MasterAccForm> => {
    const [billCycleTypeResp, deliverMethodResp] = await Promise.all([
      GetData(
        `${API_ORDER}/api/order-entry/common-service/billing-cycle-type`,
        {},
      ),
      GetData(
        `${API_ORDER}/api/order-entry/common-service/qry-deliver-method`,
        {},
      ),
      GetData(
        `${API_ORDER}/api/order-entry/common-service/qry-payment-method`,
        {},
      ),
      GetData(`${API_ORDER}/api/order-entry/acct/qry-acct-res-list`, {}),
    ]);

    const hasError = !billCycleTypeResp.status || !deliverMethodResp.status;

    if (hasError) {
      toast.error("Failed to fetch neccesary data for order");
      return {
        paymentMethod: [],
        billCurency: [],
        billCycleType: [],
        deliveryMethod: [],
        fileFormat: [],
      };
    }

    return {
      paymentMethod: [],
      billCurency: [],
      billCycleType: billCycleTypeResp.data,
      deliveryMethod: deliverMethodResp.data,
      fileFormat: [],
    };
  };

  const accInfoUseQuery: UseQueryResult<MasterAccForm> = useQuery({
    queryKey: ["acc-info-master-data"],
    queryFn: fetchInitialDataUseQuery,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
  });

  const value = { accInfoUseQuery };

  return (
    <OrderAccInfoContext.Provider value={value}>
      {children}
    </OrderAccInfoContext.Provider>
  );
};

// Custom hook to use the context
export const useOrderAccInfo = () => {
  const context = useContext(OrderAccInfoContext);
  if (context === undefined) {
    throw new Error(
      "useOrderAccInfo must be used within an OrderAccInfoProvider",
    );
  }
  return context;
};

export default OrderAccInfoContext;
