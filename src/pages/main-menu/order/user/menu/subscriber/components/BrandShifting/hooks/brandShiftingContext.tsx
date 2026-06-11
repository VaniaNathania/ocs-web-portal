import { createContext, useContext, useState } from "react";
import { useSubscriberListContext } from "../../../hooks";

interface BrandShiftingContextType {
  showSubsPlan: boolean;
  showServiceDialog: boolean;
  showOfferService: boolean;
  openSubsPlan: (show: boolean) => void;
  openServiceDialog: (show: boolean) => void;
  openOfferService: (show: boolean) => void;
}

const initialContextProps: BrandShiftingContextType = {
  showSubsPlan: false,
  showServiceDialog: false,
  showOfferService: false,
  openSubsPlan: (show: boolean) => {},
  openServiceDialog: (show: boolean) => {},
  openOfferService: (show: boolean) => {},
};

const BrandShiftingContext = createContext<
  BrandShiftingContextType | undefined
>(undefined);

export const BrandShiftingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [showSubsPlan, setShowSubsPlan] = useState(false);
  const { startOrderFlow } = useSubscriberListContext();
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showOfferService, setShowOfferService] = useState(false);

  const openSubsPlan = (show: boolean) => {
    setShowSubsPlan(show);
  };

  const openServiceDialog = (show: boolean) => {
    setShowServiceDialog(show);
  };

  const openOfferService = (show: boolean) => {
    setShowOfferService(show);
  };

  const value: BrandShiftingContextType = {
    showSubsPlan,
    showServiceDialog,
    showOfferService,
    openSubsPlan,
    openServiceDialog,
    openOfferService,
  };

  return (
    <BrandShiftingContext.Provider value={value}>
      {children}
    </BrandShiftingContext.Provider>
  );
};

export const useBrandShifting = () => {
  const context = useContext(BrandShiftingContext);
  if (context === undefined) {
    throw new Error("useBrandShifting must be used within a DepositProvider");
  }
  return context;
};
