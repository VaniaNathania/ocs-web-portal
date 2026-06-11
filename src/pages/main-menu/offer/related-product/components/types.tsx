import { LifecycleTypeProps, ServiceTypeProps } from "../actions/RelatedProductActions";
import { initialStateAddDialog } from "../blocks/AddDialog";

// Effective Type Options
export const effectiveTypeOptions = [
  { value: "A", label: "Special Day" },
  { value: "B", label: "Instan" },
  { value: "C", label: "Next Day" },
  { value: "D", label: "Next Week" },
  { value: "E", label: "Next Month" },
  { value: "F", label: "Next Billing Cycle" },
  { value: "G", label: "The Cycle After Next Cycle" },
];

export const getEffectiveTypeLabel = (effType: string | null | undefined): string => {
  if (!effType) return "-";

  return effType
    .split("|") // ← ubah dari koma ke garis vertikal
    .map((val) => {
      const found = effectiveTypeOptions.find((item) => item.value === val.trim());
      return found?.label || val.trim();
    })
    .join(", ");
};

// Duplicate Order Options
export const duplicateOrderOptions = [
  { value: "A", label: "Don't Allow to Duplicate Order" },
  {
    value: "B",
    label: "Extend Effective period of original instance from sysdate",
  },
  { value: "C", label: "Add Offer Instance, Don't Change Old Instance" },
  { value: "D", label: "Add Offer Instance, Cancel Old Instance" },
  {
    value: "E",
    label: "Extend Effective period of original instance from ExpDate",
  },
  {
    value: "F",
    label: "Add Offer Instance, New Instance EffDate equal Old ExpDate",
  },
];

export const getDuplicateOrderLabel = (value: string | null | undefined): string => {
  if (!value) return "-";
  const found = duplicateOrderOptions.find((item) => item.value === value.trim());
  return found?.label || value;
};

export const AgreementEffective = [
  { value: "1", label: "Next Day" },
  {
    value: "2",
    label: "Next Month",
  },
  { value: "3", label: "Next Billing Cycle" },
  { value: "4", label: "Today 0:00" },
];

export const getYesNoLabel = (value: string | null | undefined): string => {
  if (value === "Y") return "Yes";
  if (value === "N") return "No";
  return "-";
};

export const TIME_UNIT_MAP: Record<string, string> = {
  Y: "Year",
  M: "Month",
  W: "Week",
  D: "Day",
  H: "Hour",
  C: "Billing Cycle",
  S: "Exact Time",
};

export const AgreementEffType: Record<string, string> = {
  1: "Next Day",
  2: "Next Month",
  3: "Next Billing Cycle",
  4: "Today 0:00",
};

export const renderExpOff = (expOff?: number | string, expTimeUnit?: string): string => {
  if (!expOff || !expTimeUnit) return "-";
  const unitLabel = TIME_UNIT_MAP[expTimeUnit] || expTimeUnit;
  return `${expOff} ${unitLabel}`;
};

export const agreementPeriod = (cycleQuantity?: number | string, timeUnit?: string): string => {
  if (!cycleQuantity || !timeUnit) return "-";
  const unitLabel = TIME_UNIT_MAP[timeUnit] || timeUnit;
  return `${cycleQuantity} ${unitLabel}`;
};

export const AgreementEff = (agreementEffType?: string): string => {
  if (!agreementEffType) return "-";
  return AgreementEffType[agreementEffType] || "-";
};

// export const
export function getServTypeName(servType: number | string | undefined, serviceTypeList: ServiceTypeProps[]): string {
  if (servType === undefined || servType === null) return "-";

  const id = typeof servType === "string" ? parseInt(servType) : servType;
  const found = serviceTypeList.find((item) => item.servType === id);
  return found?.servTypeName ? `${found.servTypeName} [${found.networkTypeName}]` : (found?.servTypeName ?? "-");
}

export function getLifecycleType(
  lifecycleType: number | string | undefined,
  lifecycleTypeList: LifecycleTypeProps[]
): string {
  if (lifecycleType === undefined || lifecycleType === null) return "-";

  const id = typeof lifecycleType === "string" ? parseInt(lifecycleType) : lifecycleType;
  const found = lifecycleTypeList.find((item) => item.lifecycleType === id);
  return found?.lifecycleTypeName ?? "-";
}

export const getSelectedEffectiveTypes = (effType: string) => {
  if (!effType) return [];
  return effType.split("|").filter((type) => type.trim() !== ""); // filter empty strings
};

export const getEffectiveTypeDisplayText = (effType: string) => {
  const selected = getSelectedEffectiveTypes(effType);
  if (selected.length === 0) return "Select Effective Type";
  if (selected.length === 1) {
    const option = effectiveTypeOptions.find((opt) => opt.value === selected[0]);
    return option?.label || selected[0];
  }
  return `${selected.length} items selected`;
};

export const formatNumber = (value: any) => {
  if (!value) return "-";
  return new Intl.NumberFormat("id-ID").format(Number(value));
};
