import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { usePayment } from "../../../hooks/PaymentContext";
import { toast } from "sonner";

interface BillDetailType {
  selectQuerry: number[];
  setSelectQuerry: Dispatch<SetStateAction<number[]>>;
  handleCheckbox: (groupType: number) => void;
  handleQuerry: () => void;
  triggerNotPaid: boolean;
  setTriggerNotPaid: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  allAcctItemDatas: any;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

// Create the context with proper typing
export const BillDetailContext = createContext<BillDetailType | undefined>(
  undefined,
);

const API_URL = apiConfig.service_payment;

export const BillDetailProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // const [selectedRows, setSelectedRows] = useState<>()
  const { selectedRow } = usePayment();
  const { PostData } = useCallApi();
  const [selectQuerry, setSelectQuerry] = useState<number[]>([1]);
  const [allAcctItemDatas, setAllAcctItemDatas] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [triggerNotPaid, setTriggerNotPaid] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const finalGroupType = selectQuerry.reduce((sum, num) => sum + num, 0);

  const handleCheckbox = (groupType: number) => {
    setSelectQuerry((prev) =>
      prev.includes(groupType)
        ? prev.filter((item) => item !== groupType)
        : [...prev, groupType],
    );
  };

  const fetchAcctItem = async () => {
    try {
      setIsLoading(true);

      //  console.log(finalGroupType);

      const endPoint = triggerNotPaid
        ? "/api/payment/web-qry-created-acct-item"
        : "/api/payment/web-qry-all-acct-item";

      const response = await PostData(`${API_URL}${endPoint}`, {
        acctId: selectedRow?.acctId,
        groupType: finalGroupType,
      });

      if (!response?.status) {
        throw new Error(response?.message || "API Error");
      }

      const datas = response?.data || [];
      setAllAcctItemDatas(datas);

      if (datas.length === 0) {
        toast.info("No result were found!");
      }
    } catch (err) {
      toast.error("Failed GetData!");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuerry = () => {
    if (
      selectQuerry.length === 0 ||
      (selectQuerry.length === 0 && triggerNotPaid)
    ) {
      setIsOpen(true);
      setSelectQuerry((prev) => [...prev, 1]);
      return;
    }

    fetchAcctItem();
  };

  // useEffect(() => {
  //   fetchQryAllAcctItem();
  // }, [selectQuerry, selectedRow]);

  useEffect(() => {
    //  console.log(selectQuerry);
  }, []);

  const value: BillDetailType = {
    selectQuerry,
    setSelectQuerry,
    handleCheckbox,
    handleQuerry,
    setTriggerNotPaid,
    isLoading,
    allAcctItemDatas,
    triggerNotPaid,
    isOpen,
    setIsOpen,
  };

  return (
    <BillDetailContext.Provider value={value}>
      {children}
    </BillDetailContext.Provider>
  );
};

// Custom hook to use the context
export const useBillDetailContext = () => {
  const context = useContext(BillDetailContext);
  if (context === undefined) {
    throw new Error(
      "useBillDetailContext must be used within an BillDetailContextProvider",
    );
  }
  return context;
};

export default BillDetailContext;
