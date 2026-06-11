import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTriggerCreateContext } from "../../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiConfig } from "@/config/api.config";
import { Alert, KeenIcon, useDataGrid } from "@/components";
import { toast } from "sonner";
import { useCallApi } from "@/hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import z from "zod";
import { BalanceTriggerSchema } from "./types/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MultiSelect from "../MultiSelect";
import { debounce } from "@/lib/helpers";
import { RefreshCw } from "lucide-react";
import { AcctConfService } from "@/common/api/account-config/endpoints";
// import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";

const API_URL = apiConfig.service_price_plan;
export type BalanceTriggerFormType = z.infer<typeof BalanceTriggerSchema>;

const AddBalanceDialog = () => {
  const parentRef = useRef<any | null>(null);
  const { selectedOfferVerId } = usePortalData();
  const { showAddBalanceDialog, handleAddBalanceDialog, commonTriggerList, fetchAccountBalanceType } = useTriggerCreateContext();
  // const [showBalTypeAlert, setShowBalTypeAlert] = useState<boolean>(false);
  // const { reload } = useDataGrid();
  const { PostData, GetData } = useCallApi();
  const { table, reload } = useDataGrid();
  const { GET_ACCT_ITEM_TYPE } = AcctConfService();

  const methods = useForm<BalanceTriggerFormType>({
    resolver: zodResolver(BalanceTriggerSchema),
    defaultValues: {
      balanceType: [],
      destination: null,
      effDate: undefined,
      expDate: null,
      isLimit: "N",
      offerVerId: selectedOfferVerId ?? 0,
      state: "A",
      triggerMode: undefined,
      acctResIdAsString: null,
    },
  });

  const {
    register,
    setValue,
    watch,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const destinationVal = watch("destination");
  const triggerModeVal = watch("triggerMode");
  const balanceTypeVal = watch("balanceType");
  const isLimitVal = watch("isLimit");

  const [alert, setAlert] = useState({
    show: false,
    message: "",
  });

  console.log(errors);

  const [searchTerm, setSearchTerm] = useState("");
  const [accountBalanceType, setAccountBalanceType] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    reset();
  };

  // const fetchAccountBalanceType = async (search: string): Promise<{ label: string; value: string }[]> => {
  //   const response = await GET_ACCT_ITEM_TYPE({
  //     acctItemTypeName: search,
  //     page: 1,
  //     size: 10,
  //     sortBy: "BAL_TYPE",
  //     sortDirection: "ASC",
  //     spId: 0,
  //   });

  //   if (response.status) {
  //     return response.data.map((item: any) => ({
  //       label: item.acctItemTypeName,
  //       value: String(item.id),
  //     }));
  //   }

  //   return [];
  // };

  const onSubmit = async (data: BalanceTriggerFormType) => {
    const cleanedData: any = {
      ...data,
      balanceType: (data.balanceType || []).map((id: string) => ({
        acctResId: id,
      })),
      expDate: data.expDate ?? null,
      isLimit: data.isLimit ?? null,
      acctResIdAsString: data.acctResIdAsString ?? null,
    };

    // console.log(cleanedData);
    doCreateTriggerAccumulation(cleanedData);
  };

  /* actions */
  const doCreateTriggerAccumulation = useCallback(async (data: BalanceTriggerFormType) => {
    setIsLoading(true);
    try {
      const response = await PostData(`${API_URL}/trigger/balance/create`, {
        ...data,
      });

      if (response?.status) {
        reload();
        setAlert((prev) => ({ ...prev, show: false, message: "" }));
        handleAddBalanceDialog(false);
        toast.success("Success Create Balance Trigger");
      } else {
        toast.error(response?.message || "Failed Create Data!");
        setAlert((prev) => ({
          ...prev,
          show: true,
          message: response?.message,
        }));
      }
    } catch (error) {
      toast.error("Something went wrong while creating trigger. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetch = useRef(
    debounce((value: string) => {
      fetchAccountBalanceType(value);
    }, 400),
  ).current;

  useEffect(() => {
    if (showAddBalanceDialog) {
      debouncedFetch(searchTerm);
    }
  }, [showAddBalanceDialog, searchTerm]);

  useEffect(() => {
    if (selectedOfferVerId) {
      setValue("offerVerId", selectedOfferVerId);
    }
  }, [selectedOfferVerId]);

  useEffect(() => {
    if (!showAddBalanceDialog) {
      resetForm();
    }
  }, [showAddBalanceDialog]);

  return (
    <Dialog open={showAddBalanceDialog} onOpenChange={handleAddBalanceDialog}>
      <DialogContent className="container-fixed max-w-[800px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-gray-200">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add Balance Trigger</h1>
              <p className="text-sm text-gray-600 mt-1">Configure balance trigger settings and parameters</p>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto px-8 py-6" ref={parentRef}>
          {alert.show && (
            <Alert variant="danger" className="mb-6">
              <h3>{alert.message}</h3>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-3">
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-600 mt-1">Set up the fundamental trigger configuration</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Effective Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Effective Date<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    className={`w-full transition-colors ${errors.effDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                    type="date"
                    {...register("effDate", {
                      required: "Effective Date is required",
                    })}
                    placeholder="Select effective date"
                    // disabled={isEffDateDisabled}
                  />
                  {errors.effDate && <p className="text-xs text-red-500">{errors.effDate.message}</p>}
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                  <Input
                    className={`w-full transition-colors ${errors.expDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
                    type="date"
                    {...register("expDate", {
                      required: "Expiry Date is required",
                    })}
                    placeholder="Select Expiry Date"
                    // disabled={isEffDateDisabled}
                  />
                  {errors.expDate && <p className="text-xs text-red-500">{errors.expDate.message}</p>}
                </div>
              </div>

              {/* Account Balance Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Account Balance Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  control={control}
                  name="balanceType"
                  render={({ field }) => (
                    <div className="space-y-1">
                      <div className="flex flex-row">
                        <MultiSelect<string>
                          value={field.value ?? []}
                          onChange={field.onChange}
                          loadOptions={fetchAccountBalanceType}
                          placeholder="Search and select account balance types..."
                          onValidateSelect={(selected, currentSelected) => {
                            if (currentSelected.length === 0) return true;

                            const isSameBalType = currentSelected.every((item) => item.balType === selected.balType);

                            if (!isSameBalType) {
                              toast.error("All the balance type must be have the same type. Please select again.");

                              // setShowBalTypeAlert(true);
                              setValue("balanceType", [], { shouldValidate: true, shouldDirty: true });
                              return false;
                            }

                            return true;
                          }}
                        />
                        {balanceTypeVal.length > 0 && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => setValue("balanceType", [], { shouldValidate: true, shouldDirty: true })}>
                            <KeenIcon icon="cross" />
                          </Button>
                        )}
                      </div>
                      {errors.balanceType && <p className="text-xs text-red-500">{errors.balanceType.message}</p>}
                    </div>
                  )}
                />
              </div>

              {/* Trigger Mode & Reference Limit */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trigger Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Trigger Mode<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Controller
                    control={control}
                    name="triggerMode"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <div className="flex flex-row">
                          <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(val === "null" ? null : val)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Trigger Mode" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonTriggerList.map((item: any) => (
                                <SelectItem key={item.triggerType} value={String(item.triggerType)}>
                                  {item.triggerTypeName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {triggerModeVal && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => setValue("triggerMode", "", { shouldValidate: true, shouldDirty: true })}>
                              <KeenIcon icon="cross" />
                            </Button>
                          )}
                        </div>
                        {errors.triggerMode && <p className="text-xs text-red-500">{errors.triggerMode.message}</p>}
                      </div>
                    )}
                  />
                </div>

                {/* Reference Limit */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Reference Limit</label>
                  <Controller
                    control={control}
                    name="isLimit"
                    render={({ field }) => (
                      <div className="flex flex-row">
                        <Select value={field.value != null ? String(field.value) : ""} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Reference Limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y">Limit</SelectItem>
                            <SelectItem value="N">No Limit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Destination</label>
                <div className="lg:w-1/2">
                  <Controller
                    control={control}
                    name="destination"
                    render={({ field }) => (
                      <div className="flex flex-row text-center items-center">
                        <Select value={field.value ? String(field.value) : ""} onValueChange={(val) => field.onChange(val === "null" ? null : val)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Destination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">CVBS</SelectItem>
                            <SelectItem value="2">MCCM</SelectItem>
                            <SelectItem value="3">BOTH</SelectItem>
                          </SelectContent>
                        </Select>
                        {destinationVal && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => setValue("destination", null, { shouldValidate: true, shouldDirty: true })}>
                            <KeenIcon icon="cross" />
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => handleAddBalanceDialog(false)} className="px-6">
                  Cancel
                </Button>
                <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                  {isLoading ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : null}
                  {isLoading ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </form>
        </DialogBody>
      </DialogContent>

      {/* <PopUpDialog alertType="default" isOpen={showBalTypeAlert} handleDialog={() => setShowBalTypeAlert(false)} desc="All the balance type must be have the same type. Please select again." type="alert" title="Alert"  /> */}
    </Dialog>
  );
};

export { AddBalanceDialog };
