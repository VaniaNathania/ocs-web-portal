import { Path } from "react-hook-form";
import { DiscountPayload } from "../../types/form";
import { useEffect } from "react";

export const useSyncDpRefCondType = (
  conditionList: Condition[],
  dpRefCondType: string | null,
  path: Path<DiscountPayload>,
  setValue: (name: Path<DiscountPayload>, value: "A" | null) => void
) => {
  useEffect(() => {
    if (conditionList.length > 0 && dpRefCondType === null) {
      setValue(path, "A");
    } else if (conditionList.length === 0 && dpRefCondType === "A") {
      setValue(path, null);
    }
  }, [conditionList, dpRefCondType, path, setValue]);
};
