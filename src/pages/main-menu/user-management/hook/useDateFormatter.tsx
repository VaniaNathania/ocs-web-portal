import { useCallback } from "react";
import { UseFormSetValue } from "react-hook-form";
import { UserMData } from "../hook/UserManagementProvider";

// Hook to handle date formatting + checkbox "Effective Now"
export const useDateFormatter = (setValue: UseFormSetValue<UserMData>) => {
  // Format JS Date -> "YYYY-MM-DD HH:mm:ss"
  const formatDateTime = useCallback((date: Date): string => {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
  }, []);

  // Convert value from input/checkbox before sending to API
  const normalizeDate = useCallback((value: string): string => {
    if (!value) return "";

    // input type="datetime-local" returns "YYYY-MM-DDTHH:mm"
    if (value.includes("T")) {
      return value.replace("T", " ") + ":00";
    }
    return value; // already formatted by checkbox
  }, []);

  // Handle "Effective Now" checkbox
  const setEffectiveNow = useCallback(
    (checked: boolean) => {
      if (checked) {
        const now = new Date();
        const formatted = formatDateTime(now);
        setValue("userEffDate", formatted, { shouldValidate: true });
      } else {
        setValue("userEffDate", "", { shouldValidate: true });
      }
    },
    [formatDateTime, setValue]
  );

  return {
    formatDateTime,
    normalizeDate,
    setEffectiveNow,
  };
};
