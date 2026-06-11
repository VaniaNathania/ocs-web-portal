import React, { useCallback, useEffect, useState } from "react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CreateMappingDialogProps {
  onClose: () => void;
  onCreateSuccess?: () => void;
  ratePlanId: number | null;
}

interface MappingUnit {
  ratePlanZoneId: number;
  mappingType: string;
  mappingMatchType: string;
  mappingValue: string;
  mappingDesType: string;
}

interface Mapping {
  ratePlanId: number;
  mappingName: string;
  mappingUnit: MappingUnit[];
}

interface RatePlanZone {
  ratePlanZoneId: number;
  ratePlanId: number;
  mappingSrcType: string;
  mappingSrcValue: string;
  mappingDesType: string;
  mappingDesValue: string;
  priority: number;
  labelShow: string;
  reAttrName: string;
  zoneMapName: string;
}

interface ReAttr {
  reAttrId: number;
  reAttrName: string;
  comments: string;
}

interface ZoneMapping {
  zoneId: number;
  zoneName: string;
  zoneComments: string;
  zoneCode: string;
  zoneMapId: number;
  parentZoneId: number;
  zoneMapName: string;
  matchMode: string;
  stdCode: string;
  zoneMapComments: string;
}

const API_URL = apiConfig.service_price_plan;

const MAPPING_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> =
  {
    "0": [{ value: "0", label: "Zone" }],
    "1": [
      { value: "1", label: "Const" },
      { value: "2", label: "Attr" },
      { value: "3", label: "Enum" },
    ],
  };

const MappingMatchTypeOptions: Record<
  string,
  { value: string; label: string }[]
> = {
  "0": [{ value: "A", label: "In" }],
  "1": [
    { value: "1", label: ">" },
    { value: "2", label: "<" },
    { value: "3", label: "=" },
    { value: "4", label: "!=" },
    { value: "5", label: ">=" },
    { value: "6", label: "<=" },
  ],
};

// Enum options for mapping type "3" (Enum)
const ENUM_OPTIONS = [
  { value: "BASIC_BALANCE", label: "Base Balance" },
  { value: "ALL_CASH_BALANCE", label: "All Cash Balance" },
];

const CreateMappingDialog: React.FC<CreateMappingDialogProps> = ({
  onClose,
  onCreateSuccess,
  ratePlanId,
}) => {
  const [ratePlanZones, setRatePlanZones] = useState<RatePlanZone[]>([]);
  const [formField, setFormField] = useState<Mapping>({
    ratePlanId: ratePlanId || 0,
    mappingName: "",
    mappingUnit: [],
  });
  const [loadingZones, setLoadingZones] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reAttr, setReAttr] = useState<ReAttr[]>([]);
  const [zoneMapping, setZoneMapping] = useState<{
    [key: string]: ZoneMapping[];
  }>({});
  const [loadingZoneMapping, setLoadingZoneMapping] = useState<{
    [key: string]: boolean;
  }>({});

  const { GetData, PostData } = useCallApi();

  const getReAttr = useCallback(async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/re-attr/list`, {});
      const reAttrs = response?.data;
      setReAttr(reAttrs);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to get reAttrs");
    }
  }, []);

  const getZone = useCallback(async (mappingDesValue: string) => {
    setLoadingZoneMapping((prev) => ({ ...prev, [mappingDesValue]: true }));
    try {
      const response = await GetData(`${API_URL}/mapping/zone/list`, {
        zoneMapId: mappingDesValue,
      });

      const zones = response?.data;
      setZoneMapping((prev) => ({ ...prev, [mappingDesValue]: zones }));
      //  console.log("zones for mappingDesValue", mappingDesValue, zones);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to get zones");
    } finally {
      setLoadingZoneMapping((prev) => ({ ...prev, [mappingDesValue]: false }));
    }
  }, []);

  const getRatePlanZone = useCallback(async () => {
    setLoadingZones(true);
    try {
      const response = await GetData(`${API_URL}/rate-plan/zone/list`, {
        ratePlanId: ratePlanId,
        spId: 0,
      });

      const zones = response?.data;
      setRatePlanZones(zones);
      //  console.log("ratePlanZones", zones);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to get zones");
    } finally {
      setLoadingZones(false);
    }
  }, [ratePlanId]);

  useEffect(() => {
    getRatePlanZone();
  }, []);

  useEffect(() => {
    getReAttr();
  }, []);
  //  console.log("formField", formField);
  useEffect(() => {
    if (!Array.isArray(ratePlanZones) || ratePlanZones.length === 0) {
      console.warn("🚫 ratePlanZones is not a valid array or is empty");
      return;
    }

    const updatedMappingUnit = ratePlanZones.map((zone) => ({
      ratePlanZoneId: zone.ratePlanZoneId,
      mappingType: "",
      mappingDesType: zone.mappingDesType,
      mappingMatchType: "",
      mappingValue: "",
    }));

    setFormField((prev) => ({
      ...prev,
      mappingUnit: updatedMappingUnit,
    }));
  }, [ratePlanZones]);

  const updateMappingUnitField = (
    index: number,
    field: keyof MappingUnit,
    value: string,
  ) => {
    const updated = [...formField.mappingUnit];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    // Reset mapping value when mapping type changes
    if (field === "mappingType") {
      updated[index].mappingValue = "";

      // Load zone data when Zone type is selected
      if (value === "0") {
        const ratePlanZoneId = updated[index].ratePlanZoneId;
        const correspondingZone = ratePlanZones.find(
          (z) => z.ratePlanZoneId === ratePlanZoneId,
        );
        const mappingDesValue = correspondingZone?.mappingDesValue;

        if (mappingDesValue && !zoneMapping[mappingDesValue]) {
          getZone(mappingDesValue);
        }
      }
    }

    setFormField((prev) => ({
      ...prev,
      mappingUnit: updated,
    }));
  };

  const renderMappingValueField = (unit: MappingUnit, index: number) => {
    const { mappingType, ratePlanZoneId } = unit;

    switch (mappingType) {
      case "0": // Zone
        const correspondingZone = ratePlanZones.find(
          (z) => z.ratePlanZoneId === ratePlanZoneId,
        );
        const mappingDesValue = correspondingZone?.mappingDesValue;
        const zones = mappingDesValue ? zoneMapping[mappingDesValue] || [] : [];
        const isLoadingZones = mappingDesValue
          ? loadingZoneMapping[mappingDesValue]
          : false;

        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Zone <span className="text-red-500">*</span>
            </label>
            {isLoadingZones ? (
              <div className="flex items-center justify-center py-2 border border-gray-300 rounded-md">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-500">Loading zones...</span>
              </div>
            ) : (
              <Select
                value={unit.mappingValue}
                onValueChange={(value) =>
                  updateMappingUnitField(index, "mappingValue", value)
                }
              >
                <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem
                      key={zone.zoneId}
                      value={zone.zoneId.toString()}
                    >
                      {zone.zoneName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );

      case "1": // Const
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Constant Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter constant value..."
              value={unit.mappingValue}
              onChange={(e) =>
                updateMappingUnitField(index, "mappingValue", e.target.value)
              }
            />
          </div>
        );

      case "2": // Attr
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Attribute <span className="text-red-500">*</span>
            </label>
            <Select
              value={unit.mappingValue}
              onValueChange={(value) =>
                updateMappingUnitField(index, "mappingValue", value)
              }
            >
              <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select attribute" />
              </SelectTrigger>
              <SelectContent>
                {reAttr.map((attr) => (
                  <SelectItem
                    key={attr.reAttrId}
                    value={attr.reAttrId.toString()}
                  >
                    {attr.reAttrName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "3": // Enum
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enum Value <span className="text-red-500">*</span>
            </label>
            <Select
              value={unit.mappingValue}
              onValueChange={(value) =>
                updateMappingUnitField(index, "mappingValue", value)
              }
            >
              <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select enum value" />
              </SelectTrigger>
              <SelectContent>
                {ENUM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Mapping Value <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter mapping value..."
              value={unit.mappingValue}
              onChange={(e) =>
                updateMappingUnitField(index, "mappingValue", e.target.value)
              }
            />
          </div>
        );
    }
  };

  const doCreateMapping = useCallback(async () => {
    setLoading(true);
    try {
      const response = await PostData(`${API_URL}/mapping/create`, formField);
      if (response?.message) {
        toast.success("Mapping created successfully!");
        onCreateSuccess?.();
        onClose();
      } else {
        toast.error("Failed to create mapping.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create mapping.",
      );
    } finally {
      setLoading(false);
    }
  }, [formField, onClose, onCreateSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formField.mappingName?.trim()) {
      toast.error("Please fill in the mapping name.");
      return;
    }

    // Optional: validation for each mappingUnit
    for (const unit of formField.mappingUnit) {
      if (!unit.mappingType || !unit.mappingValue) {
        toast.error("All mapping units must have type and value filled.");
        return;
      }
    }

    doCreateMapping();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto z-[1000]">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            Create New Mapping
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="overflow-y-auto">
          {loadingZones ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-gray-500">Loading zones...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mapping Name Section */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mapping Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter mapping name..."
                  value={formField.mappingName}
                  onChange={(e) =>
                    setFormField({
                      ...formField,
                      mappingName: e.target.value,
                    })
                  }
                />
              </div>

              {/* Mapping Units Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Mapping Units ({formField.mappingUnit.length})
                  </h3>
                </div>

                {formField.mappingUnit.map((unit, index) => {
                  const zone = ratePlanZones.find(
                    (z) => z.ratePlanZoneId === unit.ratePlanZoneId,
                  );
                  const desType = unit.mappingDesType;

                  return (
                    <div
                      key={unit.ratePlanZoneId}
                      className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Zone Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {zone?.labelShow || `Zone ${index + 1}`}
                            </h4>
                            <p className="text-xs text-gray-500">
                              ID: {unit.ratePlanZoneId} | DesValue:{" "}
                              {zone?.mappingDesValue}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Type: {desType}
                        </div>
                      </div>

                      {/* Form Fields Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mapping Match Type */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Match Type <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={unit.mappingMatchType}
                            onValueChange={(value) =>
                              updateMappingUnitField(
                                index,
                                "mappingMatchType",
                                value,
                              )
                            }
                          >
                            <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500">
                              <SelectValue placeholder="Select match type" />
                            </SelectTrigger>
                            <SelectContent>
                              {MappingMatchTypeOptions[desType]?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Mapping Type */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Mapping Type <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={unit.mappingType}
                            onValueChange={(value) =>
                              updateMappingUnitField(
                                index,
                                "mappingType",
                                value,
                              )
                            }
                          >
                            <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500">
                              <SelectValue placeholder="Select mapping type" />
                            </SelectTrigger>
                            <SelectContent>
                              {MAPPING_TYPE_OPTIONS[desType]?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Dynamic Mapping Value Field - Full Width */}
                      <div className="mt-4">
                        {renderMappingValueField(unit, index)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Mapping"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMappingDialog;
