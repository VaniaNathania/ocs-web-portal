import { z } from "zod";
import { formPreNew } from "../interface";

export const Step3TypeSchema = (form: formPreNew) =>
  z
    .object({
      prefix: z.string().min(1, "This field is required").optional(),
      accNbrBegin: z.string().min(1, "This field is required").optional(),
      accNbrEnd: z.string().min(1, "This field is required").optional(),
      quantityAccNbr: z.number().min(1, "This field is required").optional(),
      quantityIccid: z.number().min(1, "This field is required").optional(),
      searchQuantity: z.number().min(1, "This field is required").optional(),
      iccidBegin: z.string().min(1, "This field is required").optional(),
      iccidEnd: z.string().min(1, "This field is required").optional(),
    })
    .superRefine((data, ctx) => {
      //  console.log("data", data);
      const requireFields = (fields: (keyof typeof data)[]) => {
        fields.forEach((field) => {
          if (!data[field]) {
            ctx.addIssue({
              path: [field],
              code: z.ZodIssueCode.custom,
              message: "This field is required",
            });
          }
        });
      };

      if (form.operationType === "1" && form.searchType === "0") {
        if (form.resourceType === "0") {
          requireFields([
            "prefix",
            "accNbrBegin",
            "accNbrEnd",
            "quantityAccNbr",
          ]);
        }

        if (form.resourceType === "1") {
          requireFields(["iccidBegin", "iccidEnd", "quantityIccid"]);
        }

        if (form.resourceType === "2") {
          requireFields([
            "prefix",
            "accNbrBegin",
            "accNbrEnd",
            "iccidBegin",
            "iccidEnd",
            "quantityAccNbr",
            "quantityIccid",
          ]);
        }
      }

      if (form.operationType === "1" && form.searchType === "1") {
        if (form.resourceType === "0") {
          requireFields(["prefix", "accNbrBegin", "searchQuantity"]);
        }

        if (form.resourceType === "1") {
          requireFields(["iccidBegin", "searchQuantity"]);
        }

        if (form.resourceType === "2") {
          requireFields([
            "prefix",
            "accNbrBegin",
            "iccidBegin",
            "searchQuantity",
          ]);
        }
      }
    });

export type Step3Form = z.infer<ReturnType<typeof Step3TypeSchema>>;
