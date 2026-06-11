import { DefaultTooltip, KeenIcon, useDataGrid } from "@/components";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import useBillingCycleTypeContext from "../hooks/useBillingCycleTypeContext";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const API_URL = apiConfig.service_price_plan;

const BasicListToolbar = () => {
  const { menuPrivAccess } = useAccountConfigLayout();
  const { reload } = useDataGrid();
  const { selectedBillingCycleType, handleCycleDelete } =
    useBillingCycleTypeContext();

  const { PostData } = useCallApi();
  const [isCreating, setIsCreating] = useState(false);

  const handleAddData = async () => {
    if (!selectedBillingCycleType) {
      toast.error("Please select billing cycle type first");
      return;
    }

    setIsCreating(true);

    try {
      const type = selectedBillingCycleType;

      const payload = {
        billingCycleTypeId: type.billingCycleTypeId,
        beginDate: type.beginDate,
        runDate: type.runDate || type.beginDate,
        spId: 0,
        quantity: type.quantity,
        timeUnit: type.timeUnit,
      };

      const response = await PostData(
        `${API_URL}/billing-cycle/create`,
        payload,
      );

      if (response?.status) {
        toast.success(
          response?.message || "Billing cycle created successfully",
        );
        reload();
      } else {
        toast.error(response?.message || "Failed to create billing cycle");
      }
    } catch (error) {
      console.error("Error creating Billing Cycle", error);
      toast.error(
        "Error creating billing cycle. Please check your connection!",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAll = () => {
    if (!selectedBillingCycleType) {
      toast.error("Please select billing cycle type first");
      return;
    }

    // Trigger delete multi dialog
    handleCycleDelete(
      true,
      selectedBillingCycleType.billingCycleTypeId,
      null,
      "multi",
    );
  };

  return (
    <div className="card-header flex-wrap gap-2 border-b-0 px-5">
      <div className="flex flex-wrap gap-2 lg:gap-5 w-full">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-3 w-2/3">
            {/* Loading indicator */}
            {isCreating && (
              <div className="flex items-center gap-2 text-primary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Creating billing cycle...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <AccessWrapper
              enabledText="Delete All Billing Cycles"
              hasAccess={menuPrivAccess.deleteStatus}
            >
              {/* <DefaultTooltip title="Delete All Billing Cycles" placement="top"> */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAll}
                className="whitespace-nowrap"
                disabled={!selectedBillingCycleType || isCreating}
              >
                <KeenIcon icon="trash" className="mr-2" />
                Delete All
              </Button>
              {/* </DefaultTooltip> */}
            </AccessWrapper>
            <AccessWrapper
              enabledText="Add Billing Cycle"
              hasAccess={menuPrivAccess.addStatus}
            >
              <Button
                onClick={handleAddData}
                className="whitespace-nowrap"
                disabled={isCreating || !selectedBillingCycleType}
                size="sm"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <KeenIcon icon="plus" className="mr-2" />
                    Add Data
                  </>
                )}
              </Button>
            </AccessWrapper>

            <DefaultTooltip title="Refresh" placement="top">
              <Button
                variant="outline"
                size="sm"
                onClick={() => reload()}
                className="p-2"
                disabled={isCreating}
              >
                <KeenIcon icon="arrows-circle" />
              </Button>
            </DefaultTooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicListToolbar;
