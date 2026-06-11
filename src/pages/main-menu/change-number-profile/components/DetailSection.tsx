import { useEffect, useState } from "react";
import { FileEdit } from "lucide-react";
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
import { useChangeNumberProfileContext } from "../hooks/useChangeNumberProfileContext";
import { Controller, useForm } from "react-hook-form";
import {
  ChangeNumberProfileForm,
  ChangeNumberProfileSchema,
} from "../schema/ChangeNumberProfileSchemaType";
import { zodResolver } from "@hookform/resolvers/zod";
import Organization, {
  OrgData,
} from "../../upload-simcard/blocks/Organization";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildPayload } from "@/lib/buildPayload";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";

const API_URL_REF = apiConfigRef.ref;

const NumberProfileDetailSection = () => {
  const {
    selectedItem,
    numberTypeList,
    mode,
    setMode,
    areaDetail,
    primaryNe,
    setRefreshTrigger,
    setLastEditedId,
    accNbrClassList,
    menuPrivAccess,
  } = useChangeNumberProfileContext();
  const { PutData } = useCallApi();
  const isDisabled = mode === "view";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditingTriggered, setIsEditingTriggered] = useState<boolean>(false);

  const {
    handleSubmit,
    reset,
    register,
    setValue,
    control,
    formState: { errors },
    watch,
  } = useForm<ChangeNumberProfileForm>({
    resolver: zodResolver(ChangeNumberProfileSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  //  console.log("selectedItem", selectedItem);

  //  console.log("errors", errors);

  useEffect(() => {
    if (selectedItem) {
      setValue(
        "serviceNumber",
        `${selectedItem?.prefix}-${selectedItem?.accNbr}`,
      );
      reset({
        orgName: selectedItem?.orgName,
        accNbrId: selectedItem?.accNbrId,
        prefix: selectedItem?.prefix,
        accNbr: selectedItem?.accNbr,
        staffId: selectedItem?.staffId,
        orgId: selectedItem?.orgId,
        accNbrClassId: selectedItem?.accNbrClassId,
        accNbrTypeId: selectedItem?.accNbrTypeId,
        accNbrState: selectedItem?.accNbrState,
        hlrId: selectedItem?.hlrId,
        neInfo: selectedItem?.neInfo,
        areaId: selectedItem?.areaId,
        nbrClassJudgeId: selectedItem?.nbrClassJudgeId,
        stateDate: selectedItem?.stateDate,
        comments: selectedItem?.comments,
        ppsPwd: selectedItem?.ppsPwd,
        preCharging: selectedItem?.preCharging,
        peerOperatorCode: selectedItem?.peerOperatorCode,
        npAuthCode: selectedItem?.npAuthCode,
        spId: selectedItem?.spId,
        isBindingFlag: selectedItem?.isBindingFlag,
        partyType: null,
        partyCode: null,
      });
    } else {
      setValue("serviceNumber", undefined);
      setValue("orgName", undefined);
      setValue("orgId", undefined);
      reset({
        serviceNumber: undefined,
        orgName: undefined,
        accNbrId: undefined,
        prefix: undefined,
        accNbr: undefined,
        staffId: undefined,
        orgId: undefined,
        accNbrClassId: undefined,
        accNbrTypeId: undefined,
        accNbrState: undefined,
        hlrId: undefined,
        neInfo: undefined,
        areaId: undefined,
        nbrClassJudgeId: undefined,
        stateDate: undefined,
        comments: undefined,
        ppsPwd: undefined,
        preCharging: undefined,
        peerOperatorCode: undefined,
        npAuthCode: undefined,
        spId: undefined,
        isBindingFlag: undefined,
        partyType: undefined,
        partyCode: undefined,
      });
    }
  }, [selectedItem, reset]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOrganization = (org: OrgData) => {
    setValue("orgName", org.orgName);
    setValue("orgId", org.orgId);
  };

  const handleEdit = () => {
    //  console.log("trigger mod");
    setIsEditingTriggered(true);
    setMode("edit");
  };

  const handleCancel = () => {
    setMode("view");
  };

  const onSubmit = async (data: ChangeNumberProfileForm) => {
    if (isEditingTriggered) {
      setIsEditingTriggered(false);
      return;
    }
    if (!selectedItem) return;

    try {
      if (mode === "edit") {
        const payload = buildPayload(data);
        delete payload.serviceNumber;
        delete payload.orgName;

        setIsSubmitting(true);
        const response = await PutData(
          `${API_URL_REF}/change-number-profile/mod-acc-nbr-and-sim-card`,
          payload,
        );

        if (response?.status) {
          toast.success("Success");
          setRefreshTrigger((prev) => prev + 1);
          const lastId = selectedItem.accNbrId;
          setLastEditedId(lastId ?? null);
          setMode("view");
        } else {
          toast.error("Failed");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          {/* Service Number */}
          <div>
            <Label className="text-sm text-gray-700 mb-2 block">
              Service Number
            </Label>
            <Input
              type="text"
              readOnly
              disabled
              className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`}
              {...register("serviceNumber")}
              placeholder="Service Number..."
            />
          </div>

          {/* Number Type */}
          <div>
            <Label className="text-sm text-gray-700 mb-2 block">
              <span className="text-red-500">*</span> Number Type
            </Label>
            <Controller
              name="accNbrTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : undefined}
                  disabled={mode === "view"}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="---Please Select---" />
                  </SelectTrigger>
                  <SelectContent>
                    {numberTypeList.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.accNbrTypeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accNbrTypeId && (
              <span className="text-red-500">
                {errors.accNbrTypeId.message}
              </span>
            )}
          </div>

          {/* Number Grade */}
          <div>
            <Label className="text-sm text-gray-700 mb-2 block">
              Number Grade
            </Label>
            <Controller
              name="accNbrClassId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) =>
                    field.onChange(val ? Number(val) : undefined)
                  }
                  value={field.value ? String(field.value) : undefined}
                  disabled={mode === "view"}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="---Please Select---" />
                  </SelectTrigger>
                  <SelectContent>
                    {accNbrClassList.length > 0 &&
                      accNbrClassList.map((item) => (
                        <SelectItem
                          key={item.accNbrClassId}
                          value={item.accNbrClassId}
                        >
                          {item.accNbrClassName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Company */}
          <div>
            <Label className="text-sm text-gray-700 mb-2 block">Company</Label>
            <div className="relative">
              <Input
                type="text"
                disabled={isDisabled}
                readOnly={!isDisabled}
                placeholder="Select Company"
                className={`h-9 pr-10 ${isDisabled ? "bg-gray-50 " : "bg-white"}`}
                {...register("orgName")}
              />

              <button
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400  ${isDisabled ? "cursor-not-allowed" : "cursor-pointer hover:text-gray-600"}`}
                type="button"
                onClick={handleOpenModal}
                disabled={isDisabled}
              >
                <FileEdit className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {/* Telkom Region */}
          <div>
            <Label className="text-sm text-gray-700 mb-2 block">
              <span className="text-red-500">*</span> Telkom Region
            </Label>
            <Controller
              name="areaId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : undefined}
                  disabled={mode === "view"}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="---Please Select---" />
                  </SelectTrigger>
                  <SelectContent>
                    {areaDetail.map((item) => (
                      <SelectItem key={item.areaId} value={String(item.areaId)}>
                        {item.areaName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.areaId && (
              <span className="text-red-500">{errors.areaId.message}</span>
            )}
          </div>

          {/* Primary NE */}
          <div>
            <Label className="text-sm text-gray-700 mb-2 block">
              <span className="text-red-500">*</span> Primary NE
            </Label>
            <Controller
              name="hlrId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : undefined}
                  disabled={mode === "view"}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="---Please Select---" />
                  </SelectTrigger>
                  <SelectContent>
                    {primaryNe.map((item) => (
                      <SelectItem key={item.hlrId} value={String(item.hlrId)}>
                        {item.hlrName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.hlrId && (
              <span className="text-red-500">{errors.hlrId.message}</span>
            )}
          </div>

          {/* Remarks */}
          <div className="col-span-3">
            <Label className="text-sm text-gray-700 mb-2 block">Remarks</Label>
            <Input
              type="text"
              {...register("comments")}
              disabled={isDisabled}
              placeholder="Comments..."
              className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`}
            />
          </div>
        </div>
        {/* Action Buttons - Hanya Edit di view mode */}
        <div className="flex justify-end gap-3 mt-6">
          {mode === "view" ? (
            <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleEdit}
                disabled={
                  selectedItem?.accNbrState === "C" ||
                  selectedItem?.accNbrState === "T" ||
                  !selectedItem
                }
              >
                Edit
              </Button>
            </AccessWrapper>
          ) : (
            <>
              <Button
                variant="outline"
                size="default"
                className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </form>

      {/* Organization Selector Modal */}
      <Organization
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        organizationData={handleOrganization}
      />
    </>
  );
};

export default NumberProfileDetailSection;
