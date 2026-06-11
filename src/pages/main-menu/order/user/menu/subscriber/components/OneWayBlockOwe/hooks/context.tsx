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
import { useSubscriberListContext } from "../../../hooks";
import { StartOrderFlow } from "../../modifysubscriber/model/interfaces";
import { toast } from "sonner";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface OneWayBlockOweContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: ReqCusInfoForm;
  setForm: React.Dispatch<SetStateAction<ReqCusInfoForm>>;
  allDatas: StartOrderFlow | undefined;
  setAllDatas: Dispatch<SetStateAction<StartOrderFlow | undefined>>;
  isLoadingOWBO: boolean;
  setIsLoadingOWBO: Dispatch<SetStateAction<boolean>>;
  handleNext: () => void;
}

export const defaultRegCustInfo: ReqCusInfoForm = {
  suspensionReasonsId: "0",
};

// Create the context with proper typing
export const OneWayBlockOweContext = createContext<
  OneWayBlockOweContextType | undefined
>(undefined);

const API_URL = apiConfigOrder.order;

export const OneWayBlockOweProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { menuPrivAccess } = useOrderLayout();
  const { startOrderFlow } = useSubscriberListContext();
  const { PostData } = useCallApi();
  const { selectedUser } = useOrder();
  const [step, setStep] = useState<number>(0);
  const [form, setForm] = useState<ReqCusInfoForm>({
    suspensionReasonsId: "0",
  });
  const [isLoadingOWBO, setIsLoadingOWBO] = useState<boolean>(false);
  const [allDatas, setAllDatas] = useState<StartOrderFlow>();

  useEffect(() => {
    if (!startOrderFlow.data) return;

    setAllDatas(startOrderFlow.data);
  }, [startOrderFlow.data]);

  const fetchNextFlow2 = async () => {
    try {
      setIsLoadingOWBO(true);
      if (!startOrderFlow.data) return;

      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_2`,
        startOrderFlow.data,
      );
      //  console.log(resp);

      if (!resp?.status) {
        return toast.error(resp?.message);
      }

      setAllDatas(resp.data);

      return resp.data;
    } catch (error) {
    } finally {
      setIsLoadingOWBO(false);
    }
  };

  const fetchNextFlow3 = async (data: StartOrderFlow) => {
    setIsLoadingOWBO(true);
    if (!data) return;

    try {
      const response = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
        data,
      );

      if (!response?.status) {
        return toast.error(response?.message);
      }

      setStep(step + 1);
      setAllDatas(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOWBO(false);
    }
  };

  const handleNext = async () => {
    const nextflow2 = await fetchNextFlow2();

    if (!nextflow2) return;

    await fetchNextFlow3(nextflow2);
  };

  const value = {
    step,
    setStep,
    form,
    setForm,
    allDatas,
    setAllDatas,
    isLoadingOWBO,
    setIsLoadingOWBO,
    handleNext,
  };
  return (
    <OneWayBlockOweContext.Provider value={value}>
      {children}
    </OneWayBlockOweContext.Provider>
  );
};

// Custom hook to use the context
export const useOneWayBlockOwe = () => {
  const context = useContext(OneWayBlockOweContext);
  if (context === undefined) {
    throw new Error(
      "useOneWayBlockOwe must be used within an OneWayBlockOweProvider",
    );
  }
  return context;
};

export default OneWayBlockOweContext;
