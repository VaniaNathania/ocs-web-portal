import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import EventSideBar from "../component/EventSideBar";
import ListToolbar from "../blocks/ListToolbar";
import { apiConfigOffer, apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { initialFormUsage } from "../schema/eventSchemaType";
import {
  menuAccess,
  useRoleCheck,
} from "@/pages/main-menu/role-management/hook/useRoleCheck";

export interface DynamicFeature {
  defReAttr?: number | null;
  reId?: number;
  reAttrSrcType?: string;
  tag?: number | null;
  reAttr: number;
  dynAttrId: number;
  attrCatg: string;
  dependProdSpecId: number;
  reType: string;
  reAttrName: string;
  comments: string | null;
  measurable: string;
  attrName: string;
  reTypeName: string;
}

export interface ReUsageList {
  reId: number;
  reName: string;
  reType: string;
  comments: string | null;
  parentReId: number;
  baseTableName: string;
  reCode: string;
  reAttr: number;
  children: ReUsageList[];
}

export interface ReSubsEventList {
  reId: number;
  reType: string;
  reName: string;
  comments: string | null;
  subsEventId: number;
  prodSpecId: number;
  eventName: string;
  prodSpecName: string;
  reCode: string;
}

export interface ReserveReAttr {
  reAttr: number;
  defReAttr: number;
  reAttrName: string;
  comments: string;
  measurable: string;
  mask: string;
  lookUpScript: number;
}

interface AttrOfCatg {
  attrId: number;
  attrName: string;
}

export interface ReRecurringList {
  reType: string;
  reName: string;
  comments: string;
  recurringReTypeName: string;
  prodSpecId: number;
  reCode: string;
  reId: number;
  prodSpecName: string;
  recurringReType: string;
}

export interface DefReAttrByAll {
  reAttr: number;
  defReAttr: number;
  reAttrName: string;
  comments: string;
  measurable: string;
  reverseAttrName: string;
  getReTypeName: string;
  reAttrSrcType?: string;
  reType?: string;
}

export interface ReAttrTagByAll {
  tag: number;
  label: string;
}

export interface RumAttr {
  reAttr: number;
  reAttrName: string;
  comments: string;
  defReAttr: number;
}

export interface SubsEventList {
  reId?: number;
  subsEventId: number;
  eventName: string;
  comments: string;
  priority: number;
  stateSet: string;
}

export interface OfferType {
  offerType: string;
  offerTypeName: string;
  comments: string;
}

export interface RecurringReType {
  recurringReType: string;
  recurringReTypeName: string;
}

export interface AllPricePlan {
  pricePlanId: number;
  applyLevel: string;
  priority: number;
  pricePlanName: string;
  offerCode: string;
  saleListPrice: string;
  rentListPrice: string;
  effDate: string;
  expDate: string;
  createdDate: string;
  state: string;
  stateDate: string;
  effType: string;
  autoContinueFlag: string;
  cycleQuantity: string;
  timeUnit: string;
  duplicateFlag: string;
  comments: string;
}

type AddReAttrParams = PaginationParams & {
  reType?: string | null;
  tag?: string | null;
  defReAttr?: number | null;
  spId: number;
};

type mode = "view" | "edit" | "new";

interface ContextProps {
  data: string | null;
  setData: (value: string | null) => void;
  selectedReType: string | null;
  setSelectedReType: (item: string | null) => void;
  selectedItem: any | null;
  setSelectedItem: (item: any | null) => void;
  selectedItemDyn: DynamicFeature | null;
  setSelectedItemDyn: (item: DynamicFeature | null) => void;
  selectedItemStatic: DefReAttrByAll | null;
  setSelectedItemStatic: (item: DefReAttrByAll | null) => void;
  selectedItemTag: ReAttrTagByAll | null;
  setSelectedItemTag: (item: ReAttrTagByAll | null) => void;
  reUsageList: ReUsageList[];
  reRecurringList: ReRecurringList[];
  reSubsEventList: ReSubsEventList[];
  dynReAttrList: DynamicFeature[];
  defReAttrList: DefReAttrByAll[];
  reAttrTagList: ReAttrTagByAll[];
  subsEventList: SubsEventList[];
  rumAttr: RumAttr[];
  handleSelectedItem: (item: any) => void;
  reserveReAttr: ReserveReAttr[];
  dsTag: ReAttrTagByAll[];
  fetchAttrOfCatg: (attrCatg: string) => Promise<AttrOfCatg[] | undefined>;
  attrOfCatg: AttrOfCatg[];
  custType: AttrOfCatg[];
  fetchCustType: () => Promise<AttrOfCatg[] | undefined>;
  fetchDynReAttrList: () => Promise<DynamicFeature[] | undefined>;
  fetchReserveReAttr: () => Promise<ReserveReAttr[] | undefined>;
  acctType: AttrOfCatg[];
  recurringReType: RecurringReType[];
  fetchAcctType: () => Promise<AttrOfCatg[] | undefined>;
  fetchDefReAttrByAll: (
    params: AddReAttrParams,
  ) => Promise<{ data: DefReAttrByAll[]; totalCount: number }>;
  fetchReAttrTagByAll: (
    params: AddReAttrParams,
  ) => Promise<{ data: ReAttrTagByAll[]; totalCount: number }>;
  fetchDsTag: () => Promise<ReAttrTagByAll[] | undefined>;
  fetchRumAttr: () => Promise<RumAttr[] | undefined>;
  fetchReUsageList: () => Promise<ReUsageList[]>;
  fetchReSubsEventList: () => Promise<ReSubsEventList[] | undefined>;
  fetchSubsEventList: () => Promise<SubsEventList[] | undefined>;
  fetchOfferType: () => Promise<OfferType[] | undefined>;
  fetchRecurringReType: () => Promise<RecurringReType[] | undefined>;
  fetchReRecurringList: () => Promise<ReRecurringList[] | undefined>;
  fetchAllPricePlan: () => Promise<AllPricePlan[] | undefined>;
  offerType: OfferType[];
  allPricePlan: AllPricePlan[];
  mode: mode;
  setMode: Dispatch<SetStateAction<mode>>;
  addTrigger: any;
  setAddTrigger: Dispatch<SetStateAction<any>>;
  setReserveReAttr: Dispatch<SetStateAction<ReserveReAttr[]>>;
  handleNewUsage: () => void;
  // handleCancelUsage: () => void;
  formReset: ((values?: any) => void) | null;
  setFormReset: Dispatch<SetStateAction<(values?: any) => void>>;
  isLoading: boolean;
  menuPrivAccess: menuAccess;
}

const API_URL_REF = apiConfigRef.ref;
const API_URL_OFFER = apiConfigOffer.offer;

const EventMainListContext = createContext<ContextProps | undefined>(undefined);

const EventMainContextListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { checkMenusPriv } = useRoleCheck();
  const { GetData } = useCallApi();
  const [data, setData] = useState<string | null>(null);
  const [selectedReType, setSelectedReType] = useState<string | null>(null);
  const [reUsageList, setReUsageList] = useState<ReUsageList[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemDyn, setSelectedItemDyn] = useState<DynamicFeature | null>(
    null,
  );
  const [selectedItemStatic, setSelectedItemStatic] =
    useState<DefReAttrByAll | null>(null);
  const [selectedItemTag, setSelectedItemTag] = useState<ReAttrTagByAll | null>(
    null,
  );
  const [reRecurringList, setReRecurringList] = useState<ReRecurringList[]>([]);
  const [reSubsEventList, setReSubsEventList] = useState<ReSubsEventList[]>([]);
  const [dynReAttrList, setDynReAttrList] = useState<DynamicFeature[] | []>([]);
  const [defReAttrList, setDefReAttrList] = useState<DefReAttrByAll[] | []>([]);
  const [reAttrTagList, setReAttrTagList] = useState<ReAttrTagByAll[] | []>([]);
  const [reserveReAttr, setReserveReAttr] = useState<ReserveReAttr[]>([]);
  const [dsTag, setDsTag] = useState<ReAttrTagByAll[]>([]);
  const [attrOfCatg, setAttrOfCatg] = useState<AttrOfCatg[]>([]);
  const [custType, setCustType] = useState<AttrOfCatg[]>([]);
  const [acctType, setAcctType] = useState<AttrOfCatg[]>([]);
  const [mode, setMode] = useState<mode>("view");
  const [addTrigger, setAddTrigger] = useState({
    type: null,
    count: 0,
  });
  const [formReset, setFormReset] = useState<null | ((values?: any) => void)>(
    null,
  );
  const [rumAttr, setRumAttr] = useState<RumAttr[]>([]);
  const [subsEventList, setSubsEventList] = useState<SubsEventList[]>([]);
  const [offerType, setOfferType] = useState<OfferType[]>([]);
  const [recurringReType, setRecurringReType] = useState<RecurringReType[]>([]);
  const [allPricePlan, setAllPricePlan] = useState<AllPricePlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const menuPrivAccess: menuAccess = {
    addStatus: checkMenusPriv(
      "/main-menu/data-reference/event/EventPage",
      "addStatus",
    ),
    editStatus: checkMenusPriv(
      "/main-menu/data-reference/event/EventPage",
      "editStatus",
    ),
    deleteStatus: checkMenusPriv(
      "/main-menu/data-reference/event/EventPage",
      "deleteStatus",
    ),
    readStatus: checkMenusPriv(
      "/main-menu/data-reference/event/EventPage",
      "readStatus",
    ),
  };

  const fetchReUsageList = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-re-usage-list`,
        {
          reId: null,
          spId: 0,
        },
      );

      if (response.data) {
        setReUsageList(response.data);
        return response.data;
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReRecurringList = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-re-recurring-list`,
        {
          reId: null,
          spId: 0,
        },
      );

      if (response.data) {
        setReRecurringList(response.data);
        return response.data;
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReSubsEventList = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-re-subs-event-list`,
        {
          reId: null,
          spId: 0,
        },
      );

      if (response.data) {
        setReSubsEventList(response.data);
        return response.data;
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDynReAttrList = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-dyn-re-attr-list`,
        {
          reType: selectedReType ?? null,
          spId: -1,
        },
      );

      if (response.data) {
        setDynReAttrList(response.data);
        setSelectedItemDyn(response.data[0] ?? null);
        return response.data;
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReserveReAttr = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-reserve-re-attr`,
        {
          search: "",
          page: 1,
          size: 1000,
          sortBy: "reAttrName",
          sortDirection: "asc",
          reAttr: null,
          exclude: null,
        },
      );

      if (response.status) {
        setReserveReAttr(response.data);

        return response.data;
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttrOfCatg = async (attrCatg: string) => {
    try {
      setIsLoading(true);
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-attr-of-catg`,
        {
          search: "",
          page: 1,
          size: 1000,
          sortBy: "attrName",
          sortDirection: "asc",
          attrCatg,
        },
      );

      if (response.data) {
        setAttrOfCatg(response.data);
        return response.data;
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustType = async () => {
    try {
      setIsLoading(true);
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-cust-type-attr-for-dyn-re-attr`,
        {
          spId: -1,
        },
      );

      if (response.data) {
        setCustType(response.data);
        return response.data;
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcctType = async () => {
    try {
      setIsLoading(true);
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-acct-type-attr-for-dyn-re-attr`,
        {
          spId: -1,
        },
      );

      if (response.data) {
        setAcctType(response.data);
        return response.data;
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefReAttrByAll = async ({
    page,
    size,
    sortBy,
    sortDirection,
    search,
    reType,
    defReAttr,
    spId,
  }: AddReAttrParams) => {
    const response = await GetData(
      `${API_URL_REF}/api/event/qry-def-re-attr-by-all`,
      {
        page,
        size,
        sortBy,
        sortDirection,
        search,
        reType,
        defReAttr,
        spId,
      },
    );

    if (response.status) {
      setDefReAttrList(response?.data);
      setSelectedItemStatic(response.data[0] ?? null);
    } else {
      toast.error("Failed Get Data");
    }

    return {
      data: response?.data || [],
      totalCount: response?.totalRows || 0,
    };
  };

  const fetchDsTag = async () => {
    try {
      const response = await GetData(`${API_URL_REF}/api/event/qry-ds-tag`, {
        tag: "",
      });

      if (response.status) {
        setDsTag(response?.data);
        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchReAttrTagByAll = async ({
    page,
    size,
    sortBy,
    sortDirection,
    search,
    reType,
    tag,
    spId,
  }: AddReAttrParams) => {
    const response = await GetData(
      `${API_URL_REF}/api/event/qry-re-attr-tag-by-all`,
      {
        search,
        page,
        size,
        sortBy,
        sortDirection,
        reType,
        tag,
        spId,
      },
    );

    if (response.status) {
      setReAttrTagList(response?.data);
      setSelectedItemTag(response.data[0] ?? null);
    }

    return {
      data: response?.data || [],
      totalCount: response?.totalRows || 0,
    };
  };

  const fetchSubsEventList = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-subs-event-list`,
        {
          search: "",
          page: 1,
          size: 500,
          sortBy: "eventName",
          sortDirection: "asc",
          subsEventId: null,
        },
      );

      if (response.status) {
        setSubsEventList(response?.data);
        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchRumAttr = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/accm-type/qry-rum-attr`,
        {
          reType: "1",
          spId: -1,
        },
      );

      if (response.status) {
        setRumAttr(response?.data);
        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchOfferType = async () => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/common/qry-offer-type`,
        {},
      );

      if (response.status) {
        setOfferType(response?.data);
        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchRecurringReType = async () => {
    try {
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-recurring-re-type`,
        {},
      );

      if (response.status) {
        setRecurringReType(response?.data);
        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const fetchAllPricePlan = async () => {
    try {
      setIsLoading(true);
      const response = await GetData(
        `${API_URL_REF}/api/event/qry-all-price-plan-spec`,
        {
          search: "",
          page: 1,
          size: 500,
          sortBy: "pricePlanId",
          sortDirection: "asc",
          pricePlanTypes: ["3", "5", "7", "8"],
          pricePlanId: null,
          spId: 0,
        },
      );

      if (response.status) {
        setAllPricePlan(response?.data);
        return response.data;
      }
    } catch (err) {
      //  console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUsage = useCallback(() => {
    setMode("new");
    const defaultValues = initialFormUsage(selectedItem?.reId);

    if (formReset) {
      formReset(defaultValues);
    }
  }, [selectedItem]);

  const handleSelectedItem = (item: any) => {
    setSelectedItem(item);
  };

  useEffect(() => {
    fetchReUsageList();
    fetchReSubsEventList();
    fetchReRecurringList();
  }, []);

  useEffect(() => {
    //  console.log("RETYPE: ", selectedReType);
    fetchDynReAttrList();
    // fetchReserveReAttr();
  }, [selectedReType]);

  return (
    <EventMainListContext.Provider
      value={{
        data,
        setData,
        selectedReType,
        setSelectedReType,
        reRecurringList,
        reSubsEventList,
        reUsageList,
        dynReAttrList,
        selectedItem,
        setSelectedItem,
        handleSelectedItem,
        setSelectedItemDyn,
        selectedItemDyn,
        reserveReAttr,
        fetchAttrOfCatg,
        attrOfCatg,
        custType,
        fetchCustType,
        acctType,
        fetchAcctType,
        mode,
        setMode,
        addTrigger,
        setAddTrigger,
        handleNewUsage,
        // handleCancelUsage,
        fetchDynReAttrList,
        selectedItemStatic,
        setSelectedItemStatic,
        defReAttrList,
        fetchDefReAttrByAll,
        fetchReserveReAttr,
        setReserveReAttr,
        fetchReAttrTagByAll,
        selectedItemTag,
        setSelectedItemTag,
        reAttrTagList,
        dsTag,
        fetchDsTag,
        formReset,
        setFormReset,
        rumAttr,
        fetchRumAttr,
        fetchReUsageList,
        fetchSubsEventList,
        subsEventList,
        fetchReSubsEventList,
        fetchOfferType,
        offerType,
        fetchRecurringReType,
        recurringReType,
        fetchReRecurringList,
        fetchAllPricePlan,
        allPricePlan,
        isLoading,
        menuPrivAccess,
      }}
    >
      <div className="flex container-fixed">
        {/* Sidebar */}
        <EventSideBar />

        {/* Main Content */}
        <ListToolbar />
      </div>
    </EventMainListContext.Provider>
  );
};

export { EventMainContextListProvider, EventMainListContext };
