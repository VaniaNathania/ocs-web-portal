import { useCallApi } from "@/hooks";
import { useRecurringPriceContext } from "../hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { apiConfig } from "@/config/api.config";
import useRecurrringRatingContext from "./rating/hooks/useRecurringRatingContext";
import useRecurringAcmContext from "./accumulation/hooks/useRecurringAcmContext";
import useRecurringBenefitContext from "./benefit/hooks/useRecurringBenefitContext";

const API_URL = apiConfig.service_price_plan;

const EditDateDialog = () => {
  const { PutData } = useCallApi();
  const {
    fetchVersionsRatingForRatePlan,
    fetchVersionsAccumulationForRatePlan,
    fetchVersionsBenefitForRatePlan,
    selectedRatePlan,
    selectedMapping,
    ratingLists,
  } = useRecurringPriceContext();
  const {
    selectedPriceVersion,
    handleEditDateDialog,
    showEditDateDialog,
    priceVersionDate,
  } = useRecurrringRatingContext();
  const {
    showEditDateDialog: showAcmEditDateDialog,
    handleEditDateDialog: handleAcmEditDateDialog,
    priceVersionDate: acmPriceVersionDate,
    selectedPriceVersion: selectedPriceVerAccumulation,
  } = useRecurringAcmContext();
  const {
    showEditDateDialog: showBenefitEditDateDialog,
    handleEditDateDialog: handleBenefitEditDateDialog,
    priceVersionDate: benefitPriceVersionDate,
    selectedPriceVersion: selectedPriceVerBenefit,
  } = useRecurringBenefitContext();

  const initialFormField: {
    effectiveDate: string;
    expiredDate: string | null;
    ratePlanId: number;
    mappingId: number | null;
  } = {
    effectiveDate: "",
    expiredDate: null,
    ratePlanId: selectedRatePlan || 0,
    mappingId: selectedMapping || null,
  };

  const [formField, setFormField] = useState(initialFormField);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (showEditDateDialog) {
      doUpdateDate(formField, selectedPriceVersion?.priceVerId ?? 0);
    } else if (showBenefitEditDateDialog) {
      doUpdateDate(formField, selectedPriceVerBenefit?.priceVerId ?? 0);
    } else if (showAcmEditDateDialog) {
      doUpdateDate(formField, selectedPriceVerAccumulation?.priceVerId ?? 0);
    }
  };

  const doUpdateDate = async (
    payload: {
      effectiveDate: string;
      expiredDate: string | null;
      ratePlanId: number;
      mappingId: number | null;
    },
    priceVerId: number
  ) => {
    setIsSubmitting(true);

    try {
      if (showEditDateDialog) {
        const response = await PutData(
          `${API_URL}/price-version/update/${priceVerId}`,
          payload
        );

        if (response?.status) {
          toast.success(response.message);
          handleEditDateDialog(false, null);

          if (selectedRatePlan) {
            await fetchVersionsRatingForRatePlan(
              selectedRatePlan,
              selectedMapping
            );
          }
        } else {
          toast.error(response?.message);
        }
      } else if (showAcmEditDateDialog) {
        const response = await PutData(
          `${API_URL}/price-version/update/${selectedPriceVerAccumulation?.priceVerId}`,
          payload
        );

        if (response?.status) {
          toast.success(response.message);
          handleAcmEditDateDialog(false, null);

          if (selectedRatePlan) {
            await fetchVersionsAccumulationForRatePlan(
              selectedRatePlan,
              selectedMapping
            );
          }
        } else {
          toast.error(response?.message);
        }
      } else if (showBenefitEditDateDialog) {
        const response = await PutData(
          `${API_URL}/price-version/update/${priceVerId}`,
          payload
        );

        if (response?.status) {
          toast.success(response.message);
          handleBenefitEditDateDialog(false, null);

          if (selectedRatePlan) {
            await fetchVersionsBenefitForRatePlan(
              selectedRatePlan,
              selectedMapping
            );
          }
        } else {
          toast.error(response?.message);
        }
      }
    } catch (error) {
      toast.error("Error updating date");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const dateString = selectedPriceVersion?.date;

  // const [effDateRaw, expDateRaw] = dateString ? dateString.split(" - ") : [];
  // const effDate = effDateRaw?.trim() || "";

  // const rawExpDate = expDateRaw?.trim();
  // const expDate = rawExpDate && rawExpDate !== "-" ? rawExpDate : "";

  useEffect(() => {
    if (showEditDateDialog) {
      setFormField((prev) => ({
        ...prev,
        effectiveDate: priceVersionDate?.effDate || "",
        expiredDate: priceVersionDate?.expDate || null,
        ratePlanId: selectedRatePlan || 0,
        mappingId: selectedMapping || null,
      }));
    }

    if (showAcmEditDateDialog) {
      setFormField((prev) => ({
        ...prev,
        effectiveDate: acmPriceVersionDate?.effDate || "",
        expiredDate: acmPriceVersionDate?.expDate || null,
        ratePlanId: selectedRatePlan || 0,
        mappingId: selectedMapping || null,
      }));
    }

    if (showBenefitEditDateDialog) {
      setFormField((prev) => ({
        ...prev,
        effectiveDate: benefitPriceVersionDate?.effectiveDate || "",
        expiredDate: benefitPriceVersionDate?.expiryDate || null,
        ratePlanId: selectedRatePlan || 0,
        mappingId: selectedMapping || null,
      }));
    }
  }, [showEditDateDialog, showAcmEditDateDialog, showBenefitEditDateDialog]);

  const getMinEffDate = () => {
    const entries = ratingLists?.[selectedRatePlan!] ?? [];

    // Kurang dari 2 data = tidak perlu batasan
    if (entries.length < 2) return undefined;

    // Temukan index dari data yang sedang dipilih
    const currentIndex = entries.findIndex(
      (entry) => entry.priceVerId === selectedPriceVersion?.priceVerId
    );

    // Jika entry pertama (index 0) sedang diedit → bebas
    if (currentIndex <= 0) return undefined;

    // Ambil expDate dari data sebelumnya
    return entries[currentIndex - 1]?.expDate;
  };

  const minEffDate = getMinEffDate();

  return (
    <Dialog
      open={
        showEditDateDialog || showAcmEditDateDialog || showBenefitEditDateDialog
      }
      onOpenChange={(open) => {
        handleEditDateDialog(open, null);
        handleAcmEditDateDialog(open, null);
        handleBenefitEditDateDialog(open, null);
      }}
    >
      <DialogContent className="container-fixed max-w-[768px] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Effective Date and Expired Date</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col">
            <form onSubmit={handleSubmit}>
              <div className="card-body grid gap-5">
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-wrap gap-2.5 text-sm">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Effective Date
                    </label>
                    <Input
                      type="date"
                      min={minEffDate || undefined}
                      value={formField.effectiveDate}
                      onChange={(e) => {
                        setFormField({
                          ...formField,
                          effectiveDate: e.target.value,
                        });
                        setErrors({ ...errors, effDate: "" });
                      }}
                      className={`w-full transition-colors ${
                        errors.effDate
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      placeholder="Select effective date"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-wrap gap-2.5 text-sm">
                    <label className="form-label flex items-center gap-1 max-w-56">
                      Expired Date
                    </label>
                    <Input
                      className={`w-full transition-colors ${
                        errors.expDate
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      type="date"
                      min={
                        priceVersionDate?.expDate ||
                        acmPriceVersionDate?.expDate ||
                        benefitPriceVersionDate?.expiryDate ||
                        undefined
                      }
                      value={formField.expiredDate || ""}
                      onChange={(e) => {
                        setFormField({
                          ...formField,
                          expiredDate: e.target.value,
                        });
                        setErrors({ ...errors, expDate: "" });
                      }}
                      placeholder="Select expired date"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2.5 gap-5">
                  <Button
                    variant="default"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <RefreshCw className="animate-spin h-8 w-8 text-white mx-3" />
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default EditDateDialog;
