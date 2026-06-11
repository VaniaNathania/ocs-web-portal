import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { AcctInfoPayment } from "@/pages/main-menu/payment/interfaces";
import { toast } from "sonner";

interface SearchContextType {
  selectedTemp?: AcctInfoPayment;
  setSelectedTemp: React.Dispatch<SetStateAction<AcctInfoPayment | undefined>>;
  query: payQuery;
  setQuery: Dispatch<SetStateAction<payQuery>>;
  isLoading: boolean;
  selectedRow?: AcctInfoPayment;
  setSelectedRow: Dispatch<SetStateAction<AcctInfoPayment | undefined>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  rows: AcctInfoPayment[];
  totalRows: number;
}

// Create the context with proper typing
export const SearchContext = createContext<SearchContextType | undefined>(
  undefined,
);

const API_URL = apiConfig.service_user;

// Provider component
interface ProviderProps {
  children: ReactNode;
  handleDialog: (open: boolean) => void;
  isOpen: boolean;
  setSelectedRow: Dispatch<SetStateAction<AcctInfoPayment | undefined>>;
  selectedRow?: AcctInfoPayment;
}
export const SearchProvider = ({
  children,
  handleDialog,
  isOpen,
  setSelectedRow,
  selectedRow,
}: ProviderProps) => {
  const { GetData } = useCallApi();
  const [selectedTemp, setSelectedTemp] = useState<AcctInfoPayment>();
  const [rows, setRows] = useState<AcctInfoPayment[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<payQuery>({
    page: 1,
    size: 5,
    sortBy: "CUST_ID",
    sortDirection: "asc",
    spId: 0,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      //  console.log(selectedRow);
      const resp = await GetData(
        `${API_URL}/api/balance-adjustment/qry-acct-info`,
        query,
      );

      if (!resp.status) return toast.error(resp.message);
      if (resp.data.length === 0) {
        setRows([]);
        return toast.warning("Can't find any matching data");
      }
      // if (resp.data.length === 1) {
      //   setSelectedRow(resp.data[0]);
      //   // navigate(`/payment/${resp.data[0].acctNbr}`);
      // }

      setTotalRows(resp.totalRows);
      setRows(resp.data);
      // console.log(resp);
    } catch (error) {
      //  console.log(error);

      return toast.error("Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    //  console.log(query);

    if (query.accNbr || query.acctNbr || query.custName) {
      fetchData();
      return;
    }
    setRows([]);
    setTotalRows(0);
  }, [query]);

  const value = {
    selectedTemp,
    setSelectedTemp,
    handleDialog,
    isOpen,
    query,
    rows,
    setQuery,
    setSelectedRow,
    selectedRow,
    isLoading,
    setIsLoading,
    totalRows,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

// Custom hook to use the context
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within an SearchProvider");
  }
  return context;
};

export default SearchContext;
