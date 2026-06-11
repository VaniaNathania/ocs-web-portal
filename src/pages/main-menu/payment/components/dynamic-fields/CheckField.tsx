import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayment } from "../../hooks/PaymentContext";
import IssueDateField from "./IssueDateField";
import { Input } from "@/components/ui/input";
import ExpiryDateField from "./ExpiryDateField";

interface CheckFieldProps {
  errorBank?: boolean;
  errorCheckNo?: boolean;
  valueBank?: number;
  valueCheckNo?: string;
  onChange: (value: string) => void;
  onValueChange: (value: number) => void;
}

const CheckField = ({ errorBank, errorCheckNo, valueBank, valueCheckNo, onChange, onValueChange }: CheckFieldProps) => {
  const { bankDatas, form, setForm } = usePayment();
  return (
    <>
      {/* Bank Name */}
      <div className="flex flex-row items-center gap-2">
        <Label className="w-36">
          Bank Name <span className="text-red-500">*</span>
        </Label>
        <div className={`input input-sm flex-1 ${errorBank ? "border-red-600" : ""}`}>
          <Select value={String(valueBank) ?? undefined} onValueChange={(e) => onValueChange(Number(e))}>
            <SelectTrigger className="border-none bg-transparent p-0">
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              {/* {paymentUseQuery.data?.paymentMethod.map((item) => {
                      // if (item.paymentMethodId === 1 || item.paymentMethodId === 6)
                      return (
                        <SelectItem value={item.paymentMethodId.toString()} key={item.paymentMethodId}>
                          {item.paymentMethodName}
                        </SelectItem>
                      );
                    })} */}
              {bankDatas?.map((item) => (
                <SelectItem value={String(item.bankId)} key={item.bankId}>
                  {item.bankName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Issue Date date field */}
      <IssueDateField
        value={form?.checkIssueDate ?? ""}
        onChange={(value) => {
          setForm((prev) => ({
            ...prev,
            checkIssueDate: value,
          }));
        }}
      />

      {/* Check No */}
      <div className="flex flex-row items-center gap-2">
        <Label className="w-36">
          Check No <span className="text-red-500">*</span>
        </Label>
        <div className={`input input-sm flex-1 ${errorCheckNo ? "border-red-600" : ""}`}>
          <Input className="p-0 border-none" size="sm" value={valueCheckNo} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>

      {/* Expiry Date date field */}
      <ExpiryDateField
        value={form?.checkExpDate ?? ""}
        onChange={(value) => {
          setForm((prev) => ({
            ...prev,
            checkExpDate: value,
          }));
        }}
      />

      {/* Issue Date text field */}
      <div className="flex flex-row items-center gap-2">
        <Label className="w-36">Issue Date</Label>
        <div className="input input-sm flex-1">
          <Input
            className="p-0 border-none"
            size="sm"
            value={form?.check?.issueDateText}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                check: {
                  ...prev?.check,
                  issueDateText: e.target.value,
                },
              }))
            }
          />
        </div>
      </div>

      {/* Expiry Date text field */}
      <div className="flex flex-row items-center gap-2">
        <Label className="w-36">Expiry Date</Label>
        <div className="input input-sm flex-1">
          <Input className="p-0 border-none" size="sm" value={form?.check?.expiryDateText} onChange={(e) => setForm((prev) => ({ ...prev, check: { ...prev?.check, expiryDateText: e.target.value } }))} />
        </div>
      </div>
    </>
  );
};

export default CheckField;
