import { createContext, useState } from "react";
import {
  DeleteSubscriptionTypeKey,
  useSubscriptionPriceCreateContext,
} from "../../../hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";

interface ContextProps {
  showEditDateDialog: boolean;
  handleEditDateDialog: (
    show: boolean,
    date: { effectiveDate: string | null; expiryDate: string | null } | null
  ) => void;
  showPriceDialog: {
    show: boolean;
    mode: "create" | "update";
    type: "version" | "price";
  };
  handlePriceDialog: (
    show: boolean,
    mode: "create" | "update",
    type: "version" | "price",
    selectedPrice: PriceBenefit | null
  ) => void;
  handleDeleteDialog: (
    show: boolean,
    selectedPrice: PriceBenefit | null,
    deleteType?: DeleteSubscriptionTypeKey
  ) => void;
  selectedPrice: PriceBenefit | null;
  setSelectedPrice: (selectedPrice: PriceBenefit | null) => void;
  selectedPriceVer: SubscriptionBenefitDetail | null;
  setSelectedPriceVer: (priceVer: SubscriptionBenefitDetail | null) => void;
  priceVersionDate: {
    effectiveDate: string | null;
    expiryDate: string | null;
  } | null;
  setPriceVersionDate: (
    date: { effectiveDate: string | null; expiryDate: string | null } | null
  ) => void;
}

const initialProps: ContextProps = {
  showEditDateDialog: false,
  handleEditDateDialog: () => {},
  showPriceDialog: { show: false, mode: "create", type: "version" },
  handlePriceDialog: () => {},
  handleDeleteDialog: () => {},
  selectedPrice: null,
  setSelectedPrice: () => {},
  selectedPriceVer: null,
  setSelectedPriceVer: () => {},
  priceVersionDate: null,
  setPriceVersionDate: () => {},
};

const BenefitContext = createContext<ContextProps>(initialProps);

const BenefitContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { dataPricePlan, dataPricePlanDetail } = usePortalData();
  const { setShowDeleteConfirm, setSelectedDelete } =
    useSubscriptionPriceCreateContext();

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
  const [selectedPriceVer, setSelectedPriceVer] =
    useState<SubscriptionBenefitDetail | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<PriceBenefit | null>(null);
  const [priceVersionDate, setPriceVersionDate] = useState<{
    effectiveDate: string | null;
    expiryDate: string | null;
  } | null>(null);

  const handleEditDateDialog = (
    show: boolean,
    date: { effectiveDate: string | null; expiryDate: string | null } | null
  ) => {
    setShowEditDateDialog(show);
    setPriceVersionDate(show ? date : null);
  };

  const handlePriceDialog = (
    show: boolean,
    mode: "create" | "update",
    type: "version" | "price",
    selectedPrice: PriceBenefit | null
  ) => {
    setShowPriceDialog({ show, mode, type });
    setSelectedPrice(show ? selectedPrice : null);
  };

  const handleDeleteDialog = (
    show: boolean,
    selectedPrice: PriceBenefit | null,
    deleteType: DeleteSubscriptionTypeKey = "priceBenefit"
  ) => {
    setShowDeleteConfirm({
      show,
      deleteType: show ? deleteType : null,
    });
    setSelectedDelete(show ? selectedPrice?.priceId! : null);
    setSelectedPrice(show ? selectedPrice : null);
  };

  return (
    <BenefitContext.Provider
      value={{
        showEditDateDialog,
        handleEditDateDialog,
        showPriceDialog,
        handlePriceDialog,
        handleDeleteDialog,
        selectedPrice,
        setSelectedPrice,
        selectedPriceVer,
        setSelectedPriceVer,
        priceVersionDate,
        setPriceVersionDate,
      }}
    >
      {children}
    </BenefitContext.Provider>
  );
};

export { BenefitContext, BenefitContextProvider };
