import { apiConfig } from "@/config/api.config"
import { useRecurringPriceContext } from "../hooks"
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext"
import { useCallApi } from "@/hooks"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Info, RefreshCw, Trash2 } from "lucide-react"
import z from "zod"
import { recurringCreateRatePlanSchema } from "../types/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SearchSelect } from "@/components/common/SearchSelect"

type EventFeature = {
  priority: number
  mappingSrcType: string
  mappingSrcValue: string
  mappingDesValue: string
  mappingDesType: string
  labelShow: string
}

type DetailItem = {
  priority: number
  mappingSrcType: string
  mappingSrcValue: string
  mappingDesValue: string
  mappingDesType: string
  labelShow: string
}

const initialDetailsItem: DetailItem = {
  priority: 1,
  mappingSrcType: "1",
  mappingSrcValue: "",
  mappingDesValue: "",
  mappingDesType: "",
  labelShow: "",
}

const API_URL = apiConfig.service_price_plan
type RecurringCreateRatePlanForm = z.infer<typeof recurringCreateRatePlanSchema>

const CreateRatePlanDialog = () => {
  const { showRatePlanDialog, handleRatePlanDialog, selectedEvent, selectedRatePlan, doGetListRatePlan } = useRecurringPriceContext()
  const { GetData, PostData } = useCallApi()
  const { selectedOfferVerId } = usePortalData()

  const methods = useForm<RecurringCreateRatePlanForm>({
    resolver: zodResolver(recurringCreateRatePlanSchema),
    defaultValues: {
      offerVerId: selectedOfferVerId || 0,
      reId: selectedEvent || 0,
      ratePlanName: undefined,
      ratePlanCode: null,
      remarks: null,
      ratePlanType: "",
      templateFlag: "N",
      catalogId: null,
      spId: 0,
      ratePlanZones: null,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = methods

  const [eventFeatures, setEventFeatures] = useState<EventFeature[]>([])
  const [eventMenu, setEventMenu] = useState<RecurringEvents[]>([])

  const [detailItems, setDetailItems] = useState<DetailItem>(initialDetailsItem)
  const [sourceType, setSourceType] = useState<
    {
      mappingSrcType: string
      mappingSrcTypeName: string
    }[]
  >([])
  const [eventFeaturesType, setEventFeaturesType] = useState<
    {
      reAttrId: number
      reAttrName: string
    }[]
  >([])
  const [enumerationType, setEnumerationType] = useState<
    {
      enumType: string
      enumTypeName: string
    }[]
  >([])
  const [zoneMaps, setZoneMaps] = useState<
    {
      zoneMapId: number
      zoneMapName: string
    }[]
  >([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const RestForm = () => {
    reset()
  }

  const fetchEvent = async () => {
    try {
      const reType = 9
      const response = await GetData(`${API_URL}/event/list`, {
        offerVerId: selectedOfferVerId,
        reType: 9,
      })
      if (response && response.data) {
        setEventMenu(response.data)
      }
    } catch (error) {
      console.error("Error fetching event data:", error)
      toast.error("Failed to load event data")
    }
  }

  const findSelectedEvent = () => {
    const reId = methods.watch("reId")
    const log = eventMenu.find((event) => event.reId === reId) || null
    // console.log(eventMenu);
    return log
    // return (
    //   eventMenu.find((event) => event.recurringReType === String(reId)) || null
    // );
  }

  const fetchZoneMap = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/zone-map/list`, {})

      if (response.status) {
        setZoneMaps(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error("Error fetching zone map")
    }
  }

  const fetchSourceType = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/source-type/list`, {})

      if (response.status) {
        setSourceType(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error("Error fetching source type")
    }
  }

  const fetchEventFeature = async (reAttrName?: string) => {
    try {
      const response = await GetData(`${API_URL}/mapping/re-attr/list`, {
        reType: 2,
        reAttrName: !reAttrName ? undefined : reAttrName,
        spId: 0,
      })

      if (response.status) {
        setEventFeaturesType(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error("Error fetching event feature")
    }
  }

  const fetchEnumeration = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/enum/list`, {})

      if (response.status) {
        setEnumerationType(response.data)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error("Error fetching enumeration")
    }
  }

  const doCreateRatePlan = async (formField: RecurringCreateRatePlanForm) => {
    setIsSubmitting(true)
    try {
      const response = await PostData(`${API_URL}/rate-plan/create`, formField)

      if (response?.status) {
        toast.success(response.message)
        handleRatePlanDialog(false, "create")
        doGetListRatePlan(selectedEvent ?? 0)
      } else {
        toast.error(response?.message)
      }
    } catch (error) {
      toast.error("Error creating Rate Plan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = (data: RecurringCreateRatePlanForm) => {
    if (eventFeatures.length > 0) {
      setValue("ratePlanZones", eventFeatures)

      const allNull = Object.values(data.ratePlanZones ?? {}).every((v) => v == null)
      const cleaned = {
        ...data,
        ratePlanZones: allNull ? null : data.ratePlanZones,
      }
      doCreateRatePlan(cleaned)
    } else {
      doCreateRatePlan(data)
    }
  }

  const addNewDetailItem = (data: DetailItem) => {
    if (!data.mappingSrcType || !data.mappingSrcValue || !data.mappingDesType || (data.mappingDesType === "0" && !data.mappingDesValue)) {
      toast.error("Please fill in all required fields.")
      return
    }

    const nextPriority = eventFeatures.length > 0 ? Math.max(...eventFeatures.map((item) => item.priority)) + 1 : 1

    const newItem: DetailItem = {
      priority: nextPriority,
      mappingSrcType: data.mappingSrcType,
      mappingSrcValue: data.mappingSrcValue,
      mappingDesValue: data.mappingDesValue,
      mappingDesType: data.mappingDesType,
      labelShow: data.labelShow,
    }

    setEventFeatures([...eventFeatures, newItem])
    setValue("ratePlanZones", [...(watch("ratePlanZones") ?? []), newItem])
  }

  const removeEventFeature = (id: number) => {
    const updatedFeatures = eventFeatures.filter((feature) => feature.priority !== id)

    setEventFeatures(updatedFeatures)
    setValue("ratePlanZones", updatedFeatures.length > 0 ? updatedFeatures : null)
  }

  useEffect(() => {
    const selectedSrcName = detailItems.mappingSrcType === "1" ? (eventFeaturesType.find((ev) => String(ev.reAttrId) === detailItems.mappingSrcValue)?.reAttrName ?? "") : detailItems.mappingSrcType === "2" ? (enumerationType.find((et) => et.enumType === detailItems.mappingSrcValue)?.enumTypeName ?? "") : ""

    const descDisplay = detailItems.mappingDesType === "0" ? (zoneMaps.find((zm) => String(zm.zoneMapId) === detailItems.mappingDesValue)?.zoneMapName ?? "") : detailItems.mappingDesType === "1" ? detailItems.mappingDesValue : ""

    const defaultLabel = `${selectedSrcName} - ${descDisplay}`

    setDetailItems((prev) => ({
      ...prev,
      labelShow: defaultLabel,
    }))
  }, [detailItems.mappingSrcType, detailItems.mappingSrcValue, detailItems.mappingDesType, detailItems.mappingDesValue, eventFeaturesType, enumerationType, zoneMaps])

  useEffect(() => {
    fetchZoneMap()
    fetchSourceType()
    fetchEventFeature()
    fetchEnumeration()
    fetchEvent()
  }, [])

  useEffect(() => {
    if (detailItems.mappingDesType !== "0" && detailItems.mappingDesValue !== "") {
      setDetailItems((prev) => ({
        ...prev,
        mappingDesValue: "",
      }))
    }
  }, [detailItems.mappingDesValue])

  useEffect(() => {
    setDetailItems((prev) => ({
      ...prev,
      mappingSrcValue: "",
      labelShow: "",
    }))
  }, [detailItems.mappingSrcType])

  useEffect(() => {
    if (!showRatePlanDialog.show) return

    if (showRatePlanDialog.show) {
      setValue("reId", selectedEvent ?? 0)
      setValue("offerVerId", selectedOfferVerId ?? 0)

      setEventFeatures([])
      setDetailItems(initialDetailsItem)
    }
  }, [showRatePlanDialog.show, selectedEvent, selectedOfferVerId])

  return (
    <Dialog open={showRatePlanDialog.show} onOpenChange={(open) => handleRatePlanDialog(open, showRatePlanDialog.mode)}>
      <DialogContent className="container-fixed max-w-[1200px] max-h-[90vh] flex flex-col p-5 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Rate Plan - Create</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogBody className="scrollable overflow-y-auto">
          <div className="flex flex-col">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="card-body grid gap-5">
                {/* Event Name */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                      <span className="text-red-500">*</span>Event Name
                    </label>
                    <div className="w-full">
                      <Input className={`${errors.reId ? "border-red-500" : ""} bg-gray-100`} type="text" value={findSelectedEvent()?.reName || "Event not found"} disabled placeholder="Event Name" />
                      {errors.reId && <div className="text-red-500 text-xs mt-1">{errors.reId.message}</div>}
                    </div>
                  </div>
                </div>

                {/* Rate Plan Name */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                      <span className="text-red-500">*</span>Rate Plan Name
                    </label>
                    <div className="w-full">
                      <Input className={errors.ratePlanName ? "border-red-500" : ""} type="text" {...register("ratePlanName")} placeholder="Rate Plan Name" />
                      {errors.ratePlanName && <div className="text-red-500 text-xs mt-1">{errors.ratePlanName.message}</div>}
                    </div>
                  </div>
                </div>

                {/* Rate Plan Code */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                      Rate Plan Code
                    </label>
                    <div className="w-full">
                      <Input
                        type="text"
                        {...register("ratePlanCode")}
                        placeholder="Rate Plan Code"
                      />
                      {/* {errors.ratePlanCode && (
                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                          {errors.ratePlanCode.message}
                        </p>
                      )} */}
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">Remarks</label>
                    <div className="w-full">
                      <Input type="text" {...register("remarks")} placeholder="Remarks" />
                    </div>
                  </div>
                </div>

                {/* Rate Plan Type */}
                <div className="w-full">
                  <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                    <label className="form-label flex items-center gap-1 min-w-32 max-w-32">
                      Rate Plan Type <span className="text-red-500">*</span>
                    </label>
                    <div className="w-full">
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ratePlanType"
                            value="1"
                            checked={watch("ratePlanType") === "1"}
                            onChange={(e) => {
                              setValue("ratePlanType", e.target.value)
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          Rating
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ratePlanType"
                            value="4"
                            checked={watch("ratePlanType") === "4"}
                            onChange={(e) => {
                              setValue("ratePlanType", e.target.value)
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          Accumulation
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ratePlanType"
                            value="3"
                            checked={watch("ratePlanType") === "3"}
                            onChange={(e) => {
                              setValue("ratePlanType", e.target.value)
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          Benefit
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ratePlanType"
                            value="5"
                            checked={watch("ratePlanType") === "5"}
                            onChange={(e) => {
                              setValue("ratePlanType", e.target.value)
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          Tax
                        </label>
                      </div>
                      {errors.ratePlanType && <p className="text-red-500 text-xs flex items-center gap-1 mt-1">{errors.ratePlanType.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Event Feature Section */}
                <div className="w-full mt-8">
                  <h3 className="text-lg font-semibold mb-4">Event Feature</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Source Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Source Type Value</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Destination</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Destination Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Label</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventFeatures.length! > 0 ? (
                          <>
                            {eventFeatures.map((feature, index) => {
                              const sourceTypeName = sourceType.find((src) => src.mappingSrcType === feature.mappingSrcType)?.mappingSrcTypeName ?? "-"

                              const getSourceValueName = () => {
                                if (feature.mappingSrcType === "1") {
                                  return eventFeaturesType.find((ev) => ev.reAttrId.toString() === feature.mappingSrcValue)?.reAttrName ?? "-"
                                } else if (feature.mappingSrcType === "2") {
                                  return enumerationType.find((en) => en.enumType === feature.mappingSrcValue)?.enumTypeName ?? "-"
                                }
                                return "-"
                              }

                              const mappingDescValueName = feature.mappingDesType === "0" ? "Zone Map" : feature.mappingDesType === "1" ? "Fix" : "-"

                              const zoneMapName = zoneMaps.find((z) => z.zoneMapId.toString() === feature.mappingDesValue)?.zoneMapName ?? "-"

                              return (
                                <tr key={index} className="border-t">
                                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                                  <td className="px-4 py-3 text-sm">{sourceTypeName}</td>
                                  <td className="px-4 py-3 text-sm">{getSourceValueName()}</td>
                                  <td className="px-4 py-3 text-sm">{mappingDescValueName}</td>
                                  <td className="px-4 py-3 text-sm">{zoneMapName}</td>
                                  <td className="px-4 py-3 text-sm">{feature.labelShow}</td>
                                  <td className="px-4 py-3 text-sm">
                                    <Button type="button" variant="outline" size="icon" onClick={() => removeEventFeature(feature.priority)} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                          </>
                        ) : (
                          <tr className="border-t">
                            <td className="px-4 py-6 text-sm text-center align-middle text-muted-foreground" colSpan={7}>
                              No event features added
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info Message */}
                <div className="w-full">
                  <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p>If you add event properties, the rate plan will be a mapping rate plan, otherwise a single one.</p>
                      <p>Drag the items in the list to change their priorities.</p>
                    </div>
                  </div>
                </div>

                {/* Detail Section */}
                <div className="w-full mt-8">
                  <h3 className="text-lg font-semibold mb-4">Detail</h3>
                  <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Source Type */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          <span className="text-red-500">*</span>Source Type
                        </label>
                        <Select
                          value={detailItems.mappingSrcType || ""}
                          onValueChange={(value) =>
                            setDetailItems({
                              ...detailItems,
                              mappingSrcType: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Source Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {sourceType.map((type) => (
                              <SelectItem key={type.mappingSrcType} value={type.mappingSrcType}>
                                {type.mappingSrcTypeName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Event Feature */}
                      {detailItems.mappingSrcType === "1" && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            <span className="text-red-500">*</span>Event Feature
                          </label>

                          <Select
                            value={detailItems.mappingSrcValue?.toString() || ""}
                            onValueChange={(value) =>
                              setDetailItems({
                                ...detailItems,
                                mappingSrcValue: String(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Event Feature" />
                            </SelectTrigger>

                            <SearchSelect
                              onSearch={(query: string) => fetchEventFeature(query)}
                              onSelect={(value) =>
                                setDetailItems({
                                  ...detailItems,
                                  mappingSrcValue: String(value),
                                })
                              }
                              selectedValue={detailItems.mappingSrcValue?.toString()}
                            >
                              {eventFeaturesType.map((type) => (
                                <SelectItem key={type.reAttrId} value={String(type.reAttrId)}>
                                  {type.reAttrName}
                                </SelectItem>
                              ))}
                            </SearchSelect>
                          </Select>
                        </div>
                      )}

                      {detailItems.mappingSrcType === "2" && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            <span className="text-red-500">*</span>Enumeration
                          </label>
                          <Select
                            value={detailItems.mappingSrcValue}
                            onValueChange={(value) =>
                              setDetailItems({
                                ...detailItems,
                                mappingSrcValue: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Enumeration" />
                            </SelectTrigger>
                            <SelectContent>
                              {enumerationType.map((type) => (
                                <SelectItem key={type.enumType} value={String(type.enumType)}>
                                  {type.enumTypeName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Destination */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          <span className="text-red-500">*</span>Destination
                        </label>
                        <Select
                          value={detailItems.mappingDesType}
                          onValueChange={(value) =>
                            setDetailItems({
                              ...detailItems,
                              mappingDesType: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Destination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Zone Map</SelectItem>
                            <SelectItem value="1">Fix</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Zone Map */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {detailItems.mappingDesType === "0" && <span className="text-red-500 ml-1">*</span>}
                          Zone Map
                        </label>
                        <Select
                          value={detailItems.mappingDesValue}
                          disabled={detailItems.mappingDesType !== "0"}
                          onValueChange={(value) =>
                            setDetailItems({
                              ...detailItems,
                              mappingDesValue: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Zone Map" />
                          </SelectTrigger>
                          <SelectContent>
                            {zoneMaps.map((zoneMap) => (
                              <SelectItem key={zoneMap.zoneMapId} value={String(zoneMap.zoneMapId)}>
                                {zoneMap.zoneMapName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Label */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                          <span className="text-red-500">*</span>Label
                        </label>
                        <Input
                          type="text"
                          value={detailItems.labelShow}
                          onChange={(e) =>
                            setDetailItems({
                              ...detailItems,
                              labelShow: e.target.value,
                            })
                          }
                          placeholder="Label"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" size="sm" onClick={() => addNewDetailItem(detailItems)}>
                        New
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-5 mt-8">
                  <Button type="button" variant="outline" onClick={() => handleRatePlanDialog(false, "create")}>
                    Cancel
                  </Button>
                  <Button variant="default" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : null}
                    {isSubmitting ? "Creating..." : "OK"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export default CreateRatePlanDialog
