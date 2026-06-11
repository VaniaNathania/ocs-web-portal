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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCallApi } from "@/hooks";
import { Controller, UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { apiConfig, apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { useChannelContext } from "../hooks/useChannelContext";
import {
  ContactChannelPayload,
  createDefaultContactChannelPayload,
} from "../types/forms";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface FormsProps {
  forms: UseFormReturn<ContactChannelPayload>;
  isSubmitting: boolean;
  formType: "create" | "update";
}

const API_URL_REF = apiConfigRef.ref;

const ChannelForm = ({ formType, forms, isSubmitting }: FormsProps) => {
  const {
    showDialog,
    handleShowDialog,
    contactChannel,
    handleRefresh,
    channelType,
    selectedContactChannel,
    menuPrivAccess,
  } = useChannelContext();

  const { GetData, PostData, PutData, DeleteData } = useCallApi();

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

  // Populate form saat update mode
  useEffect(() => {
    if (selectedContactChannel && showDialog.mode === "update") {
      setValue("contactChannelName", selectedContactChannel.contactChannelName);
      setValue("contactChannelCode", selectedContactChannel.contactChannelCode);
      setValue("channelType", selectedContactChannel.channelType);
      setValue("comments", selectedContactChannel.comments || "");
      setValue("spId", selectedContactChannel.spId);
      setValue("contactChannelId", selectedContactChannel.contactChannelId);
      setValue("systemReserve", selectedContactChannel.systemReserve);
    }
  }, [selectedContactChannel, showDialog.mode, setValue]);

  const onSubmit = async (data: ContactChannelPayload) => {
    if (showDialog.mode === "create") {
      // Hapus contactChannelId untuk create
      const { contactChannelId, ...createData } = data;
      doCreateContactChannel(createData as ContactChannelPayload);
    } else if (showDialog.mode === "update") {
      doUpdateContactChannel(data);
    }
  };

  const doCreateContactChannel = async (data: ContactChannelPayload) => {
    try {
      const response = await PostData(
        `${API_URL_REF}/api/channel-type/channel/add-contact-channel`,
        data,
      );
      if (response?.message === "Success") {
        toast.success("Contact Channel successfully created");
        handleShowDialog(false, "create", null);
        reset(createDefaultContactChannelPayload());
        handleRefresh();
      } else {
        toast.error(response?.message || "Failed to create Contact Channel");
      }
    } catch (error) {
      console.error("Error creating Contact Channel", error);
      toast.error(
        "Error Creating Contact Channel. Please Check Your Connection!",
      );
    }
  };

  const doUpdateContactChannel = async (data: ContactChannelPayload) => {
    try {
      const response = await PutData(
        `${API_URL_REF}/api/channel-type/channel/update-contact-channel`,
        data,
      );
      if (response?.message === "Success") {
        toast.success("Contact Channel successfully updated");
        handleShowDialog(false, "update", null);
        reset(createDefaultContactChannelPayload());
        handleRefresh();
      } else {
        toast.error(response?.message || "Failed to update Contact Channel");
      }
    } catch (error) {
      console.error("Error updating Contact Channel", error);
      toast.error(
        "Error Updating Contact Channel. Please Check Your Connection!",
      );
    }
  };

  useEffect(() => {
    if (!showDialog.show) {
      reset(createDefaultContactChannelPayload());
    }
  }, [showDialog.show, reset]);

  return (
    <Dialog
      open={showDialog.show}
      onOpenChange={(open) => {
        if (!open) {
          handleShowDialog(false, "create", null);
        }
      }}
    >
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle>
            {showDialog.mode === "create" ? "Create" : "Edit"} Contact Channel
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
          <form
            className="space-y-5 px-6 py-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Contact Channel Name */}
            <div className="space-y-2">
              <Label htmlFor="contactChannelName">
                Contact Channel Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactChannelName"
                placeholder="Enter contact channel name"
                {...register("contactChannelName")}
                disabled={isSubmitting}
              />
              {errors.contactChannelName && (
                <p className="text-sm text-red-500">
                  {errors.contactChannelName.message}
                </p>
              )}
            </div>

            {/* Contact Channel Code */}
            <div className="space-y-2">
              <Label htmlFor="contactChannelCode">Contact Channel Code</Label>
              <Input
                id="contactChannelCode"
                placeholder="Enter contact channel code"
                {...register("contactChannelCode")}
                disabled={isSubmitting}
              />
              {errors.contactChannelCode && (
                <p className="text-sm text-red-500">
                  {errors.contactChannelCode.message}
                </p>
              )}
            </div>

            {/* Channel Type */}
            <div className="space-y-2">
              <Label htmlFor="channelType">
                Channel Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="channelType"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Select
                      value={field.value === null ? "" : String(field.value)}
                      onValueChange={(val) => {
                        if (val === "") {
                          field.onChange(null);
                        } else {
                          field.onChange(parseInt(val, 10));
                        }
                      }}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select Balance Catalog" />
                      </SelectTrigger>
                      <SelectContent>
                        {channelType?.length ? (
                          channelType.map((item) => (
                            <SelectItem
                              key={item.channelType}
                              value={String(item.channelType)}
                            >
                              {item.channelTypeName}
                            </SelectItem>
                          ))
                        ) : (
                          <p className="p-2 text-sm text-center text-gray-500">
                            Balance Catalog Not Found
                          </p>
                        )}
                      </SelectContent>
                    </Select>
                    {/* {field.value !== null && (
                      <button
                        type="button"
                        onClick={() => field.onChange(null)}
                        className="absolute right-10 top-1/2 -translate-y-1/2 mt-0.5 p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    )} */}
                  </div>
                )}
              />
              {errors.channelType && (
                <p className="text-sm text-red-500">
                  {errors.channelType.message}
                </p>
              )}
            </div>

            {/* System Reserved */}
            <div className="space-y-2">
              <Label htmlFor="systemReserve">
                System Reserved <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="systemReserve"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select system reserved" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Y">Yes</SelectItem>
                      <SelectItem value="N">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.systemReserve && (
                <p className="text-sm text-red-500">
                  {errors.systemReserve.message}
                </p>
              )}
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">
                Comments<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="comments"
                placeholder="Enter comments or description"
                rows={4}
                {...register("comments")}
                disabled={isSubmitting}
              />
              {errors.comments && (
                <p className="text-sm text-red-500">
                  {errors.comments.message}
                </p>
              )}
            </div>

            {/* Footer */}
            <DialogFooter className="gap-2 flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleShowDialog(false, "create", null)}
                disabled={isSubmitting}
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
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {showDialog.mode === "create"
                        ? "Creating..."
                        : "Updating..."}
                    </>
                  ) : showDialog.mode === "create" ? (
                    "Create"
                  ) : (
                    "Update"
                  )}
                </Button>
              </AccessWrapper>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChannelForm;
