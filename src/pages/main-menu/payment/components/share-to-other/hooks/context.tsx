import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { apiConfig } from "@/config/api.config";
import { BalShareList } from "../models/interfaces";

interface ShareToOtherContextType {
  balShare: boolean;
  setBalShare: Dispatch<SetStateAction<boolean>>;
  balShareDelete: boolean;
  setBalShareDelete: Dispatch<SetStateAction<boolean>>;
  balHistory: boolean;
  setBalHistory: Dispatch<SetStateAction<boolean>>;
  isBalShareAdding: boolean;
  setIsBalShareAdding: Dispatch<SetStateAction<boolean>>;
  selectedBal?: BalShareList;
  setSelectedBal: Dispatch<SetStateAction<BalShareList | undefined>>;
}

// Create the context with proper typing
export const ShareToOtherContext = createContext<
  ShareToOtherContextType | undefined
>(undefined);

const API_URL = apiConfig.service_user;

export const ShareToOtherProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [balShare, setBalShare] = useState<boolean>(false);
  const [balHistory, setBalHistory] = useState<boolean>(false);
  const [balShareDelete, setBalShareDelete] = useState<boolean>(false);
  const [selectedBal, setSelectedBal] = useState<BalShareList>();
  const [isBalShareAdding, setIsBalShareAdding] = useState<boolean>(false);

  const value: ShareToOtherContextType = {
    balShare,
    setBalShare,
    balShareDelete,
    setBalShareDelete,
    balHistory,
    setBalHistory,
    isBalShareAdding,
    setIsBalShareAdding,
    selectedBal,
    setSelectedBal,
  };

  return (
    <ShareToOtherContext.Provider value={value}>
      {children}
    </ShareToOtherContext.Provider>
  );
};

// Custom hook to use the context
export const useShareToOther = () => {
  const context = useContext(ShareToOtherContext);
  if (context === undefined) {
    throw new Error(
      "useShareToOther must be used within an ShareToOtherProvider",
    );
  }
  return context;
};

export default ShareToOtherContext;
