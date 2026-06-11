import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";

interface InstantInvoiceType {}

// Create the context with proper typing
export const InstantInvoice = createContext<InstantInvoiceType | undefined>(undefined);

const API_URL = apiConfig.service_payment;

export const InstantInvoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const { PostData, GetData } = useCallApi();

  const value: InstantInvoiceType = {};

  return <InstantInvoice.Provider value={value}>{children}</InstantInvoice.Provider>;
};

// Custom hook to use the context
export const useInstantInvoice = () => {
  const context = useContext(InstantInvoice);
  if (context === undefined) {
    throw new Error("useInstantInvoice must be used within an InstantInvoiceProvider");
  }
  return context;
};

export default InstantInvoice;
