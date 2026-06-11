import React, { createContext, useCallback, useEffect, useState } from "react";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { FaFileAlt, FaDollarSign, FaPlus } from "react-icons/fa";
import CreateEventDialog from "../blocks/CreateEventDialog";
import EventList from "../blocks/EventList";
import AddRatePlanDialog from "../blocks/rate-plan/AddRatePlanDialog";
import { PricePlanService } from "@/common/api/price-plan/endpoints";

interface ContextProps {
  getEventList: () => void;
  getRatePlans: (event: number) => void;
  offerId: number;
  showCreateEventDialog: boolean;
  eventList: Events[];
  ratePlans: RatePlans[];
  acctType: AcctTypeNameProps[];
  selectedEvent: number | null;
  setSelectedEvent: (event: number | null) => void;
  handleAddDialog: (show: boolean) => void;
  showAddDialog: boolean;
  handleAddEventDialog: (show: boolean) => void;
  handleAddMapping: (show: boolean) => void;
  getAcctType: () => void;
  getReAttr: () => void;
  priceVersionsMap: Record<number, Price[]>;
  getPriceVersion: (
    ratePlan: number | null,
    mappingId: number | null,
  ) => Promise<void>;
  reAttr: ReAttrProps[];
  selectedRatePlan: number | null;
  setSelectedRatePlan: (ratePlan: number | null) => void;
  selectedMapping: number | null;
  setSelectedMapping: (mappingId: number | null) => void;
  isLoading: boolean;
  // Tambahkan state untuk tracking price plan detail
  pricePlanDetailLoaded: boolean;
  // Tambahkan fetchedPricePlanDetail ke context
  getAccumulationList: (
    ratePlanId: number,
    mappingId: number | null,
  ) => Promise<void>;
  accumulation: AccumulationProps[];
  accumulationMap: Record<number, AccumulationProps[]>;
  benefitMap: Record<number, Benefit[]>;
  getBenefitList: (
    ratePlanId: number | null,
    mappingId: number | null,
  ) => Promise<void>;
  showAddMappingDialog: boolean;
  mappingZonesMap: Record<number, MappingZone[]>;
  getMappingZone: (ratePlanId: number) => Promise<void>;
  showReservationRules: boolean;
  setShowReservationRules: (show: boolean) => void;
  handleReservationRulesDialog: (show: boolean) => void;
  formatedValue: (val: number | undefined, from?: "default" | "historical" | "preBalAndTotal") => string | undefined;

}

const initialProps: ContextProps = {
  getRatePlans: () => {},
  showAddMappingDialog: false,
  selectedMapping: null,
  setSelectedMapping: () => {},
  getEventList: () => {},
  offerId: 0,
  showCreateEventDialog: false,
  eventList: [],
  acctType: [],
  selectedEvent: null,
  setSelectedEvent: () => {},
  ratePlans: [],
  priceVersionsMap: {},
  getAcctType: () => {},
  getReAttr: () => {},
  getPriceVersion: async () => {},
  reAttr: [],
  selectedRatePlan: null,
  setSelectedRatePlan: () => {},
  handleAddDialog: () => {},
  handleAddMapping: () => {},
  showAddDialog: false,
  handleAddEventDialog: () => {},
  isLoading: false,
  pricePlanDetailLoaded: false,
  getAccumulationList: async () => {},
  accumulation: [],
  accumulationMap: {},
  benefitMap: {},
  getBenefitList: async () => {},
  mappingZonesMap: {},
  getMappingZone: async () => {},
  setShowReservationRules: () => {},
  showReservationRules: false,
  handleReservationRulesDialog: () => {},
  formatedValue: () => undefined,
};

const API_URL = apiConfig.service_assets;
const API_URL_PRICE_PLAN = apiConfig.service_price_plan;
const UsagePriceCreateContext = createContext<ContextProps>(initialProps);

interface ReIDArray {
  reId: number[];
}

const initialState: {
  offerVerId: number;
  usageEventRequestDto: ReIDArray;
} = {
  offerVerId: 0,
  usageEventRequestDto: {
    reId: [],
  },
};

interface OfferVer {
  offerVerId: number;
  effDate: string;
  expDate: string;
}

interface Benefit {
  priceId: number;
  priceName: string;
  priceVerId: number;
  subBalTypeId: number;
  priority: number;
  scriptPage: string | null;
  value: number;
  configType: string | null;
  reAttr: number | null;
  reAttrName: string;
  rum: number;
  calcPrecision: number;
  ruleScript: string | null;
  ruleComments: string | null;
  scriptTempletId: number | null;
  repeatCnt: number | null;
  periodId: number;
  acctResId: number;
  isCurrency: string;
  acctResName: string;
  offsetOfEffectiveDateUnit: string | null;
  durationOfAvailabilityUnit: string | null;
  relEffUnitName: string | null;
  relExpUnitName: string | null;
  effectiveDate: string;
  expiryDate: string;
  shareFlag: string;
  ratePlanId: number;
  ratePlanType: number;
  offerVerId: number;
  mappingId: number;
}
interface AccumulationProps {
  value: number;
  mappingId: number;
  priceId: number;
  resourceId: number;
  resourceName: string;
  reAttr: number;
  reAttrName: string;
  offerVerId: number;
  shareFlag: string;
  comments: string;
  effDate: string;
  expDate: string;
  scPriceId: number;
  ratePlanType: number;
  acmName: string;
  priceVerId: number;
  ratePlanId: number;
  rum: number;
  refValueId: number;
  accumulation: string;
}
interface MappingZone {
  mappingId: number;
  mappingName: string;
  priority: number;
}
const UsagePriceCreateContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { PostData, GetData } = useCallApi();
  const { GET_REATTR } = PricePlanService();

  const [priceVersionsMap, setPriceVersionsMap] = useState<
    Record<number, Price[]>
  >({});

  const [accumulationMap, setAccumulationMap] = useState<
    Record<number, AccumulationProps[]>
  >({});

  const [benefitMap, setBenefitMap] = useState<Record<number, Benefit[]>>({});
  const [showReservationRules, setShowReservationRules] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pricePlanDetailLoaded, setPricePlanDetailLoaded] = useState(false);
  const { dataPricePlan, dataPricePlanDetail, selectedOfferVerId } = usePortalData();
  const offerId = dataPricePlan?.pricePlanId;
  const [loadingTable, setLoadingTable] = useState(false);
  const [eventList, setEventList] = useState<Events[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlans[]>([]);
  const [acctType, setAcctType] = useState<AcctTypeNameProps[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [selectedRatePlan, setSelectedRatePlan] = useState<number | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<number | null>(null);
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
  const [reAttr, setReAttr] = useState<ReAttrProps[]>([]);
  const [accumulation, setAccumulation] = useState<AccumulationProps[]>([]);
  // State untuk menyimpan dataPricePlanDetail yang sudah di-fetch
  const [showAddMappingDialog, setShowAddMappingDialog] = useState(false);
  
  const formatedValue = (
    val: number | undefined,
    from?: "default" | "historical" | "preBalAndTotal",
  ) => {
    if (val === null && val === undefined) return;

    const stringVal = val?.toString();

    const raw = stringVal?.replace("-", "");

    const amount = Number(raw) / 100000;
    const finalAmount = amount.toLocaleString("en-US", {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    });

    if (from === "historical") {
      if (!val) return finalAmount;

      if (val > 0) return `Decrease ${finalAmount}`;
      if (val < 0) return `Increase ${finalAmount}`;
    }

    if (from === "preBalAndTotal")
      return `${!val ? "" : "Credit"} ${finalAmount}`;

    return finalAmount;
  };

  const handleReservationRulesDialog = (show: boolean) => {
    setShowReservationRules(show);
  };
  const handleAddDialog = (show: boolean) => {
    setShowAddDialog(show);
  };

  const handleAddMapping = (show: boolean) => {
    setShowAddMappingDialog(show);
  };

  const handleAddEventDialog = (show: boolean) => {
    setShowCreateEventDialog(show);
  };
  const [activeStep, setActiveStep] = useState("event");
  const [mappingZonesMap, setMappingZonesMap] = useState<
    Record<number, MappingZone[]>
  >({});

  const getMappingZone = useCallback(
    async (ratePlanId: number) => {
      try {
        const response = await GetData(`${API_URL_PRICE_PLAN}/mapping/list`, {
          ratePlanId,
        });
        setMappingZonesMap((prev) => ({
          ...prev,
          [ratePlanId]: response?.data || [],
        }));
      } catch (error) {
        console.error("Failed to fetch mapping zone", error);
      }
    },
    [GetData],
  );

  const getEventList = useCallback(async () => {
    if (!selectedOfferVerId) {
      // console.log("Price plan detail not available for event list");
      return null;
    }

    setIsLoading(true);
    try {
      const response = await GetData(`${API_URL_PRICE_PLAN}/event/list`, {
        offerVerId: selectedOfferVerId,
        reType: 1,
      });

      // console.log("response event", response);
      if (response && response.data) {
        setEventList(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      // console.error("Error fetching event list:", error);
      toast.error("Failed to fetch event list");
      return null;
    } finally {
      setIsLoading(false);
      setLoadingTable(false);
    }
  }, [selectedOfferVerId]);

  const getRatePlans = useCallback(
    async (event: number) => {
      if (!selectedOfferVerId) {
        return;
      }

      try {
        const response = await GetData(`${API_URL_PRICE_PLAN}/rate-plan/list`, {
          offerVerId: selectedOfferVerId,
          reId: event,
        });
        setRatePlans(response?.data || []);
      } catch (error) {
        toast.error("Error loading Rate Plan data");
      }
    },
    [dataPricePlanDetail, selectedOfferVerId],
  );
  // console.log("ratePlans", ratePlans);

  const getAcctType = useCallback(async () => {
    try {
      const response = await GetData(
        `${API_URL_PRICE_PLAN}/account-item-type/name/list`,
        { page: 1, size: 50, sortBy: "BAL_TYPE", sortDirection: "asc", spId: 0 },
      );

      setAcctType(response.data);
      return {
        data: response?.data || [],
        totalCount: response?.totalRows || 0,
      };
    } catch (error) {
      console.error("Error fetching Balance Type", error);
      toast.error("Error Fetching Data. Please Check Your Connection!");
    }
  }, [GetData]);

  const getReAttr = useCallback(async () => {
    try {
      const response = await GET_REATTR();
      setReAttr(response?.data || []);
    } catch (error) {
      console.error("Error fetching reattr:", error);
      return null;
    } finally {
      setLoadingTable(false);
    }
  }, [GetData]);

  const getPriceVersion = useCallback(
    async (ratePlanId: number | null, mappingId: number | null) => {
      if (!ratePlanId) return;

      try {
        const url = mappingId
          ? `${API_URL_PRICE_PLAN}/price/rating/list?ratePlanId=${ratePlanId}&mappingId=${mappingId}`
          : `${API_URL_PRICE_PLAN}/price/rating/list?ratePlanId=${ratePlanId}`;

        const response = await GetData(url, {});
        const flatPrices: Price[] = response?.data || [];

        setPriceVersionsMap((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: flatPrices,
        }));
      } catch (error) {
        console.error("Error fetching price version:", error);
        setPriceVersionsMap((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: [],
        }));
      }
    },
    [GetData],
  );

  useEffect(() => {
    if (selectedOfferVerId !== undefined && selectedOfferVerId !== null) {
      getEventList();
    }
  }, [selectedOfferVerId]);

  useEffect(() => {
    if (selectedEvent && pricePlanDetailLoaded) {
      getRatePlans(selectedEvent);
    } else {
      setRatePlans([]);
    }
  }, [selectedEvent, pricePlanDetailLoaded, getRatePlans]);

  useEffect(() => {
    getAcctType();
    getReAttr();
  }, [getAcctType, getReAttr]);

  const getAccumulationList = useCallback(
    async (ratePlanId: number, mappingId: number | null) => {
      if (!ratePlanId) {
        return;
      }

      const url = mappingId
        ? `${API_URL_PRICE_PLAN}/price/accumulation/list?ratePlanId=${ratePlanId}&mappingId=${mappingId}`
        : `${API_URL_PRICE_PLAN}/price/accumulation/list?ratePlanId=${ratePlanId}`;

      try {
        const response = await GetData(url, {});

        setAccumulationMap((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: response?.data || [],
        }));
      } catch (error) {
        console.error("Error fetching price version:", error);
        setAccumulationMap((prev) => ({
          ...prev,
          [ratePlanId]: [],
        }));
      }
    },
    [GetData],
  );

  const getBenefitList = useCallback(
    async (ratePlanId: number | null, mappingId: number | null) => {
      if (!ratePlanId) return;

      const url = mappingId
        ? `${API_URL_PRICE_PLAN}/price/benefit/list?ratePlanId=${ratePlanId}&mappingId=${mappingId}`
        : `${API_URL_PRICE_PLAN}/price/benefit/list?ratePlanId=${ratePlanId}`;
      try {
        const response = await GetData(url, {});
        setBenefitMap((prev) => ({
          ...prev,
          [mappingId || ratePlanId]: response?.data || [],
        }));
      } catch (error) {
        console.error("Error fetching benefit price version:", error);
        setBenefitMap((prev) => ({
          ...prev,
          [ratePlanId]: [],
        }));
      }
    },
    [GetData],
  );

  const isInitialLoading = isLoading && !pricePlanDetailLoaded;
  const hasEventData = eventList && eventList.length > 0;

  const steps = [
    {
      key: "event",
      label: "Event",
      icon: <FaFileAlt />,
      onClick: () => handleAddEventDialog(true),
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

  return (
    <>
      <UsagePriceCreateContext.Provider
        value={{
          selectedMapping,
          setSelectedMapping,
          eventList,
          ratePlans,
          selectedEvent,
          setSelectedEvent,
          getEventList,
          offerId,
          selectedRatePlan,
          setSelectedRatePlan,
          reAttr,
          handleAddMapping,
          getAcctType,
          getReAttr,
          acctType,
          getRatePlans,
          showCreateEventDialog,
          handleAddDialog,
          showAddDialog,
          handleAddEventDialog,
          priceVersionsMap,
          getPriceVersion,
          isLoading,
          pricePlanDetailLoaded,
          getAccumulationList,
          accumulation,
          accumulationMap,
          benefitMap,
          getBenefitList,
          showAddMappingDialog,
          getMappingZone,
          mappingZonesMap,
          setShowReservationRules,
          showReservationRules,
          handleReservationRulesDialog,
          formatedValue
        }}
      >
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
        {showCreateEventDialog && (
          <CreateEventDialog
            onClose={() => handleAddEventDialog(false)}
            onCreateSuccess={() => {
              getEventList();
              handleAddEventDialog(false);
            }}
          />
        )}
        <AddRatePlanDialog />
      </UsagePriceCreateContext.Provider>
    </>
  );
};

export { UsagePriceCreateContext, UsagePriceCreateContextProvider };
