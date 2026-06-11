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
import { useSubscriberListContext } from "../../../hooks";
import { RURform } from "../interface/interface";
import { StartOrderFlow } from "../../modifysubscriber/model/interfaces";
import { toast } from "sonner";

interface RURContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: RURform;
  setForm: React.Dispatch<SetStateAction<RURform>>;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  allDatas: StartOrderFlow | undefined;
  setAllDatas: Dispatch<SetStateAction<StartOrderFlow | undefined>>;
  nextFlow2: () => void;
  nextFlow3: () => void;
}

// Create the context with proper typing
export const RURContext = createContext<RURContextType | undefined>(undefined);

const API_URL = apiConfigOrder.order;

export const RURProvider = ({ children }: { children: React.ReactNode }) => {
  const { menuPrivAccess } = useOrderLayout();
  const { selectedOperation, startOrderFlow } = useSubscriberListContext();
  const { PostData } = useCallApi();
  const [step, setStep] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [allDatas, setAllDatas] = useState<StartOrderFlow>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [form, setForm] = useState<RURform>({
    suspensionReasonId: null,
    orderReason: "",
  });

  useEffect(() => {
    if (!startOrderFlow.data) return;
    setAllDatas(startOrderFlow.data);
  }, [startOrderFlow.data]);

  const nextFlow2 = async () => {
    try {
      setIsLoading(true);
      if (!allDatas) return;

      const payload: StartOrderFlow = {
        ...allDatas,
        orderItemList: [
          {
            ...allDatas.orderItemList[0],

            orderReason: form?.orderReason,
          },
        ],
      };

      const resp = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_2`,
        payload,
      );
      //  console.log(resp);

      if (!resp?.status) {
        return toast.error(resp?.message);
      }

      setStep(step + 1);
      setAllDatas(resp.data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const nextFlow3 = async () => {
    setIsLoading(true);
    if (!allDatas) return;

    try {
      const response = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
        allDatas,
      );

      if (!response?.status) {
        return toast.error(response?.message);
      }

      setStep(step + 1);
      setAllDatas(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    step,
    setStep,
    form,
    setForm,
    isOpen,
    setIsOpen,
    isLoading,
    setIsLoading,
    allDatas,
    setAllDatas,
    nextFlow2,
    nextFlow3,
  };
  return <RURContext.Provider value={value}>{children}</RURContext.Provider>;
};

// Custom hook to use the context
export const useRUR = () => {
  const context = useContext(RURContext);
  if (context === undefined) {
    throw new Error("useSUR must be used within an SURProvider");
  }
  return context;
};

export default RURContext;
