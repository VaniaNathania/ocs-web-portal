// RebateSettingDialog.tsx
import React, { useCallback, useState, useEffect } from "react";
import { X } from 'lucide-react';
import { useCallApi } from "@/hooks";
import { apiConfigOffer } from "@/config/api.config";
import { toast } from "sonner";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";

interface RebateSettingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offerid: number;
  onSubmit: (data: RebateFormData) => void;
}

export interface RebateFormData {
  rebateType: string;
  version: number;
  rebateCount: number;
  defaultValue: string;
  name: string;
}

const API_URL_OFFER = apiConfigOffer.offer;

const RebateSettingDialog: React.FC<RebateSettingDialogProps> = ({
  isOpen,
  onClose,
  offerid,
  onSubmit
}) => {
  const {menuPrivAccess} = useOfferLayout()
  const { GetData } = useCallApi();
  const [rebateType, setRebateType] = useState("P");
  const [versionList, setVersionList] = useState<any>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [rebateCount, setRebateCount] = useState<string>("");
  const [defaultValue, setDefaultValue] = useState<string>("");

  const getVersionList = async (offerid: number) => {
    try {
      const response = await GetData(
        `${API_URL_OFFER}/offer/price-plan/qry-price-plan-ver-list-by-price-plan-id`,
        { pricePlanId: offerid }
      );
      if (response?.data) {
        // console.log(response.data);
        setVersionList(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching version list:", error);
      toast.error("Error fetching version data");
    }
  };

  useEffect(() => {
    if (offerid) {
      getVersionList(offerid);
    }
  }, [offerid]);

  const handleSubmit = () => {
    if (!selectedVersion) {
      toast.error("Please select a version");
      return;
    }
    if (!rebateCount || Number(rebateCount) <= 0) {
      toast.error("Please enter a valid rebate count");
      return;
    }
    if (!defaultValue) {
      toast.error("Please enter a default value");
      return;
    }

    // cari data versi yang dipilih
    const selectedVersionObj = versionList.find(
      (v: any) => v.pricePlanVerId.toString() === selectedVersion
    );

    const name =
      selectedVersionObj?.effDate +
      " - " +
      (selectedVersionObj?.expDate ?? "-");

    const formData: RebateFormData = {
      rebateType,
      name,
      version: Number(selectedVersion),
      rebateCount: Number(rebateCount),
      defaultValue,
    };

    onSubmit(formData);
    handleCancel();
  };

  const handleCancel = useCallback(() => {
    setRebateType("P");
    setSelectedVersion("");
    setRebateCount("");
    setDefaultValue("");
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl h-auto max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Setting Rebate</h2>
          <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="flex min-h-full flex-col">
            <div>
              <label className="text-sm font-medium">
                <span className="text-red-500">*</span>Version
              </label>
              <Select
                onValueChange={(value) => setSelectedVersion(value)}
                value={selectedVersion}
              >
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Select Version" />
                </SelectTrigger>
                <SelectContent>
                  {versionList && versionList.length > 0 ? (
                    versionList.map((version: any) => (
                      <SelectItem
                        key={version.pricePlanVerId}
                        value={version.pricePlanVerId.toString()}
                      >
                        {version.effDate} - {version.expDate ?? "-"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      No versions available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2">
              <label className="text-sm font-medium">
                <span className="text-red-500">*</span>Rebate Type
              </label>
              <div className="flex space-x-4 mt-1">
                <label>
                  <input
                    type="radio"
                    name="rebateType"
                    value="Rate"
                    checked={rebateType === "P"}
                    onChange={() => setRebateType("P")}
                  />{" "}
                  Rate
                </label>
                <label>
                  <input
                    type="radio"
                    name="rebateType"
                    value="Amount"
                    checked={rebateType === "F"}
                    onChange={() => setRebateType("F")}
                  />{" "}
                  Amount
                </label>
              </div>
            </div>

            <div className="mt-2">
              <label className="text-sm font-medium">
                <span className="text-red-500">*</span>Rebate Count
              </label>
              <input
                type="number"
                min="1"
                value={rebateCount}
                onChange={(e) => setRebateCount(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm mt-1"
                placeholder="Enter Rebate Count"
              />
            </div>

            <div className="mt-2">
              <label className="text-sm font-medium block mb-1">
                <span className="text-red-500">*</span> Default Value
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Enter Default Value"
                />
                {rebateType === "P" && (
                  <span className="text-sm text-gray-600">%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t flex justify-end items-center">
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>  
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Submit
            </button>
            </AccessWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebateSettingDialog;