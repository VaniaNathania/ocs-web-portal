import { createDefaultReferenceObject, ReferenceObject } from "../types/form";

export const isDefaultObject = (obj: ReferenceObject | null) => {
  if (!obj) return true;
  return JSON.stringify(obj) === JSON.stringify(createDefaultReferenceObject());
};
