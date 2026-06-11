import React, {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiConfigRef } from "@/config/api.config";
import { OfferApply } from "../../../interface";
import { toast } from "sonner";
import { mock, mockOwned } from "../mock";
import { useCallApi } from "@/hooks";
import { useLifeCycle } from "../../../hooks/context";
interface OfferApplyContextType {
  ownedOffer: OfferApply[];
  setOwnedOffer: Dispatch<SetStateAction<OfferApply[]>>;
  availableOffer: OfferApply[];
  setAvailableOffer: Dispatch<SetStateAction<OfferApply[]>>;
  owned: OfferApply[];
  setOwned: Dispatch<SetStateAction<OfferApply[]>>;
  ownedMain: OfferApply[];
  setOwnedMain: Dispatch<SetStateAction<OfferApply[]>>;
  available: OfferApply[];
  setAvailable: Dispatch<SetStateAction<OfferApply[]>>;
  dialogOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  setRefresh: Dispatch<SetStateAction<number>>;
}

// Create the context with proper typing
export const OfferApplyContext = createContext<
  OfferApplyContextType | undefined
>(undefined);

const API_URL = apiConfigRef.ref;

export const OfferApplyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [allOffer, setAllOffer] = useState<OfferApply[]>([]);
  const [ownedOffer, setOwnedOffer] = useState<OfferApply[]>([]);
  const [availableOffer, setAvailableOffer] = useState<OfferApply[]>([]);
  const [owned, setOwned] = useState<OfferApply[]>([]);
  const [ownedMain, setOwnedMain] = useState<OfferApply[]>([]);
  const [available, setAvailable] = useState<OfferApply[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<number>(0);
  const { selectedLifeCycle } = useLifeCycle();
  const { GetData } = useCallApi();

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [allOfferResp, ownedOfferResp] = await Promise.all([
        GetData(
          `${API_URL}/api/lifecycle-type/qryOfferExcludeOtherLifeCycleType`,
          {
            // lifecycleType: selectedLifeCycle?.lifeCycleType,
            offerType: 2,
            excludeGoodsProd: 1,
            spId: 0,
          }
        ),
        GetData(`${API_URL}/api/lifecycle-type/qryLifecycleApplyOffer`, {
          lifecycleType: selectedLifeCycle?.lifeCycleType,
        }),
        ,
      ]);

      const tempAll: OfferApply[] = allOfferResp.data;
      const tempOwn: OfferApply[] = ownedOfferResp.data;

      setAllOffer(tempAll);
      setOwned(tempOwn);
      setOwnedMain(tempOwn);
      // setAvailable(
      //   tempAll.filter(
      //     (item) => !tempOwn.map((ofr) => ofr.offerId).includes(item.offerId)
      //   )
      // );
      setAvailable(tempAll);
      setOwnedOffer([]);
      setAvailableOffer([]);
    } catch (error) {
      toast.error("error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!dialogOpen) fetchAll();
  }, [dialogOpen, refresh, selectedLifeCycle]);
  const value: OfferApplyContextType = {
    ownedOffer,
    setOwnedOffer,
    availableOffer,
    setAvailableOffer,
    owned,
    setOwned,
    ownedMain,
    setOwnedMain,
    available,
    setAvailable,
    dialogOpen,
    setDialogOpen,

    isLoading,
    setIsLoading,
    isEditing,
    setIsEditing,
    setRefresh,
  };

  return (
    <OfferApplyContext.Provider value={value}>
      {children}
    </OfferApplyContext.Provider>
  );
};

// Custom hook to use the context
export const useOfferApply = () => {
  const context = useContext(OfferApplyContext);
  if (context === undefined) {
    throw new Error("useOfferApply must be used within an OfferApplyProvider");
  }
  return context;
};

export default OfferApplyContext;
