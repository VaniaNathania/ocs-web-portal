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
import { ReplacementData } from "../interfaces/interface";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { MasterData } from "../../CSNSTEPS/interfaces/interface";
import { useSubscriberListContext } from "../../../hooks";
import { toast } from "sonner";
import { StartOrderFlow } from "../../modifysubscriber/model/interfaces";

interface ReplacementContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: ReplacementData;
  setForm: React.Dispatch<SetStateAction<ReplacementData>>;
  RepInfoUseQuery?: UseQueryResult<MasterData>;
  allData?: StartOrderFlow;
  setAllData: React.Dispatch<SetStateAction<StartOrderFlow | undefined>>;
}

// Create the context with proper typing
export const ReplacementContext = createContext<
  ReplacementContextType | undefined
>(undefined);

const API_URL = apiConfig.service_user;

const API_ORDER = apiConfigOrder.order;

export const ReplacementProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { menuPrivAccess } = useOrderLayout();
  const { selectedOperation, startOrderFlow } = useSubscriberListContext();
  const { GetData } = useCallApi();
  const [step, setStep] = useState<number>(0);
  const [allData, setAllData] = useState<StartOrderFlow>();

  const [form, setForm] = useState<ReplacementData>({
    newSIMCard: {
      orgName: "Telkomcel",
      comments: "migration",
      simCardId: 0,
      hlrId: 0,
      hlrName: "",
      simState: "",
      pin1: 0,
      pin2: 0,
      isBindingFlag: "Y",
      imsi: 0,
      spId: 0,
      orgId: 0,
      iccid: "",
      areaId: 0,
      createdDate: "",
      areaName: "",
      puk2: 0,
      simTypeId: 0,
      simTypeName: "",
      stateDate: "",
      staffId: 0,
      ki: "",
      simStateName: "",
      puk1: 0,
    },
    susPensionReasonId: 0,
    otherReason: "",
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

  const RepInfoUseQuery: UseQueryResult<MasterData> = useQuery({
    queryKey: ["Rep-master-data"],
    queryFn: fetchInitialDataUseQuery,
    staleTime: 1000 * 60 * 10, // 10 minutes (master data rarely changes)
  });

  useEffect(() => {
    setAllData(startOrderFlow.data);
  }, [startOrderFlow]);

  const value = {
    step,
    setStep,
    form,
    setForm,
    RepInfoUseQuery,
    allData,
    setAllData,
  };
  return (
    <ReplacementContext.Provider value={value}>
      {children}
    </ReplacementContext.Provider>
  );
};

// Custom hook to use the context
export const useReplacement = () => {
  const context = useContext(ReplacementContext);
  if (context === undefined) {
    throw new Error(
      "useReplacement must be used within an ReplacementProvider",
    );
  }
  return context;
};

export default ReplacementContext;
