import React from "react";
import { useState } from "react";
import { apiConfigOffer } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { subsPlanPriceProps } from "../components/DetailCategoryContent/SubscriptionPriceContent";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface PriceFormSectionProps {
  title: string;
  data: subsPlanPriceProps;
  onChange: (key: keyof subsPlanPriceProps, value: string) => void;
  onSave: () => void;
}

const API_URL_OFFER = apiConfigOffer.offer;

const fields: { key: keyof subsPlanPriceProps; label: string; type?: "textarea" }[] = [
  { key: "goodsSaleAmount", label: "Sale Price" },
  { key: "goodsDiscountAmount", label: "Good Discount Amount" },
  { key: "totalRebateAmount", label: "Total Rebate Amount" },
  { key: "rebateAmount", label: "Rebate Amount" },
  { key: "rebateCount", label: "Rebate Count" },
  { key: "rentListPrice", label: "Rent Price" },
  { key: "comments", label: "Remarks", type: "textarea" }, 
];

const PriceFormSection: React.FC<PriceFormSectionProps> = ({ title, data, onChange, onSave }) => {
  const {menuPrivAccess} = useOfferLayout()
  // ambil semua field kecuali remarks
  const mainFields = fields.filter((f) => f.key !== "comments");
  const remarksField = fields.find((f) => f.key === "comments");

  const { GetData } = useCallApi();
  const [isEdit, setIsEdit] = useState(false);

  const handleSave = () => {
    setIsEdit(false);
    onSave?.();
  };

  const handleCancel = () => {
    setIsEdit(false);
  };

  return (
    <div className="p-6 border rounded-md mb-6">
      <h3 className="flex items-center gap-3 font-semibold text-gray-800 mb-4">
        <span className="w-1 h-5 bg-blue-600 inline-block rounded" />
        {title}
      </h3>

      <div className="space-y-4">
        {/* grid 2 kolom untuk salePrice sampai penalty */}
        <div className="grid grid-cols-2 gap-8">
          {mainFields.map(({ key, label }) => (
            <div key={key} className="grid grid-cols-[160px_1fr] items-center gap-4">
              <span className="text-sm text-gray-800">{label}:</span>
              <input
                type="text"
                value={data[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                disabled={!isEdit}
              />
            </div>
          ))}
        </div>

        {/* remarks tetap full 1 kolom */}
        {remarksField && (
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-[160px_1fr] items-center gap-4">
              <span className="text-sm text-gray-800">{remarksField.label}:</span>
              <textarea
                value={data[remarksField.key] ?? ""}
                onChange={(e) => onChange(remarksField.key, e.target.value)}
                rows={2}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                disabled={!isEdit}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-2 pt-4">
          {isEdit ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <AccessWrapper hasAccess={menuPrivAccess?.editStatus}>
            <button
              type="button"
              onClick={() => setIsEdit(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit
            </button>
            </AccessWrapper>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceFormSection;
