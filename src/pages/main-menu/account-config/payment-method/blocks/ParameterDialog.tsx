import { apiConfig } from "@/config/api.config";
import usePaymentMethod from "../hooks/usePaymentMethodContext";
import { useCallApi } from "@/hooks";
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
import { KeenIcon } from "@/components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading, LoadingOverlay } from "@/components/common/Loading";
import Skeleton from "@/components/common/Skeleton";
import { endpoints } from "../../api/api.account.config";

const ParameterDialog = () => {
  const {
    showParameterDialog,
    handleShowParameterDialog,
    selectedPaymentMethod,
    doGetListPaymentMethod,
  } = usePaymentMethod();
  const { GetData, PostData, DeleteData, PutData } = useCallApi();

  const initialParameterPaymentSchema: ParameterPaymentSchema = {
    paymentMethodId: selectedPaymentMethod?.paymentMethodId || 0,
    daysBefExtra: 0,
    spIban: "",
    reIssueDelay: 0,
    closeMandateLimit: 0,
  };
  const [formField, setFormField] = useState<ParameterPaymentSchema>(
    initialParameterPaymentSchema
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setFormField(initialParameterPaymentSchema);
    handleShowParameterDialog(false, "create", null);
  };

  const doDeleteParameter = async (paymentMethodId: number) => {
    setIsDeleting(true);
    try {
      const response = await DeleteData(
        endpoints.paymentMethod.deletePaymentParameter(paymentMethodId),
        {}
      );

      if (response?.status) {
        toast.success(response.message);
        handleShowParameterDialog(false, "create", null);
        await doGetListPaymentMethod(1, 10, [], []);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(
        "Failed to Delete Payment Method. Please Check Your Connection!"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    showParameterDialog.mode === "create"
      ? doCreateParameter(formField)
      : doUpdateParameter(formField);
  };

  const doCreateParameter = async (data: ParameterPaymentSchema) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(
        endpoints.paymentMethod.createPaymentParameter,
        data
      );

      if (response?.status) {
        toast.success(response.message);
        handleShowParameterDialog(false, "create", null);
        setFormField(initialParameterPaymentSchema);
        await doGetListPaymentMethod(1, 10, [], []);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(
        "Failed to Create Payment Method. Please Check Your Connection!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const doUpdateParameter = async (data: ParameterPaymentSchema) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        endpoints.paymentMethod.updatePaymentParameter(data.paymentMethodId),
        data
      );

      if (response?.status) {
        toast.success(response.message);
        handleShowParameterDialog(false, "create", null);
        setFormField(initialParameterPaymentSchema);
        doGetListPaymentMethod(1, 10, [], []);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(
        "Failed to Update Payment Method. Please Check Your Connection!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showParameterDialog.show) {
      setFormField((prev) => ({
        ...prev,
        paymentMethodId: selectedPaymentMethod?.paymentMethodId || 0,
      }));

      const fetchDetailParams = async () => {
        setIsLoading(true);
        try {
          const response = await GetData(
            endpoints.paymentMethod.parameterDetail,
            {
              paymentMethodId: selectedPaymentMethod?.paymentMethodId || 0,
            }
          );

          if (response.status) {
            const data = response.data[0];

            if (data) {
              setFormField(data);
              handleShowParameterDialog(true, "update", selectedPaymentMethod);
            } else {
              setFormField(initialParameterPaymentSchema);
              handleShowParameterDialog(true, "create", null);
            }
          } else {
            toast.error(response.message);
          }
        } catch (error) {
          toast.error(
            "Failed to Fetch Payment Method. Please Check Your Connection!"
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetailParams();
    }
  }, [showParameterDialog.show]);

  return (
    <Dialog open={showParameterDialog.show} onOpenChange={handleClose}>
      <DialogContent className="container-fixed max-w-[1080px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        {isLoading ? (
          <Skeleton title="Loading Parameter Detail" />
        ) : (
          <>
            <DialogHeader className="p-5 border-0">
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
              <div className="flex flex-wrap items-center justify-between grow">
                <div className="flex flex-col justify-center">
                  <h1 className="text-xl font-semibold leading-none text-gray-900">
                    Add Parameter
                  </h1>
                  <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
                </div>
                <div
                  className="opacity-50 cursor-pointer hover:opacity-100"
                  onClick={() => {
                    handleShowParameterDialog(false, "create", null);
                  }}
                >
                  <KeenIcon icon="cross" className="text-1.5xl" />
                </div>
              </div>
            </DialogHeader>
            <DialogBody className="px-0 pb-0 scrollable-y">
              <div className="flex flex-col px-0">
                <form onSubmit={onSubmit}>
                  <div className="grid gap-5 p-0 card-body">
                    <div className="w-full">
                      <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                        <label className="flex items-center gap-1 form-label max-w-56">
                          Day Before Extra
                        </label>
                        <div className="flex flex-col grow">
                          <Input
                            type="text"
                            placeholder="Enter Day Before Extra"
                            value={formField.daysBefExtra}
                            onChange={(e) => {
                              setFormField({
                                ...formField,
                                daysBefExtra: Number(e.target.value),
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                        <label className="flex items-center gap-1 form-label max-w-56">
                          SP Bank Account
                        </label>
                        <div className="flex flex-col grow">
                          <Input
                            type="text"
                            placeholder="Enter SP Bank Account"
                            value={formField.spIban}
                            onChange={(e) => {
                              setFormField({
                                ...formField,
                                spIban: e.target.value,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                        <label className="flex items-center gap-1 form-label max-w-56">
                          Reissue Delay
                        </label>
                        <div className="flex flex-col grow">
                          <Input
                            type="text"
                            placeholder="Enter Reissue Delay"
                            value={formField.reIssueDelay}
                            onChange={(e) => {
                              setFormField({
                                ...formField,
                                reIssueDelay: Number(e.target.value),
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full">
                      <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                        <label className="flex items-center gap-1 form-label max-w-56">
                          Close Mandate Limit
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col grow">
                          <Input
                            type="text"
                            placeholder="Enter Account Item Type Name"
                            value={formField.closeMandateLimit}
                            onChange={(e) => {
                              setFormField({
                                ...formField,
                                closeMandateLimit: Number(e.target.value),
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          doDeleteParameter(formField.paymentMethodId)
                        }
                        type="button"
                        disabled={isDeleting}
                        className={`
      border border-red-500 text-red-600 font-medium
      hover:bg-red-50 hover:text-red-700
      active:bg-red-100
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200 ease-in-out
      px-5 py-2 rounded-lg
      flex items-center gap-2
    `}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>

                      <Button
                        variant="default"
                        type="submit"
                        disabled={isSubmitting}
                        className={`
      bg-gradient-to-r from-red-500 to-red-600
      hover:from-red-600 hover:to-red-700
      text-white font-medium
      shadow-md hover:shadow-lg
      transition-all duration-200 ease-in-out
      px-6 py-2 rounded-lg
      flex items-center gap-2
      disabled:opacity-60 disabled:cursor-not-allowed
    `}
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
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

export default ParameterDialog;
