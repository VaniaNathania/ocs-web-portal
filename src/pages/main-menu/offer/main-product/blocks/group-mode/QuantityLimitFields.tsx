// QuantityLimitField.tsx
import React from "react";

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
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Quantity Limit</label>
      <div className="flex space-x-2">
        <input
          type="number"
          min={0}
          placeholder="Lower Limit"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={lower}
          onChange={(e) => onChange("lowerLimit", parseInt(e.target.value))}
        />
        <label className="mt-2">-</label>
        <input
          type="number"
          min={0}
          placeholder="Upper Limit"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={upper}
          onChange={(e) => onChange("upperLimit", parseInt(e.target.value))}
        />
      </div>
    </div>
  );
};

export default QuantityLimitField;
