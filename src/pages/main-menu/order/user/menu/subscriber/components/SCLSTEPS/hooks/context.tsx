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
import { SCLOST } from "../interfaces/interface";
import { MasterData } from "../../SCRSTEPS/interfaces/interface";
import { useSubscriberListContext } from "../../../hooks";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { StartOrderFlow } from "../../modifysubscriber/model/interfaces";

interface SCLContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: SCLOST;
  setForm: React.Dispatch<SetStateAction<SCLOST>>;
  SCLInfoUseQuery: UseQueryResult<MasterData>;
  allData?: StartOrderFlow;
}

// Create the context with proper typing
export const SCLContext = createContext<SCLContextType | undefined>(undefined);

const API_URL = apiConfig.service_user;

const API_ORDER = apiConfigOrder.order;

export const SCLProvider = ({ children }: { children: React.ReactNode }) => {
  const { menuPrivAccess } = useOrderLayout();
  const { selectedOperation, startOrderFlow } = useSubscriberListContext();
  const [allData, setAllData] = useState<StartOrderFlow>();
  const { GetData } = useCallApi();
  const [step, setStep] = useState<number>(0);
  const [form, setForm] = useState<SCLOST>({
    susPensionReasonId: undefined,
    otherReason: "",
    lostType: "0",
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

  const SCLInfoUseQuery: UseQueryResult<MasterData> = useQuery({
    queryKey: ["SCL-master-data"],
    queryFn: fetchInitialDataUseQuery,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
  });

  useEffect(() => {
    setAllData(startOrderFlow.data);
    setForm({
      susPensionReasonId: undefined,
      otherReason: "",
      lostType: "0",
    });
  }, [startOrderFlow]);

  const value = {
    step,
    setStep,
    form,
    setForm,
    SCLInfoUseQuery,
    allData,
  };
  return <SCLContext.Provider value={value}>{children}</SCLContext.Provider>;
};

// Custom hook to use the context
export const useSCL = () => {
  const context = useContext(SCLContext);
  if (context === undefined) {
    throw new Error("useSCL must be used within an SCLProvider");
  }
  return context;
};

export default SCLContext;
