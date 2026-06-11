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

interface UpdateMappingDialogProps {
  show: boolean;
  onClose: () => void;
  onUpdateSuccess?: () => void;
  ratePlanId: number | null;
  mappingId: number | null;
}

interface MappingUnit {
  ratePlanZoneId: number;
  mappingType: string;
  mappingMatchType: string;
  mappingValue: string;
  mappingDesType: string;
}

type ZoneFlag = "Y" | "N"; // 👈 type alias biar rapi

interface Mapping {
  mappingName: string;
  mappingUnit: MappingUnit[];
  zoneFlag: ZoneFlag;
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

const ENUM_OPTIONS = [
  { value: "BASIC_BALANCE", label: "Base Balance" },
  { value: "ALL_CASH_BALANCE", label: "All Cash Balance" },
];

const UpdateMappingDialog: React.FC<UpdateMappingDialogProps> = ({
  show,
  onClose,
  onUpdateSuccess,
  ratePlanId,
  mappingId,
}) => {
  const [ratePlanZones, setRatePlanZones] = useState<RatePlanZone[]>([]);
  const [formField, setFormField] = useState<Mapping>({
    mappingName: "",
    mappingUnit: [],
    zoneFlag: "N", // 👈 default
  });

  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingMapping, setLoadingMapping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reAttr, setReAttr] = useState<ReAttr[]>([]);
  const [zoneMapping, setZoneMapping] = useState<{
    [key: string]: ZoneMapping[];
  }>({});
  const [loadingZoneMapping, setLoadingZoneMapping] = useState<{
    [key: string]: boolean;
  }>({});

  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  const { GetData, PostData, PutData } = useCallApi();

  const getReAttr = useCallback(async () => {
    try {
      const response = await GetData(`${API_URL}/mapping/re-attr/list`, {});
      setReAttr(response?.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to get reAttrs");
    }
  }, [GetData]);

  const getZone = useCallback(
    async (mappingDesValue: string) => {
      setLoadingZoneMapping((prev) => ({ ...prev, [mappingDesValue]: true }));
      try {
        const response = await GetData(`${API_URL}/mapping/zone/list`, {
          zoneMapId: mappingDesValue,
        });

        setZoneMapping((prev) => ({
          ...prev,
          [mappingDesValue]: response?.data,
        }));
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to get zones");
      } finally {
        setLoadingZoneMapping((prev) => ({
          ...prev,
          [mappingDesValue]: false,
        }));
      }
    },
    [GetData]
  );

  const getRatePlanZone = useCallback(async () => {
    if (!ratePlanId) return;
    setLoadingZones(true);
    try {
      const response = await GetData(`${API_URL}/rate-plan/zone/list`, {
        ratePlanId,
        spId: 0,
      });
      setRatePlanZones(response?.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to get zones");
    } finally {
      setLoadingZones(false);
    }
  }, [ratePlanId, GetData]);

  const getMappingDetail = useCallback(
    async (mappingId: number | null, ratePlanId: number | null) => {
      if (!mappingId || !ratePlanId) return;

      setLoadingMapping(true);
      try {
        const response = await GetData(
          `${API_URL}/rate-plan/zone/mapping-unit/list`,
          { mappingId, ratePlanId }
        );

        const mappingDetailArray = response?.data || [];

        if (mappingDetailArray.length > 0) {
          setFormField({
            mappingName: mappingDetailArray[0].mappingName || "",
            mappingUnit: mappingDetailArray.map((item: any) => ({
              ratePlanZoneId: item.ratePlanZoneId,
              mappingType: item.mappingType || "",
              mappingMatchType: item.mappingMatchType || "",
              mappingValue: item.mappingValue || "",
              mappingDesType: item.mappingDesType || "",
            })),
            zoneFlag: "N",
          });
        } else {
          setFormField({
            mappingName: "",
            mappingUnit: [],
            zoneFlag: "N",
          });
        }

        setIsInitialDataLoaded(true);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to get mapping detail"
        );
      } finally {
        setLoadingMapping(false);
      }
    },
    [GetData]
  );

  useEffect(() => {
    if (show && ratePlanId && mappingId) {
      const loadData = async () => {
        setIsInitialDataLoaded(false);
        setFormField({ mappingName: "", mappingUnit: [], zoneFlag: "N" });

        await Promise.all([
          getRatePlanZone(),
          getMappingDetail(mappingId, ratePlanId),
          getReAttr(),
        ]);
      };

      loadData();
    }
  }, [show, ratePlanId, mappingId, getRatePlanZone, getMappingDetail, getReAttr]);

  // auto init mappingUnit dari ratePlanZones
  useEffect(() => {
    if (
      !isInitialDataLoaded &&
      Array.isArray(ratePlanZones) &&
      ratePlanZones.length > 0 &&
      (!formField.mappingUnit || formField.mappingUnit.length === 0)
    ) {
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
    }
  }, [ratePlanZones, isInitialDataLoaded, formField.mappingUnit]);

  // 👇 Auto set zoneFlag = "Y" kalau ada perubahan mappingUnit
  useEffect(() => {
    if (formField.mappingUnit && formField.mappingUnit.length > 0) {
      setFormField((prev) => ({ ...prev, zoneFlag: "Y" }));
    }
  }, [formField.mappingUnit]);

  const updateMappingUnitField = (
    index: number,
    field: keyof MappingUnit,
    value: string
  ) => {
    const updated = [...formField.mappingUnit];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "mappingType") {
      updated[index].mappingValue = "";

      if (value === "0") {
        const ratePlanZoneId = updated[index].ratePlanZoneId;
        const correspondingZone = ratePlanZones.find(
          (z) => z.ratePlanZoneId === ratePlanZoneId
        );
        const mappingDesValue = correspondingZone?.mappingDesValue;

        if (mappingDesValue && !zoneMapping[mappingDesValue]) {
          getZone(mappingDesValue);
        }
      }
    }

    setFormField((prev) => ({ ...prev, mappingUnit: updated }));
  };

  const doUpdateMapping = useCallback(async () => {
    setLoading(true);
    try {
      const response = await PutData(
        `${API_URL}/mapping/update/${mappingId}`,
        formField
      );
      if (response?.message) {
        toast.success("Mapping Updated successfully!");
        onUpdateSuccess?.();
        onClose();
      } else {
        toast.error("Failed to Update mapping.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to Update mapping."
      );
    } finally {
      setLoading(false);
    }
  }, [formField, onClose, onUpdateSuccess, PostData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formField.mappingName?.trim()) {
      toast.error("Please fill in the mapping name.");
      return;
    }

    for (const unit of formField.mappingUnit) {
      if (!unit.mappingType || !unit.mappingValue) {
        toast.error("All mapping units must have type and value filled.");
        return;
      }
    }

    doUpdateMapping();
  };

  const isLoading = loadingZones || loadingMapping;

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Update Mapping
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mapping Name Section */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mapping Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm"
                  placeholder="Enter mapping name..."
                  value={formField.mappingName}
                  onChange={(e) =>
                    setFormField({ ...formField, mappingName: e.target.value })
                  }
                />
              </div>

              {/* TODO: mapping units rendering (same as sebelumya) */}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Mapping"}
                </Button>
              </div>
            </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMappingDialog;
