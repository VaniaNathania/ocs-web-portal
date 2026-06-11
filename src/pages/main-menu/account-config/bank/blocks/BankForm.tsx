import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { useLocation } from "react-router";
import { useCallApi } from "@/hooks";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";

import useBankContext from "../hooks/useBankContext";
import { defaultCreateBankPayload } from "../types/forms";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface FormsProps {
  forms: UseFormReturn<BankAddPayload>;
  isSubmitting: boolean;
  formType: "create" | "update" | "createChild";
}
const API_URL = apiConfig.service_price_plan;

const BankForm = ({ formType, forms, isSubmitting }: FormsProps) => {
  const {
    showDialog,
    handleShowDialog,
    bankList,
    refreshBankList,
    selectedBank,
  } = useBankContext();
  const { GetData, PostData, PutData, DeleteData } = useCallApi();
  const { menuPrivAccess } = useAccountConfigLayout();
  const {
    control,
    formState: { errors },
    register,
    watch,
    reset,
    setValue,
    handleSubmit,
    clearErrors,
    setError,
  } = forms;

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [initialSepaData, setInitialSepaData] = useState<{
    hasBic: boolean;
    hasIban: boolean;
  } | null>(null);

  // Watch sepaAction value
  const sepaActionValue = watch("sepaAction");

  useEffect(() => {
    if (showDialog.selectedBank && showDialog.mode === "update") {
      setValue("bankCode", showDialog.selectedBank.bankCode);
      setValue("bankName", showDialog.selectedBank.bankName);
      setValue("bic", showDialog.selectedBank.bic);
      setValue("ibanFormat", showDialog.selectedBank.ibanFormat);
      setValue("comments", showDialog.selectedBank.comments);
      setValue("parentId", showDialog.selectedBank.parentId);

      // Check if BIC and IBAN exist
      const hasBicData =
        showDialog.selectedBank.bic !== null &&
        showDialog.selectedBank.bic !== "";
      const hasIbanData =
        showDialog.selectedBank.ibanFormat !== null &&
        showDialog.selectedBank.ibanFormat !== "";

      if (hasBicData && hasIbanData) {
        // Ada data BIC dan IBAN -> sepaAction = "Y", value = "mod"
        setValue("sepaAction", "Y");
        setInitialSepaData({ hasBic: true, hasIban: true });
      } else {
        // Tidak ada data BIC dan IBAN -> sepaAction = "N", value = null
        setValue("sepaAction", "N");
        setInitialSepaData({ hasBic: false, hasIban: false });
      }
    } else if (showDialog.mode === "createChild") {
      if (showDialog.selectedBank) {
        setValue("parentId", showDialog.selectedBank.bankId);
      }
    }
  }, [showDialog.selectedBank, showDialog.mode]);

  // Handle sepaAction change
  useEffect(() => {
    if (showDialog.mode === "create") {
      if (sepaActionValue === "N") {
        // Clear BIC and ibanFormat when "No" is selected
        setValue("bic", null);
        setValue("ibanFormat", null);
        clearErrors(["bic", "ibanFormat"]);
      }
    } else if (showDialog.mode === "update") {
      if (
        sepaActionValue === "N" &&
        initialSepaData?.hasBic &&
        initialSepaData?.hasIban
      ) {
        // User changed from Yes to No -> clear fields
        setValue("bic", null);
        setValue("ibanFormat", null);
        clearErrors(["bic", "ibanFormat"]);
      }
    }
  }, [
    sepaActionValue,
    showDialog.mode,
    setValue,
    initialSepaData,
    clearErrors,
  ]);

  const onSubmit = async (data: BankAddPayload) => {
    let sepaActionValue = "";

    if (showDialog.mode === "create") {
      // Mode create: Y = "new", N = ""
      sepaActionValue = data.sepaAction === "Y" ? "new" : "";
    } else if (showDialog.mode === "createChild") {
      sepaActionValue = data.sepaAction === "Y" ? "new" : "";
    } else if (showDialog.mode === "update") {
      // Mode update
      if (initialSepaData?.hasBic && initialSepaData?.hasIban) {
        // Awalnya ada data BIC & IBAN
        if (data.sepaAction === "Y") {
          sepaActionValue = "mod"; // Tetap Yes = "mod"
        } else {
          sepaActionValue = "del"; // Diubah ke No = "del"
        }
      } else {
        // Awalnya tidak ada data BIC & IBAN
        if (data.sepaAction === "Y") {
          sepaActionValue = "new"; // Diubah ke Yes = "new"
        } else {
          sepaActionValue = ""; // Tetap No = ""
        }
      }
    }

    const transformedData = {
      ...data,
      sepaAction: sepaActionValue,
    };

    if (showDialog.mode === "create") {
      doCreateBalanceType(transformedData);
    } else if (showDialog.mode === "createChild") {
      doCreateChildBank(transformedData);
    } else if (showDialog.mode === "update") {
      doUpdateBalanceType(transformedData);
    }
  };

  const doCreateBalanceType = async (data: BankAddPayload) => {
    try {
      const response = await PostData(`${API_URL}/bank/add`, data);
      if (response?.message === "Success") {
        toast.success("Bank successfully created");
        handleShowDialog(false, "create", null);
        reset(defaultCreateBankPayload());
        refreshBankList();
      } else {
        toast.error(response?.message || "Failed to create Bank");
      }
    } catch (error) {
      console.error("Error creating Bank", error);
      toast.error("Error Creating Bank. Please Check Your Connection!");
    }
  };
  const doCreateChildBank = async (data: BankAddPayload) => {
    try {
      const response = await PostData(`${API_URL}/bank/add`, data);
      if (response?.message === "Success") {
        toast.success("Bank successfully created");
        handleShowDialog(false, "create", null);
        reset(defaultCreateBankPayload());
        refreshBankList();
      } else {
        toast.error(response?.message || "Failed to create Bank");
      }
    } catch (error) {
      console.error("Error creating Bank", error);
      toast.error("Error Creating Bank. Please Check Your Connection!");
    }
  };

  const doUpdateBalanceType = async (data: BankAddPayload) => {
    try {
      const response = await PutData(
        `${API_URL}/bank/mod?bankId=${showDialog.selectedBank?.bankId}`,
        data,
      );
      if (response?.message === "Success") {
        toast.success("Bank successfully updated");
        handleShowDialog(false, "update", null);
        reset(defaultCreateBankPayload());
        refreshBankList();
      } else {
        toast.error(response?.message || "Failed to update Bank");
      }
    } catch (error) {
      console.error("Error updating Bank", error);
      toast.error("Error Updating Bank. Please Check Your Connection!");
    }
  };

  useEffect(() => {
    if (!showDialog.show) {
      handleShowDialog(false, "create", null);
      reset(defaultCreateBankPayload());
      setInitialSepaData(null);
    }
  }, [showDialog.show, reset]);

  //  console.log(showDialog.selectedBank);

  return (
    <Dialog
      open={showDialog.show}
      onOpenChange={(open) =>
        handleShowDialog(false, showDialog.mode, selectedBank)
      }
    >
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-7">
        <DialogHeader className="space-y-1.5">
          <DialogTitle>
            {showDialog.mode === "create" ? "Create" : "Edit"} Bank
            Configuration
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {isLoadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          </div>
        ) : (
          <form className="space-y-10 mt-4" onSubmit={handleSubmit(onSubmit)}>
            {/* BASIC INFORMATION */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>
                    <span className="text-red-500">*</span>Bank Name
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      className="mt-1"
                      {...register("bankName")}
                    />
                  </div>
                  {errors.bankName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.bankName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    <span className="text-red-500">*</span>Bank Code
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      className="mt-1"
                      {...register("bankCode")}
                    />
                  </div>
                  {errors.bankCode && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.bankCode.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Need Sepa Bank</Label>
                  <div className="mt-1">
                    <label className="mr-4">
                      <input
                        type="radio"
                        value="Y"
                        {...register("sepaAction")}
                        className="mr-1"
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="N"
                        {...register("sepaAction")}
                        className="mr-1"
                      />
                      No
                    </label>
                  </div>
                </div>
                <div>
                  <Label>
                    {watch("sepaAction") === "Y" && (
                      <span className="text-red-500">*</span>
                    )}
                    BIC
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      className="mt-1"
                      {...register("bic")}
                      disabled={sepaActionValue === "N"}
                    />
                  </div>
                  {errors.bic && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.bic.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    {watch("sepaAction") === "Y" && (
                      <span className="text-red-500">*</span>
                    )}
                    Iban Format
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      className="mt-1"
                      {...register("ibanFormat")}
                      disabled={sepaActionValue === "N"}
                    />
                  </div>
                  {errors.ibanFormat && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.ibanFormat.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Remarks</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      className="mt-1"
                      {...register("comments")}
                    />
                  </div>
                  {errors.comments && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.comments.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <DialogFooter className="pt-4 flex justify-end gap-5">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleShowDialog(false, "create", null)}
              >
                Cancel
              </Button>
              <AccessWrapper
                hasAccess={
                  showDialog.mode === "create"
                    ? menuPrivAccess.addStatus
                    : menuPrivAccess.editStatus
                }
              >
                <Button type="submit">Confirm</Button>
              </AccessWrapper>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BankForm;
