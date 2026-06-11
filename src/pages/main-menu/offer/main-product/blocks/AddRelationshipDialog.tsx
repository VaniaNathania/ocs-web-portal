import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import { toast } from "sonner";
import RelationshipSelectedOffer, { offerRelaProps } from "./RelationshipSelectedOffer";
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";

interface FilteredRelationType {
  relaType: string;
  relaTypeName: string;
}

interface AddRelationshipDialogProps {
  rowData: any;
  filteredRelationTypes: FilteredRelationType[];
  popupType: string;
  onClose: () => void;
  onSaveSuccess?: () => Promise<void>;
}

const API_URL_OFFER = apiConfigOffer.offer;

// ✅ TAMBAH: Mapping untuk convert relaType string ke numeric
const RELA_TYPE_MAPPING: Record<string, string> = {
  A: "4", // Dependent for automatic order (gunakan yang numeric)
  B: "1", // Mutually Exclusive for Disable -> gunakan Mutually Exclusive
  C: "3", // Non Exchangeable -> gunakan Exchangeable
  E: "1", // Member Relation -> gunakan Mutually Exclusive
  // Numeric types tetap sama
  "1": "1", // Mutually Exclusive
  "2": "2", // Dependent
  "3": "3", // Exchangeable
  "4": "4", // Dependent for automatic order
  "5": "5", // Weakly Dependent
  "6": "6", // Parallel Upgrade
  "7": "7", // Share Line
  "8": "8", // Weakly Share Line
  "9": "9", // Port-Network
  "998": "998", // Dependent Unsubscription Auto
  "999": "999", // Dependent for automatic order Unsubscription Auto
};

// ✅ TAMBAH: Function untuk validasi dan konversi relaType
const convertRelaTypeToNumeric = (relaType: string): string => {
  const numericType = RELA_TYPE_MAPPING[relaType];
  if (!numericType) {
    console.warn(`⚠️ Unknown relaType: ${relaType}, using fallback`);
    return relaType;
  }
  return numericType;
};

// ✅ TAMBAH: Function untuk filter relationType yang valid saja
const filterValidRelationTypes = (relationTypes: FilteredRelationType[]): FilteredRelationType[] => {
  return relationTypes.filter((relation) => {
    // Hanya ambil yang ada di mapping dan bisa dikonversi ke numeric
    const numericType = RELA_TYPE_MAPPING[relation.relaType];
    if (!numericType) {
      console.warn(`⚠️ Filtering out invalid relaType: ${relation.relaType} - ${relation.relaTypeName}`);
      return false;
    }
    return true;
  });
};

const AddRelationshipDialog: React.FC<AddRelationshipDialogProps> = ({ rowData, filteredRelationTypes, popupType, onClose, onSaveSuccess }) => {
  const { PostData } = useCallApi();
  const [isPackage, setIsPackage] = useState(popupType === "source" ? "Yes" : "No");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRelationType, setSelectedRelationType] = useState<FilteredRelationType | null>(null);
  const [selectedOfferType, setSelectedOfferType] = useState<string>("");
  const [relationTypeOpen, setRelationTypeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedOffers, setSelectedOffers] = useState<offerRelaProps[]>([]);

  // ✅ PERBAIKI: Filter relationType yang valid
  const validRelationTypes = filterValidRelationTypes(filteredRelationTypes);

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please complete all required fields");
      return;
    }

    if (selectedOffers.length === 0) {
      toast.error("Please select at least one offer");
      return;
    }

    setLoading(true);

    try {
      // ✅ PERBAIKI: Konversi relaType ke numeric sebelum dikirim
      const numericRelaType = convertRelaTypeToNumeric(selectedRelationType?.relaType || "");

      // console.log(`🔄 Converting relaType: ${selectedRelationType?.relaType} -> ${numericRelaType}`);

      const relationshipData = selectedOffers.map((offer) => {
        if (isPackage === "Yes") {
          return {
            oriOfferId: parseInt(rowData.offerId.toString()), // Current offer
            relaType: numericRelaType, // ✅ Gunakan numeric type
            destOfferId: parseInt(offer.offerId.toString()), // Selected offer
          };
        } else {
          return {
            oriOfferId: parseInt(offer.offerId.toString()), // Selected offer
            relaType: numericRelaType, // ✅ Gunakan numeric type
            destOfferId: parseInt(rowData.offerId.toString()), // Current offer
          };
        }
      });

      // console.log("📤 Sending relationship data:", relationshipData);

      const response = await PostData(`${API_URL_OFFER}/offer/rela/add-offer-rela-batch`, relationshipData);

      // console.log("📥 API Response:", response);

      if (response?.status) {
        const sectionName = isPackage === "Yes" ? "Source Offer" : "Target Offer";
        const existing = response?.data?.existing ?? 0;
        const inserted = response?.data?.inserted ?? 0;

        toast.success(
          <>
            <KeenIcon icon="check" className="border rounded-full border-gray-300 bg-green-700 text-white text-[10px] p-1" />
            <span className="font-medium text-sm">
              Relationships successfully
              <br />
              Existing: {existing}, Inserted: {inserted}
            </span>
          </>,
        );

        if (onSaveSuccess) {
          await onSaveSuccess();
        }

        closePopup();
      } else {
        const errorMessage = response?.message || "Failed to save relationship";
        toast.error(`Error: ${errorMessage}`);
        console.error("❌ API Error:", response);
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Something went wrong. Please try again.";
      console.error("❌ Network Error:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validasi Relation Type
    if (!selectedRelationType) {
      newErrors.relaType = "Relation Type is required";
    } else {
      // ✅ TAMBAH: Validasi apakah relaType bisa dikonversi
      const numericType = convertRelaTypeToNumeric(selectedRelationType.relaType);
      if (!numericType || (numericType === selectedRelationType.relaType && isNaN(Number(numericType)))) {
        newErrors.relaType = "Invalid or unsupported Relation Type";
      }
    }

    // Validasi Offer Type
    if (!selectedOfferType) {
      newErrors.offerType = "Offer Type is required";
    }

    // Validasi Selected Offers
    if (selectedOffers.length === 0) {
      newErrors.targetOffer = `${getOfferLabel()} wajib dipilih`;
    }

    // Validasi rowData (current offer)
    if (!rowData?.offerId && !rowData?.id) {
      newErrors.currentOffer = "Invalid current offer data";
    }

    setErrors(newErrors);

    // Log validation errors untuk debugging
    if (Object.keys(newErrors).length > 0) {
      console.warn("⚠️ Validation errors:", newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleRelationDirectionChange = (direction: "Yes" | "No") => {
    setIsPackage(direction);
  };

  const handleSelectRelationType = (selectedItem: FilteredRelationType) => {
    // ✅ TAMBAH: Log untuk debugging
    // console.log(`🔄 Selected relation type: ${selectedItem.relaType} - ${selectedItem.relaTypeName}`);
    // console.log(`🔄 Will be converted to: ${convertRelaTypeToNumeric(selectedItem.relaType)}`);

    setSelectedRelationType(selectedItem);
    setRelationTypeOpen(false);

    if (errors.relaType) {
      setErrors({ ...errors, relaType: "" });
    }
  };

  const getOfferLabel = () => {
    return isPackage === "Yes" ? "Source Offer" : "Target Offer";
  };

  const handleOpenAddDialog = () => {
    if (!selectedOfferType) {
      toast.error("Please select Offer Type first");
      return;
    }

    if (!selectedRelationType) {
      toast.error("Please select Relation Type first");
      return;
    }

    setIsAddDialogOpen(true);
  };

  const closePopup = () => {
    setSelectedRelationType(null);
    setSelectedOfferType("");
    setSelectedOffers([]);
    setErrors({});
    onClose();
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleAddRelations = (selectedRelations: offerRelaProps[]) => {
    // console.log("Received selected relations:", selectedRelations);
    setSelectedOffers(selectedRelations);
    if (errors.targetOffer) {
      setErrors({ ...errors, targetOffer: "" });
    }
    setIsAddDialogOpen(false);
  };

  const handleOfferTypeChange = (value: string) => {
    setSelectedOfferType(value);
    setSelectedOffers([]);

    if (errors.offerType) {
      setErrors({ ...errors, offerType: "" });
    }
  };

  const getSelectedOffersText = () => {
    if (selectedOffers.length === 0) {
      return "";
    }

    return selectedOffers.map((offer) => offer.offerName).join(", ");
  };

  const handleClearSelectedOffers = () => {
    setSelectedOffers([]);
    if (errors.targetOffer) {
      setErrors({ ...errors, targetOffer: "" });
    }
  };

  useEffect(() => {
    console.log("rowdata", rowData);
  }, [rowData]);

  return (
    <>
      <Dialog open={true} onOpenChange={closePopup}>
        <DialogContent className="w-[600px] max-w-2xl p-4">
          <DialogHeader>
            <DialogTitle>Add {popupType === "source" ? "Source" : "Target"} Item</DialogTitle>
          </DialogHeader>

          {/* --- Form Section --- */}
          <div className="space-y-4 py-2">
            {/* Row: Current Offer */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium">Current Offer</label>
              <span>:</span>
              <Input type="text" value={rowData?.offerName || rowData?.name || ""} readOnly className="flex-1" />
            </div>

            {/* Row: Relation Direction */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium">Relation Direction</label>
              <span>:</span>
              <div className="flex items-center gap-6 flex-1">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" name="isPackage" value="Yes" checked={isPackage === "Yes"} onChange={() => handleRelationDirectionChange("Yes")} />
                  As Source
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" name="isPackage" value="No" checked={isPackage === "No"} onChange={() => handleRelationDirectionChange("No")} />
                  As Target
                </label>
              </div>
            </div>

            {/* Row: Relation Type */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium">
                Relation Type <span className="text-red-500">*</span>
              </label>
              <span>:</span>
              <div className="flex-1">
                <Popover open={relationTypeOpen} onOpenChange={setRelationTypeOpen}>
                  <PopoverTrigger asChild>
                    <button type="button" className={`w-full text-sm px-3 py-2 border rounded-md text-left hover:bg-gray-50 transition-colors ${errors.relaType ? "border-red-500" : "border-gray-300"}`} disabled={loading}>
                      {loading ? "Loading Relation Types..." : selectedRelationType ? `${selectedRelationType.relaTypeName || "Unknown"}` : "Select Relation Type"}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" onWheel={(e) => e.stopPropagation()}>
                    <div className="max-h-[200px] overflow-y-auto pointer-events-auto">
                      {validRelationTypes && validRelationTypes.length > 0 ? (
                        validRelationTypes.map((relation) => (
                          <div
                            key={`${relation.relaType}`}
                            onClick={() => handleSelectRelationType(relation)}
                            className="cursor-pointer text-sm px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 truncate"
                            title={`${relation.relaTypeName} (${relation.relaType} -> ${convertRelaTypeToNumeric(relation.relaType)})`}
                          >
                            {relation.relaTypeName}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-gray-500 text-sm">{loading ? "Loading..." : "No valid relation types available"}</div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.relaType && <span className="text-red-500 text-xs mt-1 block">{errors.relaType}</span>}
              </div>
            </div>

            {/* Row: Offer Type */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium">
                Offer Type <span className="text-red-500">*</span>
              </label>
              <span>:</span>
              <div className="flex-1">
                <Select value={selectedOfferType} onValueChange={handleOfferTypeChange} disabled={!selectedRelationType}>
                  <SelectTrigger className={`text-sm ${errors.offerType ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select Offer Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {rowData.offerType === "2" && <SelectItem value="2">Main Product</SelectItem>}
                    {rowData.offerType === "7" && <SelectItem value="7">Subscription Plan</SelectItem>}
                    {(rowData.offerType === "3" || rowData?.offerType === "4") && (
                      <>
                        <SelectItem value="3">Related Product</SelectItem>
                        <SelectItem value="4">Price Plan</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.offerType && <span className="text-red-500 text-xs mt-1 block">{errors.offerType}</span>}
              </div>
            </div>

            {/* Row: Target Offer */}
            <div className="flex items-center gap-2">
              <label className="w-40 text-sm font-medium">
                {getOfferLabel()} <span className="text-red-500">*</span>
              </label>
              <span>:</span>
              <div className="relative w-full flex-1">
                <Input
                  type="text"
                  readOnly
                  placeholder="Select Offer"
                  value={getSelectedOffersText()}
                  className={`w-full border rounded-md px-3 py-2 text-sm bg-gray-100 pr-20 cursor-pointer ${errors.targetOffer ? "border-red-500" : ""}`}
                  disabled={!selectedOfferType}
                  onClick={handleOpenAddDialog}
                  title={getSelectedOffersText()}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  {selectedOffers.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSelectedOffers();
                      }}
                      className="text-gray-500 hover:text-red-500 p-1"
                      title="Clear selection"
                    >
                      <KeenIcon icon="cross" className="text-xs" />
                    </button>
                  )}
                  <button type="button" onClick={handleOpenAddDialog} className="text-gray-500 hover:text-gray-700 disabled:opacity-50 p-1" disabled={!selectedOfferType} title="Select offers">
                    <KeenIcon icon="notepad-edit" />
                  </button>
                </div>
                {errors.targetOffer && <span className="text-red-500 text-xs mt-1 block">{errors.targetOffer}</span>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4">
            <div className="flex w-full justify-end gap-2">
              <Button type="button" variant="outline" onClick={closePopup} disabled={loading} className="flex items-center gap-2">
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={loading || selectedOffers.length === 0} className="flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RelationshipSelectedOffer isOpen={isAddDialogOpen} onClose={handleCloseAddDialog} onAdd={handleAddRelations} selectedOfferType={selectedOfferType} selectedRelationType={selectedRelationType} existingSelectedOffers={selectedOffers} />
    </>
  );
};

export default AddRelationshipDialog;
