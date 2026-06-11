import z from "zod";

const createAcctAttrItemSchema = z.object({
  attrId: z.number(),
  attrValue: z.string().nullable(),
});

export const AccountFeatureCreateSchema = z.object({
  spId: z.number({ required_error: "Please select a service provider (SpId)" }),
  acctAttrRequestDtos: z.array(createAcctAttrItemSchema),
  srcAcctAttr: z.array(createAcctAttrItemSchema),
});

export const createAccountFeatureDefaultValue =
  (): AccountFeatureCreateSchemaType => ({
    spId: 0,
    acctAttrRequestDtos: [],
    srcAcctAttr: [],
  });

export const AccountAttrItemDefaultValue =
  (): createAcctAttrItemSchemaType => ({
    attrId: 0,
    attrValue: null,
  });

type createAcctAttrItemSchemaType = z.infer<typeof createAcctAttrItemSchema>;

export type AccountFeatureCreateSchemaType = z.infer<
  typeof AccountFeatureCreateSchema
>;
