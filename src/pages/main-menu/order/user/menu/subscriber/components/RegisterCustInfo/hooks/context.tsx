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
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { ReqCusInfoForm } from "../interfaces/interface";
import {
  ChangeSubsProfData,
  MasterData,
} from "../../CSNSTEPS/interfaces/interface";
import { useSubscriberListContext } from "../../../hooks";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { StartOrderFlow } from "../../modifysubscriber/model/interfaces";

interface RegisterCustInfoContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: ChangeSubsProfData;
  setForm: React.Dispatch<SetStateAction<ChangeSubsProfData>>;
  RCIUseQuery: UseQueryResult<MasterData>;
  allData?: StartOrderFlow;
}

export const defaultRegCustInfo: ReqCusInfoForm = {
  suspensionReasonsId: 0,
};

// Create the context with proper typing
export const RegisterCustInfoContext = createContext<
  RegisterCustInfoContextType | undefined
>(undefined);

const API_URL = apiConfig.service_user;
const API_ORDER = apiConfigOrder.order;

export const RegisterCustInfoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const { selectedUser } = useOrder();
  const [allData, setAllData] = useState<StartOrderFlow>();

  const { selectedOperation, startOrderFlow } = useSubscriberListContext();
  const [step, setStep] = useState<number>(0);
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

  const RCIUseQuery: UseQueryResult<MasterData> = useQuery({
    queryKey: ["rci-master-data"],
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
    RCIUseQuery,
    allData,
  };
  return (
    <RegisterCustInfoContext.Provider value={value}>
      {children}
    </RegisterCustInfoContext.Provider>
  );
};

// Custom hook to use the context
export const useRegisterCustInfo = () => {
  const context = useContext(RegisterCustInfoContext);
  if (context === undefined) {
    throw new Error(
      "useRegisterCustInfo must be used within an RegisterCustInfoProvider",
    );
  }
  return context;
};

export default RegisterCustInfoContext;
