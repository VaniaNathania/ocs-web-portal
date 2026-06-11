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
import { SUREQ } from "../interface/interface";
import { useSubscriberListContext } from "../../../hooks";
import { StartOrderFlow } from "../../modifysubscriber/model/interfaces";
import { toast } from "sonner";
import dayjs from "dayjs";

interface SURContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: SUREQ;
  setForm: React.Dispatch<SetStateAction<SUREQ>>;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  handleDialog: () => void;
  allData: StartOrderFlow | undefined;
  setAllData: Dispatch<SetStateAction<StartOrderFlow | undefined>>;
  nextFlow2: () => void;
  nextFlow3: () => void;
  isLoadingSUR: boolean;
  setIsLoadingSUR: Dispatch<SetStateAction<boolean>>;
}

// Create the context with proper typing
export const SURContext = createContext<SURContextType | undefined>(undefined);

const API_URL = apiConfigOrder.order;

export const SURProvider = ({ children }: { children: React.ReactNode }) => {
  const { menuPrivAccess } = useOrderLayout();
  const { selectedOperation, startOrderFlow, isLoading } =
    useSubscriberListContext();
  const { PostData } = useCallApi();
  const [step, setStep] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [allData, setAllData] = useState<StartOrderFlow>();
  const [isLoadingSUR, setIsLoadingSUR] = useState<boolean>(false);

  const [form, setForm] = useState<SUREQ>({
    susPensionReasonId: null,
    orderReason: "",
    resrvTime: "",
    comments: "",
    reactTimeId: null,
    periodTime: 0,
    periodTypeId: "0",
    exactTime: "",
  });

  const handleDialog = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    const resrvTime = startOrderFlow.data?.timerEventList?.[0].expDate;
    const now = dayjs();
    if (!resrvTime) return;

    if (dayjs(resrvTime).isAfter(now)) {
      setForm((prev) => ({ ...prev, resrvTime: resrvTime }));
    } else {
      handleDialog();
      setForm((prev) => ({ ...prev, resrvTime: "" }));
    }
  }, [startOrderFlow.data?.timerEventList?.[0].expDate, isLoading]);

  useEffect(() => {
    const resrvTime = form.resrvTime;
    const now = dayjs();
    if (dayjs(resrvTime).isAfter(now)) return;

    handleDialog();
    setForm((prev) => ({ ...prev, resrvTime: "" }));
  }, [form.resrvTime]);

  useEffect(() => {
    if (!startOrderFlow.data) return;
    setAllData(startOrderFlow.data);
  }, [startOrderFlow.data]);

  useEffect(() => {
    const reactTimeId =
      startOrderFlow.data?.timerEventList?.[0].reactivationDateType ?? null;

    setForm((prev) => ({
      ...prev,
      reactTimeId: !reactTimeId ? "N" : reactTimeId,
    }));
  }, [
    startOrderFlow.data?.timerEventList?.[0].reactivationDateType,
    isLoading,
  ]);

  const nextFlow2 = async () => {
    try {
      setIsLoadingSUR(true);
      if (!allData) return;

      const payload: StartOrderFlow = {
        ...allData,
        orderItemList: [
          {
            ...allData.orderItemList[0],

            orderReason: form?.orderReason,
            comments: form?.comments,
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

      // setStep(step + 1);
      setAllData(resp.data);
    } catch (error) {
    } finally {
      setIsLoadingSUR(false);
    }
  };

  const nextFlow3 = async () => {
    setIsLoadingSUR(true);
    if (!allData) return;

    try {
      const response = await PostData(
        `${API_URL}/api/order-entry/order-entry-order-initialize-V2/NEXT_FLOW_STEP_3`,
        allData,
      );

      if (!response?.status) {
        return toast.error(response?.message);
      }

      setStep(step + 1);
      setAllData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSUR(false);
    }
  };

  const value = {
    step,
    setStep,
    form,
    setForm,
    isOpen,
    setIsOpen,
    handleDialog,
    allData,
    setAllData,
    nextFlow2,
    nextFlow3,
    isLoadingSUR,
    setIsLoadingSUR,
  };
  return <SURContext.Provider value={value}>{children}</SURContext.Provider>;
};

// Custom hook to use the context
export const useSUR = () => {
  const context = useContext(SURContext);
  if (context === undefined) {
    throw new Error("useSUR must be used within an SURProvider");
  }
  return context;
};

export default SURContext;
