import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useEventListContext } from "../hooks/useEventContext";
import {
  initialFormUsage,
  UsageForm,
  UsageTypeSchema,
} from "../schema/eventSchemaType";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { getNewlyAddedTreeItems } from "@/lib/getNewlyAddedTreeItem";

const API_URL_REF = apiConfigRef.ref;

const UsageEventContent = () => {
  const {
    selectedItem,
    mode,
    setMode,
    addTrigger,
    handleNewUsage,
    formReset,
    setFormReset,
    rumAttr,
    fetchRumAttr,
    fetchReUsageList,
    reUsageList,
    setSelectedItem,
    setSelectedReType,
  } = useEventListContext();
  const { PutData, PostData, DeleteData } = useCallApi();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isEditingTriggered, setIsEditingTriggered] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
    getValues,
  } = useForm<UsageForm>({
    resolver: zodResolver(UsageTypeSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: initialFormUsage(selectedItem?.reId),
  });

  //  console.log(errors);

  useEffect(() => {
    fetchRumAttr();
  }, []);

  useEffect(() => {
    if (mode !== "view") return;

    if (!selectedItem) {
      reset(initialFormUsage(selectedItem?.reId));
    } else {
      reset({
        parentReId: selectedItem?.parentReId,
        offerId: selectedItem?.offerId,
        prodSpecId: selectedItem?.prodSpecId,
        recurringReType: selectedItem?.recurringReType,
        subsEventId: selectedItem?.subsEventId,
        reAttr: selectedItem?.reAttr,
        reType: selectedItem?.reType,
        reName: selectedItem?.reName,
        reCode: selectedItem?.reCode,
        comments: selectedItem?.comments,
      });
    }
  }, [selectedItem, reset, mode, rumAttr]);

  useEffect(() => {
    setFormReset(() => reset);
  }, [selectedItem, reset]);

  // useEffect(() => {
  //   if (selectedItem) {
  //     const reId = selectedItem.reId;
  //     reset(initialFormUsage(reId));
  //   }
  // }, [selectedItem, reset]);

  const handleEdit = () => {
    setIsEditingTriggered(true);
    if (selectedItem) {
      reset({
        parentReId: selectedItem?.parentReId,
        offerId: selectedItem?.offerId,
        prodSpecId: selectedItem?.prodSpecId,
        recurringReType: selectedItem?.recurringReType,
        subsEventId: selectedItem?.subsEventId,
        reAttr: Number(selectedItem?.reAttr),
        reType: selectedItem?.reType,
        reName: selectedItem?.reName,
        reCode: selectedItem?.reCode,
        comments: selectedItem?.comments,
      });
    }
    setMode("edit");
  };

  useEffect(() => {
    if (addTrigger.type === "usage" && addTrigger.count > 0) {
      handleNewUsage();
    }
  }, [addTrigger.count]);

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleCancel = () => {
    if (selectedItem) {
      reset({
        parentReId: selectedItem?.parentReId,
        offerId: selectedItem?.offerId,
        prodSpecId: selectedItem?.prodSpecId,
        recurringReType: selectedItem?.recurringReType,
        subsEventId: selectedItem?.subsEventId,
        reAttr: selectedItem?.reAttr,
        reType: selectedItem?.reType,
        reName: selectedItem?.reName,
        reCode: selectedItem?.reCode,
        comments: selectedItem?.comments,
      });
    } else {
      reset(initialFormUsage(selectedItem?.reId));
    }
    setMode("view");
  };

  const buildPayload = (data: UsageForm) => {
    const alwaysIncludes = ["reType", "parentReId"];
    return Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        if (alwaysIncludes.includes(key)) return true;
        return value !== undefined && value !== null && value !== "";
      }),
    );
  };

  const onSubmit = async (data: UsageForm) => {
    if (isEditingTriggered) {
      setIsEditingTriggered(false);
      return;
    }

    if (mode === "new") {
      try {
        const oldList = [...reUsageList];
        const response = await PostData(
          `${API_URL_REF}/api/event/add-re`,
          buildPayload(data),
        );

        if (response?.status) {
          toast.success("Success");
          const newList = await fetchReUsageList();

          const newItem = getNewlyAddedTreeItems(oldList, newList, "reId");

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
          await fetchReUsageList();
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
    if (selectedItem?.children.length > 0) {
      toast.error("Failed because have children");
      return;
    }

    const reId = selectedItem?.reId ?? null;
    const reType = selectedItem?.reType ?? null;
    try {
      const idx = reUsageList.findIndex((idx) => idx.reId === reId);
      const next = reUsageList[idx + 1] || reUsageList[idx - 1] || null;

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
        const updateList = await fetchReUsageList();

        if (next) {
          const newData = updateList?.find((id) => id.reId === next.reId);
          setSelectedItem(newData || null);
        } else {
          setSelectedReType("1");
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
      <PopUpDialog
        isOpen={isDeleteOpen}
        desc="This action cannot be undone!"
        handleDialog={() => setIsDeleteOpen(false)}
        onConfirm={onDeleteConfirm}
        bgOn={false}
      />

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Usage Event</h2>
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
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                          value="B"
                          checked={field.value === "B"}
                          onChange={(e) => field.onChange(e.target.value)}
                          className={`mr-1 ${mode === "view" ? "cursor-not-allowed" : "cursor-pointer"}`}
                          disabled={mode === "view"}
                        />
                        Yes
                      </Label>
                      <Label>
                        <input
                          type="radio"
                          value="1"
                          checked={field.value === "1"}
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
                Calculate Unit
              </label>
              <Controller
                name="reAttr"
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
                      {rumAttr.map((item) => (
                        <SelectItem
                          key={item.reAttr}
                          value={String(item.reAttr)}
                        >
                          <span className="block max-w-[250px] truncate">
                            {item.reAttrName}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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
                variant="outline"
                size="sm"
                onClick={(e) => {
                  //  console.log(e.currentTarget.type);
                  handleEdit();
                }}
                className="bg-blue-500 text-white"
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

export default UsageEventContent;
