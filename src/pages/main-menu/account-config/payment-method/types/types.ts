interface PaymentMethod {
  paymentMethodId: number;
  paymentMethodName: string;
  comments: string | null;
  paymentType: string;
  paymentTypeName: string;
  spId: number | null;
  paymentMethodCode: number | null;
  systemReserved: "Y" | "N";
}

interface PaymentType {
  paymentType: string;
  paymentTypeName: string;
  comments: string | null;
}

interface ParameterPaymentSchema {
  paymentMethodId: number;
  daysBefExtra: number;
  spIban: string;
  reIssueDelay: number;
  closeMandateLimit: number;
}
