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
import { apiConfig } from "@/config/api.config";
import { TerminationData } from "../interface/interface";
import {
  PaymentAmount,
  QryDefaultBAL,
  StartOrderFlow,
} from "../../modifysubscriber/model/interfaces";
import { OrderReason } from "@/pages/main-menu/order/models/interfaces";
import { useSubscriberListContext } from "../../../hooks";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";

interface TerminationContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: TerminationData;
  setForm: React.Dispatch<SetStateAction<TerminationData>>;
  allData?: StartOrderFlow;
  setAllData: React.Dispatch<SetStateAction<StartOrderFlow | undefined>>;
  paymentMethod: string[];
  setPaymentMethod: React.Dispatch<SetStateAction<string[]>>;
  amount: PaymentAmount;
  setAmount: React.Dispatch<SetStateAction<PaymentAmount>>;
  dateError: string;
  setDateError: React.Dispatch<SetStateAction<string>>;
  defaultBal?: QryDefaultBAL;
  setDefaultBal: Dispatch<SetStateAction<QryDefaultBAL | undefined>>;
  orderReason: OrderReason[];
}

// Create the context with proper typing
export const TerminationContext = createContext<
  TerminationContextType | undefined
>(undefined);

const API_URL = apiConfig.service_user;

export const TerminationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { menuPrivAccess } = useOrderLayout();
  const { fetchOrderReason } = useOrder();
  const { startOrderFlow, selectedOperation } = useSubscriberListContext();
  const { GetData } = useCallApi();
  const [step, setStep] = useState<number>(0);
  const [allData, setAllData] = useState<StartOrderFlow>();
  const [paymentMethod, setPaymentMethod] = useState<string[]>(["0"]);
  const [amount, setAmount] = useState<PaymentAmount>({
    cash: "",
    balance: "",
  });
  const [dateError, setDateError] = useState<string>("");
  const [defaultBal, setDefaultBal] = useState<QryDefaultBAL>();
  const [orderReason, setOrderReason] = useState<OrderReason[]>([]);

  const [form, setForm] = useState<TerminationData>({
    susPensionReasonId: "0",
    otherReason: "",
    orderReasonId: 0,
    termReason: "Not In Use",
    comments: "",
    resrvTime: "",
    paymentMethod: "0",
    amount: 0,
  });

  const getOrderReason = async () => {
    try {
      const temp = await fetchOrderReason(
        Number(selectedOperation?.subsEventId),
      );
      setOrderReason(temp);
    } catch (error) {
      setOrderReason([]);
    }
  };

  useEffect(() => {
    setAllData(startOrderFlow.data);
    getOrderReason();
  }, [startOrderFlow]);

  const value = {
    step,
    setStep,
    form,
    setForm,
    allData,
    setAllData,
    paymentMethod,
    setPaymentMethod,
    amount,
    setAmount,
    dateError,
    setDateError,
    defaultBal,
    setDefaultBal,
    orderReason,
  };
  return (
    <TerminationContext.Provider value={value}>
      {children}
    </TerminationContext.Provider>
  );
};

// Custom hook to use the context
export const useTermination = () => {
  const context = useContext(TerminationContext);
  if (context === undefined) {
    throw new Error(
      "useTermination must be used within an TerminationProvider",
    );
  }
  return context;
};

export default TerminationContext;
