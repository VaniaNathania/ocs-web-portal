import { z } from "zod";

const baseSchema = { operationType: z.string() };

const stringRequired = z.string().min(1, "This field is required");

const bindingWhithNumber = z.object({
  ...baseSchema,
  operationType: z.literal("0"),
  prefix: stringRequired,
  accNbrBegin: stringRequired,
  accNbrEnd: stringRequired,
  accNbrQuantity: z.number().optional().nullable(),
  iccidBegin: stringRequired,
  iccidEnd: stringRequired,
  iccidQuantity: z.number().optional().nullable(),
  matchType: z.string(),
});

const unbindingWithNumber = z.object({
  ...baseSchema,
  operationType: z.literal("1"),
  prefix: stringRequired,
  accNbrBegin: stringRequired,
  accNbrEnd: stringRequired,
  accNbrQuantity: z.number().optional().nullable(),
});

const bindingByFile = z.object({
  ...baseSchema,
  operationType: z.literal("2"),
  file: z.instanceof(File).nullable().optional(),
});

const unbindingByFile = z.object({
  ...baseSchema,
  operationType: z.literal("3"),
  file: z.instanceof(File).nullable().optional(),
});

export const SimNumberBindUnbindSchema = z.discriminatedUnion("operationType", [
  bindingWhithNumber,
  unbindingWithNumber,
  bindingByFile,
  unbindingByFile,
]);

// .superRefine((data, ctx) => {
// //  console.log("data", data);
//   const requireFields = (fields: (keyof typeof data)[]) => {
//     fields.forEach((field) => {
//       const value = data[field];
//       if (value === undefined || value === null || value === "") {
//         ctx.addIssue({
//           path: [field],
//           code: z.ZodIssueCode.custom,
//           message: "This field is required",
//         });
//       }
//     });
//   };

//   if (data.operationType === "0") {
//     requireFields(["accNbrBegin", "accNbrEnd", "iccidBegin", "iccidEnd", "prefix"]);
//   }

//   if (data.operationType === "1") {
//     requireFields(["accNbrBegin", "accNbrEnd", "prefix"]);
//   }
// });

export type SimNumberBindUnbindForm = z.infer<typeof SimNumberBindUnbindSchema>;

export const initialForm = (): SimNumberBindUnbindForm => ({
  operationType: "0",
  prefix: "",
  accNbrBegin: "",
  accNbrEnd: "",
  accNbrQuantity: null,
  iccidBegin: "",
  iccidEnd: "",
  iccidQuantity: null,
  matchType: "0",
});
