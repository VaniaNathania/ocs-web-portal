import { apiConfig } from "@/config/api.config";
import { createContext, useState } from "react";
import { useRecurringPriceContext } from "../../../hooks";

interface ContextProps {
  showPriceDialog: {
    show: boolean;
    mode: "create" | "update";
    type: "version" | "price";
  };
  handlePriceDialog: (
    show: boolean,
    mode: "create" | "update",
    type: "version" | "price",
    priceVersion: PriceDetail | null,
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
  selectedPriceVersion: PriceDetail | null;
  setSelectedPriceVersion: (priceVer: PriceDetail | null) => void;
  selectedPrice: number | null;
  setSelectedPrice: (priceId: number | null) => void;
}

const initialProps: ContextProps = {
  showPriceDialog: { show: false, mode: "create", type: "version" },
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
const RecurringRatingContext = createContext<ContextProps>(initialProps);

const RecurringRatingContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedMapping, setSelectedMapping } = useRecurringPriceContext();

  const [showPriceDialog, setShowPriceDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
    type: "version" | "price";
  }>({
    show: false,
    mode: "create",
    type: "version",
  });
  const [showEditDateDialog, setShowEditDateDialog] = useState(false);
  const [priceVersionDate, setPriceVersionDate] = useState<{
    effDate: string | null;
    expDate: string | null;
  } | null>(null);
  const [selectedPriceVersion, setSelectedPriceVersion] =
    useState<PriceDetail | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  const handlePriceDialog = (
    show: boolean,
    mode: "create" | "update",
    type: "version" | "price",
    priceVersion: PriceDetail | null,
    priceId: number | null
  ) => {
    setShowPriceDialog({ show, mode, type });
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
    <RecurringRatingContext.Provider
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
    </RecurringRatingContext.Provider>
  );
};

export { RecurringRatingContext, RecurringRatingContextProvider };
