import { apiConfigOrder } from "@/config/api.config";
import { createContext, ReactNode, useContext, useState } from "react";

interface ReverseDialogContextType {
  reserveData: ReverseDatas | null;
  setReserveData: React.Dispatch<React.SetStateAction<ReverseDatas | null>>;
}

// Create the context with proper typing
export const ReverseDialogContext = createContext<ReverseDialogContextType | undefined>(undefined);

const API_ORDER = apiConfigOrder.order;

// Provider component
interface ReverseDialogProviderProps {
  children: ReactNode;
}

interface ReverseDatas {
  prefix: string;
  preExpDate: string;
  preSuttleBal: number;
  preBalance: number;
  partyType: string;
  oldExpDate: string;
  seconds: string;
  paymentId: number;
  paymentMethodId: number;
  staffName: string;
  accNbr: string;
  balId: number;
  returnAmount: number;
  charge: number;
  orgName: string;
  acctId: number;
  spId: number;
  contactChannelId: number;
  submitAmount: number;
  createdDate: string;
  acctBookId: number;
  acctBookType: string;
  billId: number;
  partyCode: string;
  acctResId: number;
  days: string;
}

export const ReverseDialogProvider = ({ children }: ReverseDialogProviderProps) => {
  const [reserveData, setReserveData] = useState<ReverseDatas | null>(null);
  const value = {
    reserveData,
    setReserveData,
  };

  return <ReverseDialogContext.Provider value={value}>{children}</ReverseDialogContext.Provider>;
};

// Custom hook to use the context
export const useReverseDialog = () => {
  const context = useContext(ReverseDialogContext);
  if (context === undefined) {
    throw new Error("useReverseDialog must be used within an ReverseDialogProvider");
  }
  return context;
};

export default ReverseDialogContext;
