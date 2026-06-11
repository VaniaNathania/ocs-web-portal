import React, { useEffect, useState } from "react";
import { useCallApi } from "@/hooks";
import { apiConfig } from "@/config/api.config";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Info, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface RatePlanZone {
  priority: number;
  mappingSrcType: string;
  mappingSrcValue: string;
  mappingDesType: string;
  mappingDesValue: string;
  labelShow: string;
  ratePlanZoneId?: number; // Optional untuk data yang sudah ada
}

interface MappingZoneTabProps {
  formField: any;
  setFormField: any;
  ratePlanId?: number | null; // Add ratePlanId prop
  isReadOnly: boolean;
}

const API_URL = apiConfig.service_price_plan;

const MappingZoneTab: React.FC<MappingZoneTabProps> = ({
  formField,
  setFormField,
  ratePlanId,
  isReadOnly,
}) => {
  const { GetData } = useCallApi();

  // State untuk dropdown options
  const [sourceType, setSourceType] = useState<
    {
      mappingSrcType: string;
      mappingSrcTypeName: string;
    }[]
  >([]);

  const [eventFeaturesType, setEventFeaturesType] = useState<
    {
      reAttrId: number;
      reAttrName: string;
    }[]
  >([]);

  const [enumerationType, setEnumerationType] = useState<
    {
      enumType: string;
      enumTypeName: string;
    }[]
  >([]);

  const [zoneMaps, setZoneMaps] = useState<
    {
      zoneMapId: number;
      zoneMapName: string;
    }[]
  >([]);

  // State untuk event features list dan form detail
  const [eventFeatures, setEventFeatures] = useState<RatePlanZone[]>([]);
  const [detailForm, setDetailForm] = useState<RatePlanZone>({
    priority: 1,
    mappingSrcType: "",
    mappingSrcValue: "",
    mappingDesType: "",
    mappingDesValue: "",
    labelShow: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Fetch functions
  const fetchZoneMap = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/zone-map/list`, {});
      if (response.status) {
        setZoneMaps(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching zone map");
    }
  };

  const fetchSourceType = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/source-type/list`, {});
      if (response.status) {
        setSourceType(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching source type");
    }
  };

  const fetchEventFeature = async () => {
    try {
      const response = await GetData(
        `${API_URL}/mapping/re-attr/list?reType=1&spId=0`,
        {}
      );
      if (response.status) {
        setEventFeaturesType(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching event feature");
    }
  };

  const fetchEnumeration = async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/enum/list`, {});
      if (response.status) {
        setEnumerationType(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching enumeration");
    }
  };

  const getZoneDetail = async (ratePlanId: number) => {
    try {
      const response = await GetData(`${API_URL}/rate-plan/zone/list`, {
        ratePlanId: ratePlanId,
      });
      if (response.status && response.data && Array.isArray(response.data)) {
        const mappedZones: RatePlanZone[] = response.data.map((zone: any) => ({
          priority: zone.priority,
          mappingSrcType: zone.mappingSrcType,
          mappingSrcValue: zone.mappingSrcValue,
          mappingDesType: zone.mappingDesType,
          mappingDesValue: zone.mappingDesValue,
          labelShow: zone.labelShow,
          ratePlanZoneId: zone.ratePlanZoneId,
        }));

        setEventFeatures(mappedZones);

        // Update formField dengan data yang sudah ada
        setFormField((prev: any) => ({
          ...prev,
          ratePlanZones: mappedZones.length > 0 ? mappedZones : null,
        }));
      }
    } catch (error) {
      toast.error("Error fetching zone detail");
    }
  };

  // Handler functions
  const addNewDetailItem = () => {
    // Validasi form detail
    if (!detailForm.mappingSrcType) {
      toast.error("Source Type is required");
      return;
    }
    if (!detailForm.mappingSrcValue) {
      toast.error("Source Value is required");
      return;
    }
    if (!detailForm.mappingDesType) {
      toast.error("Destination is required");
      return;
    }
    if (detailForm.mappingDesType === "0" && !detailForm.mappingDesValue) {
      toast.error("Zone Map is required");
      return;
    }
    if (!detailForm.labelShow) {
      toast.error("Label is required");
      return;
    }

    let updatedFeatures: RatePlanZone[];

    if (isEditing && editingIndex !== null) {
      // Edit existing item
      updatedFeatures = eventFeatures.map((feature, index) =>
        index === editingIndex
          ? {
              ...detailForm,
              mappingDesValue:
                detailForm.mappingDesType === "1"
                  ? "1"
                  : detailForm.mappingDesValue,
            }
          : feature
      );
      setIsEditing(false);
      setEditingIndex(null);
      toast.success("Event feature updated successfully");
    } else {
      // Add new item
      const newFeature: RatePlanZone = {
        ...detailForm,
        priority: eventFeatures.length + 1,
        mappingDesValue:
          detailForm.mappingDesType === "1" ? "1" : detailForm.mappingDesValue,
      };
      updatedFeatures = [...eventFeatures, newFeature];
      toast.success("Event feature added successfully");
    }

    setEventFeatures(updatedFeatures);

    // Update formField dengan array event features
    setFormField((prev: any) => ({
      ...prev,
      ratePlanZones: updatedFeatures,
    }));

    // Reset detail form
    resetDetailForm();
  };

  const editEventFeature = (index: number) => {
    const feature = eventFeatures[index];
    setDetailForm({
      priority: feature.priority,
      mappingSrcType: feature.mappingSrcType,
      mappingSrcValue: feature.mappingSrcValue,
      mappingDesType: feature.mappingDesType,
      mappingDesValue: feature.mappingDesValue,
      labelShow: feature.labelShow,
    });
    setIsEditing(true);
    setEditingIndex(index);
  };

  const removeEventFeature = (priority: number) => {
    const updatedFeatures = eventFeatures
      .filter((feature) => feature.priority !== priority)
      .map((feature, index) => ({ ...feature, priority: index + 1 }));

    setEventFeatures(updatedFeatures);

    // Update formField
    setFormField((prev: any) => ({
      ...prev,
      ratePlanZones: updatedFeatures.length > 0 ? updatedFeatures : null,
    }));

    toast.success("Event feature removed successfully");
  };

  const resetDetailForm = () => {
    setDetailForm({
      priority: 1,
      mappingSrcType: "",
      mappingSrcValue: "",
      mappingDesType: "",
      mappingDesValue: "",
      labelShow: "",
    });
    setIsEditing(false);
    setEditingIndex(null);
  };

  // Reset detail form when source type changes
  const handleSourceTypeChange = (value: string) => {
    setDetailForm({
      ...detailForm,
      mappingSrcType: value,
      mappingSrcValue: "",
    });
  };

  // Load existing data when ratePlanId changes
  useEffect(() => {
    if (ratePlanId) {
      getZoneDetail(ratePlanId);
    }
  }, [ratePlanId]);

  useEffect(() => {
    fetchZoneMap();
    fetchSourceType();
    fetchEventFeature();
    fetchEnumeration();
  }, []);
  if (formField.ratePlanZones === null) {
    return (
      <div className="w-full">

      </div>
    );
  }
return (
  <>
    {formField.ratePlanZones !== null && formField.ratePlanZones.length > 0 && (
      <div className="w-full">
        <div className="mb-6">
          <div className="space-y-4">
            {/* Event Feature Table */}
            <div className="w-full mt-8">
              <h3 className="text-lg font-semibold mb-4">Event Feature</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Source Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Source Type Value
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Destination
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Destination Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Label
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventFeatures.length > 0 ? (
                      eventFeatures.map((feature, index) => {
                        const sourceTypeName =
                          sourceType.find(
                            (src) => src.mappingSrcType === feature.mappingSrcType
                          )?.mappingSrcTypeName ?? "-";

                        const getSourceValueName = () => {
                          if (feature.mappingSrcType === "1") {
                            return (
                              eventFeaturesType.find(
                                (ev) =>
                                  ev.reAttrId.toString() === feature.mappingSrcValue
                              )?.reAttrName ?? "-"
                            );
                          } else if (feature.mappingSrcType === "2") {
                            return (
                              enumerationType.find(
                                (en) => en.enumType === feature.mappingSrcValue
                              )?.enumTypeName ?? "-"
                            );
                          }
                          return "-";
                        };

                        const mappingDesTypeName =
                          feature.mappingDesType === "0"
                            ? "Zone Map"
                            : feature.mappingDesType === "1"
                              ? "Fix"
                              : "-";

                        const destinationValue =
                          feature.mappingDesType === "0"
                            ? (zoneMaps.find(
                                (z) =>
                                  z.zoneMapId.toString() === feature.mappingDesValue
                              )?.zoneMapName ?? "-")
                            : "Fixed Value";

                        return (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-3 text-sm">{feature.priority}</td>
                            <td className="px-4 py-3 text-sm">{sourceTypeName}</td>
                            <td className="px-4 py-3 text-sm">
                              {getSourceValueName()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {mappingDesTypeName}
                            </td>
                            <td className="px-4 py-3 text-sm">{destinationValue}</td>
                            <td className="px-4 py-3 text-sm">{feature.labelShow}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                {!isReadOnly && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      removeEventFeature(feature.priority)
                                    }
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="border-t">
                        <td
                          className="px-4 py-6 text-sm text-center align-middle text-muted-foreground"
                          colSpan={7}
                        >
                          No event features added
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Box */}
            <div className="w-full">
              <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p>
                    If you add event properties, the rate plan will be a mapping rate
                    plan, otherwise a single one.
                  </p>
                  <p>Drag the items in the list to change their priorities.</p>
                </div>
              </div>
            </div>

            {/* Detail Form */}
            <div className="w-full mt-8">
              <h3 className="text-lg font-semibold mb-4">
                {isEditing ? "Edit Detail" : "Add Detail"}
              </h3>
              <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Source Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <span className="text-red-500">*</span>Source Type
                    </label>
                    <Select
                      value={detailForm.mappingSrcType}
                      onValueChange={handleSourceTypeChange}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Source Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceType.map((type) => (
                          <SelectItem
                            key={type.mappingSrcType}
                            value={type.mappingSrcType}
                          >
                            {type.mappingSrcTypeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Event Feature */}
                  {detailForm.mappingSrcType === "1" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <span className="text-red-500">*</span>Event Feature
                      </label>
                      <Select
                        value={detailForm.mappingSrcValue}
                        onValueChange={(value) =>
                          setDetailForm({ ...detailForm, mappingSrcValue: value })
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Event Feature" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventFeaturesType.map((type) => (
                            <SelectItem
                              key={type.reAttrId}
                              value={String(type.reAttrId)}
                            >
                              {type.reAttrName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Enumeration */}
                  {detailForm.mappingSrcType === "2" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <span className="text-red-500">*</span>Enumeration
                      </label>
                      <Select
                        value={detailForm.mappingSrcValue}
                        onValueChange={(value) =>
                          setDetailForm({ ...detailForm, mappingSrcValue: value })
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Enumeration" />
                        </SelectTrigger>
                        <SelectContent>
                          {enumerationType.map((type) => (
                            <SelectItem
                              key={type.enumType}
                              value={String(type.enumType)}
                            >
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
                      value={detailForm.mappingDesType}
                      onValueChange={(value) =>
                        setDetailForm({
                          ...detailForm,
                          mappingDesType: value,
                          mappingDesValue: "",
                        })
                      }
                      disabled={isReadOnly}
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
                  {detailForm.mappingDesType === "0" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <span className="text-red-500">*</span>Zone Map
                      </label>
                      <Select
                        value={detailForm.mappingDesValue}
                        onValueChange={(value) =>
                          setDetailForm({ ...detailForm, mappingDesValue: value })
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Zone Map" />
                        </SelectTrigger>
                        <SelectContent>
                          {zoneMaps.map((zoneMap) => (
                            <SelectItem
                              key={zoneMap.zoneMapId}
                              value={String(zoneMap.zoneMapId)}
                            >
                              {zoneMap.zoneMapName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Label */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      <span className="text-red-500">*</span>Label
                    </label>
                    <Input
                      type="text"
                      value={detailForm.labelShow}
                      onChange={(e) =>
                        setDetailForm({ ...detailForm, labelShow: e.target.value })
                      }
                      disabled={isReadOnly}
                      placeholder="Enter label"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                  {isEditing && !isReadOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetDetailForm}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewDetailItem}
                    disabled={isReadOnly}
                  >
                    {isEditing ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
};

export default MappingZoneTab;
