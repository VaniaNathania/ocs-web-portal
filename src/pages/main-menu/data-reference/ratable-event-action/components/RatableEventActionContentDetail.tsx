import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRatableEventActionContext } from "../hooks/useRatableEventActionContext";
import { useEffect, useState } from "react";
import {
  initialForm,
  RatableEventActionContentForm,
  RatableEventActionContentTypeSchema,
} from "../schema/ratableEventAction.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { PopUpDialog } from "@/pages/main-menu/role-management/generalUseComp";
import { apiConfigRef } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { RelativeFields } from "../blocks/utils/fieldsTemplates/RelativeFields";
import { AbsoluteFields } from "../blocks/utils/fieldsTemplates/AbsoluteFields";
import { operationFlag } from "../blocks/utils/MapDisplayData";
import { KeenIcon } from "@/components";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
dayjs.extend(customParseFormat);

type mode = "view" | "new" | "edit";

const API_URL_REF = apiConfigRef.ref;

const RatableEventActionContentDetail = () => {
  const { PostData, PutData, DeleteData } = useCallApi();
  const {
    selectedItemContent,
    selectedItemMaster,
    fetchReActionDetail,
    editTrigger,
    deleteTrigger,
    pricePlanRecharge,
    getOperationFlagName,
    menuPrivAccess,
  } = useRatableEventActionContext();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<mode>("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    watch,
  } = useForm<RatableEventActionContentForm>({
    resolver: zodResolver(RatableEventActionContentTypeSchema),
    defaultValues: initialForm(),
  });

  const defPeriod = watch("defPeriod");
  const periodType = watch("periodType");
  const pricePlanId = watch("pricePlanId");
  const selectedOperationFlag = watch("operationFlag");
  const effDate = watch("effDate");
  const expDate = watch("expDate");

  //  console.log(errors, "ERRORS");

  useEffect(() => {
    if (!selectedItemContent) {
      reset(initialForm());
      setMode("view");
      return;
    }

    const { absEffDate, absExpDate } = selectedItemContent;
    const finalAbsEffDate = absEffDate?.split("T")[0] ?? "";
    const finalAbsExpDate = absExpDate?.split("T")[0] ?? "";

    reset({
      pricePlanId: selectedItemContent.pricePlanId,
      operationFlag: selectedItemContent.operationFlag,
      effDate: selectedItemContent.effDate,
      expDate: selectedItemContent.expDate,
      defPeriod: selectedItemContent.defPeriod,
      periodType: selectedItemContent.relEffOffset ? "N" : "Y",
      relEffUnit: selectedItemContent.relEffUnit,
      relExpUnit: selectedItemContent.relExpUnit,
      relEffOffset: selectedItemContent.relEffOffset,
      relExpOffset: selectedItemContent.relExpOffset,
      relEffTime: selectedItemContent.relEffTime,
      relExpTime: selectedItemContent.relExpTime,
      periodRelUnit: selectedItemContent.periodRelUnit,
      absEffDate: finalAbsEffDate,
      absExpDate: finalAbsExpDate,
    });
    setMode("view");
  }, [selectedItemContent, reset]);

  useEffect(() => {
    if (editTrigger > 0 && selectedItemContent) {
      handleEdit();
    }
  }, [editTrigger]);

  useEffect(() => {
    if (deleteTrigger > 0 && selectedItemContent) {
      handleDelete();
    }
  }, [deleteTrigger]);

  const buildPayload = (data: RatableEventActionContentForm) => {
    const base = {
      id: selectedItemContent?.reActionPricePlanId ?? null,
      reActionId: selectedItemMaster?.reActionId,
      pricePlanId: data.pricePlanId,
      effDate: data.effDate,
      expDate: data.expDate,
      state: "A",
      periodRelUnit: null,
      spId: 0,
      operationFlag: data.operationFlag,
      defPeriod: data.defPeriod,
      radPeriod: data.periodType,
      periodDto: [
        {
          id: selectedItemContent?.periodId ?? null,
          spId: 0,
        },
      ],
    };

    if (defPeriod === "Y") {
      return {
        ...base,
        radPeriod: "Y",
      };
    }

    if (defPeriod === "N" && periodType === "Y") {
      return {
        ...base,
        periodDto: [
          {
            id: selectedItemContent?.periodId ?? null,
            absEffDate: data.absEffDate,
            absExpDate: data.absExpDate,
            spId: 0,
          },
        ],
      };
    }

    if (defPeriod === "N" && periodType === "N") {
      return {
        ...base,
        periodRelUnit: data.periodRelUnit,
        periodDto: [
          {
            id: selectedItemContent?.periodId ?? null,
            relEffOffset: data.relEffOffset,
            relEffUnit: data.relEffUnit,
            relExpOffset: data.relExpOffset,
            relExpUnit: data.relExpUnit,
            relEffTime: data.relEffTime,
            relExpTime: data.relExpTime,
            spId: 0,
          },
        ],
      };
    }
  };

  const onSubmit = async (data: RatableEventActionContentForm) => {
    setIsSubmitting(true);
    if (mode === "new") {
      try {
        const payloadNew = buildPayload(data);
        const response = await PostData(
          `${API_URL_REF}/api/ratable-event-action/add-re-action-price-plan`,
          payloadNew,
        );
        if (response?.status) {
          toast.success("Success");
          await fetchReActionDetail();
          setMode("view");
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    } else if (mode === "edit") {
      try {
        const payloadMod = buildPayload(data);

        const response = await PutData(
          `${API_URL_REF}/api/ratable-event-action/mod-re-action-price-plan`,
          payloadMod,
        );
        if (response?.status) {
          toast.success("Success");
          setMode("view");
          await fetchReActionDetail();

          // const lastItem = newData?.find((item) => item.periodId === payloadMod?.periodId);
          // console.log(lastItem, data, "lastitem");

          // if (lastItem) {
          //   setSelectedItemContent(lastItem);
          // }
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleNew = () => {
    reset(initialForm());
    setMode("new");
  };

  useEffect(() => {
    if (mode === "view") return;

    if (defPeriod === "N") {
      setValue("periodType", "Y");
    } else {
      setValue("periodType", null);
    }
  }, [defPeriod, setValue]);

  const handleEdit = () => {
    setMode("edit");

    if (selectedItemContent) {
      const { absEffDate, absExpDate } = selectedItemContent;
      const finalAbsEffDate = absEffDate?.split("T")[0] ?? "";
      const finalAbsExpDate = absExpDate?.split("T")[0] ?? "";

      reset({
        reActionId: selectedItemContent.reActionId,
        pricePlanId: selectedItemContent.pricePlanId,
        operationFlag: selectedItemContent.operationFlag,
        effDate: selectedItemContent.effDate,
        expDate: selectedItemContent.expDate,
        defPeriod: selectedItemContent.defPeriod,
        periodType: selectedItemContent.relEffOffset ? "N" : "Y",
        relEffUnit: selectedItemContent.relEffUnit,
        relExpUnit: selectedItemContent.relExpUnit,
        relEffOffset: selectedItemContent.relEffOffset,
        relExpOffset: selectedItemContent.relExpOffset,
        relEffTime: selectedItemContent.relEffTime,
        relExpTime: selectedItemContent.relExpTime,
        periodRelUnit: selectedItemContent.periodRelUnit,
        absEffDate: finalAbsEffDate,
        absExpDate: finalAbsExpDate,
        spId: selectedItemContent.spId,
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    try {
      const response = await DeleteData(
        `${API_URL_REF}/api/ratable-event-action/del-re-action-price-plan?reActionPricePlan=${selectedItemContent?.reActionPricePlanId}`,
        {
          reActionPricePlan: selectedItemContent?.reActionPricePlanId,
        },
      );
      if (response?.status) {
        toast.success("Success");
        await fetchReActionDetail();
        setMode("view");
        setIsDeleteOpen(false);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (selectedItemContent) {
      const { absEffDate, absExpDate } = selectedItemContent;
      const finalAbsEffDate = absEffDate?.split("T")[0] ?? "";
      const finalAbsExpDate = absExpDate?.split("T")[0] ?? "";

      reset({
        pricePlanId: selectedItemContent.pricePlanId,
        operationFlag: selectedItemContent.operationFlag,
        effDate: selectedItemContent.effDate,
        expDate: selectedItemContent.expDate,
        defPeriod: selectedItemContent.defPeriod,
        periodType: selectedItemContent.relEffOffset ? "N" : "Y",
        relEffUnit: selectedItemContent.relEffUnit,
        relExpUnit: selectedItemContent.relExpUnit,
        relEffOffset: selectedItemContent.relEffOffset,
        relExpOffset: selectedItemContent.relExpOffset,
        relEffTime: selectedItemContent.relEffTime,
        relExpTime: selectedItemContent.relExpTime,
        periodRelUnit: selectedItemContent.periodRelUnit,
        absEffDate: finalAbsEffDate,
        absExpDate: finalAbsExpDate,
      });
    } else {
      reset(initialForm());
    }
    setMode("view");
  };

  return (
    <div className="p-2">
      <h1 className="font-semibold">Detail</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-row justify-end">
            <Label className="text-sm p-1 w-1/4">
              <span className="text-red-500">*</span>Price Plan Name
            </Label>
            <div className="flex-1">
              <Controller
                name="pricePlanId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : undefined}
                    disabled={mode === "view"}
                  >
                    <SelectTrigger
                      className="h-[30px]"
                      title={
                        pricePlanId
                          ? pricePlanRecharge.find(
                              (item) => item.pricePlanId === pricePlanId,
                            )?.pricePlanName || ""
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {pricePlanRecharge.map((item) => (
                        <SelectItem
                          key={item.pricePlanId}
                          value={String(item.pricePlanId)}
                        >
                          {item.pricePlanName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.pricePlanId && (
                <p className="text-sm text-red-500">
                  {errors.pricePlanId.message}
                </p>
              )}
            </div>
            {mode !== "view" && pricePlanId !== 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setValue("pricePlanId", 0, { shouldValidate: true })
                }
              >
                <KeenIcon icon="cross" />
              </Button>
            )}
          </div>
          <div className="flex flex-row justify-end">
            <Label className="text-sm p-1 w-1/4">
              <span className="text-red-500">*</span>Operation Flag
            </Label>
            <div className="flex-1">
              <Controller
                name="operationFlag"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={mode === "view"}
                  >
                    <SelectTrigger
                      className="h-[30px]"
                      title={
                        field.value ? getOperationFlagName(field.value) : ""
                      }
                    >
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-w-[400px]">
                      {operationFlag.map((item) => (
                        <SelectItem
                          key={item.operationFlag}
                          value={item.operationFlag}
                          title={`${item.operationFlagName} [${item.operationFlag}]`}
                        >
                          <span className="block max-w-[250px] truncate">
                            {item.operationFlagName} [{item.operationFlag}]
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.operationFlag && (
                <p className="text-sm text-red-500">
                  {errors.operationFlag.message}
                </p>
              )}
            </div>
            {mode !== "view" && selectedOperationFlag !== "" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setValue("operationFlag", "", { shouldValidate: true })
                }
              >
                <KeenIcon icon="cross" />
              </Button>
            )}
          </div>
          <div className="flex flex-row justify-end">
            <Label className="text-sm p-1 w-1/4">
              <span className="text-red-500">*</span>Effective Date
            </Label>
            <div className="flex-1">
              <input
                className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400 cursor-not-allowed" : ""}`}
                {...register("effDate")}
                disabled={mode === "view"}
                type="date"
              />
              {errors.effDate && (
                <p className="text-sm text-red-500">{errors.effDate.message}</p>
              )}
            </div>
            {mode !== "view" && effDate !== "" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setValue("effDate", "", { shouldValidate: true })
                }
              >
                <KeenIcon icon="cross" />
              </Button>
            )}
          </div>
          <div className="flex flex-row justify-end">
            <Label className="text-sm p-1 w-1/4">Expiry Date</Label>
            <div className="flex-1">
              <input
                className={`w-full h-[30px] border rounded border-gray-300 bg-white p-1 ${mode === "view" ? "text-gray-400 cursor-not-allowed" : ""}`}
                {...register("expDate")}
                disabled={mode === "view"}
                type="date"
              />
            </div>
            {mode !== "view" && expDate !== null && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setValue("expDate", null, { shouldValidate: true })
                }
              >
                <KeenIcon icon="cross" />
              </Button>
            )}
          </div>
          <div className="flex flex-row justify-end">
            <Label className="text-sm p-1 w-1/4">Use Default Period</Label>
            <div className="flex-1">
              <Controller
                name="defPeriod"
                control={control}
                render={({ field }) => (
                  <>
                    <Label className="mr-3">
                      <input
                        type="radio"
                        value="Y"
                        checked={field.value === "Y"}
                        onChange={(e) => field.onChange(e.target.value)}
                        className={`mr-1 ${mode === "view" ? "cursor-not-allowed" : "cursor-pointer"}`}
                        disabled={mode === "view"}
                      />
                      Yes
                    </Label>
                    <Label>
                      <input
                        type="radio"
                        value="N"
                        checked={field.value === "N"}
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
          {defPeriod === "N" && (
            <>
              <div className="flex flex-row justify-end">
                <Label className="text-sm p-1 w-1/4">Period Type</Label>
                <div className="flex-1">
                  <Controller
                    name="periodType"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Label className="mr-3">
                          <input
                            type="radio"
                            value="Y"
                            checked={field.value === "Y"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className={`mr-1 ${mode === "view" ? "cursor-not-allowed" : "cursor-pointer"}`}
                            disabled={mode === "view"}
                          />
                          Absolute
                        </Label>
                        <Label>
                          <input
                            type="radio"
                            value="N"
                            checked={field.value === "N"}
                            onChange={(e) => field.onChange(e.target.value)}
                            className={`mr-1 ${mode === "view" ? "cursor-not-allowed" : "cursor-pointer"}`}
                            disabled={mode === "view"}
                          />
                          Relative
                        </Label>
                      </>
                    )}
                  />
                </div>
              </div>
              {periodType && (
                <>
                  {periodType === "N" ? (
                    <RelativeFields
                      register={register}
                      mode={mode}
                      errors={errors}
                      control={control}
                      setValue={setValue}
                      watch={watch}
                    />
                  ) : (
                    <AbsoluteFields
                      register={register}
                      errors={errors}
                      mode={mode}
                      control={control}
                      watch={watch}
                      setValue={setValue}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-1 mt-3">
          {mode === "view" ? (
            <>
              <AccessWrapper hasAccess={menuPrivAccess.addStatus}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-300 hover:text-white "
                  onClick={(e) => {
                    e.preventDefault();
                    handleNew();
                  }}
                >
                  New
                </Button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              </AccessWrapper>
              <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </AccessWrapper>
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
      <PopUpDialog
        desc="This action cannot be undone!"
        isOpen={isDeleteOpen}
        handleDialog={setIsDeleteOpen}
        onConfirm={onDeleteConfirm}
        bgOn={false}
        // type="alert"
      />
    </div>
  );
};

export default RatableEventActionContentDetail;
