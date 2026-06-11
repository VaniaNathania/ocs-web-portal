import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useBillingCycleTypeContext from "../hooks/useBillingCycleTypeContext";
import {
  createDefaultBillingCyclePayload,
  createDefaultBillingCycleUpdatePayload,
} from "../types/forms";
import { apiConfig } from "@/config/api.config";
import { UseFormReturn } from "react-hook-form";
import { DateTimePickerField } from "@/components/ui/dateTime-picker";
import { Input } from "@/components/ui/input";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface FormsProps {
  forms: UseFormReturn<BillingCyclePayload>;
  updateForms: UseFormReturn<BillingCycleUpdatePayload>;
  isSubmitting: boolean;
  formType: "create" | "update";
}

const API_URL = apiConfig.service_price_plan;

const BasicFormDialog = ({
  formType,
  forms,
  isSubmitting,
  updateForms,
}: FormsProps) => {
  const {
    handleBasicShowDialog,
    showBasicDialog,
    selectedBillingCycle,
    selectedBillingCycleType,
    selectedStateFlag,
    handleBasicRefresh,
  } = useBillingCycleTypeContext();
  const { menuPrivAccess } = useAccountConfigLayout();

  const { PostData, PutData } = useCallApi();
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const {
    watch,
    formState: { errors },
  } = updateForms;

  const handleSubmitBillingCycle = async (
    data: BillingCyclePayload | BillingCycleUpdatePayload,
  ) => {
    setAutoSubmitting(true);
    try {
      const isCreate = formType === "create";
      const url = isCreate
        ? `${API_URL}/billing-cycle/create/`
        : `${API_URL}/billing-cycle/mod-single?billingCycleId=${selectedBillingCycle?.billingCycleId}`;

      const method = isCreate ? PostData : PutData;
      const response = await method(url, data);

      if (response?.status) {
        toast.success(response?.message);
        handleBasicShowDialog(false, formType, null);

        // Reset form
        if (isCreate) {
          forms.reset(createDefaultBillingCyclePayload());
        } else {
          updateForms.reset(createDefaultBillingCycleUpdatePayload());
        }
      }
      handleBasicRefresh();
    } catch (error) {
      console.error("Error submitting Billing Cycle", error);
      toast.error(
        `Error ${formType === "create" ? "Creating" : "Updating"} Billing Cycle. Please Check Your Connection!`,
      );
    } finally {
      setAutoSubmitting(false);
    }
  };

  useEffect(() => {
    if (showBasicDialog.show && formType === "update" && selectedBillingCycle) {
      updateForms.reset({
        billingCycleId: selectedBillingCycle.billingCycleId,
        billingCycleTypeId: selectedBillingCycle.billingCycleTypeId,
        cycleBeginDate: selectedBillingCycle.cycleBeginDate,
        cycleEndDate: selectedBillingCycle.cycleEndDate,
        runDate: selectedBillingCycle.runDate,
        spId: 0,
        debtDate: selectedBillingCycle.debtDate,
        documentDate: selectedBillingCycle.documentDate,
        invoiceDate: selectedBillingCycle.invoiceDate,
        notificationDate: selectedBillingCycle.notificationDate,
        originDate: selectedBillingCycle.originDate,
        postingDate: selectedBillingCycle.postingDate,
        state: selectedBillingCycle.state,
      });
    }
  }, [showBasicDialog.show, formType, selectedBillingCycle, updateForms]);

  /**
   * ⚙️ Auto submit CREATE saat dialog dibuka
   */
  useEffect(() => {
    if (
      showBasicDialog.show &&
      formType === "create" &&
      selectedBillingCycleType &&
      !autoSubmitting
    ) {
      const autoPayload: BillingCyclePayload = {
        billingCycleTypeId: selectedBillingCycleType.billingCycleTypeId,
        beginDate: selectedBillingCycleType.beginDate,
        runDate:
          selectedBillingCycleType.runDate ||
          selectedBillingCycleType.beginDate,
        spId: 0,
        quantity: selectedBillingCycleType.quantity,
        timeUnit: selectedBillingCycleType.timeUnit,
      };

      forms.reset(autoPayload);

      setAutoSubmitting(true);
      const timer = setTimeout(() => {
        handleSubmitBillingCycle(autoPayload);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [showBasicDialog.show, formType, selectedBillingCycleType]);

  /**
   * 🧹 Reset form saat dialog ditutup
   */
  useEffect(() => {
    if (!showBasicDialog.show) {
      forms.reset(createDefaultBillingCyclePayload());
      updateForms.reset(createDefaultBillingCycleUpdatePayload());
      setAutoSubmitting(false);
    }
  }, [showBasicDialog.show, forms, updateForms]);

  const handleDialogClose = (open: boolean) => {
    if (!autoSubmitting) {
      handleBasicShowDialog(open, showBasicDialog.mode, null);
    }
  };

  return (
    <Dialog open={showBasicDialog.show} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-7">
        <DialogHeader className="space-y-1.5">
          <DialogTitle>
            {formType === "create" ? "Create" : "Edit"} Billing Cycle
          </DialogTitle>
          <DialogDescription>
            {formType === "create"
              ? "Creating a new billing cycle..."
              : "Edit billing cycle details below"}
          </DialogDescription>
        </DialogHeader>

        {/* Loading State untuk CREATE */}
        {formType === "create" && autoSubmitting ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Creating billing cycle...</p>
          </div>
        ) : formType === "update" ? (
          /* UPDATE FORM */
          <form
            className="space-y-6 mt-4"
            onSubmit={updateForms.handleSubmit(handleSubmitBillingCycle)}
          >
            <section className="space-y-4">
              <h3 className="text-lg font-medium">Billing Cycle Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Cycle Begin Date */}
                <div className="space-y-2">
                  <Label>
                    Cycle Begin Date <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePickerField
                    disabled={true}
                    control={updateForms.control}
                    name="cycleBeginDate"
                    label="Cycle Begin Date"
                    error={updateForms.formState.errors.cycleBeginDate}
                  />
                </div>

                {/* Cycle End Date */}
                <div className="space-y-2">
                  <Label>
                    Cycle End Date <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePickerField
                    disabled={true}
                    control={updateForms.control}
                    name="cycleEndDate"
                    label="Cycle End Date"
                    error={updateForms.formState.errors.cycleEndDate}
                  />
                </div>

                {/* Run Date */}
                <div className="space-y-2">
                  <Label>
                    Run Date <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePickerField
                    control={updateForms.control}
                    name="runDate"
                    label="Run Date"
                    error={updateForms.formState.errors.runDate}
                  />
                </div>

                {/* Origin Date */}
                <div className="space-y-2">
                  <Label>
                    Origin Date <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePickerField
                    control={updateForms.control}
                    name="originDate"
                    label="Origin Date"
                    error={updateForms.formState.errors.originDate}
                  />
                </div>

                {/* Document Date */}
                <div className="space-y-2">
                  <Label>
                    Document Date <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePickerField
                    control={updateForms.control}
                    name="documentDate"
                    label="Document Date"
                    error={updateForms.formState.errors.documentDate}
                  />
                </div>

                {/* Posting Date */}
                <div className="space-y-2">
                  <Label>
                    Posting Date <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePickerField
                    control={updateForms.control}
                    name="postingDate"
                    label="Posting Date"
                    error={updateForms.formState.errors.postingDate}
                  />
                </div>

                {/* Invoice Date */}
                <div className="space-y-2">
                  <Label>
                    Invoice Date <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePickerField
                    control={updateForms.control}
                    name="invoiceDate"
                    label="Invoice Date"
                    error={updateForms.formState.errors.invoiceDate}
                  />
                </div>

                {/* Debt Date */}
                <div className="space-y-2">
                  <Label>
                    Debt Date <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePickerField
                    disabled={true}
                    control={updateForms.control}
                    name="debtDate"
                    label="Debt Date"
                    error={updateForms.formState.errors.debtDate}
                  />
                </div>

                {/* Notification Date */}
                <div className="space-y-2">
                  <Label>
                    Notification Date <span className="text-red-500">*</span>
                  </Label>
                  <DateTimePickerField
                    control={updateForms.control}
                    name="notificationDate"
                    label="Notification Date"
                    error={updateForms.formState.errors.notificationDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    State Flag<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    disabled={true}
                    name="State Flag"
                    value={selectedStateFlag!}
                  />
                </div>
              </div>
            </section>

            <DialogFooter className="pt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleBasicShowDialog(false, formType, null)}
                disabled={autoSubmitting || isSubmitting}
              >
                Cancel
              </Button>
              <AccessWrapper
                hasAccess={
                  showBasicDialog.mode == "create"
                    ? menuPrivAccess.addStatus
                    : menuPrivAccess.editStatus
                }
              >
                <Button type="submit" disabled={autoSubmitting || isSubmitting}>
                  {autoSubmitting || isSubmitting
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </AccessWrapper>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default BasicFormDialog;
