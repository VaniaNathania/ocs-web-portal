import { apiConfig } from "@/config/api.config";
import { DeleteSubscriptionTypeKey } from "../../subscription-price/hooks";
import { createContext, useCallback, useEffect, useState } from "react";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { useCallApi } from "@/hooks";
import { toast, Toaster } from "sonner";
import { FaDollarSign, FaFileAlt, FaPlus } from "react-icons/fa";
import EventList from "../blocks/EventList";
import { RecurringRatingContextProvider } from "../blocks/rating/hooks/RecurringRatingContext";
import EditDateDialog from "../blocks/EditDateDialog";
import {
  RecurringAcmContext,
  RecurringAcmContextProvider,
} from "../blocks/accumulation/hooks/RecurringAcmContext";
import { RecurringBenefitContextProvider } from "../blocks/benefit/hooks/RecurringBenefitContext";

export type DeleteRecurringTypeKey =
  | "event"
  | "ratePlan"
  | "priceRating"
  | "priceAccumulation"
  | "priceBenefit"
  | "mapping";

export type GroupedVersion = {
  priceVerId: number;
  effDate: string;
  expDate: string | null;
  prices: (PriceDetail | RecurringBenefitDetail)[];
};

interface ContextProps {
  events: RecurringEvents[];
  ratePlans: RatePlans[];
  ratingLists: Record<number, PriceDetail[]>;
  loadingRating: Record<number, boolean>;
  accumulationLists: Record<number, RecurringPriceAcmDetail[]>;
  loadingAccumulation: Record<number, boolean>;
  benefitLists: Record<number, RecurringBenefitDetail[]>;
  loadingBenefit: Record<number, boolean>;
  mappingLists: Record<number, MappingDetail[]>;
  loadingMappingLists: Record<number, boolean>;
  showMappingDialog: { show: boolean; mode: "create" | "update" };
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
  fetchMapping: (ratePlanId: number) => Promise<void>;
  showDeleteConfirm: {
    show: boolean;
    deleteType: DeleteRecurringTypeKey | null;
  };
  showCreateEventDialog: boolean;
  handleCreateEventDialog: (show: boolean) => void;
  showRatePlanDialog: { show: boolean; mode: "create" | "update" };
  handleRatePlanDialog: (
    show: boolean,
    dialogMode: "create" | "update"
  ) => void;
  setShowDeleteConfirm: (value: {
    show: boolean;
    deleteType: DeleteRecurringTypeKey | null;
  }) => void;
  handleDeleteDialog: (
    show: boolean,
    id: number | null,
    deleteType?: DeleteRecurringTypeKey
  ) => void;
  handleMappingDialog: (show: boolean, mode: "create" | "update") => void;
  onConfirmDelete: (
    deleteType: DeleteRecurringTypeKey,
    offerVerId?: number,
    eventId?: number,
    priceVerId?: number,
    subBalTypeId?: number
  ) => void;
  selectedDelete: number | null;
  setSelectedDelete: (id: number | null) => void;
  selectedEvent: number | null;
  setSelectedEvent: (event: number | null) => void;
  selectedRatePlan: number | null;
  setSelectedRatePlan: (ratePlanId: number | null) => void;
  selectedMapping: number | null;
  setSelectedMapping: (value: number | null) => void;
}

const initialProps: ContextProps = {
  events: [],
  ratePlans: [],
  ratingLists: {},
  loadingRating: {},
  accumulationLists: {},
  loadingAccumulation: {},
  benefitLists: {},
  loadingBenefit: {},
  mappingLists: {},
  loadingMappingLists: {},
  showMappingDialog: { show: false, mode: "create" },
  doGetListEvent: () => {},
  doGetListRatePlan: async () => {},
  fetchVersionsRatingForRatePlan: async () => {},
  fetchVersionsAccumulationForRatePlan: async () => {},
  fetchVersionsBenefitForRatePlan: async () => {},
  fetchMapping: async () => {},
  showDeleteConfirm: {
    show: false,
    deleteType: null,
  },
  showCreateEventDialog: false,
  handleCreateEventDialog: () => {},
  showRatePlanDialog: { show: false, mode: "create" },
  handleRatePlanDialog: () => {},
  handleMappingDialog: () => {},
  setShowDeleteConfirm: () => {},
  handleDeleteDialog: () => {},
  onConfirmDelete: () => {},
  selectedDelete: null,
  setSelectedDelete: () => {},
  selectedEvent: null,
  setSelectedEvent: () => {},
  selectedRatePlan: null,
  setSelectedRatePlan: () => {},
  selectedMapping: null,
  setSelectedMapping: () => {},
};

const API_URL = apiConfig.service_price_plan;
const RecurringPriceContext = createContext<ContextProps>(initialProps);

const RecurringPriceContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { selectedOfferVerId } = usePortalData();
  const { PostData, GetData, DeleteData } = useCallApi();

  const [showMappingDialog, setShowMappingDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });

  const [ratingLists, setRatingLists] = useState<Record<number, PriceDetail[]>>(
    {}
  );
  const [loadingRating, setLoadingRating] = useState<Record<number, boolean>>(
    {}
  );

  const [accumulationLists, setAccumulationLists] = useState<
    Record<number, RecurringPriceAcmDetail[]>
  >({});
  const [loadingAccumulation, setLoadingAccumulation] = useState<
    Record<number, boolean>
  >({});

  const [benefitLists, setBenefitLists] = useState<
    Record<number, RecurringBenefitDetail[]>
  >({});
  const [loadingBenefit, setLoadingBenefit] = useState<Record<number, boolean>>(
    {}
  );

  const [mappingLists, setMappingLists] = useState<
    Record<number, MappingDetail[]>
  >({});
  const [loadingMappingLists, setLoadingMappingLists] = useState<
    Record<number, boolean>
  >({});

  const [events, setEvents] = useState<RecurringEvents[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlans[]>([]);

  const [activeStep, setActiveStep] = useState("event");

  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);

  const [showRatePlanDialog, setShowRatePlanDialog] = useState<{
    show: boolean;
    mode: "create" | "update";
  }>({
    show: false,
    mode: "create",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    deleteType: DeleteRecurringTypeKey | null;
  }>({
    show: false,
    deleteType: null,
  });

  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [selectedRatePlan, setSelectedRatePlan] = useState<number | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<number | null>(null);
  const [selectedDelete, setSelectedDelete] = useState<number | null>(null);

  const handleCreateEventDialog = (show: boolean) => {
    setShowCreateEventDialog(show);
  };

  const handleRatePlanDialog = (show: boolean, mode: "create" | "update") => {
    setShowRatePlanDialog({ show, mode });
  };

  const handleMappingDialog = (show: boolean, mode: "create" | "update") => {
    setShowMappingDialog({ show, mode });
  };

  const handleDeleteDialog = (
    show: boolean,
    id: number | null,
    deleteType: DeleteRecurringTypeKey = "priceRating"
  ) => {
    setShowDeleteConfirm({
      show,
      deleteType: show ? deleteType : null,
    });
    setSelectedDelete(show ? id : null);
  };

  const fetchVersionsAccumulationForRatePlan = useCallback(
    async (ratePlanId: number, mappingId: number | null) => {
      if (!ratePlanId) return;

      const key = mappingId || ratePlanId;

      try {
        setLoadingAccumulation((prev) => ({
          ...prev,
          [key]: true,
        }));

        const url = mappingId
          ? `${API_URL}/price/accumulation/list?ratePlanId=${ratePlanId}&mappingId=${mappingId}`
          : `${API_URL}/price/accumulation/list?ratePlanId=${ratePlanId}`;

        const response = await GetData(url, {});

        const newData = response?.data;

        setAccumulationLists((prev) => {
          const oldData = prev[key] || [];
          return {
            ...prev,
            [key]:
              Array.isArray(newData) && newData.length > 0 ? newData : oldData,
          };
        });
      } catch (error) {
        console.error(
          `Error loading versions for rate plan ${ratePlanId}:`,
          error
        );
        toast.error("Error loading Price Version data");

        setAccumulationLists((prev) => ({
          ...prev,
          [key]: prev[key] || [],
        }));
      } finally {
        setLoadingAccumulation((prev) => ({
          ...prev,
          [key]: false,
        }));
      }
    },
    [GetData]
  );

  const fetchVersionsRatingForRatePlan = useCallback(
    async (ratePlanId: number, mappingId: number | null) => {
      if (!ratePlanId) {
        return;
      }

      try {
        setLoadingRating((prev) => ({
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
        setLoadingRating((prev) => ({
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

  const fetchMapping = useCallback(
    async (ratePlanId: number) => {
      try {
        setLoadingMappingLists((prev) => ({
          ...prev,
          [ratePlanId]: true,
        }));

        const response = await GetData(`${API_URL}/mapping/list`, {
          ratePlanId,
        });

        setMappingLists((prev) => ({
          ...prev,
          [ratePlanId]: response?.data || [],
        }));
      } catch (error) {
        console.error(
          `Error loading versions for rate plan ${ratePlanId}:`,
          error
        );
        toast.error("Error loading Price Version data");

        setMappingLists((prev) => ({
          ...prev,
          [ratePlanId]: [],
        }));
      } finally {
        setLoadingMappingLists((prev) => ({
          ...prev,
          [ratePlanId]: false,
        }));
      }
    },
    [GetData]
  );

  const onConfirmDelete = async (
    deleteType: DeleteRecurringTypeKey,
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

    try {
      let endpoint = "";
      let successMessage = "";
      let requestBody: any = null;

      switch (deleteType) {
        case "priceRating":
          endpoint = `${API_URL}/price/delete?priceId=${itemId}&priceVerId=${priceVerId}&reType=9`;
          successMessage = "Price deleted successfully";
          break;

        case "ratePlan":
          endpoint = `${API_URL}/rate-plan/delete/${itemId}`;
          successMessage = "Rate Plan deleted successfully";
          break;

        case "event":
          endpoint = `${API_URL}/event/delete?offerVerId=${offerVerId}&usageEventId=${eventId || itemId}`;
          successMessage = "Event deleted successfully";
          break;

        case "priceAccumulation":
          endpoint = `${API_URL}/price-version/delete/acm/${itemId}/${priceVerId}`;
          successMessage = "Accumulation deleted successfully";
          break;

        case "priceBenefit":
          endpoint = `${API_URL}/price/benefit/delete?priceId=${itemId}&priceVerId=${priceVerId}&subBalTypeId=${subBalTypeId}`;
          successMessage = "Benefit deleted successfully";
          break;

        case "mapping":
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
          // setLoadingRating({});
        } else if (deleteType === "priceRating" && selectedRatePlan) {
          await fetchVersionsRatingForRatePlan(
            selectedRatePlan,
            selectedMapping
          );
        } else if (deleteType === "priceAccumulation" && selectedRatePlan) {
          await fetchVersionsAccumulationForRatePlan(
            selectedRatePlan,
            selectedMapping
          );
        } else if (deleteType === "priceBenefit" && selectedRatePlan) {
          await fetchVersionsBenefitForRatePlan(
            selectedRatePlan,
            selectedMapping
          );
        } else if (deleteType === "mapping" && selectedRatePlan) {
          await fetchMapping(selectedRatePlan);
        }
      } else {
        toast.error(response?.message || "Failed to delete item");
      }
    } catch (error: any) {
      console.error(`Error deleting ${deleteType}:`, error);
      toast.error(error.message || `Failed to delete ${deleteType}`);
    } finally {
      setShowDeleteConfirm({ show: false, deleteType: null });
      setSelectedDelete(null);
    }
  };

  const doGetListEvent = useCallback(async () => {
    try {
      const response = await GetData(`${API_URL}/event/list`, {
        offerVerId: selectedOfferVerId,
        reType: 9,
      });

      setEvents(response?.data || []);
    } catch (error) {
      toast.error("Error loading Subscription Event data");
    }
  }, [selectedOfferVerId, GetData]);

  const doGetListRatePlan = useCallback(
    async (eventId: number) => {
      try {
        const response = await GetData(`${API_URL}/rate-plan/list`, {
          offerVerId: selectedOfferVerId,
          reId: eventId,
        });

        setRatePlans(response?.data || []);

        // setRatingLists({});
        // setLoadingRating({});
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
    <RecurringPriceContext.Provider
      value={{
        events,
        ratePlans,
        ratingLists,
        loadingRating,
        accumulationLists,
        loadingAccumulation,
        benefitLists,
        loadingBenefit,
        mappingLists,
        loadingMappingLists,
        showMappingDialog,
        handleMappingDialog,
        doGetListEvent,
        doGetListRatePlan,
        fetchVersionsRatingForRatePlan,
        fetchVersionsAccumulationForRatePlan,
        fetchVersionsBenefitForRatePlan,
        fetchMapping,
        showCreateEventDialog,
        handleCreateEventDialog,
        showRatePlanDialog,
        handleRatePlanDialog,
        showDeleteConfirm,
        setShowDeleteConfirm,
        handleDeleteDialog,
        onConfirmDelete,
        selectedDelete,
        setSelectedDelete,
        selectedEvent,
        setSelectedEvent,
        selectedRatePlan,
        setSelectedRatePlan,
        selectedMapping,
        setSelectedMapping,
      }}
    >
      <RecurringRatingContextProvider>
        <RecurringAcmContextProvider>
          <RecurringBenefitContextProvider>
            {!hasEventData ? (
              <div className="flex items-center justify-center mt-8 space-x-6">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className="relative flex flex-col items-center">
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
                          <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-yellow-400 rounded-full -top-1 -right-1">
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
                      <div className="w-10 h-1 mx-4 bg-gray-200 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EventList />
            )}
            <EditDateDialog />
            {children}
          </RecurringBenefitContextProvider>
        </RecurringAcmContextProvider>
      </RecurringRatingContextProvider>
    </RecurringPriceContext.Provider>
  );
};

export { RecurringPriceContext, RecurringPriceContextProvider };
