import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePayment } from "../../../hooks/PaymentContext";
import { toast } from "sonner";
import { AcctItemList, BillAcctItemProps, HisBillByCount } from "../interface/interface";

interface HistoryBillType {
  isLoading: boolean;
  hisBillByCountDatas: HisBillByCount[];
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  selectedItem: HisBillByCount | undefined;
  setSelectedItem: Dispatch<SetStateAction<HisBillByCount | undefined>>;
  billAcctItem: BillAcctItemProps | undefined;
  billDetailTable: AcctItemList[];
  selectedDetailRow: AcctItemList | undefined;
  setSelectedDetailRow: Dispatch<SetStateAction<AcctItemList | undefined>>;
}

// Create the context with proper typing
export const HistoryBillContext = createContext<HistoryBillType | undefined>(undefined);

const API_URL = apiConfig.service_payment;

export const HistoryBillProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedRow, selectedMenu } = usePayment();
  const { GetData } = useCallApi();
  const [hisBillByCountDatas, setHisBillByCountDatas] = useState<HisBillByCount[]>([]);
  const [billAcctItem, setBillAcctItem] = useState<BillAcctItemProps>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<HisBillByCount>();
  const [selectedDetailRow, setSelectedDetailRow] = useState<AcctItemList>();
  const [billDetailTable, setBillDetailTable] = useState<AcctItemList[]>([]);

  useEffect(() => {
    const fetchQryHisBillByCount = async () => {
      try {
        setIsLoading(true);
        const response = await GetData(`${API_URL}/api/payment/web-qry-his-bill-by-count`, {
          acctId: selectedRow?.acctId,
          billCount: 6,
        });

        if (response?.status) {
          setHisBillByCountDatas(response.data);
          setSelectedItem(response.data[0]);
        }
      } catch (err) {
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedMenu === "history" && selectedRow?.acctId) {
      fetchQryHisBillByCount();
    }
  }, [selectedMenu, selectedRow?.acctId]);

  useEffect(() => {
    const fetchQryBillAcctItem = async (billId: number) => {
      try {
        setIsLoading(true);
        const response = await GetData(`${API_URL}/api/payment/qry-bill-acct-item?billId=${billId}`, billId);

        if (response?.status) {
          setBillAcctItem(response?.data);
          setBillDetailTable(response?.data?.acctItemList);
          setSelectedDetailRow(response?.data?.acctItemList[0]);
        }
      } catch (err) {
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      if (!selectedItem?.billId) return;
      fetchQryBillAcctItem(selectedItem?.billId);
    }
  }, [selectedItem?.billId, isOpen]);

  const value: HistoryBillType = {
    isLoading,
    hisBillByCountDatas,
    isOpen,
    setIsOpen,
    selectedItem,
    setSelectedItem,
    billAcctItem,
    billDetailTable,
    selectedDetailRow,
    setSelectedDetailRow,
  };

  return <HistoryBillContext.Provider value={value}>{children}</HistoryBillContext.Provider>;
};

// Custom hook to use the context
export const useHistoryBillContext = () => {
  const context = useContext(HistoryBillContext);
  if (context === undefined) {
    throw new Error("useHistoryBillContext must be used within an HistoryBillContextProvider");
  }
  return context;
};

export default HistoryBillContext;
