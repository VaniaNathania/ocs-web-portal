import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { KeenIcon, DefaultTooltip } from "@/components";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import {
  MainProductOfferListContext,
  useMainProductOfferListContext,
} from "../hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import SalesCategoryContent from "./SalesCategory/SalesCategoryContent";

export interface MainProductSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleAddSideBar: (show: boolean) => void;
  handleEditSideBar: (
    show: boolean,
    categoryId?: string | null,
    categoryName?: string | null,
  ) => void;
  handleDeleteSideBar: (
    show: boolean,
    categoryId?: string | null,
    categoryName?: string | null,
  ) => void;
  handleCategoryClick: (categoryId: string, categoryName: string) => void;
  activeSubItem: string | null;
}

interface ServiceTypeProps {
  servType: number;
  networkType: string;
  networkTypeName: string;
  servTypeName: string;
  catgType: string;
  comments: string | null;
  paidFlag: string | null;
  stdCode: string | null;
}

const MainProductSidebar: React.FC<MainProductSidebarProps> = ({ isSidebarOpen, toggleSidebar, handleAddSideBar, handleEditSideBar, handleDeleteSideBar, handleCategoryClick, activeSubItem }) => {
  const { moveToSubsPlan, setMoveToSubsPlan, menuPrivAccess } = useOfferLayout();
  const [openMenus, setOpenMenus] = useState<string>("");
  const [offerDataByCategory, setOfferDataByCategory] = useState<
    Record<string, any[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceTypeProps[]>([]);
  const [serviceTypeLoaded, setServiceTypeLoaded] = useState(false);
  // const [sidebarSearchValue, setSidebarSearchValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSalesCategory, setShowSalesCategory] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const {
    categorySide,
    loading,
    setSelectedDetailSideBar,
    refreshCategorySidebar,
    selectedCategory,
    selectedCategoryId,
    selectedServiceType,
    serviceTypeOpen,
    setServiceTypeOpen,
    handleServiceTypeChange,
    refreshOfferListSidebar,
    setRefreshOfferListSidebar,
    selectedProductLine,
    setSelectedProductLine,
    handleProductLineChange,
    resetAllFilterSideBar,
    searchResult,
    setSearchResult,
    sideBarSearchValue,
    setsideBarSearchValue,
    showSearchDropdown,
    setShowSearchDropdown,
    highlightedOfferId,
    setHighlightedOfferId,
    setTableSearchFilter,
    setSearchFilterFromSidebar,
    refreshDataGrid,
  } = useMainProductOfferListContext();
  const { GetData } = useCallApi();

  // Get context untuk akses selectedCategoryId
  const context = useContext(MainProductOfferListContext);

  const API_URL_OFFER = apiConfigOffer.offer;

  // Function to fetch offer data for specific category
  const fetchOfferData = async (categoryId: string) => {
    try {
      const apiParams = {
        offerCatgId: categoryId,
        spId: 0,
        page: 1,
        size: 100,
        sortBy: "SEQ",
        sortDirection: "asc",
        search: "",
        ...(selectedProductLine && { prodType: selectedProductLine }),
        ...(selectedServiceType !== null && { servType: selectedServiceType }),
      };

      const response = await GetData(
        `${API_URL_OFFER}/offer/indep/qry-indep-offer-list-by-catg-id`,
        apiParams,
      );

      if (response?.status) {
        const list = response?.data?.list ?? response?.data ?? [];
        return Array.isArray(list) ? list : [];
      }
      return [];
    } catch (err) {
      console.error(
        `Error fetching offer data for category ${categoryId}:`,
        err,
      );
      return [];
    }
  };

  const fetchServiceType = async (page: number, size: number) => {
    try {
      const response = await GetData(`${API_URL_OFFER}/servType/qryServType`, {
        search: "",
        page: 1,
        size: 100,
        sortBy: "SERV_TYPE_NAME",
        catgType: "M",
        sortDirection: "asc",
      });
      if (response?.data) {
        setServiceType(response?.data);
      }
    } catch (error) {
      toast.error("Error GET Service Type data");
    }
  };

  const fetchSearchByName = async (search: string) => {
    if (search.trim() === "") {
      setSearchResult([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/indep/qry-indep-prod-spec-by-name`,
        {
          offerName: search,
        },
      );
      if (response?.data) {
        setSearchResult(response?.data);
        setShowSearchDropdown(true);
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
      toast.error("Error Get Search Data");
      setSearchResult([]);
      setShowSearchDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleShowSalesCategory = useCallback((open: boolean) => {
    setShowSalesCategory(open);
  }, []);

  // Handle search result selection
  const handleSearchResultSelect = async (selectedOffer: any) => {
    try {
      isSelectingRef.current = true;
      setSearchResult([]);
      setsideBarSearchValue(selectedOffer.offerName);
      setShowSearchDropdown(false);

      setTimeout(() => {
        isSelectingRef.current = false;
      }, 300);

      if (!selectedOffer.offerCatgId) {
        toast.warning("Offer does not have a valid category ID");
        return;
      }

      // console.log("Selected offer from search:", selectedOffer);

      const categoryId = selectedOffer.offerCatgId.toString();
      const categoryName = selectedOffer.offerCatgName || "Unknown Category";

      if (categoryId && !isNaN(Number(categoryId))) {
        setOpenMenus(categoryId);

        if (!offerDataByCategory[categoryId]) {
          const offerData = await fetchOfferData(categoryId);
          setOfferDataByCategory((prev) => ({
            ...prev,
            [categoryId]: offerData,
          }));
        }

        // 🎯 PERBAIKAN: Set highlight untuk sidebar - JANGAN auto-remove
        const offerIdToHighlight =
          selectedOffer.offerId?.toString() || selectedOffer.offerName;
        setHighlightedOfferId(offerIdToHighlight);

        if (context) {
          context.setSelectedCategoryId(categoryId);
          context.setSelectedCategory(categoryName);
          context.setSelectedDetailSideBar(selectedOffer);

          // 🎯 PERBAIKAN: Gunakan triggerSearchWithReset untuk memastikan pagination reset
          if (context.triggerSearchWithReset) {
            context.triggerSearchWithReset(selectedOffer.offerName);
          } else {
            // Fallback jika triggerSearchWithReset tidak tersedia
            context.setTableSearchFilter(selectedOffer.offerName);
            context.setSearchFilterFromSidebar(selectedOffer.offerName);
          }

          context.setShowDetailView(false); // 🎯 Pastikan tampil di table view

          // 🎯 Force refresh dengan key baru
          if (context.refreshDataGrid) {
            context.refreshDataGrid();
          }
        }

        handleCategoryClick(categoryId, categoryName);

        // 🎯 HAPUS setTimeout - biarkan highlight tetap sampai user pilih yang lain
      } else {
        toast.warning("Invalid category ID for this offer");
      }
    } catch (error) {
      console.error("Error handling search result selection:", error);
      toast.error("Error processing search selection");
    }
  };

  const clearSearchName = () => {
    setsideBarSearchValue("");
    setSearchResult([]);
    setShowSearchDropdown(false);
    setHighlightedOfferId(null);
    setTableSearchFilter(null);
    setSearchFilterFromSidebar(null);
    refreshDataGrid();
  };

  const handleOpenServiceTypeDropdown = async (open: boolean) => {
    if (open && !serviceTypeLoaded) {
      await fetchServiceType(1, 10);
      setServiceTypeLoaded(true);
    }
  };

  useEffect(() => {
    //  console.log("DATA MOVE", moveToSubsPlan);
  }, [moveToSubsPlan]);

  // Load offer data when menu is opened
  const handleSideBarClick = async (
    categoryId: string,
    categoryName: string,
  ) => {
    //  console.log(categoryId);
    setMoveToSubsPlan(
      (prev) => (prev = { ...prev, catgId: Number(categoryId) }),
    );
    if (openMenus === categoryId) {
      setOpenMenus("");
      return;
    }

    setOpenMenus(categoryId);

    //  refresh main product list ketika sidebar di klik
    if (context) {
      context.setSelectedCategoryId(categoryId);
      context.setSelectedCategory(categoryName);
    }
    // If opening the menu and we don't have data yet, fetch it
    if (!offerDataByCategory[categoryId]) {
      const offerData = await fetchOfferData(categoryId);
      //  console.log(offerData, "DTA");
      const dataOffer = offerData.find(
        (item) => item.offerId === moveToSubsPlan?.offerId,
      );
      //  console.log(dataOffer, "data offer");

      if (dataOffer) {
        handleOfferClick(
          (moveToSubsPlan?.catgId ?? "").toString(),
          dataOffer.offerName,
          dataOffer,
        );
        setSelectedDetailSideBar(dataOffer);
      }

      setOfferDataByCategory((prev) => ({
        ...prev,
        [categoryId]: offerData,
      }));
    }
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    categoryId: string,
    categoryName: string,
  ) => {
    e.preventDefault();
    handleDeleteSideBar(true, categoryId, categoryName);
  };

  // Convert offer data to menu items format
  const getOfferMenuItems = (categoryId: string) => {
    const offerData = offerDataByCategory[categoryId] || [];

    return offerData.map((offer) => ({
      label: offer.offerName,
      link: `/${offer.offerCode || offer.offerName.toLowerCase().replace(/\s+/g, "-")}`,
      icon: offer.offerType === "Package" ? "package" : "gift", // Different icons based on offer type
      id: offer.offerId?.toString() || offer.offerName,
      offerCode: offer.offerCode,
      offerType: offer.offerType,
      isPackage: offer.isPackage,
      servTypeName: offer.servTypeName,
      originalData: offer, // Keep original data for context
    }));
  };

  useEffect(() => {
    if (refreshOfferListSidebar) {
      (async () => {
        const offerData = await fetchOfferData(refreshOfferListSidebar);
        setOfferDataByCategory((prev) => ({
          ...prev,
          [refreshOfferListSidebar]: offerData,
        }));
        setRefreshOfferListSidebar(null); // reset setelah fetch
      })();
    }
  }, [refreshOfferListSidebar]);

  useEffect(() => {
    if (isSelectingRef.current) {
      return;
    }

    const delay = setTimeout(() => {
      if (sideBarSearchValue && sideBarSearchValue.trim() !== "") {
        fetchSearchByName(sideBarSearchValue.trim());
      } else {
        setSearchResult([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [sideBarSearchValue]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    //  console.log(categorySide, "data categorySide");
    const category = categorySide.find(
      (item) => Number(item.offerCatgId) === moveToSubsPlan?.catgId,
    );
    //  console.log("data catg", category);
    if (!category) return;
    handleSideBarClick(
      category?.offerCatgId ?? "",
      category?.offerCatgName ?? "",
    );
  }, [categorySide]);

  // Handle offer item click
  const handleOfferClick = (
    categoryId: string,
    offerName: string,
    offerData: any,
  ) => {
    //  console.log(categoryId, offerName, offerData);
    // setsideBarSearchValue(offerName);
    setMoveToSubsPlan(
      (prev) => (prev = { ...prev, offerId: offerData.offerId }),
    );

    isSelectingRef.current = true;
    setShowSearchDropdown(false);
    // 🎯 PERBAIKAN: Set highlight untuk item yang diklik di sidebar
    const offerIdToHighlight =
      offerData.offerId?.toString() || offerData.offerName;
    setHighlightedOfferId(offerIdToHighlight);
    // console.log("test 1");

    if (context) {
      // 🎯 Set category dan offer data
      context.setSelectedCategoryId(categoryId);
      context.setSelectedCategory(offerName);
      context.setSelectedDetailSideBar(offerData);

      // 🎯 PERBAIKAN: Tampilkan detail view ketika klik offer dari sidebar
      requestAnimationFrame(() => {
        context.setShowDetailView(true);
      });

      // 🎯 Clear table search filters karena kita tampilkan detail
      context.setTableSearchFilter(null);
      context.setSearchFilterFromSidebar(null);
    }

    // handleCategoryClick(categoryId, offerName);
  };

  const hastFetch = useRef(false);
  useEffect(() => {
    if (!hastFetch.current && categorySide.length > 0) {
      const categoryId = categorySide[0]?.offerCatgId;
      const categoryName = categorySide[0]?.offerCatgName;

      setOpenMenus(categoryId);
      setMoveToSubsPlan(
        (prev) => (prev = { ...prev, catgId: Number(categoryId) }),
      );

      (async () => {
        const offerData = await fetchOfferData(categoryId);
        setOfferDataByCategory((prev) => ({
          ...prev,
          [categoryId]: offerData,
        }));
      })();

      if (context) {
        context.setSelectedCategory(categoryId);
        context.setSelectedCategory(categoryName);
      }

      hastFetch.current = true;
    }
  }, [categorySide]);

  return (
    <div
      className={`relative transition-all duration-300 flex flex-col shadow-md h-[90vh]  ${isSidebarOpen ? "border-[1px] w-64 opacity-100" : "opacity-0 w-0"}`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-[0.15rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md"
      >
        {isSidebarOpen ? (
          <KeenIcon icon="left-square" />
        ) : (
          <KeenIcon icon="right-square" />
        )}
      </button>

      <div className="p-3">
        <div className="flex items-center justify-between">
          {isSidebarOpen && (
            <div className="text-lg font-bold">Main Product</div>
          )}
          <div className="flex items-center gap-2">
            <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
              <DefaultTooltip title="Add Data" placement="top">
                <Button
                  variant="default"
                  className="h-7.5 w-7.5"
                  onClick={() => handleAddSideBar(true)}
                >
                  <KeenIcon icon="plus" />
                </Button>
              </DefaultTooltip>
            </AccessWrapper>
            {/* Add Reset Button */}
            <DefaultTooltip title={"Reset Filter"} placement={"top"}>
              <Button
                variant="destructive"
                className="h-7.5 w-7.5"
                onClick={resetAllFilterSideBar}
              >
                <KeenIcon icon="arrow-circle-left" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>

      {/* Search by name */}
      <div className="px-3 relative">
        <label className="input input-sm w-full flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            ref={searchInputRef}
            type="text"
            value={sideBarSearchValue}
            onChange={(e) => setsideBarSearchValue(e.target.value)}
            onFocus={() => {
              if (searchResult.length > 0) {
                setShowSearchDropdown(true);
              }
            }}
            placeholder="Search Main Product Name..."
            className="w-full"
          />
          {sideBarSearchValue && (
            <button
              type="button"
              onClick={clearSearchName}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </label>

        {showSearchDropdown && (
          <div
            ref={searchDropdownRef}
            className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {searchResult.length > 0 ? (
              <ul className="py-1">
                {searchResult.map((offer, index) => (
                  <li key={`${offer.offerId}-${index}`}>
                    <button
                      onClick={() => handleSearchResultSelect(offer)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <KeenIcon
                          icon={
                            offer.offerType === "Package" ? "package" : "gift"
                          }
                          className="w-4 h-4 text-blue-600 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-medium text-sm text-gray-900 truncate"
                            title={offer.offerName}
                          >
                            {offer.offerName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {offer.offerCode}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${offer.offerType === "Package" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                          >
                            {offer.offerType}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {isSearching ? "Searching..." : "No results found"}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex w-full gap-2 px-3 py-3">
        {/* Product Line */}
        <div className="flex items-center justify-between w-1/2">
          <Select
            value={selectedProductLine}
            onValueChange={handleProductLineChange}
          >
            <SelectTrigger className="flex-1 min-w-0 px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Product Line" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clear">All Data</SelectItem>
              <SelectItem value="F">Fix</SelectItem>
              <SelectItem value="M">Mobile</SelectItem>
            </SelectContent>
          </Select>

          {selectedProductLine && (
            <button
              type="button"
              onClick={() => handleProductLineChange("")}
              className="ml-1 p-1 rounded-md hover:bg-gray-100 transition"
              title="Clear"
            >
              <KeenIcon icon="cross" className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>

        {/* Service Type */}
        <div className="flex items-center justify-between w-1/2">
          <Select
            value={
              selectedServiceType !== null ? selectedServiceType.toString() : ""
            }
            onValueChange={(value) => handleServiceTypeChange(Number(value))}
            onOpenChange={handleOpenServiceTypeDropdown}
            disabled={isSubmitting}
          >
            <SelectTrigger
              className="flex-1 min-w-0 px-2 py-1 text-xs h-8"
              title={
                selectedServiceType
                  ? `${serviceType.find((t) => t.servType.toString() === selectedServiceType.toString())?.servTypeName || ""} [${serviceType.find((t) => t.servType.toString() === selectedServiceType.toString())?.networkTypeName || ""}]`
                  : "Service Type"
              }
            >
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent side="bottom" className="max-h-60 overflow-y-auto">
              {serviceType.map((type) => (
                <SelectItem
                  key={type.servType}
                  value={type.servType.toString()}
                  title={`${type.servTypeName} [${type.networkTypeName}]`}
                >
                  {type.servTypeName}[{type.networkTypeName}]
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedServiceType && (
            <button
              type="button"
              onClick={() => handleServiceTypeChange(null)}
              className="ml-1 p-1 rounded-md hover:bg-gray-100 transition"
              title="Clear"
            >
              <KeenIcon icon="cross" className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="mt-2 text-sm px-2 overflow-y-auto mb-5">
          {categorySide && categorySide.length > 0 ? (
            categorySide.map((category) => {
              const categoryId = category.offerCatgId.toString();
              const categoryName = category.offerCatgName;
              const isOpen = openMenus == categoryId;
              const isSelected = selectedCategoryId === categoryId; // Check if this category is selected
              const offerItems = getOfferMenuItems(categoryId);

              return (
                <li key={category.offerCatgId}>
                  <button
                    onClick={() => handleSideBarClick(categoryId, categoryName)}
                    className={`flex items-center w-full px-2 py-1 hover:bg-gray-200 rounded transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                  >
                    <KeenIcon
                      icon="package"
                      className={`w-4 h-4 mr-2 ${isSelected ? "text-red-700" : "text-red-500"}`}
                    />
                    {isSidebarOpen && (
                      <>
                        <div className="flex-1 min-w-0 text-center">
                          <span
                            className={`block font-medium text-xs whitespace-normal break-words ${isSelected ? "text-red-700 font-semibold" : ""}`}
                          >
                            {categoryName}
                          </span>
                        </div>

                        {!loading && (
                          <div className="flex items-center gap-1 ml-auto">
                            <span
                              className={`text-white text-xs rounded-full px-2 py-1 min-w-[28px] h-[28px] flex items-center justify-center font-medium ${isSelected ? "bg-red-700" : "bg-red-500"}`}
                            >
                              {category.cnt}
                            </span>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div
                                  className="w-[28px] h-[28px] flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-300 transition"
                                  title="options"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <AccessWrapper
                                  hasAccess={menuPrivAccess?.editStatus}
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSideBar(
                                        true,
                                        categoryId,
                                        categoryName,
                                      );
                                    }}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                </AccessWrapper>
                                <AccessWrapper
                                  hasAccess={menuPrivAccess?.deleteStatus}
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSideBar(
                                        true,
                                        categoryId,
                                        categoryName,
                                      );
                                    }}
                                    className="text-red-500 focus:text-red-500"
                                  >
                                    <Trash className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </AccessWrapper>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <MdKeyboardArrowRight
                              className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </button>

                  {/* Render offer sub-items dynamically */}
                  {isOpen && isSidebarOpen && (
                    <ul className="ml-4 font-light text-xs mt-1">
                      {offerItems.length > 0 ? (
                        offerItems.map((offer) => (
                          <li key={offer.id}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOfferClick(
                                  categoryId,
                                  offer.label,
                                  offer.originalData,
                                );
                                setSelectedDetailSideBar(offer.originalData);
                                // setHighlightedOfferId(null);
                              }}
                              className={`flex items-center w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 hover:shadow-sm ${
                                highlightedOfferId === offer.id
                                  ? "bg-red-100 border-2 border-red-400 shadow-sm"
                                  : activeSubItem === offer.label
                                    ? "bg-blue-100 shadow-sm"
                                    : "hover:bg-gray-100"
                              }`}
                              title={`${offer.label} (${offer.offerCode})`}
                            >
                              <KeenIcon
                                icon={offer.icon}
                                className={`w-4 h-4 mr-2 transition-colors duration-200 ${highlightedOfferId === offer.id ? "text-red-500" : activeSubItem === offer.label ? "text-blue-600" : "text-gray-500 hover:text-blue-500"}`}
                              />
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`block truncate transition-colors duration-200 ${
                                    highlightedOfferId === offer.id
                                      ? "font-semibold text-red-500"
                                      : activeSubItem === offer.label
                                        ? "font-medium text-blue-700"
                                        : "hover:text-gray-900"
                                  }`}
                                >
                                  {offer.label}
                                </span>
                              </div>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="px-2 py-1.5 text-gray-500 italic">
                          {offerDataByCategory[categoryId] === undefined
                            ? "Loading offers..."
                            : "No offers found"}
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              );
            })
          ) : (
            <li>
              {true && isSidebarOpen && (
                <ul className="ml-4 font-light text-xs mt-1">
                  <li className="px-2 py-1.5 text-gray-500 italic">
                    {loading ? "Loading..." : "No data available"}
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>
      <div className="p-3 border-t bg-white">
        <DefaultTooltip title="Sales Category" placement="top">
          <Button
            variant="default"
            className="h-7.5"
            onClick={() => handleShowSalesCategory(true)}
          >
            Sales Category
          </Button>
        </DefaultTooltip>
      </div>
      <SalesCategoryContent
        isOpen={showSalesCategory}
        onClose={() => setShowSalesCategory(false)}
      />
    </div>
  );
};

export default MainProductSidebar;
