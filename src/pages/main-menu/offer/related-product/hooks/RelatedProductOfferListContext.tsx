import { DataGridColumnHeader, DataGridProvider, KeenIcon } from "@/components";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ColumnDef } from "@tanstack/react-table";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { ListToolBar } from "../blocks/ListToolbar";
import RelatedProductSidebar from "../components/RelatedProductSideBar";
import CategoryDetail from "../components/DetailSubCategorySideBar";
import CategoryDetailModal from "../components/DetailCategoryContent/DetailCategoryContent";
import { FormData } from "../blocks/AddDialog";
import { effectiveTypeOptions } from "../components/types";
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

// 📌 Context Props
interface ContextProps {
  // 📂 Category Content & Date
  categoryContent: FormData[];
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;

  // 📂 Selected Category & Detail Sidebar
  selectedDetailSideBar: string | null;
  setSelectedDetailSideBar: (data: any) => void;
  selectedCategory: any;
  setSelectedCategory: (category: any) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;

  // 📂 Detail View
  showDetailView: boolean;
  setShowDetailView: (show: boolean) => void;

  // 📂 Dialogs
  showAddDialog: boolean;
  handleAddDialog: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  handleEditDialog: (show: boolean, selected_category: string | null) => void;
  showDeleteDialog: boolean;
  handleDeleteDialog: (show: boolean, selected_category: any) => void;

  // 📂 Sidebars
  showAddSideBar: boolean;
  handleAddSideBar: (show: boolean) => void;
  showEditSideBar: boolean;
  setShowEditSideBar: (show: boolean) => void;
  handleEditSideBar: (show: boolean, categoryId?: string | null, categoryName?: string | null) => void;
  showDeleteSideBar: boolean;
  handleDeleteSideBar: (show: boolean, categoryId?: string | null, categoryName?: string | null) => void;

  // 📂 Detail Modal
  showDetailModal: boolean;
  setShowDetailModal: (show: boolean) => void;
  detailModalData: any;
  setDetailModalData: (data: any) => void;
  selectedModalCategory: string | null;
  setSelectedModalCategory: (category: string | null) => void;

  // 📂 Sidebar States
  refreshCategorySideBar: () => Promise<void>;
  categorySideBar: categorySideProps[];
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeSubItem: string | null;
  handleCategoryClick: (categoryId: string, categoryName: string) => void;
  handleBackToList: () => void;

  // 🔄 API Loading & Error
  loading: boolean;
  error: string | null;

  // 📂 Refresh & DataGrid
  refreshOfferListSidebar: string | null;
  setRefreshOfferListSidebar: React.Dispatch<React.SetStateAction<string | null>>;
  refreshDataGrid: () => void;
  dataGridKey: string;

  // 🔍 Table Search & Filters
  searchFilterFromSidebar: string | null;
  setSearchFilterFromSidebar: (filter: string | null) => void;
  filteredOfferData: any | null;
  setFilteredOfferData: (data: any) => void;
  tableSearchFilter: string | null;
  setTableSearchFilter: (filter: string | null) => void;
  triggerSearchWithReset?: (searchTerm: string) => void;

  // 🛠 Service Type & Package
  selectedServiceType: string;
  setSelectedServiceType: (serviceType: string) => void;
  serviceTypeOpen: boolean;
  setServiceTypeOpen: (open: boolean) => void;
  handleServiceTypeChange: (value: string) => void;
  shouldResetPagination?: boolean;
  setShouldResetPagination?: (reset: boolean) => void;
  selectedPackage: string;
  setSelectedPackage: (flag: string) => void;
  packageFlagOpen: boolean;
  setPackageFlagOpen: (open: boolean) => void;
  handlePackageChange: (value: string) => void;

  // 🔍 Sidebar Search
  searchResult: any[];
  setsearchResult: React.Dispatch<React.SetStateAction<any[]>>;
  sideBarSearchValue: string;
  setsideBarSearchValue: React.Dispatch<React.SetStateAction<string>>;
  sidebarSearchValueCode: string;
  setSidebarSearchValueCode: React.Dispatch<React.SetStateAction<string>>;
  searchResultcode: any[];
  setSearchResultcode: React.Dispatch<React.SetStateAction<any[]>>;
  showSearchDropdown: boolean;
  setShowSearchDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  showSearchDropdownCode: boolean;
  setShowSearchDropdownCode: React.Dispatch<React.SetStateAction<boolean>>;

  // ✨ Highlight
  highlightedOfferId: string | null;
  setHighlightedOfferId: React.Dispatch<React.SetStateAction<string | null>>;

  // 🔄 Reset
  resetAllFilterSideBar: () => void;
  shouldOpenModalInEditMode: boolean;
  setShouldOpenModalInEditMode: (value: boolean) => void;
}

// 📌 Initial Props
const initialProps: ContextProps = {
  // 📂 Category Content & Date
  categoryContent: [],
  date: undefined,
  setDate: () => {},

  // 📂 Selected Category & Detail Sidebar
  selectedDetailSideBar: null,
  setSelectedDetailSideBar: () => {},
  selectedCategory: null,
  setSelectedCategory: () => {},
  selectedCategoryId: null,
  setSelectedCategoryId: () => {},

  // 📂 Detail View
  showDetailView: false,
  setShowDetailView: () => {},

  // 📂 Dialogs
  showAddDialog: false,
  handleAddDialog: () => {},
  showEditDialog: false,
  setShowEditDialog: () => {},
  handleEditDialog: () => {},
  showDeleteDialog: false,
  handleDeleteDialog: () => {},

  // 📂 Sidebars
  showAddSideBar: false,
  handleAddSideBar: () => {},
  showEditSideBar: false,
  setShowEditSideBar: () => {},
  handleEditSideBar: () => {},
  showDeleteSideBar: false,
  handleDeleteSideBar: () => {},

  // 📂 Detail Modal
  showDetailModal: false,
  setShowDetailModal: () => {},
  detailModalData: null,
  setDetailModalData: () => {},
  selectedModalCategory: null,
  setSelectedModalCategory: () => {},

  // 📂 Sidebar States
  refreshCategorySideBar: async () => {},
  categorySideBar: [],
  isSidebarOpen: true,
  toggleSidebar: () => {},
  activeSubItem: null,
  handleCategoryClick: () => {},
  handleBackToList: () => {},

  // 🔄 API Loading & Error
  loading: false,
  error: null,

  // 📂 Refresh & DataGrid
  refreshOfferListSidebar: null,
  setRefreshOfferListSidebar: () => {},
  refreshDataGrid: () => {},
  dataGridKey: "initial",

  // 🔍 Table Search & Filters
  searchFilterFromSidebar: null,
  setSearchFilterFromSidebar: () => {},
  filteredOfferData: null,
  setFilteredOfferData: () => {},
  tableSearchFilter: null,
  setTableSearchFilter: () => {},
  triggerSearchWithReset: () => {},

  // 🛠 Service Type & Package
  selectedServiceType: "",
  setSelectedServiceType: () => {},
  serviceTypeOpen: false,
  setServiceTypeOpen: () => {},
  handleServiceTypeChange: () => {},
  shouldResetPagination: false,
  setShouldResetPagination: () => {},
  selectedPackage: "",
  setSelectedPackage: () => {},
  packageFlagOpen: false,
  setPackageFlagOpen: () => {},
  handlePackageChange: () => {},

  // 🔍 Sidebar Search
  searchResult: [],
  setsearchResult: () => {},
  sideBarSearchValue: "",
  setsideBarSearchValue: () => {},
  sidebarSearchValueCode: "",
  setSidebarSearchValueCode: () => {},
  searchResultcode: [],
  setSearchResultcode: () => {},
  showSearchDropdown: false,
  setShowSearchDropdown: () => {},
  showSearchDropdownCode: false,
  setShowSearchDropdownCode: () => {},

  // ✨ Highlight
  highlightedOfferId: null,
  setHighlightedOfferId: () => {},

  // 🔄 Reset
  resetAllFilterSideBar: () => {},
  shouldOpenModalInEditMode: false,
  setShouldOpenModalInEditMode: () => {},
};

const RelatedProductOfferListContext = createContext<ContextProps>(initialProps);

const API_URL_OFFER = apiConfigOffer.offer;

const RelatedProductOfferListContextProvider = ({ children }: { children: React.ReactNode }) => {
  /* state */
  const { GetData } = useCallApi();

  // 📅 Date Range
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 31)),
    to: new Date(),
  });

  // 🔄 Loading & Error
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📂 Dialog Visibility
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 📂 Sidebar Visibility
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showAddSideBar, setShowAddSideBar] = useState(false);
  const [showEditSideBar, setShowEditSideBar] = useState(false);
  const [showDeleteSideBar, setShowDeleteSideBar] = useState(false);

  // 📂 Detail View
  const [showDetailView, _setShowDetailView] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categorySideBar, setCategorySideBar] = useState<categorySideProps[]>([]);
  const [categoryContent, setCategoryContent] = useState<any[]>([]);

  // 📂 Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalData, setDetailModalData] = useState<any>(null);
  const [selectedDetailSideBar, setSelectedDetailSideBar] = useState<any>(null);
  const [selectedModalCategory, setSelectedModalCategory] = useState<string | null>(null);
  const [refreshOfferListSidebar, setRefreshOfferListSidebar] = useState<string | null>(null);

  // 📂 Table & DataGrid
  const [activeSubItem, setActiveSubItem] = useState<string | null>(null);
  const [dataGridKey, setDataGridKey] = useState<string>(`datagrid-${Date.now()}`);
  const [shouldResetPagination, setShouldResetPagination] = useState(false);

  // 🔍 Table Search & Filters
  const [tableSearchFilter, setTableSearchFilter] = useState<string | null>(null);
  const [searchFilterFromSidebar, setSearchFilterFromSidebar] = useState<string | null>(null);
  const [filteredOfferData, setFilteredOfferData] = useState<any | null>(null);

  // 🛠 Service Type & Package
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [packageFlagOpen, setPackageFlagOpen] = useState(false);

  // 🔍 Sidebar Search
  const [sideBarSearchValue, setsideBarSearchValue] = useState<string>("");
  const [sidebarSearchValueCode, setSidebarSearchValueCode] = useState<string>("");
  const [searchResult, setsearchResult] = useState<any[]>([]);
  const [searchResultcode, setSearchResultcode] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showSearchDropdownCode, setShowSearchDropdownCode] = useState(false);

  // ✨ Highlight
  const [highlightedOfferId, setHighlightedOfferId] = useState<string | null>(null);
  const [shouldOpenModalInEditMode, setShouldOpenModalInEditMode] = useState(false);

  const refreshDataGrid = useCallback(() => {
    setDataGridKey(`datagrid-${Date.now()}`);
  }, []);

  const handleAddDialog = useCallback((show: boolean) => {
    setShowAddDialog(show);
  }, []);

  const handleEditDialog = useCallback((show: boolean, rowData: any = null) => {
    // console.log("🔵 [CONTEXT] handleEditDialog called:", { show, rowData });

    if (show && rowData) {
      const offerName = rowData.offerName || rowData.relatedProductName;
      // console.log("🟢 [CONTEXT] Setting modal data with offerName:", offerName);

      setDetailModalData(rowData);
      setSelectedModalCategory(offerName);
      setSelectedCategory(offerName);
      setShouldOpenModalInEditMode(true);
      setShowDetailModal(true);

      // console.log("✅ [CONTEXT] Modal opened with data");
    } else {
      // console.log("🔴 [CONTEXT] Closing modal");
      setShowDetailModal(false);
      setDetailModalData(null);
      setSelectedModalCategory(null);
      setShouldOpenModalInEditMode(false);
    }
  }, []);

  const handleDeleteDialog = useCallback((show: boolean, selected_category: any) => {
    setSelectedCategory(show ? selected_category : null);
    setShowDeleteDialog(show);
  }, []);

  const handleServiceTypeChange = useCallback(
    (value: string) => {
      setSelectedServiceType(value);
      setServiceTypeOpen(false);
      setShouldResetPagination(true);
      refreshDataGrid();
    },
    [refreshDataGrid]
  );

  const handleAddSideBar = useCallback((show: boolean) => {
    setShowAddSideBar(show);
  }, []);

  const handleEditSideBar = useCallback((show: boolean, categoryId?: string | null, categoryName?: string | null) => {
    if (show && categoryId) {
      setSelectedCategoryId(categoryId);
      setSelectedCategory(categoryName || null);
    } else if (!show) {
    }
    setShowEditSideBar(show);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleDeleteSideBar = useCallback((show: boolean, categoryId?: string | null, categoryName?: string | null) => {
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
  }, []);

  // Handler untuk membuka detail side bar
  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategory(categoryName);
    setActiveSubItem(categoryName);
    setShowDetailView(true);
    setShouldResetPagination(true);
  };
  const handleBackToList = () => {
    setShowDetailView(false);
    setSelectedCategory(null);
    setActiveSubItem(null);
  };

  // Handler untuk membuka detail modal
  const handleOpenModal = (rowData: any) => {
    setDetailModalData(rowData);
    setSelectedModalCategory(rowData.offerName || rowData.relatedProductName);
    setShowDetailModal(true);
  };

  // Handler untuk menutup detail modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setDetailModalData(null);
    setSelectedModalCategory(null);
  };

  // Handler untuk filter package
  const handlePackageChange = useCallback(
    (value: string) => {
      if (value === "clear") {
        setSelectedPackage("");
      } else {
        setSelectedPackage(value);
      }

      setPackageFlagOpen(false);
      setShouldResetPagination(true);
      refreshDataGrid();
    },
    [refreshDataGrid]
  );

  //Reset all filter side bar
  const resetAllFilterSideBar = useCallback(() => {
    setsideBarSearchValue("");
    setSidebarSearchValueCode("");
    setsearchResult([]);
    setSearchResultcode([]);
    setShowSearchDropdown(false);
    setHighlightedOfferId(null);
    setTableSearchFilter(null);
    setSearchFilterFromSidebar(null);
    setSelectedPackage("");
    setSelectedServiceType("");
    setServiceTypeOpen(false);
    setShouldResetPagination(true);
    refreshDataGrid();
  }, [
    refreshDataGrid,
    setTableSearchFilter,
    setSearchFilterFromSidebar,
    setSelectedPackage,
    setSelectedServiceType,
    setShouldResetPagination,
  ]);

  const { menuPrivAccess } = useOfferLayout();

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorFn: (row) => row.offerName,
        id: "offerName",
        header: ({ column }) => <DataGridColumnHeader className="" title="Offer Name" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: (data: any) => {
          const row = data.row.original;
          const offerName: string = row.offerName ?? "";

          const paragraphs = offerName.includes("\n") ? offerName.split(/\n+/) : (offerName.match(/.{1,80}/g) ?? []);
          const preview = paragraphs.slice(0, 2).join("\n");
          const isTrunch = paragraphs.length > 2;

          return (
            <button
              className="font-medium text-left transition-all duration-200 text-red-500 hover:text-blue-800"
              onClick={() => handleOpenModal(row)}
              title="View Details"
            >
              <div className="max-w-[180px] whitespace-pre-wrap break-words">
                {preview}
                {isTrunch && "..."}
              </div>
            </button>
          );
        },
        meta: {
          headerClassName: "w-[200px]",
          cellClassName: "w-[200px]",
        },
      },
      {
        accessorFn: (row) => row.offerCode,
        id: "offerCode",
        header: ({ column }) => <DataGridColumnHeader className="" title="Offer Code" column={column} />,
        enableSorting: true,
        enableHiding: false,
        cell: (data: any) => {
          const row = data.row.original;
          const offerName: string = row.offerCode ?? "";

          const paragraphs = offerName.includes("\n") ? offerName.split(/\n+/) : (offerName.match(/.{1,80}/g) ?? []);
          const preview = paragraphs.slice(0, 2).join("\n");
          const isTrunch = paragraphs.length > 2;

          return (
            <div className="max-w-[100px] whitespace-pre-wrap break-words">
              {preview}
              {isTrunch && "..."}
            </div>
          );
        },
        meta: {
          headerClassName: "w-[150px]",
        },
      },
      {
        accessorFn: (row) => row.servTypeName,
        id: "servTypeName",
        cell: ({ row }) => {
          const fullText = `${row.original.servTypeName} [${row.original.networkTypeName}]`;

          return (
            <div
              className="max-w-[250px] overflow-hidden whitespace-nowrap text-ellipsis"
              title={fullText} // tooltip bawaan browser
            >
              {fullText}
            </div>
          );
        },
        header: ({ column }) => <DataGridColumnHeader className="" title="Service Type" column={column} />,
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "w-[250px]",
        },
      },
      {
        accessorKey: "effType",
        header: ({ column }) => <DataGridColumnHeader className="" title="Effective Type" column={column} />,
        cell: ({ row }) => {
          const raw: string = row.original.effType || "";
          const values = raw ? raw.split("|") : [];

          const labels = values.map((val) => {
            const match = effectiveTypeOptions.find((opt) => opt.value === val);
            return match?.label || val;
          });

          const displayText = labels.join(", ");

          return (
            <div
              className="max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis"
              title={displayText} // tooltip = label bukan raw
            >
              {displayText}
            </div>
          );
        },

        enableSorting: true,
        enableHiding: false,
        meta: {
          headerClassName: "w-[200px]",
        },
      },
      {
        accessorFn: (row) => `${row.effDate} - ${row.expDate}`,
        id: "validPeriod",
        header: ({ column }) => <DataGridColumnHeader title="Valid Period" column={column} />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const { effDate, expDate } = row.original;

          const formatDate = (dateString: any) => {
            if (!dateString) return null;
            return dateString.split("T")[0]; // YYYY-MM-DD
          };

          return (
            <div className="flex flex-col">
              {formatDate(effDate)} - {formatDate(expDate)}
            </div>
          );
        },
        meta: {
          headerClassName: "w-[230px]",
        },
      },

      {
        id: "Options",
        enableSorting: false,
        enableHiding: false,
        header: ({ column }) => <DataGridColumnHeader title="Options" className="text-center" column={column} />,
        cell: (data: any) => {
          const row = data.row.original;
          return (
            <div className="flex items-center justify-center gap-2">
              <AccessWrapper hasAccess={menuPrivAccess?.editStatus} enabledText="Edit">
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  // title="Edit"
                  onClick={() => handleEditDialog(true, row)}
                >
                  <KeenIcon icon="notepad-edit" />
                </button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus} enabledText="Delete">
                <button
                  className="btn btn-sm btn-icon btn-clear btn-light"
                  // title="Delete"
                  onClick={() => handleDeleteDialog(true, row)}
                >
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
    [handleOpenModal, handleEditDialog, handleDeleteDialog, tableSearchFilter]
  );

  const doGetListData = useCallback(
    async (page: number, limit: number, sorting: any, filter: any) => {
      setIsLoading(true);
      setError(null);

      try {
        sorting = sorting.length == 0 ? [{ id: "SEQ", desc: false}] : sorting;

        const searchTerm = tableSearchFilter || searchFilterFromSidebar || filter?.search || "";

        let actualPage = page;
        if (searchTerm && shouldResetPagination) {
          actualPage = 1;
          setShouldResetPagination(false);
        }

        const apiParams = {
          offerCatgId: selectedCategoryId || "5",
          page: actualPage,
          size: limit,
          sortBy: sorting[0].id,
          sortDirection: sorting[0]?.desc == false ? "ASC" : "DESC",
          search: "",
          ...(selectedPackage && { isPackage: selectedPackage }),
          ...(selectedServiceType && { servType: selectedServiceType }),
        };

        const response = await GetData(`${API_URL_OFFER}/offer/depend/qry-depend-offer-list-by-catg-id`, apiParams);

        if (!response?.status) {
          throw new Error(response?.message || "Failed to fetch offer data");
        }

        const allList = response?.data ?? [];
        const totalCount = response?.totalRows ?? 0;

        let filteredList = allList;
        if (searchTerm) {
          const matchingItems = allList.filter(
            (offer: any) =>
              offer.offerName?.toLowerCase() === searchTerm.toLowerCase() ||
              offer.offerCode?.toLowerCase() === searchTerm.toLowerCase()
          );

          const nonMatchingItems = allList.filter(
            (offer: any) =>
              !offer.offerName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !offer.offerCode?.toLowerCase().includes(searchTerm.toLowerCase())
          );

          filteredList = [...matchingItems, ...nonMatchingItems];
        }

        if (selectedPackage) {
          filteredList = filteredList.filter((offer: any) => offer.isPackage === selectedPackage);
        }

        if (selectedServiceType) {
          filteredList = filteredList.filter((offer: any) => offer.servType === selectedServiceType);
        }

        return {
          data: Array.isArray(allList) ? allList : [],
          pageCount: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNextPage: actualPage * limit < totalCount,
          hasPreviousPage: actualPage > 1,
          currentPage: actualPage,
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
      selectedPackage,
      selectedServiceType,
      shouldResetPagination,
    ]
  );

  const fetchCategorySide = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`, {
        offerCatgClass: "A",
        spId: 0,
        method: "qryRootCatg",
        offerCatgType: "3",
      });

      if (!response?.status) {
        throw new Error(response?.message || "Failed to fetch service type data");
      }

      const list = response?.data?.list ?? response?.data ?? response ?? [];

      setCategorySideBar(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error("❌ Error fetching service type:", err);
      setError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [GetData]);

  const refreshCategorySideBar = useCallback(async () => {
    try {
      await fetchCategorySide();
    } catch (error: any) {
      console.error("❌ [REFRESH] Error refreshing category sidebar:", error);
    }
  }, [fetchCategorySide]);

  useEffect(() => {
    fetchCategorySide();
  }, [fetchCategorySide]);

  useEffect(() => {
    if (selectedCategoryId && (tableSearchFilter || searchFilterFromSidebar)) {
      setShowDetailView(false);
      refreshDataGrid();
    }

    if (selectedCategoryId && !tableSearchFilter && !searchFilterFromSidebar) {
      setShowDetailView(false);
      refreshDataGrid();
    }
  }, [selectedCategoryId, tableSearchFilter, searchFilterFromSidebar, refreshDataGrid]);

  useEffect(() => {
    if (selectedPackage !== undefined) {
      refreshDataGrid();
    }
  }, [selectedPackage, refreshDataGrid]);

  const setShowDetailView = (show: boolean) => {
    // console.trace("🔴 setShowDetailView called with:", show);
    _setShowDetailView(show);
  };

  return (
    <RelatedProductOfferListContext.Provider
      value={{
        categoryContent,
        date,
        setDate,
        selectedDetailSideBar,
        setSelectedDetailSideBar,
        selectedCategory,
        setSelectedCategory,
        selectedCategoryId,
        setSelectedCategoryId,
        showDetailView,
        setShowDetailView,
        showAddDialog,
        handleAddDialog,
        showEditDialog,
        setShowEditDialog,
        handleEditDialog,
        showDeleteDialog,
        handleDeleteDialog,
        showAddSideBar,
        handleAddSideBar,
        showEditSideBar,
        setShowEditSideBar,
        handleEditSideBar,
        showDeleteSideBar,
        handleDeleteSideBar,
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
        // API states
        loading,
        error,
        categorySideBar,
        refreshCategorySideBar,
        refreshOfferListSidebar,
        setRefreshOfferListSidebar,
        refreshDataGrid,
        dataGridKey,
        searchFilterFromSidebar,
        setSearchFilterFromSidebar,
        filteredOfferData,
        setFilteredOfferData,
        tableSearchFilter,
        setTableSearchFilter,
        selectedServiceType,
        setSelectedServiceType,
        serviceTypeOpen,
        setServiceTypeOpen,
        handleServiceTypeChange,
        selectedPackage,
        setSelectedPackage,
        packageFlagOpen,
        setPackageFlagOpen,
        handlePackageChange,
        resetAllFilterSideBar,
        searchResult,
        setsearchResult,
        sideBarSearchValue,
        setsideBarSearchValue,
        sidebarSearchValueCode,
        setSidebarSearchValueCode,
        searchResultcode,
        setSearchResultcode,
        showSearchDropdown,
        setShowSearchDropdown,
        highlightedOfferId,
        setHighlightedOfferId,
        showSearchDropdownCode,
        setShowSearchDropdownCode,
        shouldOpenModalInEditMode,
        setShouldOpenModalInEditMode,
      }}
    >
      <div className="flex container-fixed ">
        <RelatedProductSidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          handleAddSideBar={handleAddSideBar}
          handleEditSideBar={handleEditSideBar}
          handleDeleteSideBar={handleDeleteSideBar}
          handleCategoryClick={handleCategoryClick}
          activeSubItem={activeSubItem}
        />

        {/* Main Content */}
        <div className="flex-1 px-2 h-[90vh]">
          <div className="relative shadow-md border-[1px] h-full overflow-y-auto pb-5">
            <button
              onClick={toggleSidebar}
              className={`transition-all duration-300 ${isSidebarOpen ? "opacity-0" : "opacity-100"} absolute -left-[0.15rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md z-10`}
            >
              {isSidebarOpen ? <KeenIcon icon="left-square" /> : <KeenIcon icon="right-square" />}
            </button>
            <h2 className="text-xl font-bold mb-5 mt-5 ml-10">Related Product</h2>

            {/* Conditional Rendering: Table atau Detail View */}
            <div className="flex-1 pt-0">
              {showDetailView && selectedCategory && !tableSearchFilter && !searchFilterFromSidebar ? (
                <CategoryDetail
                  category={selectedCategory}
                  onBack={handleBackToList}
                  rowData={selectedDetailSideBar}
                  isOpen={showDetailView}
                />
              ) : (
                <div className="pt-0">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      Error: {error}
                    </div>
                  )}

                  <DataGridProvider
                    key={`${dataGridKey}-${tableSearchFilter || "no-filter"}-${selectedPackage || "all-packages"}`}
                    columns={columns}
                    pagination={{ size: 10 }}
                    toolbar={<ListToolBar />}
                    layout={{ card: true }}
                    // sorting={[{ id: "offerName", desc: false }]}
                    serverSide={true}
                    getRowProps={(row: any) => {
                      const isFilteredFromSearch =
                        tableSearchFilter &&
                        (row.original.offerName?.toLowerCase() === tableSearchFilter.toLowerCase() ||
                          row.original.offerCode?.toLowerCase() === tableSearchFilter.toLowerCase());

                      return {
                        className: isFilteredFromSearch ? "bg-red-100 border-2 border-red-300 shadow-sm" : "",
                        style: isFilteredFromSearch
                          ? {
                              backgroundColor: "rgb(254 226 226)",
                              borderColor: "rgb(252 165 165)",
                              fontWeight: "600",
                            }
                          : {},
                      };
                    }}
                    onFetchData={({ pageIndex, pageSize, sorting, columnFilters }) => {
                      return doGetListData(pageIndex + 1, pageSize, sorting, columnFilters);
                    }}
                  >
                    {children}
                    {/* Add SubCategoryDetailModal */}
                    {showDetailModal && selectedModalCategory && (
                      <CategoryDetailModal
                        isOpen={showDetailModal}
                        onClose={handleCloseModal}
                        category={selectedModalCategory}
                        rowData={detailModalData}
                        // isEdit={showEditDialog}
                      />
                    )}
                  </DataGridProvider>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RelatedProductOfferListContext.Provider>
  );
};

export { RelatedProductOfferListContext, RelatedProductOfferListContextProvider };
