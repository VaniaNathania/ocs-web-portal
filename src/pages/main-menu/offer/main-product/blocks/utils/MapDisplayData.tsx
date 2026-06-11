export type OfferType = "2" | "3" | "4";

export interface OfferTypeMeta {
  attrCatg: "1" | "2" | "3";
  offerName: string;
}

export const MapDisplayData = (rowData: any) => {
  const effectiveTypeMap: Record<string, string> = {
    A: "Special Day",
    B: "Instant",
    C: "Next Day",
    D: "Next Week",
    E: "Next Month",
    F: "Next Billing Cycle",
    G: "The Cycle After Next Cycle",
    H: "Special Time",
  };

  const effectiveTypeLabel = rowData?.effType
    ? rowData.effType
        .split("|")
        .map((value: string) => effectiveTypeMap[value] || value)
        .join(" | ")
    : "-";

  return {
    ...rowData,
    effectiveTypeDisplay: effectiveTypeLabel,
    paidFlagDisplay: rowData?.paidFlag === "" ? "-" : rowData?.paidFlag === "N" ? "Pre-Paid" : "Post-Paid",
    productLineDisplay: rowData?.prodType === null ? "-" : rowData?.prodType === "F" ? "Fix" : "Mobile",
  };
};



export const OFFER_TYPE_LABEL: Record<OfferType, OfferTypeMeta> = {
    "2": {
      attrCatg: "1",
      offerName: "Main Product"
    },
    "3": {
      attrCatg: "2",
      offerName: "Related Product"
    },
    "4": {
      attrCatg: "3",
      offerName: "Price Plan"
    },
  };