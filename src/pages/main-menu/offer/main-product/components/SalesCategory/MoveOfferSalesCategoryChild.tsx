import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import { DialogWrapper } from "@/pages/main-menu/role-management/generalUseComp";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface MoveOfferProps {
  isOpen: boolean;
  onClose: () => void;
  selectedContentChild?: any;
  selectedOfferCategory?: any;
  categoriesParent?: any;
  reload?: any;
}

const API_URL_OFFER = apiConfigOffer.offer;

const MoveOfferSalesCategoryChild = ({ isOpen, onClose, selectedContentChild, selectedOfferCategory, categoriesParent, reload }: MoveOfferProps) => {
  const { GetData, PostData } = useCallApi();
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState<Record<string, any[]>>({});
  const [loadingParent, setLoadingParent] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedParentIndex, setExpandedParentIndex] = useState<number | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "" });
  const [tempSelectedOffer, setTempSelectedOffer] = useState<any>();

  const fetchCategoryChildren = async (offerCatgId: number, offerCatgClass: string) => {
    setLoadingChildren(true);
    setError(null);

    try {
      const response = await GetData(`${API_URL_OFFER}/offer/category/qry-offer-catg`, {
        offerCatgType: selectedOfferCategory,
        offerCatgClass: offerCatgClass,
        offerCatgId: offerCatgId,
        spId: 0,
      });

      const responseData = response.data;
      setCategories((prev) => ({
        ...prev,
        [offerCatgId]: responseData,
      }));
      return responseData;
    } catch (error) {
      console.error("Error fetching category side");
      return [];
    } finally {
      setLoadingChildren(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    // console.log(tempSelectedOffer);
    if (tempSelectedOffer?.length === 0) {
      toast.error("Select at least on offer before submitting!");
      return;
    }

    // console.log(selectedOffer);
    const offerCatgId = tempSelectedOffer?.offerCatgId;

    const payload = {
      offerCatgId,
      offerId: selectedContentChild.offerId,
      offerCatgMemId: selectedContentChild.offerCatgMemId,
    };

    setIsSubmitting(true);
    setAlert({ show: false, message: "" });

    try {
      const response = await PostData(`${API_URL_OFFER}/offer/category/transfer-offer-catg`, payload);

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
      toast.error(errorMessage);
      setAlert({
        show: true,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
      onClose();
      setExpandedParentIndex(null);
    }
  }, [PostData, selectedOffer, tempSelectedOffer]);

  const closePopUp = () => {
    onClose();
    setExpandedParentIndex(null);
    setCategories({});
    setTempSelectedOffer(selectedOffer);
  };

  useEffect(() => {
    setTempSelectedOffer(selectedContentChild);
    if (selectedContentChild?.offerName) {
      setCategoryName(selectedContentChild.offerName);
    } else {
      setCategoryName("");
    }
  }, [selectedContentChild, isOpen]);

  return (
    // <Dialog open={isOpen} onOpenChange={() => closePopUp()}>
    <DialogWrapper title="Move Offer" isOpen={isOpen} handleDialog={closePopUp} size={{ width: "", height: "" }}>
      {/* <DialogContent className="max-w-md h-[85vh] flex flex-col p-0">
        {loadingParent && <Loading />}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-lg font-medium">Move Offer</DialogTitle>
        </DialogHeader> */}
      {loadingParent && <Loading />}
      <div className="flex-1 px-5 overflow-auto">
        <div className="flex flex-wrap items-center w-full py-5">
          <label className="text-sm font-medium min-w-[120px]">Offer Name</label>
          <div className="flex-1">
            <Input type="text" value={categoryName} disabled={true} />
          </div>
        </div>
        {/* ChevronDown Parent */}
        <div className="py-3 space-y-2">
          {categoriesParent.map((parent: any, index: any) => {
            const isOpen = expandedParentIndex === index;
            const children = categories[parent.offerCatgId] || [];
            const isChecked = tempSelectedOffer?.offerCatgId === parent.offerCatgId;

            return (
              <div key={index} className="flex flex-col">
                {/* Parent Row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (!isOpen) {
                        await fetchCategoryChildren(parent.offerCatgId, parent.offerCatgClass);
                        setExpandedParentIndex(index);
                      } else {
                        setExpandedParentIndex(null);
                      }
                    }}
                    className="flex items-center justify-center w-6 h-6 "
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`} />
                  </button>
                  <Input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={isChecked}
                    onChange={(e) => {
                      setTempSelectedOffer(!isChecked ? parent : null);
                    }}
                  />
                  <button
                    onClick={async () => {
                      if (!isOpen) {
                        await fetchCategoryChildren(parent.offerCatgId, parent.offerCatgClass);
                      }
                      setExpandedParentIndex(isOpen ? null : index);
                    }}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                  >
                    <KeenIcon icon="folder" />
                    <span className="max-w-[300px] truncate" title={parent.offerCatgName}>
                      {parent.offerCatgName}
                    </span>
                  </button>
                </div>

                {/* Children Rows */}
                {isOpen && (
                  <div className="pl-12">
                    {loadingChildren ? (
                      <Loading />
                    ) : children.length > 0 ? (
                      children.map((child, childIndex) => {
                        const isCeked = tempSelectedOffer?.offerCatgId === child.offerCatgId;

                        return (
                          <div key={childIndex} className="flex items-center gap-2 py-1">
                            <Input
                              type="checkbox"
                              className="w-4 h-4"
                              checked={isCeked}
                              onChange={(e) => {
                                setTempSelectedOffer(!isCeked ? child : null);
                              }}
                            />
                            <span className="flex items-center gap-2 text-sm text-gray-700">
                              <KeenIcon icon="menu" />
                              <span className="max-w-[300px] truncate" title={child.offerCatgName}>
                                {child.offerCatgName}
                              </span>
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-400 italic py-1 pl-6">No data available</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <DialogFooter className="sticky bottom-0 bg-white border-t border-gray-200 flex justify-end gap-2 p-4 shrink-0">
        <Button type="submit" variant="default" className="" onClick={() => handleSubmit()}>
          Ok
        </Button>
        <Button type="button" variant="outline" onClick={() => closePopUp()}>
          Cancel
        </Button>
      </DialogFooter>
      {/* </DialogContent> */}
    </DialogWrapper>
    // </Dialog>
  );
};

export default MoveOfferSalesCategoryChild;
