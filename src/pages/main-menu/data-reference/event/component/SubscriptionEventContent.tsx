import React, { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEventListContext } from "../hooks/useEventContext";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import {
  initialFormSubscription,
  SubscriptionForm,
  SubscriptionTypeSchema,
} from "../schema/eventSchemaType";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { OfferDataList } from "../blocks/ToolbarOffer";
import OfferSelector from "./OfferSelector";
import { getNewlyAddedItem } from "@/lib/getNewlyAddedItem";

const API_URL_REF = apiConfigRef.ref;

const SubscriptionEventContent = () => {
  const { PostData, PutData, DeleteData } = useCallApi();
  const {
    selectedItem,
    mode,
    setMode,
    subsEventList,
    fetchSubsEventList,
    addTrigger,
    fetchReSubsEventList,
    setSelectedItem,
    reSubsEventList,
    setSelectedReType,
  } = useEventListContext();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
    getValues,
  } = useForm<SubscriptionForm>({
    resolver: zodResolver(SubscriptionTypeSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: initialFormSubscription(selectedItem?.reId),
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isOfferOpen, setIsOfferOpen] = useState<boolean>(false);
  const [isEditingTriggered, setIsEditingTriggered] = useState(false);
  const [displayOfferName, setDisplayOfferName] = useState<string | null>(null);

  //  console.log(errors);

  useEffect(() => {
    fetchSubsEventList();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    if (mode === "view") {
      reset({
        offerId: selectedItem?.prodSpecId,
        prodSpecId: selectedItem?.prodSpecId,
        subsEventId: selectedItem?.subsEventId,
        reType: selectedItem?.reType,
        reName: selectedItem?.reName,
        reCode: selectedItem?.reCode,
        comments: selectedItem?.comments,
      });
    }
  }, [selectedItem, subsEventList]);

  useEffect(() => {
    if (mode === "edit") {
      reset({
        offerId: selectedItem?.prodSpecId,
        prodSpecId: selectedItem?.prodSpecId,
        subsEventId: selectedItem?.subsEventId,
        reType: selectedItem?.reType,
        reName: selectedItem?.reName,
        reCode: selectedItem?.reCode,
        comments: selectedItem?.comments,
      });
    } else if (mode === "new") {
      reset(initialFormSubscription(selectedItem?.reId));
    }
  }, [mode]);

  const handleNewSubscription = () => {
    //  console.log("TRIGGER NEW");
    reset(initialFormSubscription(selectedItem?.reId));
    setMode("new");
  };

  useEffect(() => {
    if (addTrigger.type === "subscription" && addTrigger.count > 0) {
      handleNewSubscription();
    }
  }, [addTrigger.count]);

  const handleEdit = () => {
    setIsEditingTriggered(true);
    setMode("edit");
    reset({
      offerId: selectedItem?.prodSpecId,
      prodSpecId: selectedItem?.prodSpecId,
      subsEventId: selectedItem?.subsEventId,
      reType: selectedItem?.reType,
      reName: selectedItem?.reName,
      reCode: selectedItem?.reCode,
      comments: selectedItem?.comments,
    });
  };

  const handleCancel = () => {
    setMode("view");
    reset({
      offerId: selectedItem?.prodSpecId,
      prodSpecId: selectedItem?.prodSpecId,
      subsEventId: selectedItem?.subsEventId,
      reType: selectedItem?.reType,
      reName: selectedItem?.reName,
      reCode: selectedItem?.reCode,
      comments: selectedItem?.comments,
    });
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleOfferData = (item: OfferDataList | null) => {
    setValue("prodSpecId", item?.prodSpecId, { shouldValidate: true });
    setValue("offerId", item?.offerId, { shouldValidate: true });
    setDisplayOfferName(item?.prodSpecName ?? null);
  };

  const buildPayload = (data: SubscriptionForm) => {
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) => {
        return value !== undefined && value !== null && value !== "";
      }),
    );
  };

  const onSubmit = async (data: SubscriptionForm) => {
    if (isEditingTriggered) {
      setIsEditingTriggered(false);
      return;
    }

    if (mode === "new") {
      try {
        const beforeUpdatedList = [...reSubsEventList];

        const response = await PostData(
          `${API_URL_REF}/api/event/add-re`,
          buildPayload(data),
        );

        if (response?.status) {
          toast.success("Success");

          const updatedList = await fetchReSubsEventList();

          const newItem = getNewlyAddedItem(
            beforeUpdatedList,
            updatedList,
            "reId",
          );

          setSelectedItem(newItem || null);
          setMode("view");
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.error(error);
      }
    } else if (mode === "edit") {
      try {
        const payloadMod = {
          ...buildPayload(data),
          reId: selectedItem.reId,
        };

        //  console.log("MOD SUBS: ", payloadMod);

        const response = await PutData(
          `${API_URL_REF}/api/event/mod-re/${selectedItem?.reId}`,
          payloadMod,
        );

        if (response?.status) {
          toast.success("Success");

          const updateItem = {
            ...selectedItem,
            ...data,
          };

          setSelectedItem(updateItem);
          await fetchReSubsEventList();
          setMode("view");
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const onDeleteConfirm = async () => {
    const reId = selectedItem?.reId ?? null;
    const reType = selectedItem?.reType ?? null;
    try {
      const idx = reSubsEventList.findIndex((idx) => idx.reId === reId);
      const next = reSubsEventList[idx + 1] || reSubsEventList[idx - 1] || null;

      const response = await DeleteData(
        `${API_URL_REF}/api/event/del-re/${reId}?reType=${reType}`,
        {
          reId,
          reType,
        },
      );

      if (response?.status) {
        toast.success("Success");
        setIsDeleteOpen(false);
        const updateList = await fetchReSubsEventList();

        if (next) {
          const newData = updateList?.find((id) => id.reId === next.reId);
          setSelectedItem(newData || null);
        } else {
          setSelectedReType("3");
          setSelectedItem(null);
        }

        setMode("view");
      } else {
        toast.error(response?.message || "Failed");
      }
    } catch (err) {
      //  console.log(err);
    }
  };

  const handleOfferClick = () => {
    setIsOfferOpen(true);
  };

  if (!selectedItem) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg">Select an event to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Delete Confirmation */}
      <PopUpDialog
        isOpen={isDeleteOpen}
        desc={"This action cannot be undone!"}
        handleDialog={() => setIsDeleteOpen(false)}
        onConfirm={onDeleteConfirm}
        bgOn={false}
      />

      {/* offer selector */}
      <OfferSelector
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        offerData={handleOfferData}
      />

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Subscription Event
        </h2>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl space-y-5">
            <div className="flex items-center">
              <label className="w-48 text-sm text-gray-700 flex-shrink-0">
                <span className="text-red-500">*</span> Event Name
              </label>
              <Input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                {...register("reName")}
                disabled={mode === "view"}
              />
              {errors.reName && (
                <p className="text-red-500 text-sm">{errors.reName.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <label className="w-48 text-sm text-gray-700 flex-shrink-0">
                Event Code
              </label>
              <Input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                {...register("reCode")}
                disabled={mode === "view"}
              />
              {errors.reCode && (
                <p className="text-red-500 text-sm">{errors.reCode.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <label className="w-48 text-sm text-gray-700 flex-shrink-0">
                Match All Usage Event
              </label>
              <div className="flex gap-6">
                <Controller
                  name="reType"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Label className="mr-3">
                        <input
                          type="radio"
                          value="C"
                          checked={field.value === "C"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={`mr-1 ${mode === "view" ? "cursor-not-allowed" : "cursor-pointer"}`}
                          disabled={mode === "view"}
                        />
                        Yes
                      </Label>
                      <Label>
                        <input
                          type="radio"
                          value="3"
                          checked={field.value === "3"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={`mr-1 ${mode === "view" ? "cursor-not-allowed" : "cursor-pointer"}`}
                          disabled={mode === "view"}
                        />
                        No
                      </Label>
                    </>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="w-48 text-sm text-gray-700 flex-shrink-0">
                <span className="text-red-500">*</span> Event Type
              </label>
              <div className="flex-1">
                <Controller
                  name="subsEventId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value)}
                      disabled={mode === "view"}
                    >
                      <SelectTrigger className="h-[30px]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-w-[400px]">
                        {subsEventList.map((item) => (
                          <SelectItem
                            key={item.subsEventId}
                            value={String(item.subsEventId)}
                          >
                            <span className="block max-w-[250px] truncate">{`${item.eventName}[${item.subsEventId}]`}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subsEventId && (
                  <p className="text-red-500 text-sm">
                    {errors.subsEventId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <label className="w-48 text-sm text-gray-700 flex-shrink-0">
                Offer
              </label>
              <div className="flex-1 relative">
                <input
                  className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed ${mode === "view" && "text-gray-400"}`}
                  readOnly
                  disabled={mode === "view"}
                  value={
                    mode === "new" || mode === "edit"
                      ? displayOfferName || selectedItem?.prodSpecName || ""
                      : selectedItem?.prodSpecName || ""
                  }
                />
                <input
                  type="hidden"
                  {...register("prodSpecId", { valueAsNumber: true })}
                />
                <input
                  type="hidden"
                  {...register("offerId", { valueAsNumber: true })}
                />
                <button
                  onClick={handleOfferClick}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${mode === "view" ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-600 cursor-pointer"}`}
                  type="button"
                  disabled={mode === "view"}
                >
                  <ExternalLink size={18} />
                </button>
                {errors.offerId && (
                  <p className="text-red-500 text-sm">
                    {errors.offerId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <label className="w-48 text-sm text-gray-700 flex-shrink-0 pt-2">
                Remarks
              </label>
              <Input
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                {...register("comments")}
                disabled={mode === "view"}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          {mode === "view" ? (
            <>
              <Button
                type="button"
                className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white"
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white "
                type="submit"
              >
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default SubscriptionEventContent;
