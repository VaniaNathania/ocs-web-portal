import { UseFormReturn, useWatch } from "react-hook-form";
import { DiscountPayload } from "../../types/form";
import { useEffect } from "react";
import { isDefaultObject } from "../../utils/objectUtils";

export const useSyncGroupName = (forms: UseFormReturn<DiscountPayload>) => {
  const { setValue, control } = forms;

  const discountName = useWatch({ control, name: "discountName" });
  const referenceObject = useWatch({ control, name: "referenceObject" });
  const applyingObject = useWatch({ control, name: "applyingObject" });
  const calculationObject = useWatch({ control, name: "calculationObject" });

  useEffect(() => {
    if (!discountName) return;

    const groupName = `${discountName} Group`;
    setValue("tabDpCondGrpName", groupName);

    const syncNested = (object: any, path: keyof DiscountPayload) => {
      const currentGroupName = object?.tabDpCondGrpName;
      if (object && currentGroupName !== groupName) {
        setValue(`${path}.tabDpCondGrpName` as any, groupName);
      }
    };

    syncNested(referenceObject, "referenceObject");
    syncNested(applyingObject, "applyingObject");
    syncNested(calculationObject, "calculationObject");
  }, [
    discountName,
    referenceObject,
    applyingObject,
    calculationObject,
    setValue,
  ]);
};
