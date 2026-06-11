import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import useDepositContext from "../hooks/useDepositContext";
import { Controller, useForm } from "react-hook-form";
import {
  createDefaultDepositPayload,
  createDepositPayload,
  DepositCreateSchema,
} from "../types/forms";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { KeenIcon, useDataGrid } from "@/components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumericFormat } from "react-number-format";
import { endpoints } from "../../api/api.account.config";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const DialogForm = () => {
  const { GetData, PostData, PutData } = useCallApi();
  const { reload } = useDataGrid();
  const { menuPrivAccess } = useAccountConfigLayout();
  const { showDialog, handleShowDialog, selectedDeposit } = useDepositContext();

  const methods = useForm<createDepositPayload>({
    resolver: zodResolver(DepositCreateSchema),
    defaultValues: createDefaultDepositPayload(),
  });

  const {
    watch,
    control,
    register,
    setValue,
    reset,
    formState: { errors },
    handleSubmit,
  } = methods;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    reset(createDefaultDepositPayload());
    handleShowDialog(false, "create", null);
  };

  const onSubmit = (data: createDepositPayload) => {
    // console.log(data);

    const promise =
      showDialog.mode === "create"
        ? doCreateDeposit(data)
        : doUpdateDeposit(data);

    const fakePromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: "Done after delay!" });
      }, 2000);
    });

    toast.promise(promise, {
      loading:
        showDialog.mode === "create"
          ? "Creating deposit type..."
          : "Updating deposit type...",
      success: (res) => res?.message || "Success",
      error: (err) => err?.message || "Error",
    });
  };

  const doCreateDeposit = async (data: createDepositPayload) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(endpoints.depositType.create, data);

      if (!response?.status) {
        throw new Error(response?.message || "Failed to create deposit type");
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

  const doUpdateDeposit = async (data: createDepositPayload) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        endpoints.depositType.update(selectedDeposit?.depositTypeId || 0),
        data,
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to update deposit type");
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
    if (showDialog.show && showDialog.mode === "update") {
      reset({
        spId: 0,
        name: selectedDeposit?.name,
        depositTypeCode: selectedDeposit?.depositTypeCode,
        charge: selectedDeposit?.charge,
        refundable: selectedDeposit?.refundable,
        transCredit: selectedDeposit?.transCredit,
        checkDuration: selectedDeposit?.checkDuration,
        comments: selectedDeposit?.comments,
      });
    }
  }, [showDialog]);

  return (
    <Dialog open={showDialog.show} onOpenChange={handleClose}>
      <DialogContent className="container-fixed max-w-[1080px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-5 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex flex-wrap items-center justify-between grow">
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                {showDialog.mode === "create" ? "Create" : "Update"} Deposit
                Type
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
                  <BuildFormRow label="Deposit Name" isRequired>
                    <Input
                      type="text"
                      placeholder="Enter Deposit Name"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </BuildFormRow>
                  <BuildFormRow label="Deposit Type Code">
                    <Input
                      type="text"
                      placeholder="Enter Code"
                      {...register("depositTypeCode")}
                    />
                  </BuildFormRow>

                  <BuildFormRow label="Charge" isRequired>
                    <Controller
                      name="charge"
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
                    {errors.charge && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.charge.message}
                      </p>
                    )}
                  </BuildFormRow>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <BuildFormRow label="Refundable" isRequired>
                    <Controller
                      name="refundable"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(val) => field.onChange(val)}
                          value={field.value ?? ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y">Yes</SelectItem>
                            <SelectItem value="N">No</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </BuildFormRow>

                  <BuildFormRow label="Transferable" isRequired>
                    <Controller
                      name="transCredit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(val) => field.onChange(val)}
                          value={field.value ?? ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y">Yes</SelectItem>
                            <SelectItem value="N">No</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </BuildFormRow>

                  <BuildFormRow label="Deposit Check Duration (in month)">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Enter Duration"
                      {...register("checkDuration", {
                        setValueAs: (v) => (v === "" ? null : Number(v)),
                      })}
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
                      variant={"default"}
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
                  </AccessWrapper>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
