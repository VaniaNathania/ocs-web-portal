import React, { useState, useContext, useEffect, useRef } from "react";
import { KeenIcon } from "@/components";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { SubscriptionPlanOfferListContext } from "../hooks/SubscriptionPlanOfferListContext";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import { toast } from "sonner";
import { useOfferLayout } from "@/layouts/main-menu/offer";

export interface SubscriptionPlanSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleAddSideBar: (show: boolean) => void;
  handleEditSideBar: (show: boolean, categoryId?: string | null, categoryName?: string | null) => void;
  handleDeleteSideBar: (show: boolean, categoryId?: string | null, categoryName?: string | null) => void;
  handleCategoryClick: (categoryId: string, categoryName: string) => void;
  activeSubItem: string | null;
  setActiveSubItem: React.Dispatch<React.SetStateAction<string | null>>;
}

interface ServiceTypeProps {
  servType: number;
  networkType: string;
  servTypeName: string;
  catgType: string;
  comments: string | null;
  paidFlag: string | null;
  stdCode: string | null;
}

const SubscriptionPlanSideBar: React.FC<SubscriptionPlanSidebarProps> = ({ isSidebarOpen, toggleSidebar, handleEditSideBar, handleDeleteSideBar, handleCategoryClick, activeSubItem, setActiveSubItem }) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [offerDataByCategory, setOfferDataByCategory] = useState<Record<string, any[]>>({});
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [filterBy, setFilterBy] = useState<string>("2");
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const { setSelectedSubSubPlan, moveToSubsPlan, setServType, selectedSubSubPlan } = useOfferLayout();
  const [selectedOffer, setSelectedOffer] = useState<any>();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  const filterOption = [
    { value: "2", label: "Main Product Name" },
    { value: "7", label: "Subscription Plan Name" },
  ];

  const selectLabel = filterOption.find((opt) => opt.value === filterBy)?.label ?? "";

  const { categorySide, loading, setSelectedDetailSideBar, selectedCategoryId, selectedServiceType, refreshOfferListSidebar, setRefreshOfferListSidebar, selectedProductLine, searchResult, setSearchResult, sideBarSearchValue, setsideBarSearchValue, showSearchDropdown, setShowSearchDropdown, highlightedOfferId, setHighlightedOfferId, subscriptionPlanByOffer, loadingPlansForOffer, fetchSubscriptionPlans, handleBackToList, setShowDetailView } = useSubscriptionPlanOfferListContext();
  const { GetData } = useCallApi();

  // Get context untuk akses selectedCategoryId
  const context = useContext(SubscriptionPlanOfferListContext);

  const API_URL_OFFER = apiConfigOffer.offer;

  // Function to fetch offer data for specific category
  const fetchOfferData = async (categoryId: string) => {
    try {
      const apiParams = {
        offerCatgClass: "A",
        spId: 0,
        method: "qryIndepProdCatgMemAndCntOfSubs",
        offerCatgType: 2,
        offerCatgId: categoryId,
        search: "",
        ...(selectedProductLine && { prodType: selectedProductLine }),
        ...(selectedServiceType && { servType: selectedServiceType }),
      };

      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`, apiParams);

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
      setSearchResult([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await GetData(`${API_URL_OFFER}/offer/qry-offer-by-name`, {
        offerName: search,
        offerType: filterBy,
        spId: 0,
        isBundleFlagN: "N",
      });
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

  const handleSearchResultSelect = async (selectedOffer: any) => {
    try {
      isSelectingRef.current = true;
      setSearchResult([]);
      setsideBarSearchValue(selectedOffer.offerName);
      setShowSearchDropdown(false);

      // console.log(selectedOffer);

      setTimeout(() => {
        isSelectingRef.current = false;
      }, 300);

      if (!selectedOffer.offerId || !selectedOffer.indepProdSpecId) {
        toast.warning("Offer does not have valid ID");
        return;
      }

      let foundParentId: string | null = null;
      let foundCategoryName: string | null = null;
      let matchedOffer: any = null;

      for (const category of categorySide || []) {
        const categoryId = category.offerCatgId.toString();

        let offerData = offerDataByCategory[categoryId];
        if (!offerData) {
          offerData = await fetchOfferData(categoryId);
          setOfferDataByCategory((prev) => ({
            ...prev,
            [categoryId]: offerData,
          }));
        }

        matchedOffer = offerData?.find((offer: any) => offer.offerId === selectedOffer.indepProdSpecId || offer.indepProdSpecId === selectedOffer.indepProdSpecId);

        if (matchedOffer) {
          foundParentId = categoryId;
          foundCategoryName = category.offerCatgName;
          break;
        }
      }

      if (!foundParentId || !matchedOffer) {
        console.error("❌ Could not find parent category for offer:", selectedOffer);
        toast.warning("Could not find parent category for this offer");
        return;
      }

      if (selectedOffer.indepProdSpecId !== selectedOffer.offerId) {
        setOpenMenus((prev) => ({
          ...prev,
          [foundParentId]: true,
          [matchedOffer.offerId]: true,
        }));
      } else {
        setOpenMenus((prev) => ({
          ...prev,
          [foundParentId]: true,
          // [matchedOffer.offerId]: true,
        }));
      }
      // setOpenMenus((prev) => ({
      //   ...prev,
      //   [foundParentId]: true,
      //   [matchedOffer.offerId]: true,
      // }));

      const isSubscriptionPlan = selectedOffer.offerType === "7" || selectedOffer.offerType === 7 || selectedOffer.isSubscriptionPlan === true || selectedOffer.offerId !== selectedOffer.indepProdSpecId;

      // handleCategoryClick(
      //   foundParentId,
      //   foundCategoryName || selectedOffer.offerName
      // );
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (isSubscriptionPlan) {
        let subscriptionPlans = subscriptionPlanByOffer[matchedOffer.offerId] || [];
        // handleSubscriptionPlanClick(selectedOffer,selectedOffer.)

        if (subscriptionPlans.length === 0) {
          try {
            const fetchedPlans = await fetchSubscriptionPlans(matchedOffer.offerId);

            if (fetchedPlans && Array.isArray(fetchedPlans) && fetchedPlans.length > 0) {
              subscriptionPlans = fetchedPlans;
            } else {
              let retries = 0;
              const maxRetries = 10;

              while (retries < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                subscriptionPlans = subscriptionPlanByOffer[matchedOffer.offerId] || [];
                retries++;
              }
            }
          } catch (error) {
            console.error("❌ Error fetching subscription plans:", error);
          }
        }

        const matchedPlan = subscriptionPlans.find((plan: any) => {
          const idMatch = plan.subsPlanId === selectedOffer.offerId || plan.offerId === selectedOffer.offerId;
          const nameMatch = plan.offerName?.toLowerCase().trim() === selectedOffer.offerName?.toLowerCase().trim();
          return idMatch || nameMatch;
        });

        setSelectedSubSubPlan(matchedPlan);

        if (matchedPlan) {
          setActivePlanId(matchedPlan.subsPlanId || matchedPlan.offerId);
          setHighlightedOfferId(null);
          if (context) {
            context.setParentOfferData({
              ...matchedOffer,
              parentCategoryId: foundParentId,
              dataType: "offer",
            });

            const subscriptionPlanData = {
              ...matchedPlan,
              parentOffer: matchedOffer,
              parentCategoryId: foundParentId,
              dataType: "subsPlan",
            };

            context.setSelectedDetailSideBar(subscriptionPlanData);
            context.setSelectedCategoryId(foundParentId);
            context.setSelectedCategory(matchedPlan.offerName);
            context.setShowDetailView(true);

            context.setTableSearchFilter(null);
            context.setSearchFilterFromSidebar(null);

            if (context.refreshDataGrid) {
              context.refreshDataGrid();
            }
          }
        } else {
          console.error("❌ Could not find subscription plan");
          console.error("Search criteria:", {
            offerId: selectedOffer.offerId,
            offerName: selectedOffer.offerName,
          });
          console.error("Available plans:", subscriptionPlans);
          toast.warning("Could not find subscription plan details. Please try again.");
        }
      } else {
        const offerIdToHighlight = matchedOffer.offerId?.toString();
        setHighlightedOfferId(offerIdToHighlight);
        setActivePlanId(null);

        if (context) {
          context.setSelectedCategoryId(foundParentId);
          context.setSelectedCategory(foundCategoryName || selectedOffer.offerName);

          const enrichedOfferData = {
            ...matchedOffer,
            parentCategoryId: foundParentId,
            dataType: "offer",
          };

          context.setSelectedDetailSideBar(enrichedOfferData);
          context.setParentOfferData(null);

          if (context.triggerSearchWithReset) {
            context.triggerSearchWithReset(selectedOffer.offerName);
          } else {
            context.setTableSearchFilter(selectedOffer.offerName);
            context.setSearchFilterFromSidebar(selectedOffer.offerName);
          }

          context.setShowDetailView(true);

          if (context.refreshDataGrid) {
            context.refreshDataGrid();
          }
        }
      }
    } catch (error) {
      console.error("❌ Error handling search result selection:", error);
      toast.error("Error processing search selection");
    }
  };

  const clearSearch = () => {
    setsideBarSearchValue("");
    setSearchResult([]);
    setShowSearchDropdown(false);
    setHighlightedOfferId(null); 

    if (context) {
      context.setTableSearchFilter(null);
      context.setSearchFilterFromSidebar(null);
      if (context.refreshDataGrid) {
        context.refreshDataGrid();
      }
    }
  };

  // Load offer data when menu is opened
  const handleSideBarClick = async (categoryId: string, categoryName: string) => {
    const isCurrentlyOpen = openMenus[categoryId];

    if (isCurrentlyOpen) {
      setHighlightedOfferId(null);
      setActivePlanId(null);
      setSelectedDetailSideBar(null);
      // setShowDetailView(false);

      // Tutup semua offer yang terbuka (subscription plans)
      setOpenMenus((prev) => {
        const newMenus = { ...prev };
        // Tutup parent category
        newMenus[categoryId] = false;

        // Tutup semua children (offers) di dalam category ini
        const offersInCategory = offerDataByCategory[categoryId] || [];
        offersInCategory.forEach((offer) => {
          if (offer.offerId) {
            newMenus[offer.offerId] = false; //Tutup subscription plans
          }
        });

        return newMenus;
      });

      return;
    }

    setOpenMenus((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    //  refresh main product list ketika sidebar di klik
    if (context) {
      context.setSelectedCategoryId(categoryId);
      context.setSelectedCategory(categoryName);
    }
    // If opening the menu and we don't have data yet, fetch it
    if (!openMenus[categoryId] && !offerDataByCategory[categoryId]) {
      const offerData = await fetchOfferData(categoryId);
      const dataOffer = offerData.find((item) => item.offerId === moveToSubsPlan?.offerId);

      if (dataOffer) {
        handleOfferClick(dataOffer.offerCatgId, dataOffer.offerName, dataOffer);
      }

      setOfferDataByCategory((prev) => ({
        ...prev,
        [categoryId]: offerData,
      }));
    }
  };

  // Convert offer data to menu items format
  const getOfferMenuItems = (categoryId: string) => {
    const offerData = offerDataByCategory[categoryId] || [];

    return offerData.map((offer) => ({
      label: offer.offerName,
      link: `/${offer.offerCode || (offer.offerName ? offer.offerName.toLowerCase().replace(/\s+/g, "-") : "unknown-offer")}`,
      icon: offer.offerType === "Package" ? "package" : "gift", 
      id: offer.offerId?.toString() || offer.offerName,
      offerCode: offer.offerCode,
      offerType: offer.offerType,
      isPackage: offer.isPackage,
      subsCnt: offer.subsCnt,
      servTypeName: offer.servTypeName,
      originalData: offer, 
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
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node) && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle offer item click
  const handleOfferClick = async (categoryId: string, offerName: string, offerData: any) => {
    const offerId = offerData.offerId;
    // console.log(offerData);

    if (!offerId) return;
    setSelectedOffer(offerData);

    setOpenMenus((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }));

    if (!subscriptionPlanByOffer[offerId]) {
      const newSubsPlanData = await fetchSubscriptionPlans(offerId);
      // console.log(newSubsPlanData, "newSubsPlanData");

      const subsPlanData = newSubsPlanData.find((Item) => Item.subsPlanId === moveToSubsPlan?.subsPlanId);
      // console.log(subsPlanData, "subsPlandata");

      if (subsPlanData) {
        handleSubscriptionPlanClick(subsPlanData, subsPlanData.offerCatgId, offerData);
        setActivePlanId(subsPlanData.subsPlanId);
      }
    }

    const offerIdToHighlight = offerData.offerId?.toString() || offerData.offerName;
    setHighlightedOfferId(offerIdToHighlight);

    if (context) {
      context.setParentOfferData(null);

      const enrichedOfferData = {
        ...offerData,
        parentCategoryId: categoryId,
        dataType: "offer",
        openSource: "sidebar",
      };

      if (!moveToSubsPlan?.subsPlanId) {
        context.setSelectedDetailSideBar(enrichedOfferData);
      }

      context.setSelectedCategoryId(categoryId);
      context.setSelectedCategory(offerName);

      // Tampilkan detail view
      context.setShowDetailView(true);

      // Clear search filters
      context.setTableSearchFilter(null);
      context.setSearchFilterFromSidebar(null);

      if (context.refreshDataGrid) {
        context.refreshDataGrid();
      }
    }

    // handleCategoryClick(categoryId, offerName);
  };

  useEffect(() => {
    const category = categorySide.find((item) => parseInt(item.offerCatgId) === moveToSubsPlan?.catgId);
    handleSideBarClick(category?.offerCatgId ?? "", category?.offerCatgName ?? "");
  }, [categorySide]);

  const handleSubscriptionPlanClick = (subscriptionPlan: any, categoryId: string, offerData: any) => {
    setSelectedSubSubPlan(subscriptionPlan);

    // Set highlight untuk subscription plan yang diklik
    const planIdToHighlight = subscriptionPlan.subsPlanId?.toString() || subscriptionPlan.offerName;
    setHighlightedOfferId(planIdToHighlight);

    if (context) {
      context.setParentOfferData({
        ...offerData,
        parentCategoryId: categoryId,
        dataType: "offer",
      });

      if (context) {
        // console.log("test");

        // Set data subscription plan dengan flag dataType
        context.setSelectedDetailSideBar({
          ...subscriptionPlan,
          parentOffer: offerData, // Simpan data offer parent
          parentCategoryId: categoryId,
          dataType: "subsPlan",
        });

        // Set category info
        context.setSelectedCategoryId(categoryId);
        context.setSelectedCategory(subscriptionPlan.offerName);

        // Tampilkan detail view
        context.setShowDetailView(true);

        // Clear search filters
        context.setTableSearchFilter(null);
        context.setSearchFilterFromSidebar(null);

        // Refresh grid
        if (context.refreshDataGrid) {
          context.refreshDataGrid();
        }
      }
    }

    // handleCategoryClick(categoryId, subscriptionPlan.offerName);
  };

  useEffect(() => {
    if (!selectedSubSubPlan) {
      setActivePlanId(null);
    }
  }, [selectedSubSubPlan]);

  return (
    <div className={`relative transition-all duration-300 shadow-md flex flex-col h-[90vh] bg-white  ${isSidebarOpen ? "border-[1px] w-64 opacity-100" : "opacity-0 w-0"}`}>
      <button onClick={toggleSidebar} className="absolute -right-[0.5rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md">
        {isSidebarOpen ? <KeenIcon icon="left-square" /> : <KeenIcon icon="right-square" />}
      </button>

      <div className="p-3">
        <div className="flex items-center justify-between">
          {isSidebarOpen && <div className="text-lg font-bold">Subscription Plan </div>}
          <div className="flex items-center gap-2"></div>
        </div>
      </div>

      {/* Search by name */}
      <div className="flex flex-col px-3 py-2 w-full gap-2">
        <div className="flex my-auto w-full">
          <Select value={filterBy} onValueChange={(val) => setFilterBy(val)}>
            <SelectTrigger className="w-full px-2 py-1 text-xs h-8 ">
              <SelectValue placeholder="Role Name" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="2">Main Product Name</SelectItem>
              <SelectItem value="7">Subscription Plan Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
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
              placeholder={`Search ${selectLabel}..`}
              className="w-full"
            />
            {sideBarSearchValue && (
              <button type="button" onClick={clearSearch} className="text-gray-400 hover:text-gray-600 transition-colors">
                ✕
              </button>
            )}
          </label>

          {showSearchDropdown && (
            <div ref={searchDropdownRef} className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {searchResult.length > 0 ? (
                <ul className="py-1">
                  {searchResult.map((offer, index) => (
                    <li key={`${offer.offerId}-${index}`}>
                      <button onClick={() => handleSearchResultSelect(offer)} className="w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <KeenIcon icon={offer.offerType === "Package" ? "package" : "gift"} className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate" title={offer.offerName}>
                              {offer.offerName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{offer.offerCode}</div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${offer.offerType === "Package" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>{offer.offerType}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">{isSearching ? "Searching..." : "No results found"}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <ul className="mt-2 text-sm px-2 overflow-y-auto mb-5">
        {categorySide && categorySide.length > 0 ? (
          categorySide.map((category) => {
            const categoryId = category.offerCatgId.toString();
            const categoryName = category.offerCatgName;
            const isOpen = openMenus[categoryId] || false;
            const isSelected = selectedCategoryId === categoryId; // Check if this category is selected
            const offerItems = getOfferMenuItems(categoryId);

            return (
              <li key={category.offerCatgId}>
                <button onClick={() => handleSideBarClick(categoryId, categoryName)} className={`flex items-center w-full px-2 py-1 hover:bg-gray-200 rounded transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`} disabled={loading}>
                  <KeenIcon icon="package" className={`w-4 h-4 mr-2 ${isSelected ? "text-blue-600" : "text-blue-600"}`} />
                  {isSidebarOpen && (
                    <>
                      <div className="flex-1 min-w-0 text-center">
                        <span className={`block font-medium text-xs whitespace-normal break-words py-1 ${isSelected ? "text-red-500 font-semibold" : ""}`}>{categoryName}</span>
                      </div>

                      {!loading && (
                        <div className="flex items-center gap-1 ml-auto ">
                          <span className={`text-white text-xs rounded-full px-1 py-1 min-w-[28px] h-[28px] flex items-center justify-center font-medium ${isSelected ? "bg-red-600" : "bg-red-500"}`}>{category.cnt}</span>

                          {/* <DropdownMenu>
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
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSideBar(true, categoryId, categoryName);
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSideBar(true, categoryId, categoryName);
                                }}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu> */}

                          <MdKeyboardArrowRight className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
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
                            onClick={() => {
                              handleOfferClick(categoryId, offer.label, offer.originalData);
                              setSelectedDetailSideBar(offer.originalData);
                              setHighlightedOfferId(null);
                              setActivePlanId(null);
                            }}
                            className={`flex items-center w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:shadow-sm ${highlightedOfferId === offer.id ? "bg-red-100 border-2 border-red-400 shadow-sm" : activeSubItem === offer.label ? "bg-blue-100 shadow-sm" : "hover:bg-gray-100"}`}
                            title={`${offer.label}`}
                          >
                            <KeenIcon icon={offer.icon} className={`w-4 h-4 mr-2 transition-colors duration-200 ${highlightedOfferId === offer.id ? "text-yellow-600" : activeSubItem === offer.label ? "text-blue-600" : "text-gray-500 hover:text-blue-500"}`} />
                            <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-2 items-start">
                              <span className={`whitespace-normal break-words max-w-[80px] transition-colors duration-200 ${highlightedOfferId === offer.id ? "font-semibold text-yellow-800" : activeSubItem === offer.label ? "font-medium text-blue-700" : "hover:text-gray-900"}`}>{offer.label}</span>

                              {!loading && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className={`text-red-500 text-xs rounded-full mr-1 px-2 py-1 min-w-[28px] h-[28px] flex items-center justify-center font-medium ${isSelected ? "bg-white" : "bg-white-500"} border-[1px] border-red-600`}>{offer.subsCnt}</span>

                                  {/* <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <div className="w-[28px] h-[28px] flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-300 transition" title="options" onClick={(e) => e.stopPropagation()}>
                                        <MoreHorizontal className="w-4 h-4" />
                                      </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditSideBar(true, categoryId, categoryName);
                                        }}
                                      >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteSideBar(true, categoryId, categoryName);
                                        }}
                                        className="text-red-500 focus:text-red-500"
                                      >
                                        <Trash className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu> */}

                                  <MdKeyboardArrowRight className={`transition-transform duration-200 ${openMenus[offer.originalData.offerId] ? "rotate-90" : ""}`} />
                                </div>
                              )}
                            </div>
                          </button>

                          {/* === Subscription Plans render === */}
                          {openMenus[offer.originalData.offerId] && (
                            <ul className="ml-6 mt-1 text-[11px]">
                              {loadingPlansForOffer[offer.originalData.offerId] ? (
                                <li className="px-2 py-1 text-gray-400 italic">Loading...</li>
                              ) : subscriptionPlanByOffer[offer.originalData.offerId]?.length > 0 ? (
                                subscriptionPlanByOffer[offer.originalData.offerId].map((plan: any) => (
                                  <li key={plan.subsPlanId}>
                                    <button
                                      onClick={() => {
                                        handleSubscriptionPlanClick(plan, categoryId, offer.originalData);
                                        setActivePlanId(plan.subsPlanId); // set plan yg aktif
                                      }}
                                      className={`flex items-start w-full px-2 py-1 text-left rounded gap-2 transition-colors duration-200
        ${activePlanId === plan.subsPlanId ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-700"}`}
                                    >
                                      <KeenIcon
                                        icon={offer.icon}
                                        className={`w-4 h-4 flex-shrink-0 mt-[2px] transition-colors duration-200 
                                          ${activePlanId === plan.subsPlanId ? "text-blue-600" : "text-gray-500 hover:text-blue-500"}
                                        `}
                                      />
                                      <span className="flex-1 whitespace-normal break-words">{plan.offerName}</span>
                                    </button>
                                  </li>
                                ))
                              ) : (
                                <li className="px-2 py-1 text-gray-400 italic">No subscription plans</li>
                              )}
                            </ul>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="px-2 py-1.5 text-gray-500 italic">{offerDataByCategory[categoryId] === undefined ? "Loading offers..." : "No offers found"}</li>
                    )}
                  </ul>
                )}
              </li>
            );
          })
        ) : (
          <li className="px-2 py-1.5 text-gray-500 italic">No data available</li>
        )}
      </ul>
    </div>
  );
};

export default SubscriptionPlanSideBar;
