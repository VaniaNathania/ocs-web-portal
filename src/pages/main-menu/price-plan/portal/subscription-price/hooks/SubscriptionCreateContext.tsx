import React, { createContext, useCallback, useEffect, useState } from "react";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import {
  FaChevronDown,
  FaChevronUp,
  FaDollarSign,
  FaEllipsisV,
  FaFileAlt,
  FaPlus,
} from "react-icons/fa";
import EventList from "../blocks/EventList";
import { Toaster } from "@/components/ui/sonner";
import EditDateDialog from "../blocks/EditDateDialog";
import EditPriceDialog from "../blocks/rating/blocks/EditPriceDialog";
import { AccumulationContextProvider } from "../blocks/accumulation/hooks/AccumulationContext";
import { BenefitContextProvider } from "../blocks/benefit/hooks/BenefitContext";

export type DeleteSubscriptionTypeKey =
  | "event"
  | "ratePlan"
  | "priceRating"
  | "priceAccumulation"
  | "priceBenefit"
  | "mappingRating";

interface ContextProps {
  events: Events[];
  ratePlans: RatePlans[];
  ratingLists: Record<number, PriceDetail[]>;
  loadingVersions: Record<number, boolean>;
  accumulationLists: Record<number, AccumulationVersion[]>;
  loadingAccumulation: Record<number, boolean>;
  benefitLists: Record<number, SubscriptionBenefitDetail[]>;
  loadingBenefit: Record<number, boolean>;
  mappingRatingLists: Record<number, MappingDetail[]>;
  loadingMappingRating: Record<number, boolean>;
  doGetListEvent: () => void;
  doGetListRatePlan: (event: number) => Promise<void>;
  fetchVersionsRatingForRatePlan: (
    ratePlanId: number,
    mappingId: number | null
  ) => Promise<void>;
  fetchVersionsAccumulationForRatePlan: (
    ratePlanId: number,
    mappingId: number | null
  ) => Promise<void>;
  fetchVersionsBenefitForRatePlan: (
    ratePlanId: number,
    mappingId: number | null
  ) => Promise<void>;
  fetchMappingRatingForRatePlan: (ratePlanId: number) => Promise<void>;
  showRatePlanDialog: { show: boolean; mode: "create" | "update" };
  handleRatePlanDialog: (show: boolean, mode: "create" | "update") => void;
  showMappingDialog: { show: boolean; mode: "create" | "update" };
  handleMappingDialog: (show: boolean, mode: "create" | "update") => void;
  showCreateEventDialog: boolean;
  handleCreateEventDialog: (show: boolean) => void;
  createDialogPosition: { top: number; left: number } | null;
  setCreateDialogPosition: React.Dispatch<
    React.SetStateAction<{ top: number; left: number } | null>
  >;
  showPriceVersionDialog: {
    show: boolean;
    mode: "version" | "price";
    type: "create" | "update";
  };
  handlePriceVersionDialog: (
    show: boolean,
    mode: "version" | "price",
    type: "create" | "update",
    date: PriceDetail | null
  ) => void;
  showEditDateDialog: boolean;
  handleEditDateDialog: (
    show: boolean,
    priceVersion: PriceDetail | null
  ) => void;
  showEditPriceDialog: boolean;
  handleEditPriceDialog: (show: boolean, priceId: number | null) => void;
  showDeleteConfirm: {
    show: boolean;
    deleteType: DeleteSubscriptionTypeKey | null;
  };
  setShowDeleteConfirm: (value: {
    show: boolean;
    deleteType: DeleteSubscriptionTypeKey | null;
  }) => void;
  handleDeleteDialog: (
    show: boolean,
    id: number | null,
    deleteType?: DeleteSubscriptionTypeKey
  ) => void;
  onConfirmDelete: (
    deleteType: DeleteSubscriptionTypeKey,
    offerVerId?: number,
    eventId?: number,
    priceVerId?: number,
    subBalTypeId?: number
  ) => void;
  selectedPrice: number | null;
  setSelectedPrice: (priceId: number | null) => void;
  selectedRatePlan: number | null;
  setSelectedRatePlan: (ratePlanId: number | null) => void;
  selectedPriceVer: PriceDetail | null;
  setSelectedPriceVer: (value: PriceDetail | null) => void;
  selectedMapping: number | null;
  setSelectedMapping: (value: number | null) => void;
  selectedEvent: number | null;
  setSelectedEvent: (event: number | null) => void;
  selectedDelete: number | null;
  setSelectedDelete: (id: number | null) => void;
  priceVersionDate: PriceDetail | null;
  setPriceVersionDate: (priceVersion: PriceDetail | null) => void;
  formatedValue: (val: number | undefined) => string | undefined;
}

const initialProps: ContextProps = {
  events: [],
  ratePlans: [],
  ratingLists: {},
  loadingVersions: {},
  accumulationLists: {},
  loadingAccumulation: {},
  benefitLists: {},
  loadingBenefit: {},
  mappingRatingLists: {},
  loadingMappingRating: {},
  doGetListEvent: () => {},
  doGetListRatePlan: async () => {},
  fetchVersionsRatingForRatePlan: async () => {},
  fetchVersionsAccumulationForRatePlan: async () => {},
  fetchVersionsBenefitForRatePlan: async () => {},
  fetchMappingRatingForRatePlan: async () => {},
  showRatePlanDialog: { show: false, mode: "create" },
  handleRatePlanDialog: () => {},
  showMappingDialog: { show: false, mode: "create" },
  handleMappingDialog: () => {},
  showCreateEventDialog: false,
  handleCreateEventDialog: () => {},
  createDialogPosition: null,
  setCreateDialogPosition: () => {},
  showPriceVersionDialog: { show: false, mode: "version", type: "create" },
  handlePriceVersionDialog: () => {},
  showEditDateDialog: false,
  handleEditDateDialog: () => {},
  showEditPriceDialog: false,
  handleEditPriceDialog: () => {},
  showDeleteConfirm: {
    show: false,
    deleteType: null,
  },
  setShowDeleteConfirm: () => {},
  handleDeleteDialog: () => {},
  onConfirmDelete: () => {},
  selectedPrice: null,
  setSelectedPrice: () => {},
  selectedRatePlan: null,
  setSelectedRatePlan: () => {},
  selectedMapping: null,
  setSelectedMapping: () => {},
  selectedPriceVer: null,
  setSelectedPriceVer: () => {},
  selectedEvent: null,
  setSelectedEvent: () => {},
  selectedDelete: null,
  setSelectedDelete: () => {},
  priceVersionDate: null,
  setPriceVersionDate: () => {},
  formatedValue: () => "",
};

const API_URL = apiConfig.service_price_plan;
const SubscriptionCreateContext = createContext<ContextProps>(initialProps);

const SubscriptionPriceCreateContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { dataPricePlan, dataPricePlanDetail, selectedOfferVerId } = usePortalData();
  const { PostData, GetData, DeleteData } = useCallApi();
  const [activeStep, setActiveStep] = useState("event");
  const [createDialogPosition, setCreateDialogPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [showRatePlanDialog, setShowRatePlanDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });
  const [showMappingDialog, setShowMappingDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });
  const [showPriceVersionDialog, setShowPriceVersionDialog] = useState<{
    show: boolean;
    mode: "version" | "price";
    type: "create" | "update";
  }>({ show: false, mode: "version", type: "create" });
  const [showEditDateDialog, setShowEditDateDialog] = useState(false);
  const [showEditPriceDialog, setShowEditPriceDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteSubscriptionTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });

  const [selectedRatePlan, setSelectedRatePlan] = useState<number | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<number | null>(null);
  const [selectedPriceVer, setSelectedPriceVer] = useState<PriceDetail | null>(
    null
  );
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedDelete, setSelectedDelete] = useState<number | null>(null);

  const [events, setEvents] = useState<Events[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlans[]>([]);

  const [ratingLists, setRatingLists] = useState<Record<number, PriceDetail[]>>(
    {}
  );
  const [loadingVersions, setLoadingVersions] = useState<
    Record<number, boolean>
  >({});

  const [accumulationLists, setAccumulationLists] = useState<
    Record<number, AccumulationVersion[]>
  >({});
  const [loadingAccumulation, setLoadingAccumulation] = useState<
    Record<number, boolean>
  >({});

  const [benefitLists, setBenefitLists] = useState<
    Record<number, SubscriptionBenefitDetail[]>
  >({});
  const [loadingBenefit, setLoadingBenefit] = useState<Record<number, boolean>>(
    {}
  );

  const [mappingRatingLists, setMappingRatingLists] = useState<
    Record<number, MappingDetail[]>
  >({});
  const [loadingMappingRating, setLoadingMappingRating] = useState<
    Record<number, boolean>
  >({});

  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [priceVersionDate, setPriceVersionDate] = useState<PriceDetail | null>(
    null
  );
  const [ratePlanType, setRatePlanType] = useState<string | null>(null);
  const [ratePlanId, setRatePlanId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleRatePlanDialog = (show: boolean, mode: "create" | "update") => {
    setShowRatePlanDialog({ show, mode });
  };

  const handleMappingDialog = (show: boolean, mode: "create" | "update") => {
    setShowMappingDialog({ show, mode });
  };

  const handleCreateEventDialog = (show: boolean) => {
    setShowCreateEventDialog(show);
  };

  const handlePriceVersionDialog = (
    show: boolean,
    mode: "version" | "price",
    type: "create" | "update",
    date: PriceDetail | null
  ) => {
    setShowPriceVersionDialog({ show, mode, type });
    setPriceVersionDate(show ? date : null);
  };

  const handleEditDateDialog = (
    show: boolean,
    priceVersion: PriceDetail | null
  ) => {
    setShowEditDateDialog(show);
    setSelectedPriceVer(show ? priceVersion : null);
  };

  const handleEditPriceDialog = (show: boolean, priceId: number | null) => {
    setShowEditPriceDialog(show);
    setSelectedPrice(show ? priceId : null);
  };

  const handleDeleteDialog = (
    show: boolean,
    id: number | null,
    deleteType: DeleteSubscriptionTypeKey = "priceRating"
  ) => {
    setShowDeleteConfirm({
      show,
      deleteType: show ? deleteType : null,
    });
    setSelectedDelete(show ? id : null);
  };

  const fetchVersionsRatingForRatePlan = useCallback(
    async (ratePlanId: number, mappingId: number | null) => {
      if (!ratePlanId) {
        return;
      }

      try {
        setLoadingVersions((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: true,
        }));

        const url = mappingId
          ? `${API_URL}/price/rating/list?ratePlanId=${ratePlanId}&mappingId=${mappingId}`
          : `${API_URL}/price/rating/list?ratePlanId=${ratePlanId}`;

        const response = await GetData(url, {});

        setRatingLists((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: response?.data || [],
        }));
      } catch (error) {
        console.error(
          `Error loading versions for rate plan ${ratePlanId}:`,
          error
        );
        toast.error("Error loading Price Version data");

        setRatingLists((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: [],
        }));
      } finally {
        setLoadingVersions((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: false,
        }));
      }
    },
    [GetData]
  );

  const formatedValue = (val: number | undefined) => {
    if (val === null || val === undefined) return;

    const stringVal = val?.toString();

    const raw = stringVal?.replace("-", "");

    const amount = Number(raw) / 100000;
    const finalAmount = amount.toLocaleString("en-US", {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    });

    return finalAmount;
  };

  const fetchVersionsAccumulationForRatePlan = useCallback(
    async (ratePlanId: number, mappingId: number | null) => {
      if (!ratePlanId) {
        return;
      }

      try {
        setLoadingAccumulation((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: true,
        }));

        const url = mappingId
          ? `${API_URL}/price/accumulation/list?ratePlanId=${ratePlanId}&mappingId=${mappingId}`
          : `${API_URL}/price/accumulation/list?ratePlanId=${ratePlanId}`;

        const response = await GetData(url, {});

        setAccumulationLists((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: response?.data || [],
        }));
      } catch (error) {
        console.error(
          `Error loading versions for rate plan ${ratePlanId}:`,
          error
        );
        toast.error("Error loading Price Version data");

        setAccumulationLists((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: [],
        }));
      } finally {
        setLoadingAccumulation((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: false,
        }));
      }
    },
    [GetData]
  );

  const fetchVersionsBenefitForRatePlan = useCallback(
    async (ratePlanId: number, mappingId: number | null) => {
      if (!ratePlanId) {
        return;
      }

      try {
        setLoadingBenefit((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: true,
        }));

        const url = mappingId
          ? `${API_URL}/price/benefit/list?ratePlanId=${ratePlanId}&mappingId=${mappingId}`
          : `${API_URL}/price/benefit/list?ratePlanId=${ratePlanId}`;

        const response = await GetData(url, {});

        setBenefitLists((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: response?.data || [],
        }));
      } catch (error) {
        console.error(
          `Error loading versions for rate plan ${ratePlanId}:`,
          error
        );
        toast.error("Error loading Price Version data");

        setBenefitLists((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: [],
        }));
      } finally {
        setLoadingBenefit((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: false,
        }));
      }
    },
    [GetData]
  );

  const fetchMappingRatingForRatePlan = useCallback(
    async (ratePlanId: number) => {
      try {
        setLoadingMappingRating((prev) => ({
          ...prev,
          [ratePlanId]: true,
        }));

        const response = await GetData(`${API_URL}/mapping/list`, {
          ratePlanId,
        });

        setMappingRatingLists((prev) => ({
          ...prev,
          [ratePlanId]: response?.data || [],
        }));
      } catch (error) {
        console.error(
          `Error loading versions for rate plan ${ratePlanId}:`,
          error
        );
        toast.error("Error loading Price Version data");

        setMappingRatingLists((prev) => ({
          ...prev,
          [ratePlanId]: [],
        }));
      } finally {
        setLoadingMappingRating((prev) => ({
          ...prev,
          [ratePlanId]: false,
        }));
      }
    },
    [GetData]
  );

  const onConfirmDelete = async (
    deleteType: DeleteSubscriptionTypeKey,
    offerVerId?: number,
    eventId?: number,
    priceVerId?: number,
    subBalTypeId?: number
  ) => {
    const itemId = selectedDelete;

    if (!itemId) {
      toast.error("No item selected for deletion");
      return;
    }

    setIsLoading(true);
    try {
      let endpoint = "";
      let successMessage = "";
      let requestBody: any = null;

      switch (deleteType) {
        case "ratePlan":
          endpoint = `${API_URL}/rate-plan/delete/${itemId}`;
          successMessage = "Rate Plan deleted successfully";
          break;

        case "event":
          endpoint = `${API_URL}/event/delete?offerVerId=${offerVerId}&usageEventId=${eventId || itemId}`;
          successMessage = "Event deleted successfully";
          break;

        case "priceRating":
          endpoint = `${API_URL}/price/delete?priceId=${itemId}&priceVerId=${selectedPriceVer?.priceVerId}&reType/3`;
          successMessage = "Price deleted successfully";
          break;

        case "priceAccumulation":
          endpoint = `${API_URL}/price-version/delete/acm/${itemId}/${priceVerId}`;
          successMessage = "Accumulation deleted successfully";
          break;

        case "priceBenefit":
          endpoint = `${API_URL}/price/benefit/delete?priceId=${itemId}&priceVerId=${priceVerId}&subBalTypeId=${subBalTypeId}`;
          successMessage = "Benefit deleted successfully";
          break;

        case "mappingRating":
          endpoint = `${API_URL}/mapping/${itemId}`;
          successMessage = "Mapping deleted successfully";
          break;

        default:
          throw new Error("Invalid delete type");
      }

      const response = await DeleteData(endpoint, requestBody);
      if (response?.status) {
        toast.success(successMessage);

        if (deleteType === "event") {
          await doGetListEvent();
        } else if (deleteType === "ratePlan" && selectedEvent) {
          await doGetListRatePlan(selectedEvent);
          // setRatingLists({});
          // setLoadingVersions({});
        } else if (deleteType === "priceRating" && selectedRatePlan) {
          await fetchVersionsRatingForRatePlan(
            selectedRatePlan,
            selectedMapping
          );
        } else if (deleteType === "priceBenefit" && selectedRatePlan) {
          await fetchVersionsBenefitForRatePlan(
            selectedRatePlan,
            selectedMapping
          );
        } else if (deleteType === "priceAccumulation" && selectedRatePlan) {
          await fetchVersionsAccumulationForRatePlan(
            selectedRatePlan,
            selectedMapping
          );
        } else if (
          deleteType === "mappingRating" &&
          selectedRatePlan &&
          selectedMapping
        ) {
          await fetchMappingRatingForRatePlan(selectedRatePlan);
        }
      } else {
        throw new Error(response?.message || "Failed to delete item");
      }
    } catch (error: any) {
      console.error(`Error deleting ${deleteType}:`, error);
      toast.error(error.message || `Failed to delete ${deleteType}`);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm({ show: false, deleteType: null });
      setSelectedDelete(null);
      setPriceVersionDate(null);
      setSelectedPriceVer(null);
      setSelectedPrice(null);
    }
  };

  const doGetListEvent = useCallback(async () => {
  if (!selectedOfferVerId) return;

  try {
    const response = await GetData(`${API_URL}/event/list`, {
      offerVerId: selectedOfferVerId,
      reType: 3,
    });

    setEvents(response?.data || []);
  } catch (error) {
    toast.error("Error loading Subscription Event data");
  }
}, [selectedOfferVerId, GetData]);

useEffect(() => {
  if (!selectedOfferVerId) return;

  doGetListEvent();
}, [selectedOfferVerId, doGetListEvent]);

  const doGetListRatePlan = useCallback(
    async (eventId: number) => {
      try {
        const response = await GetData(`${API_URL}/rate-plan/list`, {
          offerVerId: selectedOfferVerId,
          reId: eventId,
        });

        setRatePlans(response?.data || []);
        // Clear version lists when switching events
        setRatingLists({});
        setLoadingVersions({});
      } catch (error) {
        toast.error("Error loading Rate Plan data");
      }
    },
    [selectedOfferVerId, GetData]
  );

  const steps = [
    {
      key: "event",
      label: "Event",
      icon: <FaFileAlt />,
      onClick: () => handleCreateEventDialog(!showCreateEventDialog),
    },
    {
      key: "ratePlan",
      label: "Rate Plan",
      icon: <FaDollarSign />,
      onClick: () => console.log("Rate Plan Clicked"),
    },
    {
      key: "price",
      label: "Price",
      icon: <FaDollarSign />,
      onClick: () => console.log("Price Clicked"),
    },
  ];

  useEffect(() => {
    doGetListEvent();
  }, [doGetListEvent]);

  const hasEventData = events && events.length > 0;

  return (
    <SubscriptionCreateContext.Provider
      value={{
        events,
        ratePlans,
        ratingLists,
        loadingVersions,
        accumulationLists,
        loadingAccumulation,
        benefitLists,
        loadingBenefit,
        mappingRatingLists,
        loadingMappingRating,
        doGetListEvent,
        doGetListRatePlan,
        fetchVersionsRatingForRatePlan,
        fetchVersionsAccumulationForRatePlan,
        fetchVersionsBenefitForRatePlan,
        fetchMappingRatingForRatePlan,
        showRatePlanDialog,
        handleRatePlanDialog,
        showMappingDialog,
        handleMappingDialog,
        showCreateEventDialog,
        handleCreateEventDialog,
        createDialogPosition,
        setCreateDialogPosition,
        showPriceVersionDialog,
        handlePriceVersionDialog,
        showEditDateDialog,
        handleEditDateDialog,
        showEditPriceDialog,
        handleEditPriceDialog,
        showDeleteConfirm,
        setShowDeleteConfirm,
        handleDeleteDialog,
        onConfirmDelete,
        selectedPrice,
        setSelectedPrice,
        selectedRatePlan,
        setSelectedRatePlan,
        selectedMapping,
        setSelectedMapping,
        selectedPriceVer,
        setSelectedPriceVer,
        selectedEvent,
        setSelectedEvent,
        selectedDelete,
        setSelectedDelete,
        priceVersionDate,
        setPriceVersionDate,
        formatedValue
      }}
    >
      <Toaster expand visibleToasts={9} duration={3000} />
      <AccumulationContextProvider>
        <BenefitContextProvider>
          {!hasEventData ? (
            <div className="flex justify-center items-center space-x-6 mt-8">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center relative">
                    <button
                      onClick={step.onClick}
                      className={`w-20 h-20 rounded-full flex items-center justify-center border-4 relative ${
                        activeStep === step.key
                          ? "bg-yellow-400 border-yellow-400 text-white"
                          : "bg-white border-gray-300 text-gray-500"
                      }`}
                    >
                      {step.icon}

                      {step.key === "event" && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs">
                          <FaPlus />
                        </span>
                      )}
                    </button>

                    <span
                      className={`mt-2 text-sm ${
                        activeStep === step.key
                          ? "text-yellow-500 font-medium"
                          : "text-slate-800"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="w-10 h-1 bg-gray-200 mx-4 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EventList />
          )}
          <EditDateDialog />
        </BenefitContextProvider>
      </AccumulationContextProvider>

      <EditPriceDialog />
      {children}
    </SubscriptionCreateContext.Provider>
  );
};

export { SubscriptionCreateContext, SubscriptionPriceCreateContextProvider };
