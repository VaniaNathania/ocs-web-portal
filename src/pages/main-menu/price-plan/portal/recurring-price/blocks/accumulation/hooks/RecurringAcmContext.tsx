import { apiConfig } from "@/config/api.config";
import { createContext, useState } from "react";
import { useRecurringPriceContext } from "../../../hooks";

interface ContextProps {
  showPriceDialog: { show: boolean; mode: "create" | "update" };
  handlePriceDialog: (
    show: boolean,
    dialogMode: "create" | "update",
    priceVersion: RecurringPriceAcmDetail | null,
    priceId: number | null
  ) => void;
  showEditDateDialog: boolean;
  handleEditDateDialog: (
    show: boolean,
    date: { effDate: string | null; expDate: string | null } | null
  ) => void;
  priceVersionDate: {
    effDate: string | null;
    expDate: string | null;
  } | null;
  setPriceVersionDate: (
    date: { effDate: string | null; expDate: string | null } | null
  ) => void;
  selectedPriceVersion: RecurringPriceAcmDetail | null;
  setSelectedPriceVersion: (priceVer: RecurringPriceAcmDetail | null) => void;
  selectedPrice: number | null;
  setSelectedPrice: (priceId: number | null) => void;
}

const initialProps: ContextProps = {
  showPriceDialog: { show: false, mode: "create" },
  handlePriceDialog: () => {},
  showEditDateDialog: false,
  handleEditDateDialog: () => {},
  priceVersionDate: null,
  setPriceVersionDate: () => {},
  selectedPriceVersion: null,
  setSelectedPriceVersion: () => {},
  selectedPrice: null,
  setSelectedPrice: () => {},
};

const API_URL = apiConfig.service_price_plan;
const RecurringAcmContext = createContext<ContextProps>(initialProps);

const RecurringAcmContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedMapping, setSelectedMapping } = useRecurringPriceContext();

  const [showPriceDialog, setShowPriceDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });
  const [showEditDateDialog, setShowEditDateDialog] = useState(false);
  const [priceVersionDate, setPriceVersionDate] = useState<{
    effDate: string | null;
    expDate: string | null;
  } | null>(null);
  const [selectedPriceVersion, setSelectedPriceVersion] =
    useState<RecurringPriceAcmDetail | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  const handlePriceDialog = (
    show: boolean,
    dialogMode: "create" | "update",
    priceVersion: RecurringPriceAcmDetail | null,
    priceId: number | null
  ) => {
    setShowPriceDialog({ show, mode: dialogMode });
    setSelectedPriceVersion(priceVersion);
    setSelectedPrice(priceId);
    // setSelectedMapping(priceVersion?.mappingId || null);
  };

  const handleEditDateDialog = (
    show: boolean,
    date: { effDate: string | null; expDate: string | null } | null
  ) => {
    setShowEditDateDialog(show);
    setPriceVersionDate(show ? date : null);
  };

  return (
    <RecurringAcmContext.Provider
      value={{
        showPriceDialog,
        handlePriceDialog,
        showEditDateDialog,
        handleEditDateDialog,
        priceVersionDate,
        setPriceVersionDate,
        selectedPriceVersion,
        setSelectedPriceVersion,
        selectedPrice,
        setSelectedPrice,
      }}
    >
      {children}
    </RecurringAcmContext.Provider>
  );
};

export { RecurringAcmContext, RecurringAcmContextProvider };
