// import { DiscountPayload } from "./DiscountList";
import { FormProvider, Path, UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import DiscountConditionForm from "./condition/DiscountCondition";
import ReferenceObjectConditionForm from "./condition/ReferenceObjectCondition";
import CalculationObjectConditionForm from "./condition/CalculationCondition";
import ApplyingObjectConditionForm from "./condition/ApplyingCondition";
import { DiscountPayload } from "../types/form";
import { useSyncDpRefCondType } from "../hooks/form/useSyncDpRefCondType";

interface ConditionFormProps {
  forms: UseFormReturn<DiscountPayload>;
}

const ConditionForm = ({ forms }: ConditionFormProps) => {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = forms;

  const [activeTab, setActiveTab] = useState("discount");

  const hasCalculation = watch("calculationObject") !== null;
  const hasApplying = watch("applyingObject") !== null;

  const discountCondition = watch("insertDiscountConditionGroup") || [];
  const referenceCondition =
    watch("referenceObject.insertDiscountConditionGroup") || [];
  const calculationCondition =
    watch("calculationObject.insertDiscountConditionGroup") || [];
  const applyingCondition =
    watch("applyingObject.insertDiscountConditionGroup") || [];

  const tabs = [
    { id: "discount", label: "Discount", component: <DiscountConditionForm /> },
    {
      id: "referenceObject",
      label: "Reference Object",
      component: <ReferenceObjectConditionForm />,
    },
    ...(hasCalculation
      ? [
          {
            id: "calculationObject",
            label: "Calculation Object",
            component: <CalculationObjectConditionForm />,
          },
        ]
      : []),
    ...(hasApplying
      ? [
          {
            id: "applyingObject",
            label: "Applying Object",
            component: <ApplyingObjectConditionForm />,
          },
        ]
      : []),
  ];

  useSyncDpRefCondType(
    discountCondition,
    watch("dpRefCondType"),
    "dpRefCondType",
    setValue
  );
  useSyncDpRefCondType(
    referenceCondition,
    watch("referenceObject.dpRefCondType"),
    "referenceObject.dpRefCondType",
    setValue
  );
  useSyncDpRefCondType(
    calculationCondition,
    watch("calculationObject.dpRefCondType"),
    "calculationObject.dpRefCondType",
    setValue
  );
  useSyncDpRefCondType(
    applyingCondition,
    watch("applyingObject.dpRefCondType"),
    "applyingObject.dpRefCondType",
    setValue
  );

  return (
    <FormProvider {...forms}>
      {/* Tabs Header */}
      <div className="flex mb-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="p-4 bg-white border rounded-lg shadow-sm">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </FormProvider>
  );
};

export default ConditionForm;
