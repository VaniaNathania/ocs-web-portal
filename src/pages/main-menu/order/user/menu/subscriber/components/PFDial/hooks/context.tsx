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
import { CustomerInfo } from "@/pages/main-menu/order/models/interfaces";
import { defaultCustomerInfo } from "@/pages/main-menu/order/block/AddCustomerDialog";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useSubscriberListContext } from "../../../hooks";
import {
  PaymentAmount,
  QryDefaultBAL,
  StartOrderFlow,
} from "../../modifysubscriber/model/interfaces";

interface PFDialContextType {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  form: CustomerInfo;
  setForm: React.Dispatch<SetStateAction<CustomerInfo>>;
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
}

// Create the context with proper typing
export const PFDialContext = createContext<PFDialContextType | undefined>(
  undefined,
);

const API_URL = apiConfig.service_user;

export const PFDialProvider = ({ children }: { children: React.ReactNode }) => {
  const { menuPrivAccess } = useOrderLayout();
  const { GetData } = useCallApi();
  const { selectedUser } = useOrder();
  const [step, setStep] = useState<number>(0);
  const [form, setForm] = useState<CustomerInfo>(defaultCustomerInfo);
  const { startOrderFlow } = useSubscriberListContext();
  const [allData, setAllData] = useState<StartOrderFlow>();
  const [paymentMethod, setPaymentMethod] = useState<string[]>(["0"]);
  const [amount, setAmount] = useState<PaymentAmount>({
    cash: "",
    balance: "",
  });
  const [dateError, setDateError] = useState<string>("");
  const [defaultBal, setDefaultBal] = useState<QryDefaultBAL>();

  useEffect(() => {
    //  console.log("ini ke triger");

    if (startOrderFlow) {
      setForm({
        ...startOrderFlow.data?.cust,
        certTypeId:
          startOrderFlow.data?.orderItemList[0].custProf?.oldCertTypeId,
        certNbr: startOrderFlow.data?.orderItemList[0].custProf?.oldCertNbr,
        effDate: startOrderFlow.data?.orderItemList[0].custProf?.oldEffDate,
        expDate: startOrderFlow.data?.orderItemList[0].custProf?.oldExpDate,
        issueDate: startOrderFlow.data?.orderItemList[0].custProf?.oldIssueDate,
        certAddress:
          startOrderFlow.data?.orderItemList[0].custProf?.oldCertAddress,
      });
      setAllData(startOrderFlow.data);
    }
  }, [startOrderFlow.data?.orderItemList[0].orderItemId]);

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
  };
  return (
    <PFDialContext.Provider value={value}>{children}</PFDialContext.Provider>
  );
};

// Custom hook to use the context
export const usePFDial = () => {
  const context = useContext(PFDialContext);
  if (context === undefined) {
    throw new Error("usePFDial must be used within an PFDialProvider");
  }
  return context;
};

export default PFDialContext;
