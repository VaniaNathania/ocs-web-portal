import { DataGridProvider } from "@/components";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { createContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { ColumnBillingCycleType } from "./ColumnBillingCycleType";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  billingCycleSchema,
  createDefaultBillingCyclePayload,
  createDefaultBillingCycleUpdatePayload,
  updateBillingCycleSchema,
} from "../types/forms";
import { ColumnBillingCycle } from "./ColumnBillingCycle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useBillingCycleTypeContext from "./useBillingCycleTypeContext";
import BasicListToolbar from "../blocks/ListToolBarForBasicBilling";
import BasicFormDialog from "../blocks/BillingCycleForm";
import DeleteCycleDialog from "../blocks/DeleteCycleDialog";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";

const API_URL = apiConfig.service_price_plan;

const BillingCycleTypeDetailDialog = () => {
  const { GetData } = useCallApi();

  const {
    showDetailDialog,
    handleDetailDialog,
    selectedBillingCycleType,
    showBasicDialog,
    handleBasicShowDialog,
    handleCycleDelete,
    setSelectedStateFlag,
    selectedStateFlag,
    refreshKeyBasicBCT,
    doGetBillingCycle,
  } = useBillingCycleTypeContext();
  const { menuPrivAccess } = useAccountConfigLayout();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForms = useForm<BillingCyclePayload>({
    resolver: zodResolver(billingCycleSchema),
    defaultValues: createDefaultBillingCyclePayload(),
    mode: "onChange",
  });

  const updateForms = useForm<BillingCycleUpdatePayload>({
    resolver: zodResolver(updateBillingCycleSchema),
    defaultValues: createDefaultBillingCycleUpdatePayload(),
    mode: "onChange",
  });

  return (
    <Dialog
      open={showDetailDialog.show}
      onOpenChange={(open) =>
        handleDetailDialog(open, selectedBillingCycleType!)
      }
    >
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-7">
        <DialogHeader>
          <DialogTitle>
            <div className=" bg-white px-6 py-4 shadow-sm m-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Billing Cycle
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage Billing Cycle Inside a Billing Cycle Type
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 h-[calc(100vh-120px)]">
          <DataGridProvider
            columns={ColumnBillingCycle(
              handleBasicShowDialog,
              handleCycleDelete,
              setSelectedStateFlag,
              menuPrivAccess,
            )}
            key={refreshKeyBasicBCT}
            toolbar={<BasicListToolbar />}
            pagination={{ size: 10 }}
            layout={{ card: true }}
            sorting={[{ id: "BILLING_CYCLE_TYPE_ID", desc: false }]}
            serverSide={true}
            onFetchData={({ pageIndex, pageSize }) =>
              doGetBillingCycle(pageIndex + 1, pageSize)
            }
          />

          {/* ✅ Pass forms yang berbeda berdasarkan mode */}
          <BasicFormDialog
            forms={createForms}
            updateForms={updateForms}
            formType={showBasicDialog.mode}
            isSubmitting={isSubmitting}
          />

          <DeleteCycleDialog />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { BillingCycleTypeDetailDialog };
