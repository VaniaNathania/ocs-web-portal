import React, { useEffect } from "react";
import { KeenIcon } from "@/components";
import TextFloatFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextFloatFields";
import TextMoneyFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextMoneyFields";
import TextCharacterFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextCharacterFields";
import TextNumberFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextNumberFields";
import TextPasswordFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TextPasswordFields";
import RichTextEditorFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/RichTextEditorFields";
import AttachmentFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/AttachmentFields";
import DateSelectorFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/DateSelectorFields";
import DataTimeSelecotrFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/DataTimeSelecotrFields";
import TimeSelectorFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/TimeSelectorFields";
import MemoFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/MemoFields";
import SingleChoiceFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/SingleChoiceField";
import MultiChoiceFields from "@/pages/main-menu/offer/main-product/components/InputTypesTemplate/MultiChoiceFields";
import { useAllFeature } from "../hooks/context";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface FeatureDetailViewProps {
  detailData: any;
  detailDriverAndLinkage: any;
  detailContactChannel: any[];
  detailAttrCatg: any[];
  inputTypeList: any[];
  dataType: any[];
  onEdit: () => void;
  onDelete: () => void;
  selectedFeature: any;
  rowData: any;
}

const FeatureDetailView: React.FC<FeatureDetailViewProps> = ({
  detailData,
  detailDriverAndLinkage,
  inputTypeList,
  dataType,
  onEdit,
  onDelete,
  selectedFeature,
  rowData,
  detailContactChannel,
  detailAttrCatg,
}) => {
  const renderExtraInputTypeFields = () => {
    const handleDummyChange = () => {};
    switch (detailData.inputType) {
      case "4":
        const dataType = detailData.dataType || "C";
        switch (dataType) {
          case "F":
            return (
              <TextFloatFields
                formData={detailData}
                onChange={handleDummyChange}
                isEditingMode={false}
              />
            );
          case "M":
            return (
              <TextMoneyFields
                formData={detailData}
                onChange={handleDummyChange}
                isEditingMode={false}
              />
            );
          case "C":
            return (
              <TextCharacterFields
                formData={detailData}
                onChange={handleDummyChange}
                isEditingMode={false}
              />
            );
          case "N":
            return (
              <TextNumberFields
                formData={detailData}
                onChange={handleDummyChange}
                isEditingMode={false}
              />
            );
          case "P":
            return (
              <TextPasswordFields
                formData={detailData}
                onChange={handleDummyChange}
                isEditingMode={false}
              />
            );
          default:
            return null;
        }
      case "C":
        return (
          <RichTextEditorFields
            formData={detailData}
            onChange={handleDummyChange}
            isEditingMode={false}
          />
        );
      case "6":
        return (
          <AttachmentFields
            formData={detailData}
            onChange={handleDummyChange}
            isEditingMode={false}
          />
        );
      case "3":
        return (
          <DateSelectorFields
            formData={detailData}
            onChange={handleDummyChange}
            isEditingMode={false}
          />
        );
      case "B":
        return (
          <DataTimeSelecotrFields
            formData={detailData}
            onChange={handleDummyChange}
            isEditingMode={false}
          />
        );
      case "A":
        return (
          <TimeSelectorFields
            formData={detailData}
            onChange={handleDummyChange}
            isEditingMode={false}
          />
        );
      case "5":
        return (
          <MemoFields
            formData={detailData}
            onChange={handleDummyChange}
            isEditingMode={false}
          />
        );
      case "1":
        return (
          <SingleChoiceFields
            formData={detailDriverAndLinkage || []}
            onChange={handleDummyChange}
            isEditingMode={false}
            rowData={rowData}
          />
        );
      case "2":
        return (
          <MultiChoiceFields
            formData={detailDriverAndLinkage || []}
            onChange={handleDummyChange}
            isEditingMode={false}
            rowData={rowData}
          />
        );
      default:
        return null;
    }
  };

  const { menuPrivAccess } = useAllFeature();

  useEffect(() => {
    // console.log("DETAIL CONTACT CHANNEL", detailContactChannel);
  }, [detailContactChannel]);

  const getInputTypeName = (): string => {
    if (!detailData?.inputType) return "--";

    if (detailData.inputType === "4") {
      const targetDataType = detailData.dataType || "C";
      const base = inputTypeList.find((t) => t.inputType === "4");
      const dt = dataType.find((d) => d.dataType === targetDataType);

      if (base && dt) {
        return `${base.inputTypeName} - ${dt.dataTypeName}`;
      }
    }

    const found = inputTypeList.find(
      (t) => t.inputType === detailData.inputType,
    );
    return found ? found.inputTypeName : detailData.inputType || "--";
  };

  const renderBasicFeatureFields = () => (
    <div className="space-y-4">
      {/* Row 1 - Feature Type & Feature Code */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Feature Type:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailData.attrType === "1" ? "Basic" : "Object"}
          </span>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Feature Code:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailData.attrCode || "--"}
          </span>
        </div>
      </div>

      {/* Row 2 - Feature Name & Feature Category*/}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Feature Name:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailData.attrName || "--"}
          </span>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Feature Category:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailAttrCatg && detailAttrCatg.length > 0
              ? detailAttrCatg.map((item) => item.attrCatgName).join(", ")
              : "Please Select"}
          </span>
        </div>
      </div>

      {/* Row 3 - Contact Channel & CSR Visible*/}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Contact Channel:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailContactChannel && detailContactChannel.length > 0
              ? detailContactChannel
                  .map((item) => item.contactChannelName)
                  .join(", ")
              : "--"}
          </span>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">CSR Visible:</span>
          <div>
            {detailData.csrVisible === "Y" ? (
              <KeenIcon
                icon="check-circle"
                className="text-green-500 text-sm"
              />
            ) : (
              <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />
            )}
          </div>
        </div>
      </div>

      {/* Row 4 - Project Visible & Instantiation */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Project Visible:</span>
          <div>
            {detailData.configVisible === "Y" ? (
              <KeenIcon
                icon="check-circle"
                className="text-green-500 text-sm"
              />
            ) : (
              <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />
            )}
          </div>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Instantiation:</span>
          <div>
            {detailData.instantiatable === "Y" ? (
              <KeenIcon
                icon="check-circle"
                className="text-green-500 text-sm"
              />
            ) : (
              <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />
            )}
          </div>
        </div>
      </div>

      {/* Row 5 - Editable & Value Nullable */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Editable:</span>
          <div>
            {detailData.editable === "Y" ? (
              <KeenIcon
                icon="check-circle"
                className="text-green-500 text-sm"
              />
            ) : (
              <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />
            )}
          </div>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Value Nullable:</span>
          <div>
            {detailData.nullable === "Y" ? (
              <KeenIcon
                icon="check-circle"
                className="text-green-500 text-sm"
              />
            ) : (
              <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />
            )}
          </div>
        </div>
      </div>

      {/* Row 6 - Prompt Message */}
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Prompt Message:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailData.promptMsg || "--"}
          </span>
        </div>
      </div>

      {/* Row 7 - Input Type */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Input Type:</span>
          <span className="text-sm font-medium text-gray-800">
            {getInputTypeName()}
          </span>
        </div>
      </div>

      {/* Row 8 - Value Script */}
      <div className="grid grid-cols-1 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Value Script:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailData.valueScript || "--"}
          </span>
        </div>
      </div>

      {renderExtraInputTypeFields()}
    </div>
  );

  const renderObjectFeatureFields = () => (
    <div className="space-y-4">
      {/* Row 1 - Feature Type & Feature Code */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Feature Type:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailData.attrType === "1" ? "Basic" : "Object"}
          </span>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Feature Code:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailData.attrCode || "--"}
          </span>
        </div>
      </div>

      {/* Row 2 - Feature Name & Feature Category*/}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Feature Name:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailData.attrName || "--"}
          </span>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Feature Category:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailAttrCatg && detailAttrCatg.length > 0
              ? detailAttrCatg.map((item) => item.attrCatgName).join(", ")
              : "--"}
          </span>
        </div>
      </div>

      {/* Row 3 - Contact Channel & CSR Visible*/}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Contact Channel:</span>
          <span className="text-sm font-medium text-gray-800">
            {detailContactChannel && detailContactChannel.length > 0
              ? detailContactChannel
                  .map((item) => item.contactChannelName)
                  .join(", ")
              : "--"}
          </span>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">CSR Visible:</span>
          <div>
            {detailData.csrVisible === "Y" ? (
              <KeenIcon
                icon="check-circle"
                className="text-green-500 text-sm"
              />
            ) : (
              <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />
            )}
          </div>
        </div>
      </div>

      {/* Row 4 - Project Visible & Instantiation */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Project Visible:</span>
          <div>
            {detailData.configVisible === "Y" ? (
              <KeenIcon
                icon="check-circle"
                className="text-green-500 text-sm"
              />
            ) : (
              <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />
            )}
          </div>
        </div>
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Instantiation:</span>
          <div>
            {detailData.instantiatable === "Y" ? (
              <KeenIcon
                icon="check-circle"
                className="text-green-500 text-sm"
              />
            ) : (
              <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />
            )}
          </div>
        </div>
      </div>

      {/* Row 5 - Editable */}
      <div className="grid grid-cols-2 gap-8">
        <div className="grid grid-cols-[160px_1fr] items-center gap-4">
          <span className="text-sm text-gray-800">Editable:</span>
          <div>
            {detailData.editable === "Y" ? (
              <KeenIcon
                icon="check-circle"
                className="text-green-500 text-sm"
              />
            ) : (
              <KeenIcon icon="cross-circle" className="text-zinc-500 text-sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (!detailData) {
    return (
      <div className="text-gray-500 text-center">
        Select a feature to see details
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-auto">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {selectedFeature?.attrName || "Feature Details"}
        </h3>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {String(detailData.attrType) === "1"
          ? renderBasicFeatureFields()
          : renderObjectFeatureFields()}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
          <AccessWrapper hasAccess={menuPrivAccess.editStatus}>
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedFeature}
            >
              Edit
            </button>
          </AccessWrapper>
          <AccessWrapper hasAccess={menuPrivAccess.deleteStatus}>
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={!selectedFeature}
            >
              Delete
            </button>
          </AccessWrapper>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetailView;
