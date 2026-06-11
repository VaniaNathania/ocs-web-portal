import { DefaultTooltip, KeenIcon } from "@/components";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { Button } from "@/components/ui/button";
import BundleAddSideBar from "../components/BundleSideBarComp/BundleAddSideBar";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { useBundleOfferContext } from "../hooks/useBundleOfferContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useApiBundleNew from "../UseApiBundle/UseApiBundleNew";
import {
  BundleOfferChildParams,
  BundleSubsPlanGrandChild,
  enrichedOfferData,
  enrichedSubsPlanData,
  OfferBundParams,
  OfferQueryParams,
} from "../types/BundleTypes";
import { toast } from "sonner";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BundleOfferContext } from "../hooks/BundleOfferContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash, X } from "lucide-react";
import { MdKeyboardArrowRight } from "react-icons/md";
import SalesCategoryContent from "../../main-product/components/SalesCategory/SalesCategoryContent";

export const BundleMainSideBar = () => {
  const {
    handleDialogSideBar,
    toggleSideBar,
    toggleSideBarOpen,
    selectLineProd,
    selectServType,
    setSelectLineProd,
    setSelectServType,
    categorySideBar,
    setCategorySideBar,
    setSelectCategorySide,
    selectCategorySide,
    loading,
    setLoading,
    sideBarOpen,
    setSideBarOpen,
    subsPlanBundle,
    setSubsPlanBundle,
    highlightBundleId,
    setHighLightBundleId,
    selectDetailSideBarBundle,
    setSelectDetailSideBarBundle,
    showDetailSideBarView,
    setShowDetailSideBarView,
    handleCategoryBundleClick,
    activatedSubsPlanId,
    setActivatedSubsPlanId,
    activatedSubsItem,
    loadPlanOffer,
    setLoadPlanOffer,
    showSalesCatgDialog,
    setShowSalesCatgDialog,
    setParentBundOfferData,
    parentBundOfferData,
    searchSideBar,
    setSearchSideBar,
    searchResultSideBar,
    setSearchResultSideBar,
    showDropDown,
    setShowDropDown,
    parentDatasSubsPlan,
    setParentDatasSubsPlan,
    resetAllFilterSideBarBund,
    fetchBundleSideBarChild,
    handleProductChange,
    fetchBundleSideBarGrandChild,
    fetchBundlesideBarParent,
    fetchSearchSideBarByName,
  } = useBundleOfferContext();

  const { menuPrivAccess } = useOfferLayout();
  const {
    getOfferCategory,
    getOfferCategorySideParent,
    getBundleSubsPlanGrandChild,
  } = useApiBundleNew();

  const [categoryMenuOpen, setCategoryMenuOpen] = useState<
    Record<string, boolean>
  >({});
  const [offerMenuOpen, setOfferMenuOpen] = useState<Record<string, boolean>>(
    {},
  );
  const [offerDataCategory, setOfferDataCategory] = useState<
    Record<string, any[]>
  >({});
  const [searching, setSearching] = useState<boolean>(false);
  const searchInputRefSideBar = useRef<HTMLInputElement>(null);
  const searchDropDownSideBar = useRef<HTMLDivElement>(null);
  const selectRef = useRef(false);

  const contextBundle = useContext(BundleOfferContext);

  const handleResultSearch = async (selectOfferBundle: OfferBundParams) => {
    try {
      selectRef.current = true;
      setSearchResultSideBar([]);
      setSearchSideBar(selectOfferBundle.offerName);
      setShowDropDown(false);

      setTimeout(() => {
        selectRef.current = false;
      }, 300);

      if (!selectOfferBundle.offerId || !selectOfferBundle.indepProdSpecId) {
        toast.warning("Offer does not have valid ID");
        return;
      }

      let parentFoundId: string | null = null;
      let categoryNameFound: string | null = null;
      let offerMatched: enrichedOfferData | null = null;

      for (const category of categorySideBar || []) {
        const categoryIdBund = category.offerCatgId.toString();

        let offerDatasBund = offerDataCategory[categoryIdBund];
        if (!offerDatasBund) {
          offerDatasBund = await fetchBundleSideBarChild(
            Number(categoryIdBund),
          );
          setOfferDataCategory((prev) => ({
            ...prev,
            [categoryIdBund]: offerDatasBund,
          }));
        }

        offerMatched = offerDatasBund?.find(
          (offerBundle: OfferBundParams) =>
            offerBundle.offerId === selectOfferBundle.indepProdSpecId ||
            offerBundle.indepProdSpecId === selectOfferBundle.indepProdSpecId,
        );

        if (offerMatched) {
          parentFoundId = categoryIdBund;
          categoryNameFound = category.offerCatgName;
          break;
        }
      }

      if (!parentFoundId || !offerMatched) {
        toast.warning("Could not find parent category for this offer");
        return;
      }

      setOfferMenuOpen((prev) => ({
        ...prev,
        [String(parentFoundId)]: true,
        [String(offerMatched.offerId)]: true,
      }));

      const SubscriptionBundle =
        selectOfferBundle.offerType === "7" ||
        selectOfferBundle.offerType === 7 ||
        selectOfferBundle.offerId !== selectOfferBundle.indepProdSpecId;

      handleCategoryBundleClick(
        Number(parentFoundId),
        categoryNameFound || selectOfferBundle.offerName,
      );
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (SubscriptionBundle) {
        if (!offerMatched.offerId) {
          toast.warning("offer ID is missing");
          return;
        }
        let subsPlanBundleState = subsPlanBundle[offerMatched.offerId] || [];

        if (subsPlanBundleState.length === 0 && offerMatched.offerId) {
          try {
            const fetchPlanBundle = await fetchBundleSideBarGrandChild(
              offerMatched.offerId,
            );

            if (
              fetchPlanBundle &&
              Array.isArray(fetchPlanBundle) &&
              fetchPlanBundle.length > 0
            ) {
              subsPlanBundleState = fetchPlanBundle;
            }
          } catch (error: any) {
            toast.error("❌ Error fetching subscription plans:", error);
          }
        }

        const planMatched = subsPlanBundleState.find(
          (planBundle: BundleSubsPlanGrandChild) => {
            const matchId =
              planBundle.subsPlanId === selectOfferBundle.offerId ||
              planBundle.offerId === selectOfferBundle.offerId;

            const matchName =
              planBundle.offerName?.toLowerCase().trim() ===
              selectOfferBundle.offerName?.toLowerCase().trim();

            return matchId || matchName;
          },
        );

        if (planMatched) {
          setActivatedSubsPlanId(planMatched.subsPlanId || planMatched.offerId);
          setHighLightBundleId(null);

          if (contextBundle) {
            contextBundle.setParentBundOfferData({
              ...offerMatched,
              parentCategoryId: Number(parentFoundId),
              dataType: "offer",
            } as enrichedOfferData);

            // if (contextBundle) {
            //   contextBundle.setParentDatasSubsPlan({
            //     parentOffer: offerMatched.offerName,
            //     parentCategoryId: Number(parentFoundId),
            //     dataType: "subsPlan",
            //   });
            // }

            const subscriptionPlanDatasBund = {
              ...planMatched,
              parentOffer: offerMatched.offerName,
              parentCategoryId: Number(parentFoundId),
              dataType: "subsPlan",
            };

            contextBundle.setSelectDetailSideBarBundle(
              subscriptionPlanDatasBund,
            );
            contextBundle.setSelectCategorySideId(parentFoundId);
            contextBundle.setSelectCategorySide(planMatched.offerName);
            contextBundle.setShowDetailSideBarView(true);
            contextBundle.setTableSearchFilterSideBar(null);
            contextBundle.setSearchFilterSideBar(null);

            if (contextBundle.refreshDataGridBundleKey) {
              contextBundle.refreshDataGridBundleKey();
            }
          }
        }
      }
    } catch (error) {
      toast.error("Error processing search selection");
    }
  };

  //handleParent
  const handleClickSideBarParent = async (
    categoryId: number,
    categoryName: string,
  ) => {
    setCategoryMenuOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    if (contextBundle) {
      contextBundle.setSelectCategorySide(categoryName);
      contextBundle.setSelectCategorySideId(String(categoryId));
    }

    if (!categoryMenuOpen[categoryId] && !offerDataCategory[categoryId]) {
      const offerDatas = await fetchBundleSideBarChild(categoryId);
      setOfferDataCategory((prev) => ({
        ...prev,
        [categoryId]: offerDatas,
      }));
    }
  };

  //handleChild
  const handleClickBundleSideBarChild = async (
    categoryId: number,
    offerName: string,
    offerData: OfferBundParams,
  ) => {
    const offerId = offerData.offerId;

    if (!offerId) return;

    setOfferMenuOpen((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }));

    if (!subsPlanBundle[offerId]) {
      await fetchBundleSideBarGrandChild(offerId);
    }

    const BundleOfferHighLight =
      offerData.offerId?.toString() || offerData.offerName;
    setHighLightBundleId(BundleOfferHighLight);

    if (contextBundle) {
      contextBundle.setSelectDetailSideBarBundle({
        ...offerData,
        parentCategoryId: categoryId,
        dataType: "offer",
        openSource: "sidebar",
      });
    }

    contextBundle.setSelectCategorySide(offerName);
    contextBundle.setSelectCategorySideId(String(categoryId));
    contextBundle.setShowDetailSideBarView(true);

    handleCategoryBundleClick(categoryId, offerName);
  };

  //handleGrandChild
  const handleClickSideBarGrandChild = (
    subscriptionPlanSide: BundleSubsPlanGrandChild,
    categoryId: number,
    offerData: OfferBundParams,
  ) => {
    if (!contextBundle) {
      return;
    }

    const highLightSubsPlan =
      subscriptionPlanSide.subsPlanId?.toString() ||
      subscriptionPlanSide.offerName;
    setHighLightBundleId(highLightSubsPlan);

    //  console.log("OfferData", offerData);

    const enrichedOfferData: enrichedOfferData = {
      ...offerData,
      parentCategoryId: categoryId,
      dataType: "offer",
      openSource: "sidebar",
    };

    const enrichedSubsPlanData: enrichedSubsPlanData = {
      ...subscriptionPlanSide,
      parentOffer: String(offerData.offerId),
      parentCategoryId: categoryId,
      dataType: "subsPlan",
    };

    contextBundle.setSelectDetailSideBarBundle(enrichedSubsPlanData);
    contextBundle.setSelectCategorySideId(String(categoryId));
    contextBundle.setSelectCategorySide(subscriptionPlanSide.offerName);
    contextBundle.setShowDetailSideBarView(true);
    contextBundle.setParentBundOfferData(enrichedOfferData);

    handleCategoryBundleClick(categoryId, subscriptionPlanSide.offerName);
  };

  useEffect(() => {
    fetchBundlesideBarParent();
  }, []);

  const getOfferItemMenu = (categoryId: string) => {
    const offerDatas = offerDataCategory[categoryId] || [];

    return offerDatas.map((offerBundle) => ({
      label: offerBundle.offerName,
      link: `/${
        offerBundle.offerCode ||
        (offerBundle.offerName
          ? offerBundle.offerName.toLowerCase().replace(/\s+/g, "-")
          : "unknown-offer")
      }`,
      icon: offerBundle.offerType === "Package" ? "package" : "gift",
      id: offerBundle.offerId?.toString() || offerBundle.offerName,
      offerCode: offerBundle.offerCode,
      offerType: offerBundle.offerType,
      isPackage: offerBundle.isPackage,
      subsCnt: offerBundle.subsCnt,
      servTypeName: offerBundle.servTypeName,
      originalData: offerBundle,
    }));
  };

  const clearSearchSideBar = () => {
    setSearchSideBar("");
    setSearchResultSideBar([]);
    setShowDropDown(false);
    setHighLightBundleId(null);

    if (contextBundle) {
      contextBundle.setTableSearchFilterSideBar(null);
      contextBundle.setSearchFilterSideBar(null);
      if (contextBundle.refreshDataGridBundleKey) {
        contextBundle.refreshDataGridBundleKey();
      }
    }
  };

  useEffect(() => {
    if (selectRef.current) {
      return;
    }
    const delay = setTimeout(() => {
      if (searchSideBar && searchSideBar.trim() !== "") {
        fetchSearchSideBarByName(searchSideBar.trim());
      } else {
        setSearchResultSideBar([]);
        setShowDropDown(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchSideBar]);

  return (
    <div
      className={`relative transition-all duration-300 shadow-md flex flex-col h-[90vh] bg-white ${
        toggleSideBar ? "border-[1px] w-64 opacity-100" : "opacity-0 w-0"
      }`}
    >
      <button
        onClick={toggleSideBarOpen}
        className="absolute -right-[0.15rem] top-1/2 transform -translate-y-1/2 bg-red-500 text-white ps-2 pe-3 py-1 rounded-md"
      >
        {toggleSideBar ? (
          <KeenIcon icon="left-square" />
        ) : (
          <KeenIcon icon="rigth-square" />
        )}
      </button>

      <div className="p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-lg font-normal text-gray-900">Bundle</div>
          <div className="flex items-center gap-2">
            <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
              <DefaultTooltip title="Add Data" placement="top">
                <Button
                  variant="default"
                  className="h-7.5 w-7.5"
                  onClick={() => handleDialogSideBar(true)}
                >
                  <KeenIcon icon="plus" />
                </Button>
              </DefaultTooltip>
            </AccessWrapper>
            <DefaultTooltip title={"Reset Filter"} placement={"top"}>
              <Button
                variant="destructive"
                className="h-7.5 w-7.5"
                onClick={resetAllFilterSideBarBund}
              >
                <KeenIcon icon="arrow-circle-left" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>

      <div className="px-3 relative flex-shrink-0">
        <label className="input input-sm w-full flex items-center gap-2">
          <KeenIcon icon="magnifier" />
          <input
            type="text"
            placeholder="Search Bundle Name"
            className="w-full"
            ref={searchInputRefSideBar}
            value={searchSideBar}
            onChange={(e) => setSearchSideBar(e.target.value)}
            onFocus={() => {
              if (searchResultSideBar.length > 0) {
                setShowDropDown(true);
              }
            }}
          />
          {searchSideBar && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={clearSearchSideBar}
            >
              <X />
            </button>
          )}
        </label>

        {showDropDown && (
          <div
            ref={searchDropDownSideBar}
            className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {searchResultSideBar.length > 0 ? (
              <ul className="py-1">
                {searchResultSideBar.map((offer, index) => (
                  <li key={`${offer.offerId}-${index}`}>
                    <button
                      onClick={() => handleResultSearch(offer)}
                      className="W-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
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
                {searching ? "Searching...." : "No result found"}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex w-full gap-2 px-3 py-3 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <Select
            value={selectLineProd}
            onValueChange={(val) => {
              if (val === "all") {
                setSelectLineProd("");
                handleProductChange("");
              } else {
                handleProductChange(val);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Product Line" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">All Product</SelectItem>
              <SelectItem value="B">Fix</SelectItem>
              <SelectItem value="C">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-2">
        <ul className="mt-2 text-sm">
          {categorySideBar && categorySideBar.length > 0 ? (
            categorySideBar.map((category) => {
              const categoryId = category.offerCatgId.toString();
              const categoryName = category.offerCatgName;
              const isOpen = categoryMenuOpen[categoryId] || false;
              const isSelected = selectCategorySide === categoryId;
              const offerItems = getOfferItemMenu(categoryId);

              return (
                <li key={category.offerCatgId}>
                  <button
                    onClick={() =>
                      handleClickSideBarParent(Number(categoryId), categoryName)
                    }
                    className={`flex items-center w-full px-2 py-1 hover:bg-gray-200 rounded transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                  >
                    <KeenIcon
                      icon="package"
                      className={`w-4 h-4 mr-2 ${isSelected ? "text-blue-600" : "text-blue-600"}`}
                    />
                    {sideBarOpen && (
                      <>
                        <div className="flex-1 min-w-0 text-center">
                          <span
                            className={`block font-medium text-xs whitespace-normal break-words ${
                              isSelected ? "text-red-500 font-semibold" : ""
                            }`}
                          >
                            {categoryName}
                          </span>
                        </div>

                        {!loading && (
                          <div className="flex items-center gap-1 ml-auto">
                            <span
                              className={`text-white text-xs rounded-full px-2 py-1 min-w[28px] h-[28px] flex items-center justify-center font-medium ${
                                isSelected ? "bg-red-600" : "bg-red-500"
                              }`}
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
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // handleEditSideBar
                                  }}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // handleDeleteSideBar
                                  }}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <Trash className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
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

                  {isOpen && sideBarOpen && (
                    <ul className="ml-4 font-light text-xs mt-1">
                      {offerItems.length > 0 ? (
                        offerItems.map((offerBundle) => (
                          <li key={offerBundle.id}>
                            <button
                              onClick={() => {
                                handleClickBundleSideBarChild(
                                  Number(categoryId),
                                  offerBundle.label,
                                  offerBundle.originalData,
                                );
                                setSelectDetailSideBarBundle({
                                  ...offerBundle.originalData,
                                  parentCategoryId: Number(categoryId),
                                  dataType: "offer",
                                  openSource: "sidebar",
                                });
                                setHighLightBundleId(null);
                                setActivatedSubsPlanId(null);
                              }}
                              className={`flex items-center w-full text-left px-2 py-1.5 rounded hover:bg-blue-50 hover:shadow-sm
                              ${
                                highlightBundleId === offerBundle.id
                                  ? "bg-red-100 border-2 border-red-400 shadow-sm"
                                  : activatedSubsItem === offerBundle.label
                                    ? "bg-blue-100 shadow-sm"
                                    : "hover:bg-gray-100"
                              }
                              `}
                              title={`${offerBundle.label}-(${offerBundle.offerCode})`}
                            >
                              <KeenIcon
                                icon={offerBundle.icon}
                                className={`w-4 h-4 mr-2 transition-colors duration-200
                                ${
                                  highlightBundleId === offerBundle.id
                                    ? "text-yellow-600"
                                    : activatedSubsItem === offerBundle.label
                                      ? "text-blue-600"
                                      : "text-gray-500 hover: text-blue-500"
                                }
                                `}
                              />
                              <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-2 items-start">
                                <span
                                  className={`whitespace-normal break-words max-w-[80px] transition-colors duration-200
                                  ${
                                    highlightBundleId === offerBundle.id
                                      ? "font-semibold text-yellow-800"
                                      : activatedSubsItem === offerBundle.label
                                        ? "font-medium text-blue-700"
                                        : "hover:text-gray-900"
                                  }
                                  `}
                                >
                                  {offerBundle.label}
                                </span>
                              </div>
                              {!loading && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span
                                    className={`text-red-500 text-xs rounded-full px-2 py-1 min-w-[28px] h-[28px] flex items-center justify-center font-medium
                                    ${isSelected ? "bg-white" : "bg-white-500"} border-[1px] border-red-600
                                    `}
                                  >
                                    {offerBundle.subsCnt}
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
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          //handlEditSidebar()
                                        }}
                                      >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // HandleDeleteSideBar()
                                        }}
                                        className="text-red-500 focus:text-red-500"
                                      >
                                        <Trash className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <MdKeyboardArrowRight
                                    className={`transition-transform duration-200 ${
                                      offerMenuOpen[
                                        offerBundle.originalData.offerId
                                      ]
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  />
                                </div>
                              )}
                            </button>
                            {/* SubsPlanRender */}
                            {offerMenuOpen[
                              offerBundle.originalData.offerId
                            ] && (
                              <ul className="ml-6 mt-1 text-[11px]">
                                {loadPlanOffer[
                                  offerBundle.originalData.offerId
                                ] ? (
                                  <li className="px-2 py-1 text-gray-400 italic">
                                    Loading....
                                  </li>
                                ) : subsPlanBundle[
                                    offerBundle.originalData.offerId
                                  ]?.length > 0 ? (
                                  subsPlanBundle[
                                    offerBundle.originalData.offerId
                                  ].map((plan: BundleSubsPlanGrandChild) => (
                                    <li key={plan.subsPlanId}>
                                      <button
                                        onClick={() => {
                                          handleClickSideBarGrandChild(
                                            plan,
                                            Number(categoryId),
                                            offerBundle.originalData,
                                          );
                                          setActivatedSubsPlanId(
                                            plan.subsPlanId,
                                          );
                                        }}
                                        className={`flex items-start w-full px-2 py-1 text-left rounded gap-2 transition-colors duration-200
                                              ${
                                                activatedSubsPlanId ===
                                                plan.subsPlanId
                                                  ? "bg-blue-100 text-blue-600"
                                                  : "hover:bg-gray-100 text-gray-700"
                                              }
                                              `}
                                      >
                                        <KeenIcon
                                          icon={offerBundle.icon}
                                          className={`w-4 h-4 flex-shrink-0 mt-[2px] transition-colors duration-200
                                                ${
                                                  activatedSubsPlanId ===
                                                  plan.subsPlanId
                                                    ? "text-blue-600"
                                                    : "text-gray-500 hover:text-blue-500"
                                                }
                                                `}
                                        />
                                        <span className="flex-1 whitespace-normal break-words">
                                          {plan.offerName}
                                        </span>
                                      </button>
                                    </li>
                                  ))
                                ) : (
                                  <li className="px-2 py-1 text-gray-400 italic">
                                    No Subscription Plans
                                  </li>
                                )}
                              </ul>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="px-2 py-1.5 text-gray-500 italic">
                          {offerDataCategory[categoryId] === undefined
                            ? "loading Offer...."
                            : "No Offers found"}
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              );
            })
          ) : (
            <li>
              <button
                onClick={() =>
                  handleClickSideBarParent(0, "Telkomcel Vas product")
                }
                className={`flex items-center w-full px-2 py-1 hover:bg-gray-200 rounded transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                <KeenIcon
                  icon="package"
                  className="w-4 h-4 mr-2 text-blue-600"
                />
                {sideBarOpen && (
                  <>
                    <span className="font-medium text-xs flex-1 text-center">
                      {loading ? "loading..." : "Telkomcel Vas Product"}
                    </span>

                    {!loading && (
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[28px] h-[28px] flex items-center justify-center font-medium">
                          0
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
                          <DropdownMenuContent align="end" className="W-48">
                            <DropdownMenuItem
                            //onClick ={() => handlEditSideBar(true, "fallback", Telkomcel Vas Product)}
                            >
                              <Pencil className="W-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              //onClickonClick ={() => handlDeleteSideBar("fallback", Telkomcel Vas Product)}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <MdKeyboardArrowRight
                          className={`transition-transform duration-200 ${true ? "rotate-180" : ""}`}
                        />
                      </div>
                    )}
                  </>
                )}
              </button>
              {true && sideBarOpen && (
                <ul className="ml-4 font-light text-xs mt-1">
                  <li className="px-2 py-1.5 text-gray-500 italic">
                    No Data Available
                  </li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>

      <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t border-gray-200">
        <DefaultTooltip title="sales Category" placement="top">
          <Button
            variant="default"
            className="h-7.5"
            onClick={() => setShowSalesCatgDialog(true)}
          >
            Sales Category
          </Button>
        </DefaultTooltip>
      </div>
      <SalesCategoryContent
        isOpen={showSalesCatgDialog}
        onClose={() => setShowSalesCatgDialog(false)}
        type="1"
      />
      <BundleAddSideBar />
    </div>
  );
};

export default BundleMainSideBar;
