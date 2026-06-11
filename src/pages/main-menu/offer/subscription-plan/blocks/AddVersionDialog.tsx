import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiConfigOffer } from "@/config/api.config";
import { useSubscriptionPlanOfferListContext } from "../hooks/useSubscriptionPlanOfferListContext";
import { KeenIcon, useDataGrid } from "@/components";
import { useCallApi } from "@/hooks";
import { getAuth } from "@/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface AddVersionDialogProps {
  isOpen: boolean;
  onSuccess?: () => void;
  onClose: () => void;
}

export interface FormData {
  effDate: string | null;
  expDate: string | null;
  srcOfferVerId?: number | null;
  offerId: number | null;
  offerVerId?: number | null;
  seq?: number | null;
  spId: number | null;
}

const API_URL_OFFER = apiConfigOffer.offer;

const AddVersionDialog: React.FC<AddVersionDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const parentRef = useRef<any | null>(null);
  // const { reload } = useDataGrid();
  const { PostData, GetData } = useCallApi();
  const parsedUser = getAuth()?.user;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });
  const {
    fetchSubscriptionPlans,
    showAddVersionDialogSubsPlan,
    handleAddVersionDialogSubsPlan,
    selectedCategoryId,
  } = useSubscriptionPlanOfferListContext();

  const [verCopyForm, setVerCopyForm] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verOpen, setVerOpen] = useState(false);
  const { selectedSubSubPlan } = useOfferLayout();
  const [expandedOffers, setExpandedOffers] = useState(new Set());

  const initialStateAddDialog: FormData = {
    effDate: null,
    expDate: null,
    srcOfferVerId: null,
    offerId: selectedSubSubPlan.offerId,
    spId: 0,
  };

  const [formData, setFormData] = useState<FormData>(initialStateAddDialog);

  const resetForm = () => {
    setFormData(initialStateAddDialog);
    setErrors({});
    setAlert({ show: false, message: "" });
  };

  const fetchVersionCopy = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchSubscriptionPlans(
        selectedSubSubPlan.indepProdSpecId,
      );
      setVerCopyForm(result ?? []);
      const allOfferIds = new Set(result.map((p) => p.offerId));
      setExpandedOffers(allOfferIds);
    } catch (error: any) {
      console.error("❌ fetchVersionCopy error:", error);
      setError(error?.message ?? "Failed to fetch version copy form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //  console.log("OBJECTVERSIONCOPYFROM: ", verCopyForm);
  }, [verCopyForm]);

  useEffect(() => {
    //  console.log("UPDATED FORM DATA", formData);
  }, [formData]);

  useEffect(() => {
    if (showAddVersionDialogSubsPlan === false) {
      resetForm();
    }
  }, [showAddVersionDialogSubsPlan]);

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [{ key: "effDate", label: "Effective Date" }];

    const newErrors: Record<string, string> = {};
    let isValid = true;

    setAlert({ show: false, message: "" });

    requiredFields.forEach(({ key, label }) => {
      const value = formData[key as keyof FormData];
      const isEmpty = value === "" || value === null || value === undefined;

      if (isEmpty) {
        newErrors[key] = `${label} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      setAlert({
        show: true,
        message: firstError || "Please fill in all required fields",
      });
    }

    return isValid;
  };

  const handleCancel = () => {
    handleAddVersionDialogSubsPlan(false);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setAlert({ show: false, message: "" });

      try {
        //  console.log("🚀 Creating version with data:", formData);

        const response = await PostData(
          `${API_URL_OFFER}/offer/subs-plan/add-subs-plan-ver`,
          formData,
        );

        //  console.log("📦 API Response:", response);

        if (response?.status) {
          resetForm();
          toast.success("Version created successfully!");

          onSuccess?.();

          onClose();
        } else {
          const errorMessage =
            response?.message || "Failed to create version. Please try again.";
          toast.error(errorMessage);
          setAlert({
            show: true,
            message: errorMessage,
          });
          console.error("❌ API returned error:", response);
        }
      } catch (error: any) {
        const errorMessage =
          error?.message || "Something went wrong. Please try again.";
        console.error("❌ Error creating version:", error);
        toast.error(errorMessage);
        setAlert({
          show: true,
          message: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, handleAddVersionDialogSubsPlan, PostData, parsedUser],
  );

  return (
    <Dialog
      open={showAddVersionDialogSubsPlan}
      onOpenChange={handleAddVersionDialogSubsPlan}
    >
      <DialogContent className="max-w-2xl w-full p-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg">Add Version</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <DialogBody className="max-h-[75vh] overflow-y-auto">
          {alert.show && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{alert.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Version Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version Date <span className="text-red-500">*</span>
                  </label>

                  {/* Dua input sejajar */}
                  <div className="flex gap-2">
                    {/* Effective Date */}
                    <div className="w-1/2">
                      <input
                        type="date"
                        value={formData.effDate || ""}
                        onChange={(e) =>
                          handleInputChange("effDate", e.target.value || null)
                        }
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["effDate"] ? "border-red-500" : "border-gray-300"}`}
                        disabled={isSubmitting}
                      />
                      {errors["effDate"] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors["effDate"]}
                        </p>
                      )}
                    </div>

                    <label className="mt-2">-</label>

                    {/* Expired Date */}
                    <div className="w-1/2">
                      <input
                        type="date"
                        value={formData.expDate || ""}
                        onChange={(e) =>
                          handleInputChange("expDate", e.target.value || null)
                        }
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["expDate"] ? "border-red-500" : "border-gray-300"}`}
                        disabled={isSubmitting}
                      />
                      {errors["expDate"] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors["expDate"]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Version Copy From */}
                <div className="flex-col">
                  <label className="form-label pb-2">Version Copy From</label>
                  <div className="flex flex-row">
                    <Popover
                      open={verOpen}
                      onOpenChange={(open) => {
                        setVerOpen(open);
                        if (open && verCopyForm?.length === 0 && !loading) {
                          fetchVersionCopy();
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={`w-full flex items-center justify-between input text-left ${errors.offerId ? "border-red-500" : ""}`}
                          disabled={loading}
                        >
                          {loading
                            ? "Loading subscription plans..."
                            : (() => {
                                const selectedPlan = verCopyForm?.find(
                                  (p) => p.offerId === formData.offerId,
                                );
                                //  console.log("SELECTED PLAN", selectedPlan);
                                if (!selectedPlan)
                                  return "Select Version Copy From";

                                const selectedVersion =
                                  selectedPlan.offerVer?.find(
                                    (v: any) =>
                                      v.offerVerId === formData.srcOfferVerId,
                                  );
                                //  console.log("formData.srcOfferVerId", formData.srcOfferVerId);
                                //  console.log("type:", typeof formData.srcOfferVerId);

                                //  console.log("SELECTED VERSION", selectedVersion);

                                if (!selectedVersion)
                                  return "Selected Version Copy From";

                                return `${selectedVersion.effDate} ~ ${selectedVersion.expDate || ""}`;
                              })()}

                          <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <Command>
                          <CommandInput placeholder="Search subscription plan..." />
                          <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto">
                            <CommandEmpty>
                              {loading
                                ? "Loading..."
                                : "No subscription plan found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {verCopyForm?.map((plan) => (
                                <div key={plan.subsPlanId}>
                                  {/* PARENT */}
                                  <CommandItem
                                    value={plan.offerName}
                                    onSelect={() => {
                                      // Toggle expand
                                      setExpandedOffers((prev) => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(plan.offerId)) {
                                          newSet.delete(plan.offerId);
                                        } else {
                                          newSet.add(plan.offerId);
                                        }
                                        return newSet;
                                      });
                                    }}
                                  >
                                    <ChevronRight
                                      className={`h-4 w-4 transition-transform ${expandedOffers.has(plan.offerId) ? "rotate-90" : ""}`}
                                    />
                                    <span>{plan.offerName}</span>
                                  </CommandItem>

                                  {/* CHILDREN - Versions (tampil jika expanded) */}
                                  {expandedOffers.has(plan.offerId) &&
                                    plan.offerVer?.map((ver: any) => (
                                      <CommandItem
                                        key={ver.offerVerId}
                                        value={`${plan.offerName} ${ver.effDate}`}
                                        className="pl-8"
                                        onSelect={() => {
                                          setFormData((prev) => ({
                                            ...prev,
                                            offerId: plan.offerId,
                                            srcOfferVerId: ver.offerVerId,
                                          }));
                                          setErrors((prev) => ({
                                            ...prev,
                                            offerId: "",
                                          }));
                                          setVerOpen(false);
                                        }}
                                      >
                                        <span>
                                          {ver.effDate} ~ {ver.expDate || ""}
                                        </span>
                                      </CommandItem>
                                    ))}
                                </div>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Button Clear terpisah */}
                    {formData.srcOfferVerId && (
                      <button
                        type="button"
                        className="p-2 rounded-md hover:bg-gray-100 transition"
                        title="Clear"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            srcOfferVerId: null,
                          }));
                          setExpandedOffers(new Set());
                        }}
                      >
                        <KeenIcon icon="cross" />
                      </button>
                    )}
                  </div>

                  {errors.subsPlanId && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.subsPlanId}
                    </span>
                  )}
                  {error && (
                    <span className="text-red-500 text-xs mt-1">
                      Error loading subscription plans: {error}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "OK"}
              </Button>
            </div>
          </form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AddVersionDialog;
