import { KeenIcon } from "@/components";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { ChevronDown } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useOfferGroupHook } from "../../../subscription-plan/hooks/useOfferGroupHooks";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SelectOfferProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory?: any;
  selectedOffer: any[];
  setSelectedOffer: React.Dispatch<React.SetStateAction<any[]>>;
  reload?: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

const SelectOfferSalesCategoryChild = ({ isOpen, onClose, selectedCategory, selectedOffer, setSelectedOffer, reload }: SelectOfferProps) => {
  const { GetData, PostData } = useCallApi();
  const { fetchSearchSelectOffer, searchSelectOffer, setSearchSelectOffer, showSearchDropdownSelectOffer, setShowSearchDropdownSelectOffer, isSearchingSelectOffer, setIsSearchingSelectOffer } = useOfferGroupHook();
  const [categoryName, setCategoryName] = useState("");
  const [loadingParent, setLoadingParent] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [loadingSubChildren, setLoadingSubChildren] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryParent, setCategoryParent] = useState<any[]>([]);
  const [categoryChildren, setCategoryChildren] = useState<Record<string, any[]>>({});
  const [categorySubChildren, setCategorySubChildren] = useState<Record<string, any[]>>({});
  const [expandedParentIndex, setExpandedParentIndex] = useState<number | null>(null);
  const [expandedChildIndex, setExpandedChildIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "" });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [highlightedChildId, setHighlightedChildId] = useState<number | null>(null);
  const [tempSelectedOffer, setTempSelectedOffer] = useState<any[]>([]);

  const fetchCategoryParent = async () => {
    setLoadingParent(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-indep-prod-catg-mem-and-cnt`, {
        spId: 0,
        method: "qryRootCatg",
        offerCatgType: "2", //selectedOfferCategory,
        offerCatgClass: "A",
      });

      const responseData = response.data;
      setCategoryParent(responseData);
      return responseData;
    } catch (error: any) {
      console.error("error fetching category parent");
      return [];
    } finally {
      setLoadingParent(false);
    }
  };

  const fetchCategoryChildren = async (parentId: string) => {
    setLoadingChildren(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-offer-catg-mem`, {
        offerCatgId: parentId,
        spId: 0,
      });

      const responseData = response.data;
      setCategoryChildren((prev) => ({
        ...prev,
        [parentId]: responseData,
      }));
      return responseData;
    } catch (error: any) {
      console.error("error fetching category children");
      return [];
    } finally {
      setLoadingChildren(false);
    }
  };

  const fetchCategorySubChildren = async (specId: string) => {
    // console.log("Fetching sub children with specId:", specId); // ← Debug
    setLoadingSubChildren(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/subs-plan/qry-subs-plan-tmp`, {
        indepProdSpecId: specId,
        spId: 0,
      });

      // console.log("Sub children response:", response.data); // ← Debug
      const responseData = response.data;
      setCategorySubChildren((prev) => ({
        ...prev,
        [specId]: responseData,
      }));
      return responseData;
    } catch (error: any) {
      console.error("Error fetching category sub children:", error);
      return [];
    } finally {
      setLoadingSubChildren(false);
    }
  };

  useEffect(() => {
    if (isOpen) setTempSelectedOffer(selectedOffer);
  }, [isOpen, selectedOffer, selectedCategory]);

  const handleSubmit = useCallback(async () => {
    if (tempSelectedOffer?.length === 0) {
      toast.error("Select at least one offer before submitting!");
      return;
    }

    // console.log("sebelum filter: ", selectedOffer)

    const payload = tempSelectedOffer
      .filter((item: any) => !selectedOffer.some((oldOffer: any) => oldOffer.offerId === item.offerId))
      .map((item) => ({
        offerCatgId: selectedCategory.offerCatgId,
        offerId: item.offerId,
      }));

    // console.log("ini payload: ", payload);
    // console.log("newSelectedOffer: ", newSelectedOffer);

    setIsSubmitting(true);
    setAlert({ show: false, message: "" });

    try {
      const response = await PostData(`${API_URL_OFFER}/offer/category/catg-choose-offer`, payload);

      if (response?.status) {
        setSelectedOffer(tempSelectedOffer);
        toast.success("Selected offer created successfully!");
        reload();
      } else {
        const errorMessage = response?.message || "Failed to select offer. Please try again.";
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
        console.error("❌ API returned error:", response);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      console.error("❌ Error selected offer:", error);
      toast.error(errorMessage);
      setAlert({
        show: true,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
      onClose();
      setExpandedParentIndex(null);
      setExpandedChildIndex(null);
    }
  }, [PostData, selectedOffer, selectedCategory, tempSelectedOffer]);

  const closePopUp = () => {
    onClose();
    setCategoryParent([]);
    setCategoryChildren({});
    setCategorySubChildren({});
    setExpandedParentIndex(null);
    setExpandedChildIndex(null);
    setSearchQuery("");
    setSearchSelectOffer([]);
    setShowSearchDropdownSelectOffer(false);
    setHighlightedChildId(null);
    setTempSelectedOffer(selectedOffer);
  };

  useEffect(() => {
    if (selectedCategory?.offerCatgName) {
      setCategoryName(selectedCategory.offerCatgName);
    } else {
      setCategoryName("");
    }

    if (isOpen) {
      fetchCategoryParent();
    }
  }, [selectedCategory, isOpen]);

  const handleSearch = useCallback(
    async (search: string) => {
      if (!search.trim()) {
        setSearchSelectOffer([]);
        setShowSearchDropdownSelectOffer(false);
        return;
      }

      await fetchSearchSelectOffer(search, selectedCategory?.offerCatgType ?? "2");
    },
    [fetchSearchSelectOffer, setSearchSelectOffer, setShowSearchDropdownSelectOffer, selectedCategory],
  );

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        handleSearch(value);
      }, 500);
    },
    [handleSearch],
  );

  const handleSearchSelectResult = async (searchResult: any) => {
    const offerId = searchResult.offerId;

    let parentIndex = -1; // 1. Cari parent mana yang punya child ini
    let foundChild: any = null;

    for (let i = 0; i < categoryParent.length; i++) {
      const parent = categoryParent[i];

      // Fetch children dulu jika belum ada
      if (!categoryChildren[parent.offerCatgId]) {
        await fetchCategoryChildren(parent.offerCatgId);
      }

      const children = categoryChildren[parent.offerCatgId] || [];
      foundChild = children.find((child: any) => child.offerId === offerId);

      if (foundChild) {
        parentIndex = i;
        break;
      }
    }

    if (parentIndex !== -1 && foundChild) {
      setExpandedParentIndex(parentIndex);
      setHighlightedChildId(offerId);
      setSearchQuery("");
      setSearchSelectOffer([]);
      setShowSearchDropdownSelectOffer(false);
    }
  };

  useEffect(() => {
    if (expandedParentIndex === null) {
      setExpandedChildIndex(null);
      setCategorySubChildren({});
      setLoadingChildren(false);
      setLoadingSubChildren(false);
    }
  }, [expandedParentIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdownSelectOffer(false);
      }
    };

    if (showSearchDropdownSelectOffer) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchDropdownSelectOffer]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePopUp()}>
      <DialogContent className="max-w-md h-[85vh] flex flex-col p-0">
        {loadingParent && <Loading />}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-medium">Choose Offer</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="flex flex-col px-5 overflow-auto">
          <div className="flex flex-wrap items-center w-full py-5">
            <label className="text-sm font-medium min-w-[120px]">Category Name</label>
            <div className="flex-1">
              <Input type="text" value={categoryName} disabled={true} />
            </div>
          </div>
          <div className="relative" ref={searchDropdownRef}>
            <label className="input input-sm flex-1 flex items-center">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => {
                  if (searchSelectOffer.length > 0) {
                    setShowSearchDropdownSelectOffer(true);
                  }
                }}
                className="w-full border border-gray-400 rounded-md py-1.5 text-sm"
                placeholder="Search Category Name..."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(""), setSearchSelectOffer([]);
                    setShowSearchDropdownSelectOffer(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </label>

            {showSearchDropdownSelectOffer && (
              <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {isSearchingSelectOffer && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    <Loading />
                  </div>
                )}

                {!isSearchingSelectOffer && searchSelectOffer.length === 0 && <div className="px-3 py-2 text-sm text-gray-500">No result found.</div>}

                {!isSearchingSelectOffer &&
                  searchSelectOffer.map((offer, index) => (
                    <button
                      key={offer.offerId || index}
                      onClick={() => {
                        handleSearchSelectResult(offer);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-100"
                    >
                      <div className="flex items-center gap-2">
                        <KeenIcon icon="category" className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate" title={offer.offerName}>
                            {offer.offerName}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
          {/* //ChevronDown parent */}
          <div className="py-3 space-y-2">
            {categoryParent.map((item, index) => {
              const isOpen = expandedParentIndex === index;
              const children = categoryChildren[item.offerCatgId] || [];

              return (
                <div key={index} className="flex flex-col">
                  {/* === Parent Row === */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (!isOpen) {
                          await fetchCategoryChildren(item.offerCatgId);
                          setExpandedParentIndex(index);
                        } else {
                          setExpandedParentIndex(null);
                        }
                      }}
                      className="flex items-center justify-center w-6 h-6"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`} />
                    </button>
                    <input type="checkbox" className="w-4 h-4" disabled />
                    <button
                      onClick={async () => {
                        if (!isOpen) {
                          await fetchCategoryChildren(item.offerCatgId);
                        }
                        setExpandedParentIndex(isOpen ? null : index);
                      }}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                    >
                      <KeenIcon icon="folder" />
                      <span className="max-w-[300px] truncate" title={item.offerCatgName}>
                        {item.offerCatgName}
                      </span>
                    </button>
                  </div>

                  {/* === Children Rows === */}
                  {isOpen && children.length > 0 && (
                    <div className="pl-6">
                      {loadingChildren && <Loading />}
                      {children.map((child, childIndex) => {
                        const key = `${index}-${childIndex}`;
                        const isChildOpen = expandedChildIndex === key;
                        const specId = child.offerId;
                        const subChildren = categorySubChildren[specId] || [];

                        return (
                          <div key={childIndex} className="flex flex-col">
                            {/* === Child Row === */}
                            <div className="flex items-center gap-2 py-1">
                              <button
                                onClick={async () => {
                                  if (!isChildOpen) {
                                    const specId = child.indepProdSpecId;
                                    await fetchCategorySubChildren(specId);
                                  }
                                  setExpandedChildIndex(isChildOpen ? null : key);
                                }}
                                className="flex items-center justify-center w-6 h-6"
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isChildOpen ? "rotate-0" : "-rotate-90"}`} />
                              </button>
                              <input type="checkbox" className="w-4 h-4" disabled />
                              <button
                                onClick={async () => {
                                  if (highlightedChildId) {
                                    setHighlightedChildId(null);
                                  }

                                  if (!isChildOpen) {
                                    await fetchCategorySubChildren(specId);
                                  }
                                  setExpandedChildIndex(isChildOpen ? null : key);
                                }}
                                className={`flex items-center gap-2 text-sm hover:text-blue-600 ${highlightedChildId === child.offerId ? "text-blue-600 font-semibold" : "text-gray-700"}`}
                              >
                                <KeenIcon icon="folder" />
                                <span className="max-w-[300px] truncate" title={child.offerCatgName}>
                                  {child.offerCatgName}
                                </span>
                              </button>
                            </div>

                            {/* === SubChildren Rows === */}
                            {isChildOpen && subChildren.length > 0 && (
                              <div className="pl-4">
                                {loadingSubChildren && <Loading />}
                                {subChildren.map((sub, subIndex) => {
                                  const isChecked = tempSelectedOffer.some((item: any) => item.offerId === sub.offerId);

                                  return (
                                    <div key={subIndex} className="flex items-center gap-2 py-1">
                                      <span className="w-6 h-6" />
                                      <input
                                        type="checkbox"
                                        className="w-4 h-4"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setTempSelectedOffer((prev) => (checked ? [...prev, sub] : prev.filter((item) => item.offerId !== sub.offerId)));
                                        }}
                                      />
                                      <span className="flex items-center gap-2 text-sm text-gray-700">
                                        <KeenIcon icon="menu" />
                                        <span className="max-w-[250px] truncate" title={sub.subsPlanName}>
                                          {sub.subsPlanName ?? sub.offerName ?? sub.offerCatgName}
                                        </span>
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 bg-white border-t border-gray-200 flex justify-end gap-2 p-4">
          <Button type="submit" variant="default" onClick={() => handleSubmit()}>
            Ok
          </Button>
          <Button type="button" variant="outline" onClick={() => closePopUp()}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectOfferSalesCategoryChild;
