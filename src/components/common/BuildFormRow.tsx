import React from "react";
import { cn } from "@/utils/cn";

interface Props {
  label: string;
  isRequired?: boolean;
  children?: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

const BuildFormRow = ({
  children,
  label,
  isRequired,
  className,
  labelClassName,
}: Props) => {
  return (
    <div className={cn("flex flex-col space-y-1 w-full", className)}>
      <label
        className={cn("text-sm font-medium text-gray-700", labelClassName)}
      >
        {label}
        {isRequired && (
          <span className="text-red-500 ml-0.5 font-semibold">*</span>
        )}
      </label>
      <div className="w-full flex-1 flex items-start">{children}</div>
    </div>
  );
};

export { BuildFormRow };
