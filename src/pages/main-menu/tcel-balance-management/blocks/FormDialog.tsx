import { KeenIcon } from "@/components";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import useTcelBalanceAdjustmentContext from "../hooks/useTcelBalanceAjustmentContext";
import {
  TcelBalanceAdjustmentSchema,
  TcelBalanceAdjustmentForm,
  createDefaultTcelBalanceAjustmentPayload,
} from "../types/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";

const API_URL = apiConfig.service_price_plan;

const FormDialog = () => {
  const {
    showDialog,
    handleShowDialog,
    listFilterExpired,
    selectedTcelBalanceAdjustment,
  } = useTcelBalanceAdjustmentContext();
  const { GetData, PostData } = useCallApi();

  const [balanceTypeList, setBalanceTypeList] = useState<any[]>([]);
  const [isLoadingBalanceType, setIsLoadingBalanceType] = useState(false);
  const [searchAcctRes, setSearchAcctRes] = useState<string>("");
  const [openAcctRes, setOpenAcctRes] = useState<boolean>(false);

  const methods = useForm<TcelBalanceAdjustmentForm>({
    resolver: zodResolver(TcelBalanceAdjustmentSchema),
    defaultValues: createDefaultTcelBalanceAjustmentPayload(),
  });

  const {
    control,
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
    handleSubmit,
  } = methods;

  // Fetch Balance Type List
  const doGetBalanceTypeList = async () => {
    setIsLoadingBalanceType(true);
    try {
      const response: any = await GetData(
        `${API_URL}/account-balance/type-list`,
        {
          page: 1,
          size: 100,
          sortBy: "acctResId",
          sortDirection: "asc",
        },
      );
      setBalanceTypeList(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch balance type list");
      setBalanceTypeList([]);
    } finally {
      setIsLoadingBalanceType(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: TcelBalanceAdjustmentForm) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(
        `${API_URL}/balance-adjustment/add`,
        data,
      );

      toast.success(
        showDialog.mode === "create"
          ? "Balance adjustment created successfully"
          : "Balance adjustment updated successfully",
      );

      handleClose();
      // Refresh data if needed
      // handleRefresh();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save balance adjustment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    handleShowDialog(false, "create", null);
    reset();
  };

  // Load account data when dialog opens
  useEffect(() => {
    if (showDialog.show) {
      if (showDialog.mode === "create") {
        if (listFilterExpired?.acctInfo) {
          setValue("acctId", listFilterExpired.acctInfo.acctId);
          setValue("acctNbr", listFilterExpired.acctInfo.acctNbr || "");
          setValue("acctResId", 1);
        }
      } else if (
        (showDialog.mode === "update" || showDialog.mode === "detail") &&
        selectedTcelBalanceAdjustment
      ) {
        setValue("acctId", selectedTcelBalanceAdjustment.acctId || 0);
        setValue("acctNbr", selectedTcelBalanceAdjustment.acctNbr || "");
        setValue("acctResId", selectedTcelBalanceAdjustment.acctResId || 1);
        setValue("balance", selectedTcelBalanceAdjustment.balance || 0);
        if (selectedTcelBalanceAdjustment.effDate) {
          setValue("effDate", selectedTcelBalanceAdjustment.effDate);
        }
        if (selectedTcelBalanceAdjustment.expDate) {
          setValue("expDate", selectedTcelBalanceAdjustment.expDate);
        }
      }
      doGetBalanceTypeList();
    }
  }, [
    showDialog.show,
    showDialog.mode,
    listFilterExpired,
    selectedTcelBalanceAdjustment,
    setValue,
  ]);

  const BalTypeOptions = useMemo(
    () =>
      balanceTypeList.filter((item) =>
        item.acctResName.toLowerCase().includes(searchAcctRes.toLowerCase()),
      ),
    [balanceTypeList, searchAcctRes],
  );

  return (
    <Dialog open={showDialog.show} onOpenChange={handleClose}>
      <DialogContent className="container-fixed max-w-[1080px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-5 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex flex-wrap items-center justify-between grow">
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                {showDialog.mode === "create"
                  ? "Create"
                  : showDialog.mode === "update"
                    ? "Update"
                    : "Detail"}{" "}
                Balance Adjustment
              </h1>
              <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
            </div>
            <div
              className="opacity-50 cursor-pointer hover:opacity-100"
              onClick={handleClose}
            >
              <KeenIcon icon="cross" className="text-1.5xl" />
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="px-0 pb-0 scrollable-y">
          <div className="flex flex-col px-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="acctNbr">
                  Account Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="acctNbr"
                  placeholder="Enter Account Number"
                  {...register("acctNbr")}
                  disabled
                />
                {errors.acctNbr && (
                  <p className="text-sm text-red-500">
                    {errors.acctNbr.message}
                  </p>
                )}
              </div>

              {/* Account Resource ID - Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="acctResId">
                  Account Resource ID <span className="text-red-500">*</span>
                </Label>
                {/* <Controller
                  name="acctResId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                      disabled={isLoadingBalanceType || showDialog.mode === "detail"}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingBalanceType
                              ? "Loading..."
                              : "Select Account Resource ID"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {balanceTypeList.map((item) => (
                          <SelectItem
                            key={item.acctResId}
                            value={item.acctResId.toString()}
                          >
                            {item.acctResName || ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                /> */}
                <Controller
                  name="acctResId"
                  control={control}
                  render={({ field }) => {
                    const selected = balanceTypeList.find(
                      (e) => e.acctResId.toString() === field.value?.toString(),
                    );

                    return (
                      <div
                        className="flex flex-1 min-w-0"
                        title={selected?.eventName ?? "Event Name"}
                      >
                        <Popover>
                          <PopoverTrigger
                            asChild
                            className="flex-1 flex"
                            disabled={
                              isLoadingBalanceType ||
                              showDialog.mode === "detail"
                            }
                            // title={selected?.eventName}
                          >
                            <Button
                              className="justify-start flex-1 truncate"
                              variant="outline"
                              // title={selected?.eventName || "Please Select"}
                            >
                              {selected?.eventName || "Please Select"}
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                            <Command>
                              <CommandInput
                                placeholder="Search..."
                                value={searchAcctRes}
                                onValueChange={setSearchAcctRes}
                              />
                              <CommandEmpty>No results</CommandEmpty>
                              <CommandGroup
                                className="overflow-y-auto max-h-[400px]"
                                onWheel={(e) => e.stopPropagation()}
                              >
                                {BalTypeOptions.map((item) => (
                                  <CommandItem
                                    key={item.acctResId}
                                    onSelect={() =>
                                      field.onChange(item.acctResId.toString())
                                    }
                                  >
                                    {item.acctResName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    );
                  }}
                />
                {errors.acctResId && (
                  <p className="text-sm text-red-500">
                    {errors.acctResId.message}
                  </p>
                )}
              </div>

              {/* Balance */}
              <div className="space-y-2">
                <Label htmlFor="balance">
                  Balance <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="balance"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      customInput={Input}
                      id="balance"
                      placeholder="Enter Balance"
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values.floatValue || 0);
                      }}
                      thousandSeparator
                      disabled={showDialog.mode === "detail"}
                    />
                  )}
                />
                {errors.balance && (
                  <p className="text-sm text-red-500">
                    {errors.balance.message}
                  </p>
                )}
              </div>

              {/* Effective Date */}
              {/* <div className="space-y-2">
                <div className="relative">
                  <DateTimePickerField
                    control={control}
                    name="effDate"
                    label="Effective Date"
                    error={errors.effDate}
                  ></DateTimePickerField>
                </div>
                {errors.effDate && (
                  <p className="text-sm text-red-500">
                    {errors.effDate.message}
                  </p>
                )}
              </div> */}

              {/* Expiry Date */}
              {/* <div className="space-y-2">
                <div className="relative">
                  <DateTimePickerField
                    control={control}
                    name="expDate"
                    label="Expiry Date"
                    error={errors.expDate}
                  ></DateTimePickerField>
                </div>
                {errors.expDate && (
                  <p className="text-sm text-red-500">
                    {errors.expDate.message}
                  </p>
                )}
              </div> */}

              {/* Effective Date */}
              <div className="space-y-2">
                <Label htmlFor="effDate">
                  Effective Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="effDate"
                  type="datetime-local"
                  {...register("effDate")}
                  disabled={showDialog.mode === "detail"}
                />
                {errors.effDate && (
                  <p className="text-sm text-red-500">
                    {errors.effDate.message}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expDate">
                  Expiry Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expDate"
                  type="datetime-local"
                  {...register("expDate")}
                  disabled={showDialog.mode === "detail"}
                />
                {errors.expDate && (
                  <p className="text-sm text-red-500">
                    {errors.expDate.message}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Enter comment (optional)"
                  rows={4}
                  {...register("comment")}
                  disabled={showDialog.mode === "detail"}
                />
                {errors.comment && (
                  <p className="text-sm text-red-500">
                    {errors.comment.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {showDialog.mode !== "detail" && (
                <div className="flex justify-end pt-2.5 gap-5 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => reset()}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="default"
                    className="bg-red-500 hover:bg-red-600"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? showDialog.mode === "create"
                        ? "Creating..."
                        : "Updating..."
                      : showDialog.mode === "create"
                        ? "Create"
                        : "Update"}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default FormDialog;
