import { createContext, useState, ReactNode } from "react";
import { DetailDialog } from "./blocks/DetailPricePlan";

interface ContextProps {
  handleDetailDialog: (show: boolean) => void;
  showDetailDialog: boolean;
  setShowDetailDialog: (show: boolean) => void;
  selectedOfferVerId: number | null;
  setSelectedOfferVerId: (id: number | null) => void;
  pricePlanData: any;
  setPricePlanData: (data: any) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
}

const initialProps: ContextProps = {
  handleDetailDialog: () => {},
  showDetailDialog: false,
  setShowDetailDialog: () => {},
  selectedOfferVerId: null,
  setSelectedOfferVerId: () => {},
  pricePlanData: {},
  setPricePlanData: () => {},
  isDropdownOpen: false,
  setIsDropdownOpen: () => {},
};

const NavbarMenuContext = createContext<ContextProps>(initialProps);

const NavbarMenuContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [showDetailDialog, setShowDetailDialog] = useState<boolean>(false);
  const [selectedOfferVerId, setSelectedOfferVerId] = useState<number | null>(null);
  const [pricePlanData, setPricePlanData] = useState<any>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const handleDetailDialog = (show: boolean) => {
    console.log("Toggling Detail Dialog:", show);
    console.log("klik")
    setShowDetailDialog(show);
  };

  return (
    <NavbarMenuContext.Provider
      value={{
        handleDetailDialog,
        showDetailDialog,
        setShowDetailDialog,
        selectedOfferVerId,
        setSelectedOfferVerId,
        pricePlanData,
        setPricePlanData,
        isDropdownOpen,
        setIsDropdownOpen,
      }}
    >
        <DetailDialog />
      {children}
    </NavbarMenuContext.Provider>
  );
};

export { NavbarMenuContextProvider, NavbarMenuContext };