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
import { ListToolBar } from "../blocks";
import MainProductSidebar from "../components/MainProductSidebar";
import EditDetailCategoryContent, {
  useEditModalHandlers,
} from "../blocks/EditDetailCategoryContent";
import CategoryDetail from "../components/DetailSubCategorySideBar";
import CategoryDetailModal from "../components/DetailCategoryContent/DetailCategoryContent";
import DeleteSideBar from "../blocks/DeleteSidebarDialog";
import { useOfferLayout } from "@/layouts/main-menu/offer";
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

interface ContextProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  selectedCategory: string | null;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  showDetailView: boolean;
  setShowDetailView: (show: boolean) => void;
  showAddDialog: boolean;
  handleAddDialog: (show: boolean) => void;
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
  showDetailModal: boolean;
  setShowDetailModal: (show: boolean) => void;
  detailModalData: any;
  setDetailModalData: (data: any) => void;
  selectedModalCategory: string | null;
  setSelectedModalCategory: (category: string | null) => void;
  // Sidebar states
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeSubItem: string | null;
  handleCategoryClick: (categoryId: string, categoryName: string) => void;
  handleBackToList: () => void;
  refreshCategorySidebar: () => Promise<void>;
  selectedServiceType: number | null;
  setSelectedServiceType: (serviceType: number | null) => void;
  serviceTypeOpen: boolean;
  setServiceTypeOpen: (open: boolean) => void;
  handleServiceTypeChange: (value: number | null) => void;
  categorySide: categorySideProps[];
  loading: boolean;
  error: string | null;
  // DataGrid refresh control
  dataGridKey: string;
  refreshDataGrid: () => void;
  refreshOfferListSidebar: string | null;
  setRefreshOfferListSidebar: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  selectedDetailSideBar: string | null;
  setSelectedDetailSideBar: (data: any) => void;
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

  // Reset
  resetAllFilterSideBar: () => void;

  productLineOpen: boolean;
  setProductLineOpen: (open: boolean) => void;
  handleProductLineChange: (value: string) => void;
  selectedProductLine: string;
  setSelectedProductLine: (flag: string) => void;
  isEditingMode: boolean;
  setIsEditingMode: React.Dispatch<React.SetStateAction<boolean>>;
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
  handleAddDialog: (show: boolean) => {},
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
  showDetailModal: false,
  setShowDetailModal: () => {},
  detailModalData: null,
  setDetailModalData: () => {},
  selectedModalCategory: null,
  setSelectedModalCategory: () => {},
  // Sidebar states
  isSidebarOpen: true,
  toggleSidebar: () => {},
  activeSubItem: null,
  handleCategoryClick: () => {},
  handleBackToList: () => {},
  refreshCategorySidebar: async () => {},
  selectedServiceType: null,
  setSelectedServiceType: () => {},
  serviceTypeOpen: false,
  setServiceTypeOpen: () => {},
  handleServiceTypeChange: () => {},
  // Initialize category data
  categorySide: [],
  loading: false,
  error: null,
  // DataGrid refresh control
  dataGridKey: "initial",
  refreshDataGrid: () => {},
  refreshOfferListSidebar: null,
  setRefreshOfferListSidebar: () => {},
  selectedDetailSideBar: null,
  setSelectedDetailSideBar: () => {},
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
  // Reset
  resetAllFilterSideBar: () => {},

  productLineOpen: false,
  setProductLineOpen: () => {},
  handleProductLineChange: () => {},
  selectedProductLine: "",
  setSelectedProductLine: () => {},
  isEditingMode: false,
  setIsEditingMode: () => {},
};

const MainProductOfferListContext = createContext<ContextProps>(initialProps);

const API_URL_OFFER = apiConfigOffer.offer;

const MainProductOfferListContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /* state */
  const { GetData } = useCallApi();
  const { moveToSubsPlan, setMoveToSubsPlan, menuPrivAccess } = useOfferLayout();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
  });
  const selectedTempId = useRef(0);
  const selectedTempSubsPlanId = useRef(0);
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
  const [showAddSideBar, setShowAddSideBar] = useState(false);
  const [showDeleteSideBar, setShowDeleteSideBar] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  // Add new states for detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalData, setDetailModalData] = useState<any>(null);

  const [selectedModalCategory, setSelectedModalCategory] = useState<
    string | null
  >(null);

  const [selectedDetailSideBar, setSelectedDetailSideBar] = useState<any>(null);

  //
  const [isLoading, setIsLoading] = useState(false);

  const [selectedServiceType, setSelectedServiceType] = useState<number | null>(
    null,
  );
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

  // editing mode
  const [isEditingMode, setIsEditingMode] = useState(false);

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

  // Function to refresh DataGrid
  const refreshDataGrid = useCallback(() => {
    setDataGridKey(`datagrid-${Date.now()}`);
  }, [selectedServiceType]);

  // Fetch category data function
  const fetchCategorySide = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`,
        {
          spId: 0,
          method: "qryRootCatg",
          offerCatgType: "2",
          offerCatgClass: "A",
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

  const handleAddDialog = useCallback((show: boolean) => {
    setShowAddDialog(show);
  }, []);

  const handleDeleteDialog = useCallback(
    (show: boolean, selected_category: string | null) => {
      setSelectedCategory(show ? selected_category : null);
      setShowDeleteDialog(show);
    },
    [],
  );

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Effect to trigger data refresh when category changes
  useEffect(() => {
    //  console.log("semua", selectedCategoryId, tableSearchFilter, searchFilterFromSidebar, moveToSubsPlan, selectedTempId.current, selectedTempSubsPlanId.current);

    if (selectedCategoryId && (tableSearchFilter || searchFilterFromSidebar)) {
      //  console.log("A");
      setShowDetailView(false);
      refreshDataGrid();
    }

    // Kalau kategori berubah tapi filter tidak aktif => tetap refresh
    if (selectedCategoryId && !tableSearchFilter && !searchFilterFromSidebar) {
      //  console.log("B");

      refreshDataGrid();
      if (selectedTempId.current !== Number(selectedCategoryId)) {
        setShowDetailView(false);
      }

      if (moveToSubsPlan?.subsPlanId) {
        selectedTempId.current = Number(selectedCategoryId);
        selectedTempSubsPlanId.current = moveToSubsPlan?.subsPlanId ?? 0;
        setMoveToSubsPlan(
          (prev) => (prev = { ...prev, subsPlanId: undefined }),
        );
        return;
      }
      // setShowDetailView(false);
    }
  }, [
    selectedCategoryId,
    tableSearchFilter,
    searchFilterFromSidebar,
    refreshDataGrid,
  ]);

  useEffect(() => {
    //  console.log(showDetailView, "sh0w detail");
  }, [showDetailView]);

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
      // Set kedua categoryId dan categoryName
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
  const handleBackToList = () => {
    setShowDetailView(false);
    setSelectedCategory(null);
    setActiveSubItem(null); // Reset active sub-item
  };

  // Handler untuk membuka modal detail - UPDATED
  const handleOpenModal = (rowData: any) => {
    setMoveToSubsPlan(
      (prev) => (prev = { ...prev, offerId: Number(rowData.offerId) }),
    );
    setDetailModalData(rowData);
    setSelectedModalCategory(rowData.offerName);
    setShowDetailModal(true);
  };

  // Handler untuk menutup modal - UPDATED
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setDetailModalData(null);
    setSelectedModalCategory(null);
  };

  // Handler untuk membuka edit modal langsung dari table - MENGGUNAKAN EXPORTED FUNCTION
  const handleOpenEditModal = (rowData: any) => {
    setIsEditingMode(true);
    // Gunakan fungsi handleEditOpen dari hook
    handleEditOpen(
      rowData.offerName || "Product", // category name
      rowData, // raw data - modal akan hit API untuk data terbaru
    );
  };

  const handleServiceTypeChange = useCallback(
    (value: number | null) => {
      setSelectedServiceType(value);
      setServiceTypeOpen(false);
      setShouldResetPagination(true);
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
      const normalizedData = value === "clear" ? "" : value;
      setSelectedProductLine(normalizedData);
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
    setSelectedServiceType(null);
    setServiceTypeOpen(false);
    setShouldResetPagination(true);
  }, [
    setTableSearchFilter,
    setSearchFilterFromSidebar,
    setSelectedProductLine,
    setSelectedServiceType,
    setShouldResetPagination,
  ]);

  useEffect(() => {
    if (selectedServiceType !== null) {
      refreshDataGrid();
    }
    if (selectedServiceType === null) {
      refreshDataGrid();
    }
  }, [selectedServiceType, refreshDataGrid]);

  useEffect(() => {
    if (selectedProductLine !== "") {
      refreshDataGrid();
    }
  }, [selectedProductLine, refreshDataGrid]);

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
            <button
              className="font-medium text-left transition-all duration-200 text-red-500 hover:text-blue-800"
              onClick={() => handleOpenModal(row)}
              title="View Details"
            >
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
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus} enabledText="Edit">
                <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => handleOpenEditModal(row)}>
                  <KeenIcon icon="notepad-edit" />
                </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus} enabledText="Delete">
                <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => handleDeleteDialog(true, row.offerId)}>
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
          size: 1000,
          sortBy: "SEQ",
          sortDirection: "asc",
          search: "",
          ...(selectedProductLine && { prodType: selectedProductLine }),
          ...(selectedServiceType !== null && {
            servType: selectedServiceType,
          }),
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

        // Filter data untuk search
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
          currentPage: actualPage, //
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
      selectedServiceType,
      selectedProductLine,
      searchFilterFromSidebar,
      shouldResetPagination,
    ],
  );

  return (
    <MainProductOfferListContext.Provider
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
        showAddDialog,
        showDeleteDialog,
        handleDeleteDialog,
        // Add new values to context
        showDetailModal,
        setShowDetailModal,
        detailModalData,
        setDetailModalData,
        selectedModalCategory,
        setSelectedModalCategory,
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
        loading,
        error,
        //DataGrid refresh control
        dataGridKey,
        refreshDataGrid,
        refreshOfferListSidebar,
        setRefreshOfferListSidebar,
        selectedDetailSideBar,
        setSelectedDetailSideBar,
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
        isEditingMode,
        setIsEditingMode,
      }}
    >
      <div className="flex container-fixed min-h-fit">
        {/* Sidebar */}
        <MainProductSidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          handleAddSideBar={handleAddSideBar}
          handleDeleteSideBar={handleDeleteSideBar}
          handleCategoryClick={handleCategoryClick}
          handleEditSideBar={handleEditSideBar}
          activeSubItem={activeSubItem}
        />

        {/* Main Content */}
        <div className="flex-1 px-2 h-[90vh]">
          <div className="relative shadow-md border-[1px]  h-full overflow-y-auto pb-5">
            <button
              onClick={toggleSidebar}
              className={`transition-all duration-300 ${isSidebarOpen ? "opacity-0" : "opacity-100"} absolute -left-[0.15rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md z-10`}
            >
              {isSidebarOpen ? (
                <KeenIcon icon="left-square" />
              ) : (
                <KeenIcon icon="right-square" />
              )}
            </button>
            <h2 className="text-xl font-bold mb-5 mt-5 ml-10">
              Main Product List
            </h2>

            {/* Conditional Rendering: Table atau Detail View */}
            <div className="flex-1 pt-0 overflow-y-auto">
              {showDetailView &&
              selectedCategory &&
              !tableSearchFilter &&
              !searchFilterFromSidebar ? (
                <CategoryDetail
                  subCategory={selectedCategory}
                  onBack={handleBackToList}
                  rowData={selectedDetailSideBar}
                  isOpen
                />
              ) : (
                <div className="pt-0">
                  <DataGridProvider
                    key={`${dataGridKey}-${tableSearchFilter || "no-filter"}-${selectedProductLine || "all-productline"}`}
                    columns={columns}
                    pagination={{ size: 10 }}
                    toolbar={<ListToolBar />}
                    layout={{ card: true }}
                    // sorting={[{ id: "offerName", desc: false }]}
                    serverSide={true}
                    getRowProps={(row: any) => {
                      const isFilteredFromSearch =
                        tableSearchFilter &&
                        (row.original.offerName?.toLowerCase() ===
                          tableSearchFilter.toLowerCase() ||
                          row.original.offerCode?.toLowerCase() ===
                            tableSearchFilter.toLowerCase());

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

                    {/* Detail Modal */}
                    {showDetailModal &&
                      selectedModalCategory &&
                      detailModalData && (
                        <CategoryDetailModal
                          isOpen={showDetailModal}
                          onClose={handleCloseModal}
                          category={selectedModalCategory}
                          rowData={detailModalData}
                        />
                      )}

                    {/* Use the exported hook's edit modal */}
                    {isEditModalOpen && currentData && (
                      <EditDetailCategoryContent
                        isOpen={isEditModalOpen}
                        onClose={handleEditClose}
                        category={currentData.offerName}
                        rowData={currentData}
                      />
                    )}
                  </DataGridProvider>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainProductOfferListContext.Provider>
  );
};

export { MainProductOfferListContext, MainProductOfferListContextProvider };
