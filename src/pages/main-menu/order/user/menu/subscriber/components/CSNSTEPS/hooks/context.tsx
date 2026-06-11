import React, {
  createContext,
  useContext,
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";
import { useOrderLayout } from "@/layouts/main-menu/order";
import { useCallApi } from "@/hooks";
import { apiConfig, apiConfigOrder } from "@/config/api.config";
import { ChangeSubsProfData, MasterData } from "../interfaces/interface";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useSubscriberListContext } from "../../../hooks";
import { StartOrderFlow } from "../../modifysubscriber/model/interfaces";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";

interface CSNContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: ChangeSubsProfData;
  setForm: React.Dispatch<SetStateAction<ChangeSubsProfData>>;
  CSNInfoUseQuery: UseQueryResult<MasterData>;
  allData?: StartOrderFlow;
}

// Create the context with proper typing
export const CSNContext = createContext<CSNContextType | undefined>(undefined);

const API_URL = apiConfig.service_user;

const API_ORDER = apiConfigOrder.order;

export const CSNProvider = ({ children }: { children: React.ReactNode }) => {
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const { fetchOrderReason } = useOrder();
  const { startOrderFlow, selectedOperation } = useSubscriberListContext();
  const [step, setStep] = useState<number>(0);
  const [allData, setAllData] = useState<StartOrderFlow>();
  const [form, setForm] = useState<ChangeSubsProfData>({
    susPensionReasonId: undefined,
    otherReason: "",
    userTypeId: undefined,
    language: undefined,
  });

  const fetchInitialDataUseQuery = async (): Promise<MasterData> => {
    const [billCycleTypeResp, orderReasonResp] = await Promise.all([
      GetData(
        `${API_ORDER}/api/order-entry/common-service/billing-cycle-type`,
        {},
      ),
      GetData(`${API_ORDER}/api/order-entry/common-service/qry-order-reason`, {
        subsEventId: selectedOperation?.subsEventId,
      }),
    ]);

    const hasError = !billCycleTypeResp.status || !orderReasonResp.status;

    if (hasError) {
      toast.error("Failed to fetch neccesary data for order");
      return {
        billingCycleType: [],
        orderReason: [],
      };
    }

    return {
      billingCycleType: billCycleTypeResp.data,
      orderReason: orderReasonResp.data,
    };
  };

  const CSNInfoUseQuery: UseQueryResult<MasterData> = useQuery({
    queryKey: ["csn-master-data"],
    queryFn: fetchInitialDataUseQuery,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
  });

  useEffect(() => {
    setAllData(startOrderFlow.data);
    setForm({
      language: startOrderFlow.data?.orderItemList[0].subsBaseOrder?.defLangId,
      otherReason: "",
      userTypeId: startOrderFlow.data?.orderItemList[0].acct.billingCycleTypeId,
      susPensionReasonId: undefined,
    });
  }, [startOrderFlow]);

  const value = {
    step,
    setStep,
    form,
    setForm,
    CSNInfoUseQuery,
    allData,
  };
  return <CSNContext.Provider value={value}>{children}</CSNContext.Provider>;
};

// Custom hook to use the context
export const useCSN = () => {
  const context = useContext(CSNContext);
  if (context === undefined) {
    throw new Error("useCSN must be used within an CSNProvider");
  }
  return context;
};

export default CSNContext;
