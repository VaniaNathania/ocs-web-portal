import { Controller, useForm } from "react-hook-form";
import { SimcardProfileForm, SimcardProfileSchema } from "../schema/SimcardProfileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import Organization, { OrgData } from "../../upload-simcard/blocks/Organization";
import { buildPayload } from "@/lib/buildPayload";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessWrapper } from "../../role-management/hook/useRoleCheck";
import { useSimcardProfileContext } from "../hooks/SimcardProfileContext";
import { Button } from "@/components/ui/button";
import { FileEdit } from "lucide-react";
import { SimStateDatas } from "../mockDatas/mockDatas";
import { KeenIcon } from "@/components";
import { boundLabel } from "../utils/helper";

const API_URL = apiConfigRef.ref;

const SimcardDetail = () => {
  const { menuPrivAccess, mode, setMode, selectedRow, primaryNe, areaDetail, simType } = useSimcardProfileContext();
  //   const { PutData } = useCallApi();
  const isDisabled = mode === "view";
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
  } = useForm<SimcardProfileForm>({
    resolver: zodResolver(SimcardProfileSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const boundVal = watch("isBindingFlag");
  const simTypeVal = watch("simTypeId");
  const areaIdVal = watch("areaId");
  const primaryNeVal = watch("hlrId");
  const orgIdVal = watch("orgId");
  const orgNameVal = watch("orgName");

  //  console.log("selectedItem", selectedItem);

  console.log("errors", errors);

  const defaultFormValues = {
    orgName: selectedRow?.orgName,
    iccid: selectedRow?.iccid,
    imsi: selectedRow?.imsi,
    simTypeId: selectedRow?.simTypeId,
    simState: selectedRow?.simState,
    areaId: selectedRow?.areaId,
    hlrId: selectedRow?.hlrId,
    orgId: selectedRow?.orgId,
    comments: selectedRow?.comments,
    spId: selectedRow?.spId,
    isBindingFlag: selectedRow?.isBindingFlag,
  };

  useEffect(() => {
    if (selectedRow && primaryNe.length > 0 && areaDetail.length > 0 && simType.length > 0) {
      // setValue("serviceNumber", `${selectedRow?.prefix}-${selectedRow?.accNbr}`);
      reset(defaultFormValues);
    } else {
      // setValue("serviceNumber", undefined);
      // setValue("orgName", undefined);
      // setValue("orgId", undefined);
      reset({
        serviceNumber: undefined,
        orgName: undefined,
        accNbrId: undefined,
        prefix: undefined,
        accNbr: undefined,
        orgId: 0,
        iccid: undefined,
        imsi: undefined,
        simTypeId: 0,
        simState: undefined,
        areaId: 0,
        hlrId: 0,
        comments: undefined,
        spId: undefined,
        isBindingFlag: undefined,
      });
    }
  }, [selectedRow, primaryNe, areaDetail, simType, reset]);

  const handleOrganization = (org: OrgData) => {
    setValue("orgName", org.orgName, { shouldValidate: true, shouldDirty: true });
    setValue("orgId", org.orgId, { shouldValidate: true, shouldDirty: true });
  };

  const handleEdit = () => {
    //  console.log("trigger mod");
    setIsEditingTriggered(true);
    setMode("edit");
  };

  const handleCancel = () => {
    reset(defaultFormValues);

    setMode("view");
  };

  const onSubmit = async (data: SimcardProfileForm) => {
    // if (isEditingTriggered) {
    //   setIsEditingTriggered(false);
    //   return;
    // }
    // if (!selectedItem) return;
    // try {
    //   if (mode === "edit") {
    //     const payload = buildPayload(data);
    //     delete payload.serviceNumber;
    //     delete payload.orgName;
    //     setIsSubmitting(true);
    //     const response = await PutData(
    //       `${API_URL}/change-number-profile/mod-acc-nbr-and-sim-card`,
    //       payload,
    //     );
    //     if (response?.status) {
    //       toast.success("Success");
    //       setRefreshTrigger((prev) => prev + 1);
    //       const lastId = selectedItem.accNbrId;
    //       setLastEditedId(lastId ?? null);
    //       setMode("view");
    //     } else {
    //       toast.error("Failed");
    //     }
    //   }
    // } catch (err) {
    //   console.error(err);
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-none w-full px-4 py-4">
          <div className="border rounded-lg shadow-sm w-full bg-white p-6">
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              {/* ICCID */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">
                  <span className="text-red-500">*</span> ICCID
                </Label>
                <Input type="text" disabled className="h-9 bg-gray-50" {...register("iccid")} placeholder={mode === "edit" ? "Enter ICCID..." : ""} />
                {errors.iccid && <span className="text-red-500 text-sm">{errors.iccid.message}</span>}
              </div>

              {/* IMSI */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">
                  <span className="text-red-500">*</span> IMSI
                </Label>
                <Input type="text" disabled className="h-9 bg-gray-50" {...register("imsi")} placeholder={mode === "edit" ? "Enter IMSI..." : ""} />
                {errors.imsi && <span className="text-red-500 text-sm">{errors.imsi.message}</span>}
              </div>

              <div>
                <Label>Inject Flag</Label>
                <div className="flex gap-6 border-red-500">
                  <Label className="flex items-center text-center gap-1">
                    Yes
                    <Input type="radio" size={"sm"} value="Y" checked={boundVal === "Y"} onChange={(e) => setValue("isBindingFlag", e.target.value)} disabled={isDisabled} />
                  </Label>

                  <Label className="flex items-center text-center gap-1">
                    No
                    <Input type="radio" size={"sm"} value="N" checked={boundVal === "N"} onChange={(e) => setValue("isBindingFlag", e.target.value)} disabled={isDisabled} />
                  </Label>
                </div>
              </div>

              {/* ESN */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">ESN</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("esn")} placeholder={mode === "edit" ? "Enter ESN..." : ""} />
              </div>

              {/* IMSI2 */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">IMSI2</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("imsi2")} placeholder={mode === "edit" ? "Enter IMSI..." : ""} />
              </div>

              {/* ADM */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">ADM</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("adm")} placeholder={mode === "edit" ? "Enter ADM..." : ""} />
              </div>

              {/* SIM CARD TYPE */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">
                  <span className="text-red-500">*</span> Sim Card Type
                </Label>
                <Controller
                  name="simTypeId"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center">
                      <Select
                        onValueChange={(val) => {
                          // field.onChange(Number(val));
                          setValue("simTypeId", Number(val), { shouldValidate: true, shouldDirty: true });
                        }}
                        value={field.value ? String(field.value) : ""}
                        disabled={isDisabled}
                      >
                        <SelectTrigger className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`}>
                          <SelectValue placeholder={mode === "edit" && "---Please Select---"} />
                        </SelectTrigger>
                        <SelectContent>
                          {simType.map((item) => (
                            <SelectItem key={item.simTypeId} value={String(item.simTypeId)}>
                              {item.simTypeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mode === "edit" && simTypeVal !== 0 && (
                        <Button
                          variant={"ghost"}
                          size={"sm"}
                          onClick={() => {
                            setValue("simTypeId", 0, { shouldValidate: true, shouldDirty: true });
                          }}
                          className="p-2"
                        >
                          <KeenIcon icon="cross" />
                        </Button>
                      )}
                    </div>
                  )}
                />
                {errors.simTypeId && <span className="text-red-500 text-sm">{errors.simTypeId.message}</span>}
              </div>

              {/* SIM CARD STATE */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">
                  <span className="text-red-500">*</span> Sim Card State
                </Label>
                <Controller
                  name="simState"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : ""} disabled>
                      <SelectTrigger className="h-9 bg-gray-50">
                        <SelectValue placeholder={mode === "edit" && "---Please Select---"} />
                      </SelectTrigger>
                      <SelectContent>
                        {SimStateDatas.map((item) => (
                          <SelectItem key={item.simState} value={String(item.simState)}>
                            {item.simStateName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.simState && <span className="text-red-500 text-sm">{errors.simState.message}</span>}
              </div>

              {/* CHECK SUM */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">Check Sum</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("checkSum")} placeholder={mode === "edit" ? "Enter CHECK SUM..." : ""} />
              </div>

              {/* Organization */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">
                  <span className="text-red-500">*</span> Organization
                </Label>
                <div className="flex items-center">
                  <div className="relative w-full" onClick={() => setIsOpen(true)}>
                    <Input type="text" disabled={isDisabled} readOnly={!isDisabled} placeholder={mode === "edit" ? "Select Organization..." : ""} className={`h-9 pr-10 ${isDisabled ? "bg-gray-50 " : "bg-white"}`} {...register("orgName")} />
                    <Button className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:bg-white`} type="button" size={"sm"} variant={"ghost"} disabled={isDisabled}>
                      <FileEdit className="h-[18px] w-[18px]" />
                    </Button>
                  </div>
                  {mode === "edit" && orgIdVal !== 0 && orgNameVal && (
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      onClick={() => {
                        setValue("orgId", 0, { shouldValidate: true, shouldDirty: true });
                        setValue("orgName", "", { shouldValidate: true, shouldDirty: true });
                      }}
                      className="p-2"
                    >
                      <KeenIcon icon="cross" />
                    </Button>
                  )}
                </div>
                {errors.orgId && <span className="text-red-500 text-sm">{errors.orgId.message}</span>}
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
                    <div className="flex items-center">
                      <Select
                        onValueChange={(val) => {
                          // field.onChange(Number(val));
                          setValue("areaId", Number(val), { shouldValidate: true, shouldDirty: true });
                        }}
                        value={field.value ? String(field.value) : ""}
                        disabled={isDisabled}
                      >
                        <SelectTrigger className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`}>
                          <SelectValue placeholder={mode === "edit" && "---Please Select---"} />
                        </SelectTrigger>
                        <SelectContent>
                          {areaDetail.map((item) => (
                            <SelectItem key={item.areaId} value={String(item.areaId)}>
                              {item.areaName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mode === "edit" && areaIdVal !== 0 && (
                        <Button
                          variant={"ghost"}
                          size={"sm"}
                          onClick={() => {
                            setValue("areaId", 0, { shouldValidate: true, shouldDirty: true });
                          }}
                          className="p-2"
                        >
                          <KeenIcon icon="cross" />
                        </Button>
                      )}
                    </div>
                  )}
                />
                {errors.areaId && <span className="text-red-500 text-sm">{errors.areaId.message}</span>}
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
                    <div className="flex items-center">
                      <Select
                        onValueChange={(val) => {
                          // field.onChange(Number(val));
                          setValue("hlrId", Number(val), { shouldValidate: true, shouldDirty: true });
                        }}
                        value={field.value ? String(field.value) : ""}
                        disabled={isDisabled}
                      >
                        <SelectTrigger className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`}>
                          <SelectValue placeholder={mode === "edit" && "---Please Select---"} />
                        </SelectTrigger>
                        <SelectContent>
                          {primaryNe.map((item) => (
                            <SelectItem key={item.hlrId} value={String(item.hlrId)}>
                              {item.hlrName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mode === "edit" && primaryNeVal !== 0 && (
                        <Button
                          variant={"ghost"}
                          size={"sm"}
                          onClick={() => {
                            setValue("hlrId", 0, { shouldValidate: true, shouldDirty: true });
                          }}
                          className="p-2"
                        >
                          <KeenIcon icon="cross" />
                        </Button>
                      )}
                    </div>
                  )}
                />
                {errors.hlrId && <span className="text-red-500 text-sm">{errors.hlrId.message}</span>}
              </div>

              {/* PIN1 */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">PIN1</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("pin1")} placeholder={mode === "edit" ? "Enter PIN1..." : ""} />
              </div>

              {/* PUK1 */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">PUK1</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("puk1")} placeholder={mode === "edit" ? "Enter PUK1..." : ""} />
              </div>

              {/* KI */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">KI</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("ki1")} placeholder={mode === "edit" ? "Enter KI..." : ""} />
              </div>

              {/* PIN2 */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">PIN2</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("pin2")} placeholder={mode === "edit" ? "Enter PIN2..." : ""} />
              </div>

              {/* PUK2 */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">PUK2</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("puk2")} placeholder={mode === "edit" ? "Enter PUK2..." : ""} />
              </div>

              {/* KI2 */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">KI2</Label>
                <Input type="text" disabled={isDisabled} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} {...register("ki2")} placeholder={mode === "edit" ? "Enter KI2..." : ""} />
              </div>

              {/* BOUND */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">BOUND</Label>
                <Input type="text" disabled className="h-9 bg-gray-50" value={boundVal ? boundLabel[boundVal] : ""} placeholder={mode === "edit" ? "Enter BOUND..." : ""} />
              </div>

              {/* SERVICE NUMBER */}
              <div>
                <Label className="text-sm text-gray-700 mb-2 block">SERVICE NUMBER</Label>
                <Input type="text" disabled {...register("serviceNumber")} className="h-9 bg-gray-50" placeholder={mode === "edit" ? "Enter SERVICE NUMBER..." : ""} />
              </div>

              {/* Remarks */}
              <div className="col-span-3">
                <Label className="text-sm text-gray-700 mb-2 block">Remarks</Label>
                <Input type="text" {...register("comments")} disabled={isDisabled} placeholder={mode === "edit" ? "Enter Comments..." : ""} className={`h-9 ${isDisabled ? "bg-gray-50" : "bg-white"}`} />
              </div>
            </div>
            {/* Action Buttons - Hanya Edit di view mode */}
            <div className="flex justify-end gap-3 mt-6">
              {mode === "view" ? (
                <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
                  <Button type="button" variant="outline" size="default" onClick={handleEdit} disabled={!selectedRow || selectedRow.simState !== "I"}>
                    Edit
                  </Button>
                </AccessWrapper>
              ) : (
                <>
                  <Button variant="outline" size="default" className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                  <Button type="button" variant="outline" size="default" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Organization Selector Modal */}
      <Organization isOpen={isOpen} onClose={() => setIsOpen(false)} organizationData={handleOrganization} />
    </>
  );
};

export default SimcardDetail;
