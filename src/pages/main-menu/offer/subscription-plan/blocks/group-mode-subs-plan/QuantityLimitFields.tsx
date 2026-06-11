// QuantityLimitField.tsx
import React, { useEffect, useState } from "react";

interface QuantityLimitFieldProps {
  lower?: number;
  upper?: number;
  onChange: (field: "lowerLimit" | "upperLimit", value: number) => void;
}

const QuantityLimitField: React.FC<QuantityLimitFieldProps> = ({
  lower,
  upper,
  onChange,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lower && upper) {
      if (lower > upper)
        setErrors({ quantity: "Lower quantity must be bellow upper limit" });
    }
  }, []);
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Quantity Limit</label>
      <div className="flex space-x-2">
        <input
          type="number"
          placeholder="Lower Limit"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={lower}
          onChange={(e) => onChange("lowerLimit", parseInt(e.target.value))}
        />
        <label className="mt-2">-</label>
        <input
          type="number"
          placeholder="Upper Limit"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={upper}
          onChange={(e) => onChange("upperLimit", parseInt(e.target.value))}
        />
      </div>
      {errors["quantity"] && (
        <div className="text-red-500 text-xs ">{errors["quantity"]}</div>
      )}
    </div>
  );
};

export default QuantityLimitField;
