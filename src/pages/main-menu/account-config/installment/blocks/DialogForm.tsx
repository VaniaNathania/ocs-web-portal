import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import useInstallmentTypeContext from "../hooks/useInstallmentTypeContext";
import { KeenIcon, useDataGrid } from "@/components";
import { Controller, useForm } from "react-hook-form";
import {
  appliedAccountItemType,
  createDefaultInstallmentItems,
  createDefaultInstallmentPayload,
  createInstallmentItems,
  createInstallmentPayload,
  InstallmentCreateSchema,
} from "../types/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Input } from "@/components/ui/input";
import { NumericFormat } from "react-number-format";
import { Button } from "@/components/ui/button";
import PhasesTable from "./PhasesTable";
import AcctMultiSelect from "@/components/common/AcctMultiSelect";
import Skeleton from "@/components/common/Skeleton";
import { endpoints } from "../../api/api.account.config";
import { cn } from "@/utils/cn";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const DialogForm = () => {
  const { PostData, PutData, GetData } = useCallApi();
  const {
    showDialog,
    handleShowDialog,
    selectedInstallmentType,
    acctItemTypeList,
  } = useInstallmentTypeContext();
  const { menuPrivAccess } = useAccountConfigLayout();
  const { reload } = useDataGrid();

  const methods = useForm<createInstallmentPayload>({
    resolver: zodResolver(InstallmentCreateSchema),
    defaultValues: createDefaultInstallmentPayload(),
  });

  const {
    control,
    watch,
    setValue,
    setError,
    getValues,
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = methods;

  const [defaultInstallmentItems, setDefaultInstallmentItems] = useState<
    createInstallmentItems[]
  >([]);
  const [defaultAppliedAcct, setDefaultAppliedAcct] = useState<
    appliedAccountItemType[]
  >([]);

  const [showAcctSelector, setShowAcctSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTotalOver, setIsTotalOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const installmentList = watch("instalmentItems");

  const handleClose = () => {
    reset(createDefaultInstallmentPayload());
    handleShowDialog(false, "create", null);
  };

  const onSubmit = (data: createInstallmentPayload) => {
    if (data.firstPay === null) {
      setError("firstPay", {
        type: "required",
        message: "First pay is required",
      });
      return;
    }

    const promise =
      showDialog.mode === "create"
        ? doCreateInstallment(data)
        : doUpdateInstallment(data);

    toast.promise(promise, {
      loading:
        showDialog.mode === "create"
          ? "Creating installment type..."
          : "Updating installment type...",
      success: (res) => res?.message || "Success",
      error: (err) => err?.message || "Error",
    });
  };

  const doCreateInstallment = async (data: createInstallmentPayload) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(endpoints.installmentType.create, data);

      if (!response?.status) {
        throw new Error(
          response?.message || "Failed to create installment type",
        );
      }

      handleClose();
      reload();
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const doUpdateInstallment = async (data: createInstallmentPayload) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        endpoints.installmentType.update(
          selectedInstallmentType?.instalmentTypeId || 0,
        ),
        data,
      );

      if (!response?.status) {
        throw new Error(
          response?.message || "Failed to update installment type",
        );
      }

      handleClose();
      reload();
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchInstallmentDetail = async () => {
      setIsLoading(true);
      try {
        const response = await GetData(endpoints.installmentType.detail, {
          instalmnetTypeId: selectedInstallmentType?.instalmentTypeId,
        });
        const data = response.data;
        if (response.status) {
          reset({
            instalmentTypeName: data.instalmentTypeName,
            appliedAccountItemType: data.appliedAccountItemType.map(
              (item: any) => ({
                acctItemTypeId: item.acctItemTypeId,
                status: "A",
              }),
            ),
            firstPay: data.firstPay,
            comments: data.comments,
            feePercent: data.feePercent,
            instalmentItems: data.instalmentItems,
          });
          setDefaultInstallmentItems(data.instalmentItems);
          setDefaultAppliedAcct(data.appliedAccountItemType);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error(
          "Something went wrong while fetching detail data. Please check your connection!",
        );
      } finally {
        setIsLoading(false);
      }
    };
    if (showDialog.show && showDialog.mode === "update") {
      fetchInstallmentDetail();
    }
  }, [showDialog, selectedInstallmentType?.instalmentTypeId]);

  return (
    <Dialog open={showDialog.show} onOpenChange={handleClose}>
      <DialogContent className="container-fixed max-w-[1080px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        {isLoading ? (
          <Skeleton title="Fetching installment type detail" />
        ) : (
          <>
            <DialogHeader className="p-5 border-0">
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
              <div className="flex flex-wrap items-center justify-between grow">
                <div className="flex flex-col justify-center">
                  <h1 className="text-xl font-semibold leading-none text-gray-900">
                    {showDialog.mode === "create" ? "Create" : "Update"}{" "}
                    Installment Type
                  </h1>
                  <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
                </div>
                <div
                  className="opacity-50 cursor-pointer hover:opacity-100"
                  onClick={() => {
                    handleClose();
                  }}
                >
                  <KeenIcon icon="cross" className="text-1.5xl" />
                </div>
              </div>
            </DialogHeader>
            <DialogBody className="px-0 pb-0 scrollable-y">
              <div className="flex flex-col px-0">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="w-full space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <BuildFormRow label="Payment Plan Name" isRequired>
                        <Input
                          type="text"
                          placeholder="Enter Plan Name"
                          {...register("instalmentTypeName")}
                        />
                        {errors.instalmentTypeName && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.instalmentTypeName.message}
                          </p>
                        )}
                      </BuildFormRow>

                      <BuildFormRow label="Applied Account Item">
                        <Controller
                          name="appliedAccountItemType"
                          control={control}
                          render={({ field }) => {
                            const currentValue = Array.isArray(field.value)
                              ? field.value
                              : [];

                            const selectedItems = acctItemTypeList
                              .filter((opt) =>
                                currentValue.some(
                                  (v: any) => v.acctItemTypeId === opt.id,
                                ),
                              )
                              .map((opt) => {
                                const formItem = currentValue.find(
                                  (v: any) => v.acctItemTypeId === opt.id,
                                );
                                return {
                                  id: opt.id,
                                  acctItemTypeName: opt.acctItemTypeName,
                                  status: formItem?.status,
                                };
                              });

                            const handleAddAcctItem = (item: {
                              id: number;
                              acctItemTypeName: string;
                            }) => {
                              const alreadyExists = currentValue.some(
                                (x: any) => x.acctItemTypeId === item.id,
                              );
                              if (!alreadyExists) {
                                const updated = [
                                  ...currentValue,
                                  { acctItemTypeId: item.id, status: "A" },
                                ];
                                field.onChange(updated);
                              }
                            };

                            const handleRemoveAcctItem = (itemId: number) => {
                              const defaultIds = defaultAppliedAcct.map(
                                (x) => x.acctItemTypeId,
                              );
                              const updated = currentValue
                                .map((x: any) => {
                                  if (x.acctItemTypeId === itemId) {
                                    if (defaultIds.includes(itemId)) {
                                      // item lama → beri flag D
                                      return { ...x, status: "D" };
                                    } else {
                                      // item baru → hapus saja
                                      return null;
                                    }
                                  }
                                  return x;
                                })
                                .filter(Boolean);
                              field.onChange(updated);
                            };

                            const handleClearAcctItems = () => {
                              const defaultIds = defaultAppliedAcct.map(
                                (x) => x.acctItemTypeId,
                              );
                              const updated = currentValue
                                .map(
                                  (x: any) =>
                                    defaultIds.includes(x.acctItemTypeId)
                                      ? { ...x, status: "D" } // tandai sebagai dihapus
                                      : null, // item baru → hapus
                                )
                                .filter(Boolean);
                              field.onChange(updated);
                            };

                            const handleUndoDeleteAcctItem = (
                              itemId: number,
                            ) => {
                              const updated = currentValue.map((x: any) =>
                                x.acctItemTypeId === itemId
                                  ? { ...x, status: "A" }
                                  : x,
                              );
                              field.onChange(updated);
                            };

                            return (
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowAcctSelector(true)}
                                  className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border rounded-md hover:bg-gray-50 overflow-hidden"
                                >
                                  {selectedItems.length > 0 ? (
                                    <span
                                      className="truncate text-gray-700"
                                      title={selectedItems
                                        .map((i) => i.acctItemTypeName)
                                        .join(", ")}
                                    >
                                      {selectedItems
                                        .map((item) => item.acctItemTypeName)
                                        .join(", ")}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      Select account item
                                    </span>
                                  )}
                                </Button>

                                {/* Multi Select Component */}
                                <AcctMultiSelect
                                  showDialog={showAcctSelector}
                                  setShowDialog={setShowAcctSelector}
                                  options={acctItemTypeList}
                                  placeholder="Select account item"
                                  searchPlaceholder="Search account item"
                                  value={selectedItems}
                                  onAdd={handleAddAcctItem}
                                  onRemove={handleRemoveAcctItem}
                                  onClear={handleClearAcctItems}
                                  onUndoDelete={handleUndoDeleteAcctItem}
                                />

                                {/* Tombol reset semua */}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => field.onChange([])}
                                >
                                  <i className="ki-duotone ki-arrow-circle-right">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                </Button>
                              </div>
                            );
                          }}
                        />
                      </BuildFormRow>

                      <BuildFormRow label="Cash Payment" isRequired>
                        <Controller
                          name="firstPay"
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              thousandSeparator="."
                              decimalSeparator=","
                              allowNegative={false}
                              className="input"
                              placeholder="Enter Charge"
                              value={field.value ?? ""}
                              onValueChange={(values) => {
                                field.onChange(values.floatValue ?? null);
                              }}
                            />
                          )}
                        />
                        {errors.firstPay && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.firstPay.message}
                          </p>
                        )}
                      </BuildFormRow>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <BuildFormRow label="Total Phases" isRequired>
                        <Input
                          type="text"
                          placeholder="Total Phases"
                          value={installmentList.reduce(
                            (sum, item) => sum + Number(item.repeatTime ?? 0),
                            0,
                          )}
                          readOnly
                        />
                      </BuildFormRow>

                      <BuildFormRow label="Fee Percent">
                        <Controller
                          name="feePercent"
                          control={control}
                          render={({ field }) => (
                            <NumericFormat
                              thousandSeparator="."
                              decimalSeparator=","
                              allowNegative={false}
                              className="input"
                              placeholder="Enter Charge"
                              value={field.value ?? ""}
                              onValueChange={(values) => {
                                field.onChange(values.floatValue ?? null);
                              }}
                            />
                          )}
                        />
                      </BuildFormRow>
                    </div>

                    <div>
                      <BuildFormRow label="Remarks">
                        <Input
                          type="text"
                          placeholder="Enter Remarks"
                          {...register("comments")}
                        />
                      </BuildFormRow>
                    </div>

                    <div>
                      <PhasesTable
                        forms={methods}
                        setIsTotalOver={setIsTotalOver}
                      />
                    </div>

                    <div className="flex justify-end pt-2.5 gap-5">
                      <Button
                        variant={"outline"}
                        type="button"
                        onClick={() => reset()}
                      >
                        Reset
                      </Button>
                      <AccessWrapper
                        hasAccess={
                          showDialog.mode === "create"
                            ? menuPrivAccess.addStatus
                            : menuPrivAccess.editStatus
                        }
                      >
                        <Button
                          type="submit"
                          disabled={isSubmitting || isTotalOver}
                          variant="default"
                          className={cn(
                            "bg-red-500 hover:bg-red-600",
                            (isSubmitting || isTotalOver) &&
                              "cursor-not-allowed",
                          )}
                        >
                          {isSubmitting
                            ? showDialog.mode === "create"
                              ? "Creating..."
                              : "Updating..."
                            : showDialog.mode === "create"
                              ? "Create"
                              : "Update"}
                        </Button>
                      </AccessWrapper>
                    </div>
                  </div>
                </form>
              </div>
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
