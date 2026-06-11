import React from "react";
import UnderConstruction from "../common/UnderConstruction";

interface stepForm {
  step: number;
  items: stepItem[];
  label?: boolean;
}

export interface stepItem {
  label?: string;
  item?: React.ReactNode;
}

export const StepForm = ({ step, items, label = true }: stepForm) => {
  if (!items[step]?.item) {
    return (
      <div className="flex flex-col gap-2 h-full transition-all duration-300">
        {label && (
          <div className="p-5 flex flex-row gap-2">
            <div className="w-1 h-6 bg-primary"></div>
            <span className="font-bold">
              {items[step]?.label ?? `Step ${step + 1}`}
            </span>
          </div>
        )}
        <div className="flex-1 flex items-center">
          <UnderConstruction desc={`Step ${step + 1} is Under Construction`} />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col gap-2 h-full w-full transition-all duration-300">
        {label && (
          <div className="p-5 flex flex-row gap-2">
            <div className="w-1 h-6 bg-primary"></div>
            <span className="font-bold">
              {items[step]?.label ?? `Step ${step + 1}`}
            </span>
          </div>
        )}
        <div className="flex-1 w-full">{items[step].item}</div>
      </div>
    );
  }
};
