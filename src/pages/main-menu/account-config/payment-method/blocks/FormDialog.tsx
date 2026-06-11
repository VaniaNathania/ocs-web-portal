import { useCallApi } from "@/hooks";
import usePaymentMethod from "../hooks/usePaymentMethodContext";
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
import { useEffect, useMemo, useState } from "react";
import {
  createDefaultPaymentPayload,
  createPaymentPayload,
  PaymentMethodSchema,
} from "../types/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { endpoints } from "../../api/api.account.config";
import { useAccountConfigLayout } from "@/layouts/main-menu/account-config";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const FormDialog = () => {
  const { PostData, GetData, PutData } = useCallApi();
  const { menuPrivAccess } = useAccountConfigLayout();
  const { reload } = useDataGrid();
  const {
    showDialog,
    handleShowDialog,
    selectedPaymentMethod,
    doGetListPaymentMethod,
  } = usePaymentMethod();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType[]>([]);

  const methods = useForm<createPaymentPayload>({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues: createDefaultPaymentPayload(),
  });

  const {
    control,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
    handleSubmit,
  } = methods;

  const handleClose = () => {
    handleShowDialog(false, "create", null);
    reset(createDefaultPaymentPayload());
  };

  const onSubmit = async (data: createPaymentPayload) => {
    // console.log(data);
    const promise =
      showDialog.mode === "create"
        ? doCreatePayment(data)
        : doUpdatePayment(data);

    toast.promise(promise, {
      loading:
        showDialog.mode === "create"
          ? "Creating payment method..."
          : "Updating payment method...",
      success: (res) => res?.message || "Success",
      error: (err) => err?.message || "Error",
    });
  };

  const doCreatePayment = async (data: createPaymentPayload) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(
        endpoints.paymentMethod.createPaymentMethod,
        data,
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to create payment method");
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

  const doUpdatePayment = async (data: createPaymentPayload) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        endpoints.paymentMethod.updatePaymentMethod(
          selectedPaymentMethod?.paymentMethodId || 0,
        ),
        data,
      );

      if (!response?.status) {
        throw new Error(response?.message || "Failed to update payment method");
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

  const getPaymentTypeList = async () => {
    try {
      const response = await GetData(
        endpoints.paymentMethod.paymentTypeList,
        {},
      );

      if (response.status) {
        setPaymentType(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching payment type list.");
    }
  };

  useEffect(() => {
    if (showDialog.show === true) {
      getPaymentTypeList();
    }

    if (showDialog.mode === "update") {
      reset({
        paymentMethodName: selectedPaymentMethod?.paymentMethodName,
        paymentMethodCode: String(selectedPaymentMethod?.paymentMethodCode),
        comments: selectedPaymentMethod?.comments,
        paymentType: selectedPaymentMethod?.paymentType,
        systemReserved: selectedPaymentMethod?.systemReserved,
        spId: selectedPaymentMethod?.spId,
      });
    }
  }, [showDialog.show, showDialog.mode]);

  return (
    <Dialog open={showDialog.show} onOpenChange={handleClose}>
      <DialogContent className="container-fixed max-w-[1080px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-5 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex flex-wrap items-center justify-between grow">
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                {showDialog.mode === "create" ? "Create" : "Update"} Account
                Item Type
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
              <div className="grid gap-5 p-0 card-body">
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Payment Method Name
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col grow">
                      <Input
                        type="text"
                        placeholder="Enter Account Item Type Name"
                        {...register("paymentMethodName")}
                      />
                      {errors.paymentMethodName && (
                        <span className="text-xs text-red-600">
                          {errors.paymentMethodName.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Payment Type
                    </label>
                    <div className="flex flex-col grow">
                      <Controller
                        name="paymentType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(val) => field.onChange(val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Parent Account Item Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentType.map((item) => (
                                <SelectItem
                                  key={item.paymentType}
                                  value={item.paymentType}
                                >
                                  {item.paymentTypeName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="flex items-center gap-1 form-label max-w-56">
                      Remarks
                    </label>
                    <div className="flex flex-col grow">
                      <Input
                        type="text"
                        placeholder="Enter Remarks"
                        {...register("comments", {
                          setValueAs: (value) => (value === "" ? null : value),
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2.5 gap-5">
                  <Button variant={"outline"} type="reset">
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

export default FormDialog;
