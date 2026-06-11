import React, { useEffect } from "react";
import { useState } from "react";

interface EffectiveTimeFieldProps {
  start?: string;
  end?: string;
  onChange: (field: "effDate" | "expDate", value: string) => void;
}

const EffectiveTimeField: React.FC<EffectiveTimeFieldProps> = ({
  start,
  end,
  onChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // useEffect(() => {
  // //  console.log(start, end);
  // }, [start, end]);

  return (
    <div>
      {/* Label untuk keduanya */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Effective Time <span className="text-red-500">*</span>
      </label>

      {/* Dua input sejajar */}
      <div className="flex gap-2">
        {/* Effective Date */}
        <div className="w-1/2">
          <input
            type="date"
            value={start ? start.split("T")[0] : ""}
            onChange={(e) => onChange("effDate", e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offer.effDate"] ? "border-red-500" : "border-gray-300"}`}
            disabled={isSubmitting}
          />
          {errors["offer.effDate"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["offer.effDate"]}
            </p>
          )}
        </div>

        <label className="mt-2">-</label>

        {/* Expired Date */}
        <div className="w-1/2">
          <input
            type="date"
            value={end ? end.split("T")[0] : ""}
            onChange={(e) => onChange("expDate", e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors["offer.expDate"] ? "border-red-500" : "border-gray-300"}`}
            disabled={isSubmitting}
          />
          {errors["offer.expDate"] && (
            <p className="text-red-500 text-xs mt-1">
              {errors["offer.expDate"]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EffectiveTimeField;
