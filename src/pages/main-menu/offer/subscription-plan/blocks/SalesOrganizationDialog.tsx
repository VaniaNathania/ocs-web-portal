import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeenIcon } from "@/components";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import OrganizationSelector, {
  OrgData,
} from "../components/OrganizationSelector.tsx";
import { MdKeyboardArrowDown } from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { apiConfigOffer } from "@/config/api.config.ts";
import { useCallApi } from "@/hooks/useCallApi.ts";
import { toast } from "sonner";

interface SalesOrganizationProps {
  isOpen: boolean;
  onClose: () => void;
  featureChildren?: any;
  fetchData: () => void;
  organizationData?: (data: OrgData) => void;
}

interface SalesOrganizationData {
  attrName: string | null;
  orgId: number | null;
  attrValueIdList: number[];
  excludeFlag: string | null;
  subsPlanOfferAttrId: number | null;
  attrValueId: number | null;
  spId: number;
}

const API_URL_OFFER = apiConfigOffer.offer;

const SalesOrganizationDialog: React.FC<SalesOrganizationProps> = ({
  isOpen,
  onClose,
  featureChildren,
  fetchData,
  organizationData,
}) => {
  const { PostData } = useCallApi();
  const [selectedOrg, setSelectedOrg] = useState<OrgData | null>(null);
  const initialFormData: SalesOrganizationData = {
    attrName: featureChildren.attrName,
    orgId: selectedOrg?.orgId ?? null,
    attrValueIdList: [],
    excludeFlag: "N",
    subsPlanOfferAttrId: featureChildren.subsPlanOfferAttrId,
    attrValueId: null,
    spId: 0,
  };

  const [formData, setFormData] =
    useState<SalesOrganizationData>(initialFormData);
  const [featureValuesOpen, setFeatureValuesOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<number[]>([]);

  const [isValidateOpen, setIsValidateOpen] = useState(false);
  // const isNotMatch = formData.attrName !== formData.testText;

  const [isOpenOrganizationSelector, setIsOpenOrganizationSelector] =
    useState(false);

  const handleInputChange = (
    field: keyof SalesOrganizationData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOrgData = (data: OrgData) => {
    //  console.log("ORG DATA: ", data);
    setFormData((prev) => (prev = { ...prev, orgId: data.orgId }));
    setSelectedOrg(data);
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setSelectedValues([]);
      setSelectedOrg(null);
    }
  }, [isOpen]);

  const handleShowSalesOrganization = () => {
    setIsOpenOrganizationSelector(true);
  };

  const handleSubmit = async () => {
    const payload = selectedValues.map((attrValueId) => ({
      orgId: formData.orgId,
      excludeFlag: formData.excludeFlag,
      subsPlanOfferAttrId: featureChildren.subsPlanOfferAttrId,
      attrValueId,
      spId: formData.spId,
    }));

    //  console.log("Payload:", payload);

    try {
      const response = await PostData(
        `${API_URL_OFFER}/offer/subs-plan/add-subs-plan-attr-value-apply-org`,
        payload,
      );
      if (response?.status) {
        toast.success("Success");
        onClose();
        fetchData();
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl p-0">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <DialogTitle className="text-lg font-medium text-gray-800">
              Sales Organization
            </DialogTitle>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
            />
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            {/* Regular Expression */}
            <div className="grid grid-cols-2 gap-8">
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <Label
                  htmlFor="attrName"
                  className="text-sm text-gray-700 text-right"
                >
                  <span className="text-red-500">*</span> Feature Name
                </Label>
                <Input
                  id="attrName"
                  value={formData.attrName ?? ""}
                  onChange={(e) =>
                    handleInputChange("attrName", e.target.value)
                  }
                  className="h-9 border-gray-300 bg-gray-300"
                  autoComplete="off"
                  disabled
                />
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <Label
                  htmlFor="attrDriverList"
                  className="text-sm text-gray-700 text-right"
                >
                  <span className="text-red-500">*</span>
                  Sales Organization
                </Label>
                <div className="relative">
                  <div className="h-9 border border-gray-300 rounded-md px-3 flex items-center">
                    <span className="flex-1 text-gray-700">
                      {selectedOrg?.orgName || ""}
                    </span>
                    <div
                      className="cursor-pointer p-1 hover:bg-gray-100 rounded"
                      onClick={handleShowSalesOrganization}
                    >
                      <KeenIcon
                        icon="notepad-edit"
                        className="text-gray-500 w-4 h-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <Label
                  htmlFor="attrValueIdList"
                  className="text-sm text-gray-700 text-right"
                >
                  <span className="text-red-500">*</span> Feature Value
                </Label>
                <Popover
                  open={featureValuesOpen}
                  onOpenChange={setFeatureValuesOpen}
                >
                  <PopoverTrigger
                    asChild
                    title={
                      selectedValues.length > 0
                        ? featureChildren.attrValueDtoList
                            .filter((item: any) =>
                              selectedValues.includes(item.attrValueId),
                            )
                            .map((item: any) => `${item.valueMark}`)
                            .join(" , ")
                        : "Select Values"
                    }
                  >
                    <button
                      type="button"
                      className="w-full px-2 py-1 text-sm h-10 border border-gray-300 rounded-md flex items-center justify-between overflow-hidden"
                    >
                      <span className="truncate flex-1 text-left">
                        {selectedValues.length === 0
                          ? "Select Values"
                          : featureChildren.attrValueDtoList
                              .filter((item: any) =>
                                selectedValues.includes(item.attrValueId),
                              )
                              .map((item: any) => item.valueMark)
                              .join(" , ")}
                      </span>
                      <MdKeyboardArrowDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[300px]">
                    <div className="flex flex-col gap-2">
                      {featureChildren.attrValueDtoList.map((item: any) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 text-md"
                        >
                          <Checkbox
                            checked={selectedValues.includes(item.attrValueId)}
                            onCheckedChange={(checked) => {
                              setSelectedValues((prev) =>
                                checked
                                  ? [...prev, item.attrValueId]
                                  : prev.filter(
                                      (val) => val !== item.attrValueId,
                                    ),
                              );
                            }}
                          />
                          {item.valueMark}
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {/* Is Default */}
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <Label className="text-sm text-gray-700 text-right">
                  <span className="text-red-500">*</span> Exclude Flag
                </Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="excludeFlag"
                      value="Y"
                      checked={formData.excludeFlag === "Y"}
                      onChange={(e) =>
                        handleInputChange("excludeFlag", e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="excludeFlag"
                      value="N"
                      checked={formData.excludeFlag === "N"}
                      onChange={(e) =>
                        handleInputChange("excludeFlag", e.target.value)
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 h-9 border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="px-6 h-9 bg-blue-600 hover:bg-blue-700 text-white"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OrganizationSelector
        isOpen={isOpenOrganizationSelector}
        onClose={() => setIsOpenOrganizationSelector(false)}
        organizationData={handleOrgData}
      />
    </>
  );
};

export default SalesOrganizationDialog;
