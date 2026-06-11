import React, { useState, useMemo, useContext, useEffect, useRef } from "react";
import { DefaultTooltip, KeenIcon } from "@/components";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { Check, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import RelatedProductActions from "../actions/RelatedProductActions";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { RelatedProductOfferListContext } from "../hooks/RelatedProductOfferListContext";
import { Button } from "@/components/ui/button";
import { useRelatedProductOfferListContext } from "../hooks/useRelatedProductOfferListContext";
import { toast } from "sonner";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface RelatedProductSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleAddSideBar: (show: boolean) => void;
  handleEditSideBar: (show: boolean, categoryId?: string | null, categoryName?: string | null) => void;
  handleDeleteSideBar: (show: boolean, categoryId?: string | null, categoryName?: string | null) => void;
  handleCategoryClick: (categoryId: string, categoryName: string) => void;
  activeSubItem: string | null;
}

const RelatedProductSidebar: React.FC<RelatedProductSidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  handleAddSideBar,
  handleEditSideBar,
  handleDeleteSideBar,
  handleCategoryClick,
  activeSubItem,
}) => {
  const [offerDataByCategory, setOfferDataByCategory] = useState<Record<string, any[]>>({});
  const [openMenus, setOpenMenus] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSearchingCode, setIsSearchingCode] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchCodeInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchCodeDropdownRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);
  const { menuPrivAccess } = useOfferLayout();

  const { serviceType, loading, error: serviceTypeError, fetchServiceTypeList } = RelatedProductActions();
  const {
    categorySideBar,
    selectedServiceType,
    serviceTypeOpen,
    setServiceTypeOpen,
    handleServiceTypeChange,
    refreshOfferListSidebar,
    setRefreshOfferListSidebar,
    setSelectedDetailSideBar,
    selectedPackage,
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
    showSearchDropdownCode,
    setShowSearchDropdownCode,
    highlightedOfferId,
    setHighlightedOfferId,
    setTableSearchFilter,
    refreshDataGrid,
    setSearchFilterFromSidebar,
  } = useRelatedProductOfferListContext();
  const { GetData } = useCallApi();

  const context = useContext(RelatedProductOfferListContext);

  const API_URL_OFFER = apiConfigOffer.offer;

  const fetchOfferData = async (categoryId: string) => {
    try {
      const apiParams = {
        offerCatgId: categoryId,
        // spId: 0,
        page: 1,
        size: 100,
        sortBy: "SEQ",
        sortDirection: "asc",
        search: "",
        ...(selectedPackage && { isPackage: selectedPackage }),
        ...(selectedServiceType && { servType: selectedServiceType }),
      };

      const response = await GetData(`${API_URL_OFFER}/offer/depend/qry-depend-offer-list-by-catg-id`, apiParams);

      if (response?.status) {
        const list = response?.data?.list ?? response?.data ?? [];
        return Array.isArray(list) ? list : [];
      }
      return [];
    } catch (err) {
      console.error(`Error fetching offer data for category ${categoryId}:`, err);
      return [];
    }
  };

  const fetchSearchByName = async (search: string) => {
    if (search.trim() === "") {
      setsearchResult([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/depend/qry-depend-prod-spec-by-name`, {
        offerName: search,
      });
      if (response?.data) {
        setsearchResult(response?.data);
        setShowSearchDropdown(true);
      }
    } catch (error) {
      console.error("Error fetching search data by name:", error);
      toast.error("Error Get Search Data by name");
      setsearchResult([]);
      setShowSearchDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchSearchByCode = async (search: string) => {
    if (search.trim() === "") {
      setSearchResultcode([]);
      setShowSearchDropdown(false);
    }

    setIsSearchingCode(true);
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/depend/qry-depend-prod-spec-by-name`, {
        offerCode: search,
      });

      if (response?.data) {
        setSearchResultcode(response?.data);
        setShowSearchDropdownCode(true);
      }
    } catch (error) {
      console.error("Error fetching search data by code:", error);
      toast.error("Error Get Search Data by Code");
      setSearchResultcode([]);
      setShowSearchDropdownCode(false);
    } finally {
      setIsSearchingCode(false);
    }
  };

  const handleDropdownSelection = async (selectedOffer: any, isFromCode: boolean = false) => {
    // Set flag untuk mencegah useEffect
    isSelectingRef.current = true;

    try {
      // Force close dropdown dan clear hasil
      if (isFromCode) {
        setShowSearchDropdownCode(false);
        setSearchResultcode([]);
        setSidebarSearchValueCode(selectedOffer.offerCode);
      } else {
        setShowSearchDropdown(false);
        setsearchResult([]);
        setsideBarSearchValue(selectedOffer.offerName);
      }

      // Reset flag setelah delay
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 500);

      // Panggil logic selection
      await handleSearchResultSelect(selectedOffer, isFromCode);
    } catch (error) {
      console.error("Error in dropdown selection:", error);
      isSelectingRef.current = false;
    }
  };

  const handleSearchResultSelect = async (selectedOffer: any, isFromCode: boolean = false) => {
    try {
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

        const offerIdToHighlight = selectedOffer.offerId?.toString();
        if (offerIdToHighlight) {
          setHighlightedOfferId(offerIdToHighlight);
        } else {
          toast.warning("Offer ID tidak valid untuk highlight");
        }

        if (context) {
          context.setSelectedCategoryId(categoryId);
          context.setSelectedCategory(categoryName);
          context.setSelectedDetailSideBar(selectedOffer);

          if (context.triggerSearchWithReset) {
            context.triggerSearchWithReset(selectedOffer.offerName);
          } else {
            context.setTableSearchFilter(selectedOffer.offerName);
            context.setSearchFilterFromSidebar(selectedOffer.offerName);
          }

          context.setShowDetailView(false);

          if (context.refreshDataGrid) {
            context.refreshDataGrid();
          }
        }

        handleCategoryClick(categoryId, categoryName);
      } else {
        toast.warning("Invalid category ID for this offer");
      }
    } catch (error) {
      console.error("Error handling search result selection:", error);
      toast.error("Error processing search selection");
    }
  };

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

      if (
        searchCodeDropdownRef.current &&
        !searchCodeDropdownRef.current.contains(event.target as Node) &&
        searchCodeInputRef.current &&
        !searchCodeInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdownCode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSideBarClick = async (categoryId: string, categoryName: string) => {
    if (openMenus === categoryId) {
      setOpenMenus("");
      return;
    }

    setOpenMenus(categoryId);

    if (context) {
      context.setSelectedCategoryId(categoryId);
      context.setSelectedCategory(categoryName);
    }

    if (!offerDataByCategory[categoryId]) {
      const offerData = await fetchOfferData(categoryId);
      setOfferDataByCategory((prev) => ({
        ...prev,
        [categoryId]: offerData,
      }));
    }
  };

  const getOfferMenuItems = (categoryId: string) => {
    const offerData = offerDataByCategory[categoryId] || [];

    return offerData.map((offer) => ({
      label: offer.offerName,
      link: `/${offer.offerCode || offer.offerName.toLowerCase().replace(/\s+/g, "-")}`,
      icon: offer.offerType === "Package" ? "package" : "gift",
      id: offer.offerId?.toString() || offer.offerName,
      offerCode: offer.offerCode,
      offerType: offer.offerType,
      isPackage: offer.isPackage,
      servTypeName: offer.servTypeName,
      originalData: offer,
    }));
  };

  const handleOfferClick = (categoryId: string, offerName: string, offerData: any) => {
    // console.log("🔵 handleOfferClick called", { categoryId, offerName });

    const offerIdToHighlight = offerData.offerId?.toString();
    if (offerIdToHighlight) {
      setHighlightedOfferId(offerIdToHighlight);
    } else {
      toast.warning("Offer ID tidak valid untuk highlight");
    }

    if (context) {
      // console.log("🟢 Setting context showDetailView to TRUE");
      context.setSelectedCategoryId(categoryId);
      context.setSelectedCategory(offerName);
      context.setSelectedDetailSideBar(offerData);

      requestAnimationFrame(() => {
        context.setShowDetailView(true);
      });

      context.setTableSearchFilter(null);
      context.setSearchFilterFromSidebar(null);
    }

    handleCategoryClick(categoryId, offerName);
  };

  const clearSearchName = () => {
    setsideBarSearchValue("");
    setsearchResult([]);
    setShowSearchDropdown(false);
    setHighlightedOfferId(null);
    setTableSearchFilter(null);
    setSearchFilterFromSidebar(null);
    refreshDataGrid();
  };

  const clearSearchCode = () => {
    setSidebarSearchValueCode("");
    setSearchResultcode([]);
    setShowSearchDropdownCode(false);
    setHighlightedOfferId(null);
    setTableSearchFilter(null);
    setSearchFilterFromSidebar(null);
    refreshDataGrid();
  };

  useEffect(() => {
    if (refreshOfferListSidebar) {
      (async () => {
        const offerData = await fetchOfferData(refreshOfferListSidebar);
        setOfferDataByCategory((prev) => ({
          ...prev,
          [refreshOfferListSidebar]: offerData,
        }));
        setRefreshOfferListSidebar(null);
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
        setsearchResult([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [sideBarSearchValue]);

  useEffect(() => {
    if (isSelectingRef.current) {
      return;
    }

    const delay = setTimeout(() => {
      if (sidebarSearchValueCode && sidebarSearchValueCode.trim() !== "") {
        fetchSearchByCode(sidebarSearchValueCode.trim());
      } else {
        setSearchResultcode([]);
        setShowSearchDropdownCode(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [sidebarSearchValueCode]);

  const hastFetch = useRef(false);
  useEffect(() => {
    if (!hastFetch.current && categorySideBar.length > 0) {
      const categoryId = categorySideBar[0]?.offerCatgId.toString();
      const categoryName = categorySideBar[0]?.offerCatgName;

      setOpenMenus(categoryId);

      (async () => {
        const offerData = await fetchOfferData(categoryId);
        setOfferDataByCategory((prev) => ({
          ...prev,
          [categoryId]: offerData,
        }));
      })();

      if (context) {
        context.setSelectedCategoryId(categoryId);
        context.setSelectedCategory(categoryName);
      }

      hastFetch.current = true;
    }
  }, [categorySideBar]);

  return (
    <div
      className={`relative transition-all duration-300 shadow-md h-[90vh] flex flex-col overflow-x-hidden ${isSidebarOpen ? "border-[1px] w-64 opacity-100" : "opacity-0 w-0"} overflow-hidden`}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          {isSidebarOpen && <div className="text-lg font-bold">Related Product</div>}
          <div className="flex items-center gap-2">
            <AccessWrapper hasAccess={menuPrivAccess?.addStatus} enabledText="Add Data">
              <Button variant="default" className="h-7.5 w-7.5" onClick={() => handleAddSideBar(true)}>
                <KeenIcon icon="plus" />
              </Button>
            </AccessWrapper>
            {/* Add Reset Button */}
            <DefaultTooltip title={"Reset Filter"} placement={"top"}>
              <Button variant="destructive" className="h-7.5 w-7.5" onClick={resetAllFilterSideBar}>
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
            placeholder="Search Related Product Name..."
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
                  <li key={offer.offerId ?? `temp-${index}`}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDropdownSelection(offer, false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <KeenIcon
                          icon={offer.offerType === "Package" ? "package" : "gift"}
                          className="w-4 h-4 text-blue-600 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate" title={offer.offerName}>
                            {offer.offerName}
                          </div>
                          <div className="text-xs text-gray-500 truncate" title={offer.offerCode}>
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

      {/* search by code */}
      <div className="px-3 py-2 relative">
        <label className="input input-sm w-full flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            ref={searchCodeInputRef}
            type="text"
            value={sidebarSearchValueCode}
            onChange={(e) => setSidebarSearchValueCode(e.target.value)}
            onFocus={() => {
              if (searchResultcode.length > 0) {
                setShowSearchDropdownCode(true);
              }
            }}
            placeholder="Search Offer Code..."
            className="w-full"
          />
          {sidebarSearchValueCode && (
            <button
              type="button"
              onClick={clearSearchCode}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </label>

        {showSearchDropdownCode && (
          <div
            ref={searchCodeDropdownRef}
            className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {searchResultcode.length > 0 ? (
              <ul className="py-1">
                {searchResultcode.map((offer, index) => (
                  <li key={offer.offerId ?? `temp-${index}`}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDropdownSelection(offer, true);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <KeenIcon
                          icon={offer.offerType === "Package" ? "package" : "gift"}
                          className="w-4 h-4 text-blue-600 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          {/* Tampilkan code di atas, name di bawah */}
                          <div className="font-medium text-sm text-gray-900 truncate">{offer.offerCode}</div>
                          <div className="text-xs text-gray-500 truncate">{offer.offerName}</div>
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
                {isSearchingCode ? "Searching..." : "No results found"}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex w-full gap-2 px-3">
        <div className="flex-1 min-w-0 relative">
          <Select
            value={selectedPackage}
            onValueChange={(value) => {
              // console.log("Select onChange triggered:", value);
              handlePackageChange(value);
            }}
          >
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8">
              <SelectValue placeholder="Package Flag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clear">All Data</SelectItem>
              <SelectItem value="Y">Yes</SelectItem>
              <SelectItem value="N">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Service Type Popover */}
        <div className="flex-1 min-w-0">
          <Popover
            open={serviceTypeOpen}
            onOpenChange={(open) => {
              setServiceTypeOpen(open);
              if (open && serviceType.length === 0 && !loading) {
                fetchServiceTypeList();
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`w-full px-2 py-1 text-xs font-medium h-8 border border-gray-300 rounded-md flex items-center justify-between`}
                disabled={loading}
              >
                <span
                  className="truncate max-w-[180px]"
                  title={
                    loading
                      ? "Loading service types..."
                      : (() => {
                          const selected = serviceType.find(
                            (service) => String(service.servType) === selectedServiceType
                          );
                          return selected ? `${selected.servTypeName} [${selected.networkTypeName}]` : "Service Type";
                        })()
                  }
                >
                  {loading
                    ? "Loading service types..."
                    : (() => {
                        const selected = serviceType.find(
                          (service) => String(service.servType) === selectedServiceType
                        );
                        return selected ? `${selected.servTypeName} [${selected.networkTypeName}]` : "Service Type";
                      })()}
                </span>

                <MdKeyboardArrowDown className="h-4 w-4 opacity-50 shrink-0" />
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px] p-0" onWheel={(e) => e.stopPropagation()}>
              <Command>
                <CommandInput placeholder="Search Service Type..." />
                <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto">
                  <CommandEmpty>{loading ? "Loading..." : "No Service Type found."}</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="clear"
                      onSelect={() => handleServiceTypeChange("")}
                      className="text-gray-500 cursor-pointer text-xs"
                    >
                      All Data
                    </CommandItem>
                    {serviceTypeError ? (
                      <CommandItem value="error" disabled>
                        Error loading data
                      </CommandItem>
                    ) : serviceType && serviceType.length > 0 ? (
                      serviceType.map((item) => {
                        const isSelected = String(item.servType) === selectedServiceType;
                        return (
                          <CommandItem
                            key={item.servType}
                            value={`${item.servTypeName} [${item.networkTypeName}]`}
                            onSelect={() => handleServiceTypeChange(String(item.servType))}
                            className="cursor-pointer text-xs flex items-center gap-2"
                          >
                            {/* Checkmark jika item sedang dipilih */}
                            {isSelected && <Check className="h-3 w-3 text-blue-500" />}
                            <span className="truncate w-full overflow-hidden text-ellipsis whitespace-nowrap" title={`${item.servTypeName} [${item.networkTypeName}]`}>
                              {item.servTypeName} [{item.networkTypeName}]
                            </span>
                          </CommandItem>
                        );
                      })
                    ) : (
                      !loading && (
                        <CommandItem value="no-data" disabled>
                          No service types available
                        </CommandItem>
                      )
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ul className="mt-2 text-sm px-2 flex-1 overflow-y-auto mb-5">
        {categorySideBar && categorySideBar.length > 0 ? (
          categorySideBar.map((category) => {
            const categoryId = category.offerCatgId.toString();
            const categoryName = category.offerCatgName;
            const isOpen = openMenus == categoryId;
            const offerItems = getOfferMenuItems(categoryId);

            return (
              <React.Fragment key={category.offerCatgId}>
                <button
                  onClick={toggleSidebar}
                  className="absolute -right-[0.5rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md"
                >
                  {isSidebarOpen ? <KeenIcon icon="left-square" /> : <KeenIcon icon="right-square" />}
                </button>
                <li key={category.offerCatgId}>
                  <button
                    onClick={() => handleSideBarClick(categoryId, categoryName)}
                    className={`flex items-center w-full px-2 py-1 hover:bg-gray-200 rounded transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                  >
                    <KeenIcon icon="package" className="w-4 h-4 mr-2 text-blue-600" />
                    {isSidebarOpen && (
                      <>
                        <div className="flex-1 min-w-0 text-center max-w-[115px]">
                          <span className="block font-medium text-xs whitespace-normal break-words">
                            {categoryName}
                          </span>
                        </div>

                        {!loading && (
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[28px] h-[28px] flex items-center justify-center font-medium">
                              {category.cnt}
                            </span>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <div
                                  className="w-[28px] h-[28px] flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-300 transition"
                                  title="other"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleEditSideBar(true, categoryId, categoryName);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                </AccessWrapper>
                                <AccessWrapper hasAccess={menuPrivAccess?.deleteStatus}>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleDeleteSideBar(true, categoryId, categoryName);
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
                                handleOfferClick(categoryId, offer.label, offer.originalData);
                                setSelectedDetailSideBar(offer.originalData);
                                setHighlightedOfferId(null);
                              }}
                              className={`flex items-center w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:shadow-sm ${
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
                                className={`w-4 h-4 mr-2 transition-colors duration-200 ${highlightedOfferId === offer.id ? "text-yellow-600" : activeSubItem === offer.label ? "text-blue-600" : "text-gray-500 hover:text-blue-500"}`}
                              />
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`block truncate transition-colors duration-200 ${
                                    highlightedOfferId === offer.id
                                      ? "font-semibold text-yellow-800"
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
                          {offerDataByCategory[categoryId] === undefined ? "Loading offers..." : "No offers found"}
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              </React.Fragment>
            );
          })
        ) : (
          <li>
            {true && isSidebarOpen && (
              <ul className="ml-4 font-light text-xs mt-1">
                <li className="px-2 py-1.5 text-gray-500 italic">No data available</li>
              </ul>
            )}
          </li>
        )}
      </ul>
    </div>
  );
};

export default RelatedProductSidebar;
