import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useSubscriptionPriceCreateContext } from "../hooks";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccumulationContext } from "./accumulation/hooks/useAccumulationContext";
import useBenefitContext from "./benefit/hooks/useBenefitContext";

const API_URL = apiConfig.service_price_plan;

type Date = {
  effDateProps: string;
  expDateProps: string;
};

type VersionListProps = {
  versionList: PriceVersion[];
  ratePlanId: number;
};

const EditDateDialog = () => {
  const { PutData } = useCallApi();
  const {
    priceVersionDate,
    showEditDateDialog,
    handleEditDateDialog,
    selectedPriceVer,
    selectedRatePlan,
    selectedMapping,
    fetchVersionsRatingForRatePlan,
    fetchVersionsAccumulationForRatePlan,
    fetchVersionsBenefitForRatePlan,
  } = useSubscriptionPriceCreateContext();

  const {
    showEditDateDialog: showAccumulationEditDateDialog,
    handleEditDateDialog: handleAccumulationEditDateDialog,
    priceVersionDate: priceVersionDateAccumulation,
    selectedPriceVer: selectedPriceVerAccumulation,
  } = useAccumulationContext();

  const {
    showEditDateDialog: showBenefitEditDateDialog,
    handleEditDateDialog: handleBenefitEditDateDialog,
    selectedPriceVer: selectedPriceVerBenefit,
  } = useBenefitContext();

  const initialFormField: {
    effectiveDate: string;
    expiredDate: string | null;
    ratePlanId: number;
    mappingId: number;
  } = {
    effectiveDate: "",
    expiredDate: null,
    ratePlanId: selectedRatePlan ?? 0,
    mappingId: selectedMapping ?? 0,
  };

  const [formField, setFormField] = useState(initialFormField);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (showEditDateDialog) {
      doUpdateDate(formField, selectedPriceVer?.priceVerId ?? 0);
    } else if (showBenefitEditDateDialog) {
      doUpdateDate(formField, selectedPriceVerBenefit?.priceVerId ?? 0);
    } else if (showAccumulationEditDateDialog) {
      doUpdateDate(formField, selectedPriceVerAccumulation?.priceVerId ?? 0);
    }
  };

  const doUpdateDate = async (
    payload: {
      effectiveDate: string;
      expiredDate: string | null;
      ratePlanId: number;
      mappingId: number;
    },
    priceVerId: number
  ) => {
    setIsSubmitting(true);
    try {
      if (
        showEditDateDialog ||
        showBenefitEditDateDialog ||
        showAccumulationEditDateDialog
      ) {
        const response = await PutData(
          `${API_URL}/price-version/update/${priceVerId}`,
          payload
        );

        if (response?.status) {
          toast.success(response.message);
          handleEditDateDialog(false, null);

          if (selectedRatePlan) {
            if (showEditDateDialog) {
              await fetchVersionsRatingForRatePlan(
                selectedRatePlan,
                selectedMapping
              );
            } else if (showBenefitEditDateDialog) {
              await fetchVersionsBenefitForRatePlan(
                selectedRatePlan,
                selectedMapping
              );
            } else if (showAccumulationEditDateDialog) {
              await fetchVersionsAccumulationForRatePlan(
                selectedRatePlan,
                selectedMapping
              );
            }
          }
        } else {
          toast.error(response?.message);
        }
      }
    } catch (error) {
      toast.error("Error updating date");
    } finally {
      setIsSubmitting(false);
      handleEditDateDialog(false, null);
      handleAccumulationEditDateDialog(false, null);
      handleBenefitEditDateDialog(false, null);
    }
  };

  // const dateString = selectedPriceVer?.date;

  // const [effDateRaw, expDateRaw] = dateString ? dateString.split(" - ") : [];
  // const effDate = effDateRaw?.trim() || "";

  // const rawExpDate = expDateRaw?.trim();
  // const expDate = rawExpDate && rawExpDate !== "-" ? rawExpDate : "";

  useEffect(() => {
    if (
      !showEditDateDialog &&
      !showAccumulationEditDateDialog &&
      !showBenefitEditDateDialog
    ) {
      setFormField(initialFormField);
    }
  }, [
    showEditDateDialog,
    showAccumulationEditDateDialog,
    showBenefitEditDateDialog,
  ]);

  useEffect(() => {
    if (showEditDateDialog) {
      setFormField((prev) => ({
        ...prev,
        effectiveDate: selectedPriceVer?.effDate || "",
        expiredDate: selectedPriceVer?.expDate || "",
      }));
    }

    if (showAccumulationEditDateDialog) {
      setFormField((prev) => ({
        ...prev,
        effectiveDate: priceVersionDateAccumulation?.effDate || "",
        expiredDate: priceVersionDateAccumulation?.expDate || "",
      }));
    }

    if (showBenefitEditDateDialog) {
      setFormField((prev) => ({
        ...prev,
        effectiveDate: selectedPriceVerBenefit?.effectiveDate || "",
        expiredDate: selectedPriceVerBenefit?.expiryDate || "",
      }));
    }
  }, [
    showEditDateDialog,
    showAccumulationEditDateDialog,
    showBenefitEditDateDialog,
  ]);

  return (
    <Dialog
      open={
        showEditDateDialog ||
        showAccumulationEditDateDialog ||
        showBenefitEditDateDialog
      }
      onOpenChange={(open) => {
        handleEditDateDialog(open, null);
        handleAccumulationEditDateDialog(open, null);
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
                      className={`w-full transition-colors ${
                        errors.effDate
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                      type="date"
                      value={formField.effectiveDate}
                      onChange={(e) => {
                        setFormField({
                          ...formField,
                          effectiveDate: e.target.value,
                        });
                        setErrors({ ...errors, effDate: "" });
                      }}
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
