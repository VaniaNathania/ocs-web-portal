import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import {
  FeatureModData,
  SubsPlanOfferAttrList,
  SubsPlanOfferAttrValueList,
} from "../hooks/useFeatureOfferAttributeHooks";
import { apiConfig, apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { toast } from "sonner";
import { Item } from "@radix-ui/react-select";

interface OfferAttributeProps {
  featureChildren: any;
  featureParent: any;
  inputType: string | undefined;
  onClose: () => void;
  fetchData: () => void;
}

interface OfferAttributeData {
  attrName: string | null;
  unavailable: string | null;
  featureValue: string | null;
}

const API_URL_OFFER = apiConfigOffer.offer;

const OfferAttribute: React.FC<OfferAttributeProps> = ({
  featureChildren,
  inputType,
  featureParent,
  onClose,
  fetchData,
}) => {
  const { PutData } = useCallApi();
  const { selectedSubSubPlan, selectedVer } = useOfferLayout();
  const [attrValueDtoList, setAttrValueDtoList] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [defaultValue, setDefaultValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const initialFormData: OfferAttributeData = {
    attrName: featureChildren?.attrName,
    unavailable: featureChildren?.excludeFlag,
    featureValue: featureChildren?.defaultValue ?? null,
  };
  const [formData, setFormData] = useState<OfferAttributeData>(initialFormData);

  const handleInputChange = (
    field: keyof OfferAttributeData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    //  console.log("SELECTED SUBSPLAN : ", selectedSubSubPlan);
    //  console.log("SELECTED VER: ", selectedVer);
  }, [selectedSubSubPlan, selectedVer]);

  useEffect(() => {
    if (featureChildren?.attrValueDtoList) {
      setAttrValueDtoList(featureChildren.attrValueDtoList);

      const valueIds = featureChildren?.attrValueIds ?? [];

      const defaultItem = featureChildren.attrValueDtoList.find(
        (item: any) => item.value === featureChildren.defaultValue,
      );

      let combinedSelected = [...valueIds];
      if (defaultItem && !combinedSelected.includes(defaultItem.attrValueId)) {
        combinedSelected.push(defaultItem.attrValueId);
      }

      setSelectedRows(combinedSelected);
      setDefaultValue(defaultItem ? defaultItem.value : null);
    }
  }, [featureChildren]);

  const handleRowSelect = (id: number) => {
    setSelectedRows((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];

      const selectedItem = attrValueDtoList.find(
        (item) => item.attrValueId === id,
      );

      if (
        selectedItem &&
        defaultValue === selectedItem.value &&
        !newSelection.includes(id)
      ) {
        setDefaultValue(null);
      }

      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === attrValueDtoList.length) {
      setSelectedRows([]);
      setDefaultValue(null);
    } else {
      setSelectedRows(attrValueDtoList.map((item) => item.attrValueId));
    }
  };

  const handleDefaultChange = (value: string, id: number) => {
    if (!selectedRows.includes(id)) return;
    setDefaultValue(value);
  };

  const handleSubmit = async () => {
    const parentOfferId = selectedSubSubPlan?.offerId;
    const offerVerId = selectedVer?.offerVerId;
    setIsLoading(true);

    const subsPlanOfferAttrList = featureParent?.children?.map((item: any) => {
      const isEdited = item.attrId === featureChildren?.attrId;

      const attrValueIds = isEdited ? selectedRows : (item.attrValueIds ?? []);
      const itemDefaultValue = isEdited
        ? (defaultValue ?? item.defaultValue)
        : item.defaultValue;

      const subsPlanOfferAttrValueList = isEdited
        ? selectedRows.map((attrValueId: any) => ({
            subsPlanOfferAttrId: featureChildren?.subsPlanOfferAttrId,
            attrValueId,
            spId: featureChildren?.spId ?? 0,
          }))
        : (item.attrValueDtoList?.map((attr: any) => ({
            subsPlanOfferAttrId: item.subsPlanOfferAttrId,
            attrValueId: attr.attrValueId,
            spId: item.spId ?? 0,
          })) ?? []);

      const finalDefaultValue =
        isEdited && inputType === "4"
          ? formData.featureValue
          : (itemDefaultValue ?? item.defaultValue);

      return {
        offerId: item.offerId,
        subsPlanOfferAttrId: item.subsPlanOfferAttrId,
        attrId: item.attrId,
        defaultValue: finalDefaultValue,
        attrValueIds,
        excludeFlag: isEdited
          ? (formData.unavailable ?? null)
          : (item.excludeFlag ?? null),
        mask: item.mask ?? null,
        exceptionMessage: item.exceptionMessage ?? null,
        subsPlanOfferAttrValueList: subsPlanOfferAttrValueList,
        offerVerId,
        spId: item?.spId ?? 0,
      };
    });

    const payload: FeatureModData = {
      showPage: true,
      subsPlanVerId: offerVerId,
      subsPlanId: selectedSubSubPlan?.subsPlanId,
      offerId: parentOfferId,
      subsPlanOfferAttrList,
      spId: featureChildren?.spId ?? 0,
      offerVerId,
    };

    //  console.log("PAYLOAD: ", payload);

    try {
      const response = await PutData(
        `${API_URL_OFFER}/offer/subs-plan/${offerVerId}/offer-feature/${parentOfferId}`,
        payload,
      );

      if (response?.status) {
        toast.success("Success Update");
        fetchData();
        onClose();
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => {
          const allSelected =
            selectedRows.length > 0 &&
            selectedRows.length === attrValueDtoList.length;

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
          );
        },
        cell: ({ row }) => {
          const feature = row.original;
          const isSelected = selectedRows.includes(feature.attrValueId);

          return (
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleRowSelect(feature.attrValueId)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
          );
        },
        meta: {
          headerClassName: "w-[50px] text-center",
          cellClassName: "text-center",
        },
      },

      {
        accessorKey: "valueMark",
        id: "valueMark",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Feature Value"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const { valueMark, value } = row.original;
          return (
            <div className="p-2 text-gray-700">{`${valueMark ?? ""} (${value ?? ""})`}</div>
          );
        },
      },

      {
        id: "defaultValue",
        header: ({ column }) => (
          <DataGridColumnHeader
            className=""
            title="Default Value"
            column={column}
          />
        ),
        cell: ({ row }) => {
          const feature = row.original;
          const isSelected = selectedRows.includes(feature.attrValueId);
          const isDefault = defaultValue === feature.value;
          const isDisabled = !isSelected;

          return (
            <div className="flex justify-center">
              <input
                type="radio"
                name="defaultValue"
                checked={isDefault}
                disabled={isDisabled}
                onChange={() =>
                  handleDefaultChange(feature.value, feature.attrValueId)
                }
                className={`w-4 h-4 ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              />
            </div>
          );
        },
      },
    ],
    [selectedRows, attrValueDtoList, defaultValue],
  );

  return (
    <div className="border border-gray-300 p-5 rounded-md m-3">
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <Label
            htmlFor="attrName"
            className="text-sm text-gray-700 text-right"
          >
            Feature Name
          </Label>
          <Input
            id="attrName"
            value={featureChildren.attrName ?? ""}
            disabled
            className="h-9 border-gray-300 bg-gray-100"
          />
        </div>
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <Label className="text-sm text-gray-700 text-right">
            Unavailable
          </Label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="unavailable"
                value="Y"
                checked={formData.unavailable === "Y"}
                onChange={(e) =>
                  handleInputChange("unavailable", e.target.value)
                }
                className="w-4 h-4 text-blue-600"
              />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="unavailable"
                value="N"
                checked={formData.unavailable === "N"}
                onChange={(e) =>
                  handleInputChange("unavailable", e.target.value)
                }
                className="w-4 h-4 text-blue-600"
              />
              No
            </label>
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <Label className="text-sm text-gray-700 text-right">
            Feature Value
          </Label>
          {inputType === "4" ? (
            <Input
              id="featureValue"
              value={formData.featureValue ?? ""}
              onChange={(e) =>
                handleInputChange("featureValue", e.target.value)
              }
              className="h-9 border-gray-300"
              autoComplete="off"
            />
          ) : (
            <>
              <DataGridProvider
                data={attrValueDtoList}
                columns={columns}
                pagination={{ size: 10 }}
                toolbar={<div className="p-2"></div>}
              />
            </>
          )}
        </div>

        <div className="flex justify-end pt-10">
          <Button variant="default" onClick={handleSubmit}>
            {isLoading ? "Saving..." : "Save and Close"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfferAttribute;
