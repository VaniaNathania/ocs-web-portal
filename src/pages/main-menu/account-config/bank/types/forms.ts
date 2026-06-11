import z from "zod";

export const createBankSchema = z
  .object({
    parentId: z.number().nullable(),
    bankName: z.string().min(1, "Bank Name is required"),
    comments: z.string().nullable(),
    stateDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, must be YYYY-MM-DD"),
    bankCode: z.string().min(1, "Bank Code is required"),
    spId: z.number(),
    countryCode: z.string().min(1, "Country Code is required"),
    sepaAction: z.string(),
    bic: z.string().nullable(),
    directDebitFlag: z.string().nullable(),
    ibanFormat: z.string().nullable(),
  })
  // .refine(
  //   (data) => {
  //     // Jika sepaAction bukan "" atau "del", maka bic harus diisi
  //     if (data.sepaAction !== "" && data.sepaAction !== "del") {
  //       return data.bic && data.bic.trim().length > 0;
  //     }
  //     return true;
  //   },
  //   {
  //     message: "BIC is required when Sepa Bank is enabled",
  //     path: ["bic"],
  //   }
  // )
  // .refine(
  //   (data) => {
  //     // Jika sepaAction bukan "" atau "del", maka ibanFormat harus diisi
  //     if (data.sepaAction !== "" && data.sepaAction !== "del") {
  //       return data.ibanFormat && data.ibanFormat.trim().length > 0;
  //     }
  //     return true;
  //   },
  //   {
  //     message: "IBAN Format is required when Sepa Bank is enabled",
  //     path: ["ibanFormat"],
  //   }
  // );
export const defaultCreateBankPayload = (): BankAddPayload => ({
  bankCode: "",
  bankName: "",
  comments: null,
  countryCode: "0",
  directDebitFlag: null,
  ibanFormat: null,
  parentId: null,
  sepaAction: "",
  spId: 0,
  stateDate: new Date().toISOString().split("T")[0],
  bic: null,
});
