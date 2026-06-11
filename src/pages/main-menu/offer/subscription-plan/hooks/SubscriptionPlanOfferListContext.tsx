import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { DateRange } from "react-day-picker";
import { ListToolBar } from "../blocks/ListToolbar";
import SubscriptionPlanSideBar from "../components/SubscriptionPlanSideBar";
import EditDetailCategoryContent, {
  useEditModalHandlers,
} from "../blocks/EditDetailCategoryContent";
import DetailSubCategorySidebar from "../components/DetailSubCategorySideBar";
import DeleteSideBar from "../blocks/DeleteSidebarDialog";
import AddDialogSubsPlan from "../blocks/AddDialogSubsPlan";
import AddVersionDialog from "../blocks/AddVersionDialog";
import EditVersionDialog from "../blocks/EditVersionDialog";
import DetailSubCategorySideBarSubsPlan from "../components/DetailSubCategorySideBarSubsPlan";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { offerVer } from "../components/DetailCategoryContent/VersionSubsPlan";
import DeleteVersionDialog from "../blocks/DeleteVersionDialog";
import { toast } from "sonner";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface categorySideProps {
  comments: any;
  effDate: any;
  offerCatgCode: string;
  offerCatgId: string;
  offerCatgName: string;
  offerCatgType: string;
  offerCatgClass: string;
  spId: number;
  cnt: number;
}

interface NavigationItem {
  type: "offer" | "subsPlan";
  data: any;
  category: string;
  categoryId: string;
}

interface ContextProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  selectedCategory: string | null;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  showDetailView: boolean;
  setShowDetailView: (show: boolean) => void;
  handleOpenModalSubsPlan: (show: boolean) => void;
  showAddDialog: boolean;
  showAddDialogSubsPlan: boolean;
  showAddVersionDialogSubsPlan: boolean;
  handleAddVersionDialogSubsPlan: (show: boolean) => void;
  showEditVersionDialogSubsPlan: boolean;
  showDeleteVersionDialogSubsPlan: boolean;
  handleEditVersionDialogSubsPlan: (show: boolean) => void;
  handleDeleteVersionDialogSubsPlan: (show: boolean) => void;
  handleAddDialog: (show: boolean) => void;
  handleAddDialogSubsPlan: (show: boolean, indepProdSpecId?: number) => void;
  showAddSideBar: boolean;
  setShowAddSideBar: (show: boolean) => void;
  handleAddSideBar: (show: boolean) => void;
  showEditSideBar: boolean;
  handleEditSideBar: (show: boolean) => void;
  showDeleteSideBar: boolean;
  handleDeleteSideBar: (
    show: boolean,
    categoryId?: string | null,
    categoryName?: string | null,
  ) => void;
  showDeleteDialog: boolean;
  handleDeleteDialog: (show: boolean, selected_category: string | null) => void;
  // Add new states for detail modal
  // showDetailModal: boolean;
  // setShowDetailModal: (show: boolean) => void;
  showDetailModalSubsPlan: boolean;
  setShowDetailModalSubsPlan: (show: boolean) => void;
  detailModalData: any;
  setDetailModalData: (data: any) => void;
  // selectedModalCategory: string | null;
  // setSelectedModalCategory: (category: string | null) => void;
  // Sidebar states
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeSubItem: string | null;
  handleCategoryClick: (categoryId: string, categoryName: string) => void;
  handleBackToList: () => void;
  refreshCategorySidebar: () => Promise<void>;
  selectedServiceType: string;
  setSelectedServiceType: (serviceType: string) => void;
  serviceTypeOpen: boolean;
  setServiceTypeOpen: (open: boolean) => void;
  handleServiceTypeChange: (value: string) => void;
  // Category data management
  categorySide: categorySideProps[];
  setCategorySide: React.Dispatch<React.SetStateAction<categorySideProps[]>>;
  loading: boolean;
  error: string | null;
  // DataGrid refresh control
  dataGridKey: string;
  refreshDataGrid: () => void;
  refreshOfferListSidebar: string | null;
  setRefreshOfferListSidebar: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  selectedDetailSideBar: any | null;
  setSelectedDetailSideBar: (data: any) => void;
  detailContent: any;
  setDetailContent: (data: any) => void;
  selectedDetailContent: string | null;
  setSelectedDetailContent: (data: any) => void;
  // search
  triggerSearchWithReset?: (searchTerm: string) => void;
  tableSearchFilter: string | null;
  setTableSearchFilter: (filter: string | null) => void;
  searchFilterFromSidebar: string | null;
  setSearchFilterFromSidebar: (filter: string | null) => void;
  sideBarSearchValue: string;
  setsideBarSearchValue: React.Dispatch<React.SetStateAction<string>>;
  searchResult: any[];
  setSearchResult: React.Dispatch<React.SetStateAction<any[]>>;
  showSearchDropdown: boolean;
  setShowSearchDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  highlightedOfferId: string | null;
  setHighlightedOfferId: React.Dispatch<React.SetStateAction<string | null>>;
  // 🔄 Reset
  resetAllFilterSideBar: () => void;

  productLineOpen: boolean;
  setProductLineOpen: (open: boolean) => void;
  handleProductLineChange: (value: string) => void;
  selectedProductLine: string;
  setSelectedProductLine: (flag: string) => void;

  subscriptionPlanByOffer: Record<string, any[]>;
  setSubscriptionPlanByOffer: React.Dispatch<
    React.SetStateAction<Record<string, any[]>>
  >;
  loadingPlansForOffer: Record<string, boolean>;
  fetchSubscriptionPlans: (offerId: string) => Promise<any[]>;
  fetchVersions: (offerId: string | number) => Promise<any[]>;
  parentOfferData: any;
  setParentOfferData: (data: any) => void;
  handleBackToParentOffer: () => void;
  navigationHistory: NavigationItem[];
  setNavigationHistory: React.Dispatch<React.SetStateAction<NavigationItem[]>>;
  openAddDialogSubsPlan: (indepProdSpecId: number) => void;
  closeAddDialogSubsPlan: () => void;
  selectedIndepProdSpecId: number | null;
  selectedVersionData: any;
  setSelectedVersionData: React.Dispatch<React.SetStateAction<any | null>>;
  handleVersionClick: (versionData: any) => void;
  offerVersion?: offerVer[];
  setOfferVersion: React.Dispatch<React.SetStateAction<offerVer[] | undefined>>;
  versions: offerVer[];
  setVersions: React.Dispatch<React.SetStateAction<any | null>>;
  loadingVersions: boolean;
  // setloadingVersions: false
  refreshSubsPlanSection: () => void;
  subsPlanRefreshTrigger: number;
  setShowAddDialogSubsPlan: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialProps: ContextProps = {
  date: undefined,
  setDate: () => {},
  selectedCategory: null,
  selectedCategoryId: null,
  setSelectedCategoryId: () => {},
  setSelectedCategory: () => {},
  showDetailView: false,
  setShowDetailView: () => {},
  showAddDialog: false,
  showAddDialogSubsPlan: false,
  handleOpenModalSubsPlan: () => {},
  showAddVersionDialogSubsPlan: false,
  handleAddVersionDialogSubsPlan: (show: boolean) => {},
  showEditVersionDialogSubsPlan: false,
  showDeleteVersionDialogSubsPlan: false,
  handleEditVersionDialogSubsPlan: (show: boolean) => {},
  handleDeleteVersionDialogSubsPlan: (show: boolean) => {},
  handleAddDialog: (show: boolean) => {},
  handleAddDialogSubsPlan: (show: boolean, indepProdSpecId?: number) => {},
  showAddSideBar: false,
  setShowAddSideBar: () => {},
  handleAddSideBar: () => {},
  showEditSideBar: false,
  handleEditSideBar: (show: boolean) => {},
  showDeleteSideBar: false,
  handleDeleteSideBar: (
    show: boolean,
    categoryId?: string | null,
    categoryName?: string | null,
  ) => {},
  showDeleteDialog: false,
  handleDeleteDialog: (show: boolean, selected_category: string | null) => {},
  // Initialize new states
  // showDetailModal: false,
  // setShowDetailModal: () => {},
  showDetailModalSubsPlan: false,
  setShowDetailModalSubsPlan: () => {},
  detailModalData: null,
  setDetailModalData: () => {},
  // selectedModalCategory: null,
  // setSelectedModalCategory: () => {},
  // Sidebar states
  isSidebarOpen: true,
  toggleSidebar: () => {},
  activeSubItem: null,
  handleCategoryClick: () => {},
  handleBackToList: () => {},
  refreshCategorySidebar: async () => {},
  selectedServiceType: "",
  setSelectedServiceType: () => {},
  serviceTypeOpen: false,
  setServiceTypeOpen: () => {},
  handleServiceTypeChange: () => {},
  // Initialize category data
  categorySide: [],
  setCategorySide: () => {},
  loading: false,
  error: null,
  // DataGrid refresh control
  dataGridKey: "initial",
  refreshDataGrid: () => {},
  refreshOfferListSidebar: null,
  setRefreshOfferListSidebar: () => {},
  selectedDetailSideBar: null,
  setSelectedDetailSideBar: () => {},
  detailContent: null,
  setDetailContent: () => {},
  selectedDetailContent: null,
  setSelectedDetailContent: () => {},
  // search
  triggerSearchWithReset: () => {},
  tableSearchFilter: null,
  setTableSearchFilter: (filter: string | null) => {},
  searchFilterFromSidebar: null,
  setSearchFilterFromSidebar: () => {},
  sideBarSearchValue: "",
  setsideBarSearchValue: () => {},
  searchResult: [],
  setSearchResult: () => {},
  showSearchDropdown: false,
  setShowSearchDropdown: () => {},
  highlightedOfferId: null,
  setHighlightedOfferId: () => {},
  // 🔄 Reset
  resetAllFilterSideBar: () => {},

  productLineOpen: false,
  setProductLineOpen: () => {},
  handleProductLineChange: () => {},
  selectedProductLine: "",
  setSelectedProductLine: () => {},
  subscriptionPlanByOffer: {},
  setSubscriptionPlanByOffer: () => {},
  loadingPlansForOffer: {},
  fetchSubscriptionPlans: async () => [],
  fetchVersions: async () => [],
  parentOfferData: null,
  setParentOfferData: () => {},
  handleBackToParentOffer: () => {},
  navigationHistory: [],
  setNavigationHistory: () => {},
  openAddDialogSubsPlan: () => {},
  closeAddDialogSubsPlan: () => {},
  selectedIndepProdSpecId: null,
  selectedVersionData: null,
  setSelectedVersionData: () => {},
  handleVersionClick: () => {},
  offerVersion: [],
  setOfferVersion: () => {},
  versions: [],
  setVersions: () => {},
  loadingVersions: false,
  refreshSubsPlanSection: () => {},
  subsPlanRefreshTrigger: 0,
  setShowAddDialogSubsPlan: () => {},
};

const SubscriptionPlanOfferListContext =
  createContext<ContextProps>(initialProps);

const API_URL_OFFER = apiConfigOffer.offer;

const SubscriptionPlanOfferListContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /* state */
  const { GetData } = useCallApi();
  const { moveToSubsPlan, menuPrivAccess } = useOfferLayout();
  const {
    setSelectedSubSubPlan,
    selectedSubSubPlan,
    setSelectedVer,
    selectedVer,
  } = useOfferLayout();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
  });
  const [showEditSideBar, setShowEditSideBar] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // ADD: Category data states - managed in context now
  const [categorySide, setCategorySide] = useState<categorySideProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk detail view
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddDialogSubsPlan, setShowAddDialogSubsPlan] = useState(false);
  const [showAddVersionDialogSubsPlan, setShowAddVersionDialogSubsPlan] =
    useState(false);
  const [showEditVersionDialogSubsPlan, setShowEditVersionDialogSubsPlan] =
    useState(false);
  const [showDeleteVersionDialogSubsPlan, setShowDeleteVersionDialogSubsPlan] =
    useState(false);
  const [showAddSideBar, setShowAddSideBar] = useState(false);
  const [showDeleteSideBar, setShowDeleteSideBar] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // Add new states for detail modal
  // const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDetailModalSubsPlan, setShowDetailModalSubsPlan] = useState(false);
  const [detailModalData, setDetailModalData] = useState<any>(null);
  const [detailContent, setDetailContent] = useState<any>(null);

  // const [selectedModalCategory, setSelectedModalCategory] = useState<string | null>(null);

  const [selectedDetailSideBar, setSelectedDetailSideBar] = useState<any>(null);
  const [selectedDetailContent, setSelectedDetailContent] = useState<any>(null);

  //
  const [isLoading, setIsLoading] = useState(false);

  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);

  const [refreshOfferListSidebar, setRefreshOfferListSidebar] = useState<
    string | null
  >(null);

  // State untuk active sub-item
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null);

  // DataGrid refresh states
  const [dataGridKey, setDataGridKey] = useState<string>(
    `datagrid-${Date.now()}`,
  );

  // Use the exported hook for edit modal management
  const {
    isEditModalOpen,
    currentData,
    handleEditOpen,
    handleEditClose,
    handleEditSave,
  } = useEditModalHandlers();

  // search
  const [tableSearchFilter, setTableSearchFilter] = useState<string | null>(
    null,
  );
  const [shouldResetPagination, setShouldResetPagination] = useState(false);
  const [searchFilterFromSidebar, setSearchFilterFromSidebar] = useState<
    string | null
  >(null);

  // Sidebar Search
  const [sideBarSearchValue, setsideBarSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [highlightedOfferId, setHighlightedOfferId] = useState<string | null>(
    null,
  );
  const [selectedProductLine, setSelectedProductLine] = useState<string>("");
  const [productLineOpen, setProductLineOpen] = useState(false);

  // State untuk subscription plans per offer
  const [subscriptionPlanByOffer, setSubscriptionPlanByOffer] = useState<
    Record<string, any[]>
  >({});
  const [loadingPlansForOffer, setLoadingPlansForOffer] = useState<
    Record<string, boolean>
  >({});
  const [parentOfferData, setParentOfferData] = useState<any>(null);
  const [navigationHistory, setNavigationHistory] = useState<NavigationItem[]>(
    [],
  );
  const [selectedIndepProdSpecId, setSelectedIndepProdSpecId] = useState<
    number | null
  >(null);
  const [selectedVersionData, setSelectedVersionData] = useState<any | null>(
    null,
  );
  const [offerVersion, setOfferVersion] = useState<offerVer[]>();
  const [versions, setVersions] = useState<offerVer[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [subsPlanRefreshTrigger, setSubsPlanRefreshTrigger] = useState(0);

  // Function to refresh DataGrid
  const refreshDataGrid = useCallback(() => {
    setDataGridKey(`datagrid-${Date.now()}`);
  }, []);

  const refreshSubsPlanSection = useCallback(() => {
    setSubsPlanRefreshTrigger((prev) => prev + 1);
  }, []);

  // Fetch category data function
  const fetchCategorySide = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`,
        {
          offerCatgClass: "A",
          spId: 0,
          method: "qryRootCatg",
          offerCatgType: "2",
        },
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch category data");
      }

      const list = response?.data?.list ?? response?.data ?? response ?? [];
      const categoryData = Array.isArray(list) ? list : [];

      setCategorySide(categoryData);
      return categoryData;
    } catch (err: any) {
      console.error("❌ Error fetching category data:", err);
      setError(err.message || "Unknown error");
      setCategorySide([]); // Reset to empty array on error
      throw err; // Re-throw to handle in calling function
    } finally {
      setLoading(false);
    }
  }, [GetData]);

  const fetchSubscriptionPlans = async (offerId: string) => {
    setLoadingPlansForOffer((prev) => ({ ...prev, [offerId]: true }));

    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-by-indep-prod-id`,
        {
          indepProdSpecId: offerId,
        },
      );

      if (response?.status) {
        const plans = Array.isArray(response?.data)
          ? response.data
          : (response?.data?.list ?? []);
        setSubscriptionPlanByOffer((prev) => ({ ...prev, [offerId]: plans }));
        return plans;
      }
      return [];
    } catch (error) {
      console.error("Error fetch subscription plan:", error);
      return [];
    } finally {
      setLoadingPlansForOffer((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  // Function untuk fetch Versions
  const fetchVersions = async (offerId: string | number) => {
    setLoadingVersions(true);

    try {
      // console.log("Fetching versions for offerId:", offerId);

      const response = await GetData(
        `${API_URL_OFFER}/offer/qry-subs-plan-ver`,
        {
          offerId: Number(offerId),
          // onlyValid: 1,
          spId: 0,
        },
      );

      // console.log("API Response:", response);

      if (response?.status && Array.isArray(response.data)) {
        setVersions(response.data);
        return response.data;
      } else {
        console.warn("Unexpected response format:", response);
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching versions:", error);
      toast.error("Failed to load versions");
      return [];
    } finally {
      setLoadingVersions(false);
    }
  };

  // Refresh category sidebar function
  const refreshCategorySidebar = useCallback(async () => {
    try {
      await fetchCategorySide();
    } catch (error) {
      console.error("❌ Error refreshing category sidebar:", error);
    }
  }, [fetchCategorySide]);

  // Load initial data
  useEffect(() => {
    fetchCategorySide();
  }, [fetchCategorySide]);

  useEffect(() => {
    if (
      (showEditVersionDialogSubsPlan || showDeleteVersionDialogSubsPlan) &&
      selectedVer
    ) {
      setSelectedVersionData(selectedVer);
    }
  }, [
    showEditVersionDialogSubsPlan,
    showDeleteVersionDialogSubsPlan,
    selectedVer,
  ]);

  useEffect(() => {
    if (!showEditVersionDialogSubsPlan && !showDeleteVersionDialogSubsPlan) {
      setSelectedVersionData([]);
    }
  }, [showEditVersionDialogSubsPlan, showDeleteVersionDialogSubsPlan]);

  useEffect(() => {
    if (moveToSubsPlan) {
      setSidebarOpen(false);
    }
  }, [moveToSubsPlan]);

  const handleAddSideBar = useCallback((show: boolean) => {
    setShowAddSideBar(show);
  }, []);

  const handleEditSideBar = (
    show: boolean,
    categoryId?: string | null,
    categoryName?: string | null,
  ) => {
    setShowEditSideBar(show);
    setSelectedCategoryId(categoryId || "");
    setSelectedCategory(categoryName || "");
  };

  const handleVersionUpdated = async () => {
    if (selectedSubSubPlan?.offerId) {
      await fetchVersions(selectedSubSubPlan?.offerId);
    }
  };

  const handleAddDialog = useCallback((show: boolean) => {
    setShowAddDialog(show);
  }, []);

  const openAddDialogSubsPlan = useCallback((indepProdSpecId: number) => {
    setSelectedIndepProdSpecId(indepProdSpecId);
    setShowAddDialogSubsPlan(true);
  }, []);

  const closeAddDialogSubsPlan = useCallback(() => {
    // setSelectedIndepProdSpecId(null);
    setShowAddDialogSubsPlan(false);
  }, []);

  const handleAddDialogSubsPlan = useCallback(
    (show: boolean, indepProdSpecId?: number) => {
      if (show && indepProdSpecId) {
        openAddDialogSubsPlan(indepProdSpecId);
      } else if (!show) {
        // closeAddDialogSubsPlan();
        setShowAddDialogSubsPlan(false);
      } else {
        setShowAddDialogSubsPlan(show);
      }
    },
    [openAddDialogSubsPlan],
  );

  const handleVersionClick = (versionData: any) => {
    setSelectedVersionData(versionData);
  };

  const handleAddVersionDialogSubsPlan = useCallback((show: boolean) => {
    setShowAddVersionDialogSubsPlan(show);
  }, []);

  const handleEditVersionDialogSubsPlan = useCallback((show: boolean) => {
    setShowEditVersionDialogSubsPlan(show);
  }, []);

  const handleDeleteVersionDialogSubsPlan = useCallback((show: boolean) => {
    setShowDeleteVersionDialogSubsPlan(show);
  }, []);

  const handleDeleteDialog = useCallback(
    (show: boolean, selected_category: string | null) => {
      setSelectedCategory(show ? selected_category : null);
      setShowDeleteDialog(show);
    },
    [],
  );

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (showDetailView && selectedDetailSideBar) {
      return;
    }

    if (selectedCategoryId && (tableSearchFilter || searchFilterFromSidebar)) {
      refreshDataGrid();
    }

    if (selectedCategoryId && !tableSearchFilter && !searchFilterFromSidebar) {
      refreshDataGrid();
    }
  }, [selectedCategoryId, tableSearchFilter, searchFilterFromSidebar, refreshDataGrid, showDetailView, selectedDetailSideBar]);

  useEffect(() => {
    if (selectedProductLine !== undefined) {
      refreshDataGrid();
    }
  }, [selectedProductLine, refreshDataGrid]);

  // Handler untuk membuka detail view
  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategory(categoryName);
    setShowDetailView(true);
    setActiveSubItem(categoryName);
  };

  // Function untuk handle delete sidebar dialog
  const handleDeleteSideBar = (
    show: boolean,
    categoryId?: string | null,
    categoryName?: string | null,
  ) => {
    if (show) {
      const newCategoryId = categoryId || null;
      const newCategoryName = categoryName || null;

      setSelectedCategoryId(newCategoryId);
      setSelectedCategory(newCategoryName);
    } else {
      setSelectedCategoryId(null);
      setSelectedCategory(null);
    }
    setShowDeleteSideBar(show);
  };

  // Handler untuk kembali ke list view
  const handleBackToList = useCallback(() => {
    // setShowDetailView(false);
    setSelectedCategory(null);
    setActiveSubItem(null);
    setSelectedDetailSideBar(null);
    setParentOfferData(null);
    setNavigationHistory([]); // Clear navigation history
    setHighlightedOfferId("");
    setSelectedSubSubPlan(null);
    // setSelectedVer(null);
  }, []);

  const handleBackToParentOffer = useCallback(() => {
    // if (!parentOfferData) return;
    // if (parentOfferData) {
    const enrichedOfferData = {
      ...parentOfferData,
      dataType: "offer",
    };

    setSelectedDetailSideBar(enrichedOfferData);
    setSelectedCategory(parentOfferData.offerName);
    setShowDetailView(true);
    setActiveSubItem(parentOfferData.offerName);
    setSelectedSubSubPlan(null);

    setParentOfferData(null);
    // }
    // else {
    //   handleBackToList();
    // }
  }, [parentOfferData]);

  const handleOpenModalSubsPlan = (rowData: any) => {
    // Enriched data dengan type untuk conditional rendering
    const enrichedData = {
      ...rowData,
      dataType: "subsPlan",
    };

    if (rowData.parentOffer) {
      setParentOfferData({
        ...rowData.parentOffer,
        dataType: "offer",
      });
    } else if (selectedDetailSideBar?.dataType === "offer") {
      setParentOfferData({
        ...selectedDetailSideBar,
        dataType: "offer",
      });
    }

    // Reuse existing states
    setSelectedDetailSideBar(enrichedData);
    setSelectedCategory(rowData.offerName || rowData.subsPlanName);
    setShowDetailView(true);
    setActiveSubItem(rowData.offerName || rowData.subsPlanName);

    // Keep this kalau emang dipake di layout
    setSelectedSubSubPlan(rowData);
  };

  const handleOpenModal = (rowData: any) => {
    // Tambahkan dataType agar conditional rendering tau ini offer
    const enrichedData = {
      ...rowData,
      dataType: "offer",
      openSource: "table",
    };

    setTableSearchFilter(null);
    setSearchFilterFromSidebar(null);
    // setParentOfferData(null);
    // setNavigationHistory([]);
    setSelectedDetailSideBar(enrichedData);
    setSelectedCategory(rowData.offerName);
    setShowDetailView(true);
    setActiveSubItem(rowData.offerName);
  };

  const handleOpenEditModal = (rowData: any) => {
    handleEditOpen(
      rowData.offerName || "Product", // category name
      rowData, // raw data - modal akan hit API untuk data terbaru
    );
  };

  const handleServiceTypeChange = useCallback(
    (value: string) => {
      setSelectedServiceType(value);
      setServiceTypeOpen(false);
      setShouldResetPagination(true);
      refreshDataGrid();
    },
    [refreshDataGrid],
  );

  const triggerSearchWithReset = useCallback((searchTerm: string) => {
    setTableSearchFilter(searchTerm);
    setShouldResetPagination(true);
    // Force refresh data grid
    setDataGridKey(`datagrid-${Date.now()}`);
  }, []);

  const handleProductLineChange = useCallback(
    (value: string) => {
      setSelectedProductLine(value);
      setProductLineOpen(false);
      setShouldResetPagination(true);
      refreshDataGrid();
    },
    [refreshDataGrid],
  );

  //Reset all filter side bar
  const resetAllFilterSideBar = useCallback(() => {
    setsideBarSearchValue("");
    setSearchResult([]);
    setShowSearchDropdown(false);
    setHighlightedOfferId(null);
    setTableSearchFilter(null);
    setSearchFilterFromSidebar(null);
    setSelectedProductLine("");
    setSelectedServiceType("");
    setServiceTypeOpen(false);
    setShouldResetPagination(true);
    refreshDataGrid();
  }, [refreshDataGrid, setTableSearchFilter, setSearchFilterFromSidebar, setSelectedProductLine, setSelectedServiceType, setShouldResetPagination]);

  /* Data Grid Options */
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Main Product Name"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <button className="font-medium text-left transition-all duration-200 text-red-500 hover:text-blue-800" onClick={() => handleOpenModal(row)} title="View Details">
              <div className="flex items-center gap-2">
                <span>{row.offerName}</span>
              </div>
            </button>
          );
        },
      },
      {
        accessorFn: (row) => row.offerCode,
        id: "offerCode",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Main Product Code"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.servTypeName,
        id: "servTypeName",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Service Type"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => (row.paidFlag === "N" ? "Pre-Paid" : "Post-Paid"),
        id: "paidFlag",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Paid Flag"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.effDate,
        id: "effDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Effective Date"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorFn: (row) => row.expDate,
        id: "expDate",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Expired Date"
            column={column}
          />
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "Options",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Options"
            className="text-center"
            column={column}
          />
        ),
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>  
              <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => handleOpenEditModal(row)} title="Edit">
                <KeenIcon icon="notepad-edit" />
              </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
              <button className="btn btn-sm btn-icon btn-clear btn-light" title="Delete" onClick={() => handleDeleteDialog(true, row.offerId)}>
                <KeenIcon icon="trash" />
              </button>
              </AccessWrapper>
            </div>
          );
        },
        meta: {
          headerClassName: "w-[100px] text-center",
          cellClassName: "text-center",
        },
      },
    ],
    [handleOpenModal, handleOpenEditModal, handleDeleteDialog],
  );

  // Updated function to fetch data from API
  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const searchTerm =
          tableSearchFilter || searchFilterFromSidebar || filter?.search || "";

        // 🎯 PERBAIKAN: Jika ada search term, selalu mulai dari halaman 1
        let actualPage = page;
        if (searchTerm && shouldResetPagination) {
          actualPage = 1;
          setShouldResetPagination(false); // Reset flag
        }
        const apiParams = {
          offerCatgId: selectedCategoryId || "1",
          page: 1,
          size: 100,
          sortBy: "SEQ",
          sortDirection: "asc",
          search: "",
          ...(selectedProductLine && { prodType: selectedProductLine }),
          ...(selectedServiceType && { servType: selectedServiceType }),
        };

        const response = await GetData(
          `${API_URL_OFFER}/offer/indep/qry-indep-offer-list-by-catg-id`,
          apiParams,
        );

        if (!response?.status) {
          throw new Error(response?.message || "Failed to fetch offer data");
        }

        const responseData = response?.data;
        let allList = [];

        if (responseData) {
          allList =
            responseData.list ||
            responseData.data ||
            responseData.content ||
            responseData ||
            [];
        }

        let filteredList = allList;
        if (searchTerm) {
          const matchingItems = allList.filter(
            (offer: any) =>
              offer.offerName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              offer.offerCode?.toLowerCase().includes(searchTerm.toLowerCase()),
          );

          const nonMatchingItems = allList.filter(
            (offer: any) =>
              !offer.offerName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) &&
              !offer.offerCode
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()),
          );

          filteredList = [...matchingItems, ...nonMatchingItems];
        }

        if (selectedProductLine) {
          filteredList = filteredList.filter(
            (offer: any) => offer.prodType === selectedProductLine,
          );
        }

        if (selectedServiceType) {
          filteredList = filteredList.filter(
            (offer: any) =>
              Number(offer.servType) === Number(selectedServiceType),
          );
        }

        // 🎯 PERBAIKAN: Implementasi pagination manual
        const startIndex = (actualPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedList = filteredList.slice(startIndex, endIndex);

        const totalCount = filteredList.length;

        return {
          data: Array.isArray(paginatedList) ? paginatedList : [],
          pageCount: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNextPage: actualPage * limit < totalCount,
          hasPreviousPage: actualPage > 1,
          currentPage: actualPage, // 🎯 Tambahkan info halaman saat ini
        };
      } catch (err: any) {
        console.error("❌ Error fetching offer data:", err);

        return {
          data: [],
          totalCount: 0,
          pageCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          currentPage: 1,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [
      GetData,
      selectedCategoryId,
      selectedCategory,
      tableSearchFilter,
      searchFilterFromSidebar,
      shouldResetPagination,
    ],
  );

  const updateSubscriptionPlanInSidebar = useCallback((updatedPlan: any) => {
    setSubscriptionPlanByOffer((prev) => {
      // GUNAKAN indepProdSpecId sebagai key, bukan offerId
      const keyToFind = updatedPlan.indepProdSpecId || updatedPlan.offerId;
      if (prev[keyToFind]) {
        const newState = {
          ...prev,
          [keyToFind]: prev[keyToFind].map((plan) => {
            // console.log("🔍 Checking plan:", plan.subsPlanId, "vs", updatedPlan.subsPlanId);
            return plan.subsPlanId === updatedPlan.subsPlanId
              ? { ...plan, ...updatedPlan }
              : plan;
          }),
        };
        return newState;
      }
      return prev;
    });
  }, []);

  return (
    <SubscriptionPlanOfferListContext.Provider
      value={{
        date,
        setDate,
        selectedCategory,
        setSelectedCategory,
        selectedCategoryId,
        showEditSideBar,
        handleEditSideBar,
        // refreshSidebarData,
        setSelectedCategoryId,
        showDetailView,
        setShowDetailView,
        showAddSideBar,
        setShowAddSideBar,
        handleAddSideBar,
        showDeleteSideBar,
        handleDeleteSideBar,
        handleAddDialog,
        handleAddDialogSubsPlan,
        showAddDialog,
        showAddDialogSubsPlan,
        showAddVersionDialogSubsPlan,
        handleAddVersionDialogSubsPlan,
        showEditVersionDialogSubsPlan,
        showDeleteVersionDialogSubsPlan,
        handleEditVersionDialogSubsPlan,
        handleDeleteVersionDialogSubsPlan,
        showDeleteDialog,
        handleDeleteDialog,
        // Add new values to context
        // showDetailModal,
        // setShowDetailModal,
        showDetailModalSubsPlan,
        setShowDetailModalSubsPlan,
        handleOpenModalSubsPlan,
        detailModalData,
        setDetailModalData,
        // selectedModalCategory,
        // setSelectedModalCategory,
        // Sidebar values
        isSidebarOpen,
        toggleSidebar,
        activeSubItem,
        handleCategoryClick,
        handleBackToList,
        // refreshSidebarData,
        refreshCategorySidebar,
        selectedServiceType,
        setSelectedServiceType,
        serviceTypeOpen,
        setServiceTypeOpen,
        handleServiceTypeChange,
        // Provide category data
        categorySide,
        setCategorySide,
        loading,
        error,
        //DataGrid refresh control
        dataGridKey,
        refreshDataGrid,
        refreshOfferListSidebar,
        setRefreshOfferListSidebar,
        selectedDetailSideBar,
        setSelectedDetailSideBar,
        detailContent,
        setDetailContent,
        selectedDetailContent,
        setSelectedDetailContent,
        setTableSearchFilter,
        triggerSearchWithReset,
        setSearchFilterFromSidebar,
        setsideBarSearchValue,
        setSearchResult,
        setShowSearchDropdown,
        tableSearchFilter,
        searchFilterFromSidebar,
        sideBarSearchValue,
        searchResult,
        showSearchDropdown,
        highlightedOfferId,
        setHighlightedOfferId,
        resetAllFilterSideBar,
        handleProductLineChange,
        productLineOpen,
        setProductLineOpen,
        selectedProductLine,
        setSelectedProductLine,
        subscriptionPlanByOffer,
        setSubscriptionPlanByOffer,
        loadingPlansForOffer,
        fetchSubscriptionPlans,
        fetchVersions,
        parentOfferData,
        setParentOfferData,
        handleBackToParentOffer,
        navigationHistory,
        setNavigationHistory,
        openAddDialogSubsPlan,
        closeAddDialogSubsPlan,
        selectedIndepProdSpecId,
        selectedVersionData,
        setSelectedVersionData,
        handleVersionClick,
        offerVersion,
        setOfferVersion,
        versions,
        setVersions,
        loadingVersions,
        refreshSubsPlanSection,
        subsPlanRefreshTrigger,
        setShowAddDialogSubsPlan,
      }}
    >
      <div className="flex container-fixed">
        {/* Gunakan komponen sidebar yang sudah terpisah */}
        <SubscriptionPlanSideBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} handleAddSideBar={handleAddSideBar} handleDeleteSideBar={handleDeleteSideBar} handleCategoryClick={handleCategoryClick} handleEditSideBar={handleEditSideBar} activeSubItem={activeSubItem} setActiveSubItem={setActiveSubItem} />

        {/* Main Content */}
        <div className="flex-1 px-2 h-[90vh]">
          <div className="relative shadow-md border-[1px] h-full overflow-y-auto pb-5">
            <button
              onClick={toggleSidebar}
              className={
                moveToSubsPlan
                  ? ""
                  : `transition-all duration-300 ${isSidebarOpen ? "opacity-0" : "opacity-100"} absolute -left-[0.15rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md z-10`
              }
            >
              {moveToSubsPlan ? (
                ""
              ) : isSidebarOpen ? (
                <KeenIcon icon="left-square" />
              ) : (
                <KeenIcon icon="right-square" />
              )}
            </button>
            {!(
              showDetailView &&
              selectedCategory &&
              !tableSearchFilter &&
              !searchFilterFromSidebar
            ) && (
              <h2 className="text-xl font-normal text-gray-900 mb-5 mt-5 ml-10">
                Main Product List
              </h2>
            )}

            {/* Conditional Rendering: Table atau Detail View */}
            <div className="flex-1 pt-0">
              {(() => {
                const shouldShowDetail = showDetailView && selectedCategory && selectedDetailSideBar && !tableSearchFilter && !searchFilterFromSidebar;

                return shouldShowDetail ? (
                  <>

                    {/* Render Detail untuk Offer */}
                    {selectedDetailSideBar?.dataType === "offer" && <DetailSubCategorySidebar subCategory={selectedCategory} onBack={handleBackToList} rowData={selectedDetailSideBar} isOpen={showDetailView} onClose={handleBackToList} openSource={selectedDetailSideBar?.openSource} />}

                    {/* Render Detail untuk Subscription Plan */}
                    {selectedDetailSideBar?.dataType === "subsPlan" && (
                      <DetailSubCategorySideBarSubsPlan
                        subCategory={selectedCategory}
                        onBack={handleBackToParentOffer}
                        rowData={selectedDetailSideBar}
                        isOpen={showDetailView}
                        onClose={handleBackToList}
                        onUpdatePlanInSidebar={updateSubscriptionPlanInSidebar}
                      />
                    )}

                    {/* Fallback */}
                    {!selectedDetailSideBar?.dataType && <DetailSubCategorySidebar subCategory={selectedCategory} onBack={handleBackToList} rowData={selectedDetailSideBar} isOpen={showDetailView} onClose={handleBackToList} openSource={selectedDetailSideBar?.openSource} />}
                  </>
                ) : (
                  <>
                    <div className="pt-0">
                      <DataGridProvider
                        key={`${dataGridKey}-${tableSearchFilter || "no-filter"}-${selectedProductLine || "all-productline"}`}
                        columns={columns}
                        pagination={{ size: 10 }}
                        toolbar={<ListToolBar />}
                        layout={{ card: true }}
                        serverSide={true}
                        getRowProps={(row: any) => {
                          const isFilteredFromSearch =
                            tableSearchFilter &&
                            (row.original.offerName
                              ?.toLowerCase()
                              .includes(tableSearchFilter.toLowerCase()) ||
                              row.original.offerCode
                                ?.toLowerCase()
                                .includes(tableSearchFilter.toLowerCase()));

                          return {
                            className: isFilteredFromSearch
                              ? "bg-red-100 border-2 border-red-300 shadow-sm"
                              : "",
                            style: isFilteredFromSearch
                              ? {
                                  backgroundColor: "rgb(254 226 226)",
                                  borderColor: "rgb(252 165 165)",
                                  fontWeight: "600",
                                }
                              : {},
                          };
                        }}
                        onFetchData={({
                          pageIndex,
                          pageSize,
                          sorting,
                          columnFilters,
                        }) => {
                          return doGetListData(
                            pageIndex + 1,
                            pageSize,
                            sorting,
                            columnFilters,
                          );
                        }}
                      >
                        {children}

                        <DeleteSideBar />

                        {isEditModalOpen && currentData && <EditDetailCategoryContent isOpen={isEditModalOpen} onClose={handleEditClose} category={currentData.productName} rowData={currentData} />}
                      </DataGridProvider>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {showAddDialogSubsPlan && (
        <AddDialogSubsPlan
          isOpen={showAddDialogSubsPlan}
          onClose={() => handleAddDialogSubsPlan(false)}
        />
      )}

      {showAddVersionDialogSubsPlan && <AddVersionDialog isOpen={showAddVersionDialogSubsPlan} onClose={() => handleAddVersionDialogSubsPlan(false)} onSuccess={handleVersionUpdated} />}

      {showEditVersionDialogSubsPlan && <EditVersionDialog isOpen={showEditVersionDialogSubsPlan} onClose={() => handleEditVersionDialogSubsPlan(false)} onSuccess={handleVersionUpdated} data={selectedVersionData} />}

      {showDeleteVersionDialogSubsPlan && <DeleteVersionDialog isOpen={showDeleteVersionDialogSubsPlan} onClose={() => handleDeleteVersionDialogSubsPlan(false)} onSuccess={handleVersionUpdated} data={selectedVersionData} />}
    </SubscriptionPlanOfferListContext.Provider>
  );
};

export {
  SubscriptionPlanOfferListContext,
  SubscriptionPlanOfferListContextProvider,
};
