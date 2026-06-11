import { usePayment } from "../../hooks/PaymentContext";
import ExpiryDateField from "./ExpiryDateField";
import IssueDateField from "./IssueDateField";

const DeductDepositField = () => {
  const { form, setForm } = usePayment();
  return (
    <>
      {/* Issue Date date field */}
      <IssueDateField value={form?.checkIssueDate ?? ""} onChange={(value) => setForm((prev) => ({ ...prev, checkIssueDate: value }))} />

      {/* Expiry Date date field */}
      <ExpiryDateField value={form?.checkExpDate ?? ""} onChange={(value) => setForm((prev) => ({ ...prev, checkExpDate: value }))} />
    </>
  );
};

export default DeductDepositField;
