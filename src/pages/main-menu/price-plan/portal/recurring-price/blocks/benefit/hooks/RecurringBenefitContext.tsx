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
    dialogMode: "create" | "update",
    type: "version" | "price",
    price: RecurringBenefitDetail | null
  ) => void;
  showEditDateDialog: boolean;
  handleEditDateDialog: (
    show: boolean,
    date: { effectiveDate: string | null; expiryDate: string | null } | null
  ) => void;
  priceVersionDate: {
    effectiveDate: string | null;
    expiryDate: string | null;
  } | null;
  setPriceVersionDate: (
    date: { effectiveDate: string | null; expiryDate: string | null } | null
  ) => void;
  selectedPriceVersion: RecurringBenefitDetail | null;
  setSelectedPriceVersion: (
    priceVersion: RecurringBenefitDetail | null
  ) => void;
  selectedPrice: RecurringBenefitDetail | null;
  setSelectedPrice: (price: RecurringBenefitDetail | null) => void;
}

const InitialProps: ContextProps = {
  showPriceDialog: { show: false, mode: "create", type: "version" },
  handlePriceDialog: () => {},
  showEditDateDialog: false,
  handleEditDateDialog: () => {},
  priceVersionDate: { effectiveDate: null, expiryDate: null },
  setPriceVersionDate: () => {},
  selectedPriceVersion: null,
  setSelectedPriceVersion: () => {},
  selectedPrice: null,
  setSelectedPrice: () => {},
};

const API_URL = apiConfig.service_price_plan;
const RecurringBenefitContext = createContext<ContextProps>(InitialProps);

const RecurringBenefitContextProvider = ({
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
    effectiveDate: string | null;
    expiryDate: string | null;
  } | null>(null);
  const [selectedPriceVersion, setSelectedPriceVersion] =
    useState<RecurringBenefitDetail | null>(null);
  const [selectedPrice, setSelectedPrice] =
    useState<RecurringBenefitDetail | null>(null);

  const handlePriceDialog = (
    show: boolean,
    dialogMode: "create" | "update",
    type: "version" | "price",
    price: RecurringBenefitDetail | null
  ) => {
    setShowPriceDialog({ show, mode: dialogMode, type });
    setSelectedPriceVersion(price ?? null);
    // setSelectedMapping(price?.mappingId || null);
  };

  const handleEditDateDialog = (
    show: boolean,
    date: { effectiveDate: string | null; expiryDate: string | null } | null
  ) => {
    setShowEditDateDialog(show);
    setPriceVersionDate(date);
  };

  return (
    <RecurringBenefitContext.Provider
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
    </RecurringBenefitContext.Provider>
  );
};

export { RecurringBenefitContext, RecurringBenefitContextProvider };
