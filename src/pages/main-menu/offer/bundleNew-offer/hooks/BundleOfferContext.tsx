import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  BundleOfferChildParams,
  BundleQueryParentParams,
  BundleSubsPlanGrandChild,
  categorySideBarProps,
  enrichedOfferData,
  enrichedSubsPlanData,
  FormDataOfferBundle,
  OfferBundParams,
  OfferQueryParams,
} from "../types/BundleTypes";
import BundleMainSideBar from "../blocks/BundleMainSideBar";
import useApiBundleNew from "../UseApiBundle/UseApiBundleNew";
import { toast } from "sonner";

interface ContextProps {
  reloads: number;
  ShowAddSideBarBund: boolean;
  toggleSideBar: boolean;
  selectLineProd: string;
  selectServType: string;
  selectCategorySide: string | null;
  categorySideBar: categorySideBarProps[];
  selectCategorySideId: number | string | null;
  loading: boolean;
  sideBarOpen: boolean;
  highlightBundleId: string | null;
  subsPlanBundle: Record<string, BundleSubsPlanGrandChild[]>;
  selectDetailSideBarBundle: enrichedOfferData | enrichedSubsPlanData | null;
  showDetailSideBarView: boolean;
  activatedSubsItem: string | null;
  activatedSubsPlanId: number | null;
  loadPlanOffer: Record<string, boolean>;
  showSalesCatgDialog: boolean;
  showAddBundleDetail: boolean;
  detailContentBundle: FormDataOfferBundle | null;
  editModeBundDetail: boolean;
  showSubsPlanVersion: boolean;
  versionSubsplan: OfferBundParams[];
  parentBundOfferData: enrichedOfferData | null;
  refreshBundDataGrid: string;
  errorsBund: Record<string, string>;
  alertAdd: { show: boolean; message: string };
  submittAdd: boolean;
  searchSideBar: string;
  searchResultSideBar: OfferBundParams[];
  showDropDown: boolean;
  tableSearchFilterSideBar: string | null;
  searchFilterSideBar: string | null;
  parentDatasSubsPlan: enrichedSubsPlanData | null;
  prodLineOpen: boolean;
  shouldRessPagination: boolean;
  filter: string;

  resetAllFilterSideBarBund: () => void;
  setFilter: (value: string) => void;
  setShouldRessPagination: (value: boolean) => void;
  setProdLineOpen: (value: boolean) => void;
  setParentDatasSubsPlan: (value: enrichedSubsPlanData | null) => void;
  setSearchFilterSideBar: (value: string | null) => void;
  setTableSearchFilterSideBar: (value: string | null) => void;
  setShowDropDown: Dispatch<SetStateAction<boolean>>;
  setSearchResultSideBar: Dispatch<SetStateAction<OfferBundParams[]>>;
  setSearchSideBar: (value: string) => void;
  setSubmittAdd: (value: boolean) => void;
  setAlertAdd: Dispatch<SetStateAction<{ show: boolean; message: string }>>;
  setErrorsBund: Dispatch<SetStateAction<Record<string, string>>>;
  setRefreshBundDataGrid: (value: string) => void;
  setParentBundOfferData: (value: enrichedOfferData | null) => void;
  setVersionSubsPlan: (value: OfferBundParams[]) => void;
  setShowSubsPlanVersion: (value: boolean) => void;
  setEditModeBundDetail: (value: boolean) => void;
  setDetailContentBundle: (value: FormDataOfferBundle | null) => void;
  setShowAddBundleDetail: (value: boolean) => void;
  setShowSalesCatgDialog: (value: boolean) => void;
  setLoadPlanOffer: Dispatch<SetStateAction<Record<string, boolean>>>;
  setActivatedSubsPlanId: (value: number | null) => void;
  setActivatedSubsItem: (value: string | null) => void;
  setShowDetailSideBarView: (value: boolean) => void;
  setSelectDetailSideBarBundle: (
    value: enrichedOfferData | enrichedSubsPlanData | null,
  ) => void;
  setSubsPlanBundle: Dispatch<
    SetStateAction<Record<string, BundleSubsPlanGrandChild[]>>
  >;
  setHighLightBundleId: (value: string | null) => void;
  setSideBarOpen: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setSelectCategorySideId: (value: number | string | null) => void;
  setSelectCategorySide: (value: string | null) => void;
  setCategorySideBar: Dispatch<SetStateAction<categorySideBarProps[]>>;
  setSelectServType: (value: string) => void;
  setSelectLineProd: (value: string) => void;
  setShowAddSideBarBund: (show: boolean) => void;
  setReloads: (value: number) => void;
  triggerReloadBundle: () => void;
  handleDialogSideBar: (show: boolean) => void;
  handleAddDialogBundDetail: (show: boolean) => void;
  toggleSideBarOpen: () => void;
  refreshDataGridBundleKey: () => void;
  handleCategoryBundleClick: (categoryId: number, CategoryName: string) => void;
  refreshBundCategorySideBar: () => Promise<void>;
  fetchBundlesideBarParent: () => Promise<BundleQueryParentParams[]>;
  fetchBundleSideBarChild: (categoryId: number) => Promise<OfferQueryParams[]>;
  fetchBundleSideBarGrandChild: (
    offerId: number,
  ) => Promise<BundleSubsPlanGrandChild[]>;
  handleProductChange: (value: string) => void;
  fetchSearchSideBarByName: (value: string) => void;
}

const initialProps: ContextProps = {
  reloads: 0,
  ShowAddSideBarBund: false,
  toggleSideBar: true,
  selectLineProd: "",
  selectServType: "",
  categorySideBar: [],
  selectCategorySide: null,
  selectCategorySideId: null,
  loading: false,
  sideBarOpen: true,
  highlightBundleId: null,
  subsPlanBundle: {},
  selectDetailSideBarBundle: null,
  showDetailSideBarView: false,
  activatedSubsItem: null,
  activatedSubsPlanId: null,
  loadPlanOffer: {},
  showSalesCatgDialog: false,
  showAddBundleDetail: false,
  detailContentBundle: null,
  editModeBundDetail: false,
  showSubsPlanVersion: false,
  versionSubsplan: [],
  parentBundOfferData: null,
  refreshBundDataGrid: "",
  errorsBund: {},
  alertAdd: { show: false, message: "" },
  submittAdd: false,
  searchSideBar: "",
  searchResultSideBar: [],
  showDropDown: false,
  tableSearchFilterSideBar: null,
  searchFilterSideBar: null,
  parentDatasSubsPlan: null,
  prodLineOpen: false,
  shouldRessPagination: false,
  filter: "",

  resetAllFilterSideBarBund: () => {},
  fetchSearchSideBarByName: () => {},
  setFilter: () => {},
  handleProductChange: () => {},
  setShouldRessPagination: () => {},
  setProdLineOpen: () => {},
  setParentDatasSubsPlan: () => {},
  setTableSearchFilterSideBar: () => {},
  setSearchFilterSideBar: () => {},
  setShowDropDown: () => {},
  setSearchResultSideBar: () => {},
  setSearchSideBar: () => {},
  setSubmittAdd: () => {},
  setAlertAdd: () => {},
  setErrorsBund: () => {},
  fetchBundlesideBarParent: async () => [],
  fetchBundleSideBarChild: async () => [],
  fetchBundleSideBarGrandChild: async () => [] as BundleSubsPlanGrandChild[],
  refreshBundCategorySideBar: async () => {},
  refreshDataGridBundleKey: () => {},
  setRefreshBundDataGrid: () => {},
  setParentBundOfferData: () => {},
  setVersionSubsPlan: () => {},
  setShowSubsPlanVersion: () => {},
  setEditModeBundDetail: () => {},
  setDetailContentBundle: () => {},
  setShowAddBundleDetail: () => {},
  setShowSalesCatgDialog: () => {},
  setLoadPlanOffer: () => {},
  setActivatedSubsPlanId: () => {},
  setActivatedSubsItem: () => {},
  setShowDetailSideBarView: () => {},
  setSelectDetailSideBarBundle: () => {},
  setSubsPlanBundle: () => {},
  setHighLightBundleId: () => {},
  setSideBarOpen: () => {},
  setLoading: () => {},
  setSelectCategorySideId: () => {},
  setSelectCategorySide: () => {},
  setCategorySideBar: () => {},
  setSelectServType: () => {},
  setSelectLineProd: () => {},
  toggleSideBarOpen: () => {},
  setShowAddSideBarBund: () => {},
  setReloads: () => {},
  triggerReloadBundle: () => {},
  handleDialogSideBar: () => {},
  handleAddDialogBundDetail: () => {},
  handleCategoryBundleClick: () => {},
};

const BundleOfferContext = createContext<ContextProps>(initialProps);

const BundleOfferContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ShowAddSideBarBund, setShowAddSideBarBund] = useState(false);
  const [reloads, setReloads] = useState(0);
  const [toggleSideBar, setToggleSideBar] = useState(true);
  const [selectLineProd, setSelectLineProd] = useState<string>("");
  const [selectServType, setSelectServType] = useState<string>("");
  const [categorySideBar, setCategorySideBar] = useState<
    categorySideBarProps[]
  >([]);
  const [selectCategorySide, setSelectCategorySide] = useState<string | null>(
    null,
  );
  const [selectCategorySideId, setSelectCategorySideId] = useState<
    number | string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [sideBarOpen, setSideBarOpen] = useState(true);
  const [highlightBundleId, setHighLightBundleId] = useState<string | null>(
    null,
  );
  const [subsPlanBundle, setSubsPlanBundle] = useState<
    Record<string, BundleSubsPlanGrandChild[]>
  >({});
  const [selectDetailSideBarBundle, setSelectDetailSideBarBundle] = useState<
    enrichedOfferData | enrichedSubsPlanData | null
  >(null);
  const [showDetailSideBarView, setShowDetailSideBarView] = useState(false);
  const [activatedSubsItem, setActivatedSubsItem] = useState<string | null>(
    null,
  );
  const [activatedSubsPlanId, setActivatedSubsPlanId] = useState<number | null>(
    null,
  );
  const [loadPlanOffer, setLoadPlanOffer] = useState<Record<string, boolean>>(
    {},
  );
  const [showSalesCatgDialog, setShowSalesCatgDialog] = useState(false);
  const [showAddBundleDetail, setShowAddBundleDetail] = useState(false);
  const [detailContentBundle, setDetailContentBundle] =
    useState<FormDataOfferBundle | null>(null);
  const [editModeBundDetail, setEditModeBundDetail] = useState(false);
  const [showSubsPlanVersion, setShowSubsPlanVersion] = useState(false);
  const [versionSubsplan, setVersionSubsPlan] = useState<OfferBundParams[]>([]);
  const [parentBundOfferData, setParentBundOfferData] =
    useState<enrichedOfferData | null>(null);
  const [refreshBundDataGrid, setRefreshBundDataGrid] = useState<string>(
    `datagrid-${Date.now()}`,
  );
  const [errorsBund, setErrorsBund] = useState<Record<string, string>>({});
  const [alertAdd, setAlertAdd] = useState({
    show: false,
    message: "",
  });
  const [submittAdd, setSubmittAdd] = useState(false);
  const [searchSideBar, setSearchSideBar] = useState<string>("");
  const [searchResultSideBar, setSearchResultSideBar] = useState<
    OfferBundParams[]
  >([]);
  const [showDropDown, setShowDropDown] = useState(false);
  const [tableSearchFilterSideBar, setTableSearchFilterSideBar] = useState<
    string | null
  >(null);
  const [searchFilterSideBar, setSearchFilterSideBar] = useState<string | null>(
    null,
  );
  const [parentDatasSubsPlan, setParentDatasSubsPlan] =
    useState<enrichedSubsPlanData | null>(null);
  const [prodLineOpen, setProdLineOpen] = useState(false);
  const [shouldRessPagination, setShouldRessPagination] = useState(false);
  const [searByName, setSearchByName] = useState(false);
  const [filter, setFilter] = useState<string>("2");

  const {
    getOfferCategorySideParent,
    getOfferCategory,
    getBundleSubsPlanGrandChild,
    getSearchByName,
  } = useApiBundleNew();

  const handleDialogSideBar = useCallback((show: boolean) => {
    setShowAddSideBarBund(show);
  }, []);

  const handleAddDialogBundDetail = useCallback((show: boolean) => {
    //  console.log("handleAddBundleDialog:", show);
    setShowAddBundleDetail(show);
  }, []);

  const triggerReloadBundle = () => {
    setReloads((prev) => prev + 1);
  };

  const handleCategoryBundleClick = (
    categoryId: number,
    categoryName: string,
  ) => {
    setSelectCategorySide(categoryName);
    setSelectCategorySideId(String(categoryId));
    setShowDetailSideBarView(true);
    setActivatedSubsItem(categoryName);
  };

  const refreshDataGridBundleKey = useCallback(() => {
    setRefreshBundDataGrid(`datagrid-${Date.now()}`);
  }, []);

  const toggleSideBarOpen = () => setToggleSideBar(!toggleSideBar);

  const fetchBundlesideBarParent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOfferCategorySideParent({
        offerCatgClass: selectCategorySide,
        spId: 0,
        method: "qryRootCatg",
        offerCatgType: "2",
      });

      if (!response?.status) {
        throw new Error(response?.message || "Failed to Fetch category data");
      }

      const listed = response?.data?.list ?? response?.data ?? response ?? [];
      const categoryDatas = Array.isArray(listed) ? listed : [];

      setCategorySideBar(categoryDatas);
      return categoryDatas;
    } catch (error) {
      toast.error(`Unknown Error`);
      setCategorySideBar([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getOfferCategorySideParent]);

  const fetchBundleSideBarChild = async (categoryId: number) => {
    try {
      const apiParams: OfferQueryParams = {
        offerCatgClass: "A",
        spId: 0,
        method: "qryIndepProdCatgMemAndCntOfSubs",
        offerCatgType: 2,
        offerCatgId: categoryId,
        search: "",
        prodType: selectLineProd,
        servType: selectServType,
      };

      const response = await getOfferCategory(apiParams);

      if (response?.status) {
        const list = response?.data?.list ?? response?.data ?? [];
        return Array.isArray(list) ? list : [];
      }
      return [];
    } catch (error) {
      toast.error(`Error Fetching offer data for category ${categoryId}`);

      return [];
    }
  };

  const fetchBundleSideBarGrandChild = async (offerId: number) => {
    try {
      setLoadPlanOffer((prev) => ({ ...prev, [offerId]: true }));

      const response = await getBundleSubsPlanGrandChild(String(offerId));

      if (response?.status) {
        const plans = Array.isArray(response?.data)
          ? response.data
          : (response?.data?.list ?? []);
        setSubsPlanBundle((prev) => ({ ...prev, [offerId]: plans }));
        return plans;
      }
      return [];
    } catch (error) {
      console.error("ERROR fetch Subscription Plan:", error);
      return [];
    } finally {
      setLoadPlanOffer((prev) => ({ ...prev, [offerId]: false }));
    }
  };
  const refreshBundCategorySideBar = useCallback(async () => {
    try {
      await fetchBundlesideBarParent();
    } catch (error) {
      console.error("❌ Error refreshing category sidebar:", error);
    }
  }, [fetchBundlesideBarParent]);

  const handleProductChange = useCallback(
    (value: string) => {
      setSelectLineProd(value);
      setProdLineOpen(false);
      setShouldRessPagination(false);
      refreshDataGridBundleKey();
    },
    [refreshDataGridBundleKey],
  );

  const fetchSearchSideBarByName = async (value: string) => {
    if (value.trim() === "") {
      setSearchResultSideBar([]);
      setShowDropDown(false);
      return;
    }

    setSearchByName(true);
    try {
      const response = await getSearchByName(value);
      if (response?.data) {
        setSearchResultSideBar(response?.data);
        setShowDropDown(true);
      }
    } catch (error) {
      toast.error("Error Get Search Data");
    } finally {
      setSearchByName(false);
    }
  };

  const resetAllFilterSideBarBund = useCallback(() => {
    setSearchResultSideBar([]);
    setSearchSideBar("");
    setShowDropDown(false);
    setHighLightBundleId(null);
    setTableSearchFilterSideBar(null);
    setSearchFilterSideBar(null);
    setSelectLineProd("");
    setSelectServType("");
    setShouldRessPagination(true);
    refreshDataGridBundleKey();
  }, [
    refreshDataGridBundleKey,
    setTableSearchFilterSideBar,
    setSearchFilterSideBar,
    setSelectLineProd,
    setSelectServType,
    setShouldRessPagination,
  ]);

  useEffect(() => {
    if (
      (selectCategorySideId && !tableSearchFilterSideBar) ||
      searchFilterSideBar
    ) {
      setShowDetailSideBarView(false);
      refreshDataGridBundleKey();
    }
  }, [
    selectCategorySideId,
    tableSearchFilterSideBar,
    searchFilterSideBar,
    refreshDataGridBundleKey,
  ]);

  return (
    <BundleOfferContext.Provider
      value={{
        reloads,
        ShowAddSideBarBund,
        toggleSideBar,
        selectLineProd,
        selectServType,
        categorySideBar,
        selectCategorySide,
        selectCategorySideId,
        loading,
        sideBarOpen,
        highlightBundleId,
        subsPlanBundle,
        selectDetailSideBarBundle,
        showDetailSideBarView,
        activatedSubsItem,
        activatedSubsPlanId,
        loadPlanOffer,
        showSalesCatgDialog,
        showAddBundleDetail,
        detailContentBundle,
        editModeBundDetail,
        showSubsPlanVersion,
        versionSubsplan,
        parentBundOfferData,
        refreshBundDataGrid,
        errorsBund,
        alertAdd,
        submittAdd,
        searchSideBar,
        searchResultSideBar,
        showDropDown,
        tableSearchFilterSideBar,
        searchFilterSideBar,
        parentDatasSubsPlan,
        prodLineOpen,
        shouldRessPagination,
        filter,
        resetAllFilterSideBarBund,
        fetchSearchSideBarByName,
        setFilter,
        handleProductChange,
        setShouldRessPagination,
        setProdLineOpen,
        setParentDatasSubsPlan,
        setSearchFilterSideBar,
        setTableSearchFilterSideBar,
        setShowDropDown,
        setSearchResultSideBar,
        setSearchSideBar,
        setSubmittAdd,
        setAlertAdd,
        setErrorsBund,
        fetchBundleSideBarChild,
        fetchBundlesideBarParent,
        fetchBundleSideBarGrandChild,
        setRefreshBundDataGrid,
        refreshDataGridBundleKey,
        refreshBundCategorySideBar,
        setParentBundOfferData,
        setVersionSubsPlan,
        setShowSubsPlanVersion,
        setEditModeBundDetail,
        setDetailContentBundle,
        setShowAddBundleDetail,
        setShowSalesCatgDialog,
        setLoadPlanOffer,
        setActivatedSubsPlanId,
        setActivatedSubsItem,
        setShowDetailSideBarView,
        setSelectDetailSideBarBundle,
        setSubsPlanBundle,
        setHighLightBundleId,
        setSideBarOpen,
        setLoading,
        setSelectCategorySideId,
        setSelectCategorySide,
        setCategorySideBar,
        setSelectServType,
        setSelectLineProd,
        toggleSideBarOpen,
        setShowAddSideBarBund,
        handleDialogSideBar,
        handleAddDialogBundDetail,
        setReloads,
        triggerReloadBundle,
        handleCategoryBundleClick,
      }}
    >
      {children}
    </BundleOfferContext.Provider>
  );
};

export { BundleOfferContext, BundleOfferContextProvider };
