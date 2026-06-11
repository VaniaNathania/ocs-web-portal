import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePayment } from "../../../hooks/PaymentContext";
import { AllBillProps } from "../interface/interface";

interface AllBillContextType {
  allBillDatas: AllBillProps[];
  setAllBillDatas: Dispatch<SetStateAction<AllBillProps[]>>;
  selectedRows: AllBillProps | undefined;
  setSelectedRows: Dispatch<SetStateAction<AllBillProps | undefined>>;
  loading: boolean;
}

// Create the context with proper typing
export const AllBillContext = createContext<AllBillContextType | undefined>(undefined);

const API_URL = apiConfig.service_payment;

export const AllBillProvider = ({ children }: { children: React.ReactNode }) => {
  const { GetData } = useCallApi();
  const { selectedMenu, selectedRow } = usePayment();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<AllBillProps>();
  const [allBillDatas, setAllBillDatas] = useState<AllBillProps[]>([]);

  useEffect(() => {
    const fetchQryBillSimpleByAcctId = async (acctId: number) => {
      try {
        setLoading(true);
        const response = await GetData(`${API_URL}/api/payment/qry-bill-simple-by-acct-id`, {
          acctId,
        });

        if (response?.status) {
          setAllBillDatas(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedRow?.acctId && selectedMenu === "all bill") {
      fetchQryBillSimpleByAcctId(1537022);
    }
  }, [selectedRow?.acctId, selectedMenu]);

  const value: AllBillContextType = {
    selectedRows,
    setSelectedRows,
    loading,
    allBillDatas,
    setAllBillDatas,
  };

  return <AllBillContext.Provider value={value}>{children}</AllBillContext.Provider>;
};

// Custom hook to use the context
export const useAllBillContext = () => {
  const context = useContext(AllBillContext);
  if (context === undefined) {
    throw new Error("useAllBillContext must be used within an AllBillProvider");
  }
  return context;
};

export default AllBillContext;
