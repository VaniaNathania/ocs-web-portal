import { apiConfig } from "@/config/api.config";
import {
  DeleteSubscriptionTypeKey,
  useSubscriptionPriceCreateContext,
} from "../../../hooks";
import { createContext, useState } from "react";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useCallApi } from "@/hooks";

interface ContextProps {
  showAddRatePlanDialog: boolean;
  handleAddRatePlanDialog: (show: boolean) => void;
  showEditDateDialog: boolean;
  handleEditDateDialog: (
    show: boolean,
    date: { effDate: string | null; expDate: string | null } | null
  ) => void;
  showPriceDialog: { show: boolean; mode: "create" | "update" };
  handlePriceDialog: (
    show: boolean,
    dialogMode: "create" | "update",
    priceVersion: AccumulationVersion | null,
    priceId: number | null
  ) => void;
  handleDeleteDialog: (
    show: boolean,
    priceId: number | null,
    priceVer: AccumulationVersion | null,
    deleteType?: DeleteSubscriptionTypeKey
  ) => void;
  selectedPrice: number | null;
  setSelectedPrice: (priceId: number | null) => void;
  selectedRatePlan: number | null;
  setSelectedRatePlan: (ratePlanId: number | null) => void;
  selectedPriceVer: AccumulationVersion | null;
  setSelectedPriceVer: (priceVer: AccumulationVersion | null) => void;
  priceVersionDate: { effDate: string | null; expDate: string | null } | null;
  setPriceVersionDate: (
    date: { effDate: string | null; expDate: string | null } | null
  ) => void;
}

const initialProps: ContextProps = {
  showAddRatePlanDialog: false,
  handleAddRatePlanDialog: () => {},
  showEditDateDialog: false,
  handleEditDateDialog: () => {},
  showPriceDialog: { show: false, mode: "create" },
  handlePriceDialog: () => {},
  handleDeleteDialog: () => {},
  selectedPrice: null,
  setSelectedPrice: () => {},
  selectedRatePlan: null,
  setSelectedRatePlan: () => {},
  selectedPriceVer: null,
  setSelectedPriceVer: () => {},
  priceVersionDate: null,
  setPriceVersionDate: () => {},
};

const API_URL = apiConfig.service_price_plan;
const AccumulationContext = createContext<ContextProps>(initialProps);

const AccumulationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { dataPricePlan, dataPricePlanDetail } = usePortalData();
  const { PostData, GetData, DeleteData } = useCallApi();
  const { setShowDeleteConfirm, setSelectedDelete } =
    useSubscriptionPriceCreateContext();

  const [showAddRatePlanDialog, setShowAddRateDialog] = useState(false);
  const [showPriceVersionDialog, setShowPriceVersionDialog] = useState(false);
  const [showEditDateDialog, setShowEditDateDialog] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });

  const [selectedRatePlan, setSelectedRatePlan] = useState<number | null>(null);
  const [selectedPriceVer, setSelectedPriceVer] =
    useState<AccumulationVersion | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [priceVersionDate, setPriceVersionDate] = useState<{
    effDate: string | null;
    expDate: string | null;
  } | null>(null);

  const handleAddRatePlanDialog = (show: boolean) => {
    setShowAddRateDialog(show);
  };

  const handlePriceVersionDialog = (
    show: boolean,
    priceVersion: AccumulationVersion | null
  ) => {
    setShowPriceVersionDialog(show);
    setSelectedPriceVer(show ? priceVersion : null);
  };

  const handleEditDateDialog = (
    show: boolean,
    date: { effDate: string | null; expDate: string | null } | null
  ) => {
    setShowEditDateDialog(show);
    setPriceVersionDate(show ? date : null);
  };

  const handlePriceDialog = (
    show: boolean,
    dialogMode: "create" | "update",
    priceVersion: AccumulationVersion | null,
    priceId: number | null
  ) => {
    setShowPriceDialog({ show, mode: dialogMode });
    setSelectedPriceVer(show ? priceVersion : null);
    setSelectedPrice(show ? priceId : null);
  };

  const handleDeleteDialog = (
    show: boolean,
    priceId: number | null,
    priceVer: AccumulationVersion | null,
    deleteType: DeleteSubscriptionTypeKey = "priceRating"
  ) => {
    setShowDeleteConfirm({
      show,
      deleteType: show ? deleteType : null,
    });
    setSelectedDelete(show ? priceId : null);
    setSelectedPriceVer(show ? priceVer : null);
  };

  return (
    <AccumulationContext.Provider
      value={{
        showAddRatePlanDialog,
        handleAddRatePlanDialog,
        showEditDateDialog,
        handleEditDateDialog,
        showPriceDialog,
        handlePriceDialog,
        handleDeleteDialog,
        selectedRatePlan,
        setSelectedRatePlan,
        selectedPriceVer,
        setSelectedPriceVer,
        selectedPrice,
        setSelectedPrice,
        priceVersionDate,
        setPriceVersionDate,
      }}
    >
      {children}
    </AccumulationContext.Provider>
  );
};

export { AccumulationContext, AccumulationContextProvider };
