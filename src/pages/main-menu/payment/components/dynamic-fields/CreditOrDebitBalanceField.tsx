import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IssueDateField from "./IssueDateField";
import ExpiryDateField from "./ExpiryDateField";
import { usePayment } from "../../hooks/PaymentContext";

interface CreditOrDebitBalanceProps {
  error?: boolean;
  value?: string;
  onChange: (value: string) => void;
}

const CreditOrDebitBalanceFields = ({ error, value, onChange }: CreditOrDebitBalanceProps) => {
  const { form, setForm } = usePayment();
  return (
    <>
      {/* Card No */}
      <div className="flex flex-row items-center gap-2">
        <Label className="w-36">
          Card No <span className="text-red-500">*</span>
        </Label>
        <div className={`input input-sm flex-1 ${error ? "border-red-600" : ""}`}>
          <Input className="p-0 border-none" size="sm" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>

      {/* Issue Date date field */}
      <IssueDateField
        value={form?.checkIssueDate ?? ""}
        onChange={(value) =>
          setForm((prev) => ({
            ...prev,
            checkIssueDate: value,
          }))
        }
      />

      {/* Expiry Date date field */}
      <ExpiryDateField
        value={form?.checkExpDate ?? ""}
        onChange={(value) =>
          setForm((prev) => ({
            ...prev,
            checkExpDate: value,
          }))
        }
      />
    </>
  );
};

export default CreditOrDebitBalanceFields;
