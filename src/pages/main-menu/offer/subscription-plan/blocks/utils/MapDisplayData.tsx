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