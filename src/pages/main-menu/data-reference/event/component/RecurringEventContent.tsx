import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEventListContext } from "../hooks/useEventContext";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import {
  initialFormRecurring,
  RecurringForm,
  RecurringTypeSchema,
} from "../schema/eventSchemaType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink } from "lucide-react";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import OfferSelector from "./OfferSelector";
import { OfferDataList } from "../blocks/ToolbarOffer";
import { getNewlyAddedItem } from "@/lib/getNewlyAddedItem";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { KeenIcon } from "@/components";
import { Item } from "@radix-ui/react-select";

const API_URL_REF = apiConfigRef.ref;

const RecurringEventContent = () => {
  const {
    selectedItem,
    mode,
    setMode,
    addTrigger,
    fetchRecurringReType,
    recurringReType,
    fetchReRecurringList,
    fetchAllPricePlan,
    allPricePlan,
    setSelectedItem,
    reRecurringList,
    setSelectedReType,
    isLoading,
  } = useEventListContext();
  const { PostData, PutData, DeleteData } = useCallApi();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
    getValues,
    clearErrors,
  } = useForm<RecurringForm>({
    resolver: zodResolver(RecurringTypeSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: initialFormRecurring(selectedItem?.reId),
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isOfferOpen, setIsOfferOpen] = useState<boolean>(false);
  const [isEditingTriggered, setIsEditingTriggered] = useState(false);
  const [displayOfferName, setDisplayOfferName] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  //  console.log(errors);

  const reType = watch("reType");

  useEffect(() => {
    fetchRecurringReType();
    fetchAllPricePlan();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    if (mode === "view") {
      reset({
        offerId: selectedItem?.prodSpecId,
        prodSpecId: selectedItem?.prodSpecId,
        reType: selectedItem?.reType,
        reName: selectedItem?.reName,
        reCode: selectedItem?.reCode,
        comments: selectedItem?.comments,
        recurringReType: selectedItem?.recurringReType,
      });
    }
  }, [selectedItem, allPricePlan]);

  useEffect(() => {
    //  console.log(mode);
    if (mode === "edit") {
      reset({
        offerId: selectedItem?.prodSpecId,
        prodSpecId: selectedItem?.prodSpecId,
        reType: selectedItem?.reType,
        reName: selectedItem?.reName,
        reCode: selectedItem?.reCode,
        comments: selectedItem?.comments,
        recurringReType: selectedItem?.recurringReType,
      });
    } else if (mode === "new") {
      reset(initialFormRecurring(selectedItem?.reId));
    }
  }, [mode]);

  const handleNewRecurring = () => {
    setMode("new");
  };

  useEffect(() => {
    if (addTrigger.type === "recurring" && addTrigger.count > 0) {
      handleNewRecurring();
    }
  }, [addTrigger.count]);

  useEffect(() => {
    if (reType === "D") {
      clearErrors("offerId");
      setValue("offerId", null);
    } else if (reType === "2") {
      clearErrors("prodSpecId");
      setValue("prodSpecId", null);
      // setSelectedItem((prev: any) => ({ ...prev, prodSpecName: "" }));
      // setDisplayOfferName("")
    }
  }, [reType]);

  const handleEdit = () => {
    setIsEditingTriggered(true);
    setMode("edit");
  };

  const handleCancel = () => {
    reset({
      offerId: selectedItem?.prodSpecId,
      prodSpecId: selectedItem?.prodSpecId,
      reType: selectedItem?.reType,
      reName: selectedItem?.reName,
      reCode: selectedItem?.reCode,
      comments: selectedItem?.comments,
      recurringReType: selectedItem?.recurringReType,
    });
    setMode("view");
  };

  const handleOfferData = (item: OfferDataList | null) => {
    if (reType === "2") {
      setValue("prodSpecId", item?.prodSpecId, { shouldValidate: true });
      setValue("offerId", item?.offerId, { shouldValidate: true });
      setDisplayOfferName(item?.prodSpecName ?? null);
    }
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const buildPayload = (data: RecurringForm) => {
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) => {
        return value !== undefined && value !== null && value !== "";
      }),
    );
  };

  const onSubmit = async (data: RecurringForm) => {
    if (isEditingTriggered) {
      setIsEditingTriggered(false);
      return;
    }

    if (mode === "new") {
      try {
        const beforeUpdatedList = [...reRecurringList];

        const response = await PostData(
          `${API_URL_REF}/api/event/add-re`,
          buildPayload(data),
        );
        if (response?.status) {
          toast.success("Success");

          const updateList = await fetchReRecurringList();

          const newItem = getNewlyAddedItem(
            beforeUpdatedList,
            updateList,
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
          await fetchReRecurringList();
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
      const idx = reRecurringList.findIndex((idx) => idx.reId === reId);
      const next = reRecurringList[idx + 1] || reRecurringList[idx - 1] || null;

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
        const updateList = await fetchReRecurringList();

        if (next) {
          const newData = updateList?.find((id) => id.reId === next.reId);
          setSelectedItem(newData || null);
        } else {
          setSelectedReType("2");
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
    //  console.log("trigger offer");
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

  const filteredPricePlan = useMemo(() => {
    return allPricePlan.filter((item) =>
      item.pricePlanName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, allPricePlan]);

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
        <h2 className="text-xl font-semibold text-gray-800">Recurring Event</h2>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl space-y-5">
            <div className="flex items-center">
              <label className="w-48 text-sm text-gray-700 flex-shrink-0">
                <span className="text-red-500">*</span> Event Name
              </label>
              <div className="flex-1">
                <Input
                  type="text"
                  className=" px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  {...register("reName")}
                  disabled={mode === "view"}
                />
                {errors.reName && (
                  <p className="text-red-500 text-sm">
                    {errors.reName.message}
                  </p>
                )}
              </div>
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
            </div>

            <div className="flex items-center">
              <label className="w-48 text-sm text-gray-700 flex-shrink-0">
                <span className="text-red-500">*</span> Recurring Event Type
              </label>
              <div className="flex-1">
                <Controller
                  name="recurringReType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={mode === "view"}
                    >
                      <SelectTrigger className="h-[30px]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white max-w-[400px]">
                        {recurringReType.map((item) => (
                          <SelectItem
                            key={item.recurringReType}
                            value={item.recurringReType}
                          >
                            <span className="block max-w-[250px] truncate">
                              {item.recurringReTypeName}
                            </span>
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
                Match All Recurring Event
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
                          value="D"
                          checked={field.value === "D"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={`mr-1 ${mode === "view" ? "cursor-not-allowed" : "cursor-pointer"}`}
                          disabled={mode === "view"}
                        />
                        Yes
                      </Label>
                      <Label>
                        <input
                          type="radio"
                          value="2"
                          checked={field.value === "2"}
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
                {reType === "2" && <span className="text-red-500">*</span>}Offer
              </label>
              <div className="flex-1 relative">
                <input
                  className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed ${mode === "view" && "text-gray-400"}`}
                  readOnly
                  disabled={mode === "view"}
                  value={
                    reType === "2"
                      ? mode === "new"
                        ? displayOfferName || ""
                        : displayOfferName || selectedItem?.prodSpecName || ""
                      : ""
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
                  onClick={() => {
                    if (reType === "D") return;

                    handleOfferClick();
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${mode === "view" || reType === "D" ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-600 cursor-pointer"}`}
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

            <div className="flex items-center">
              <label className="w-48 text-sm text-gray-700 flex-shrink-0">
                {reType === "D" && <span className="text-red-500">*</span>}
                Price Plan
              </label>
              <div className="flex-1">
                <Controller
                  name="prodSpecId"
                  control={control}
                  render={({ field }) => {
                    const selectedItem = allPricePlan.find(
                      (i) => i.pricePlanId === field.value,
                    );

                    return (
                      <Popover open={openPopover} onOpenChange={setOpenPopover}>
                        <PopoverTrigger asChild disabled={mode === "view"}>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="h-[30px] w-full justify-between"
                          >
                            <span className="truncate">
                              {selectedItem
                                ? selectedItem.pricePlanName
                                : "Select..."}
                            </span>
                            <KeenIcon icon="chevron-down" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="p-0 w-[400px]">
                          <Command>
                            <CommandInput
                              placeholder="Search..."
                              value={search}
                              onValueChange={setSearch}
                            />

                            <CommandList>
                              {isLoading && (
                                <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                                  <KeenIcon
                                    icon="loading"
                                    className="mr-2 animate-spin"
                                  />
                                  Loading...
                                </div>
                              )}
                              {!isLoading && filteredPricePlan.length === 0 && (
                                <CommandEmpty>No data found.</CommandEmpty>
                              )}

                              {filteredPricePlan.map((item) => (
                                <CommandItem
                                  key={item.pricePlanId}
                                  value={String(item.pricePlanName)}
                                  onSelect={() => {
                                    field.onChange(item.pricePlanId);
                                    setSearch("");
                                    setOpenPopover(false);
                                  }}
                                >
                                  <span className="truncate">
                                    {item.pricePlanName}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                {errors.prodSpecId && (
                  <p className="text-red-500 text-sm">
                    {errors.prodSpecId.message}
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

export default RecurringEventContent;
