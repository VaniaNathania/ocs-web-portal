import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePayment } from "../../../hooks/PaymentContext";

const Main = () => {
  const { form, setForm, error, setError, OnCredit, setShowRefund } =
    usePayment();
  return (
    <div className="grid grid-cols-1 gap-2">
      <BuildFormRow label="Sum Received" isRequired>
        <div
          className={`input input-sm flex-1 ${error.submitAmount ? "border-red-600" : ""}`}
        >
          <Input
            className="p-0 border-none"
            value={form?.submitAmount ?? ""}
            onChange={(e) => {
              setError((prev) => ({ ...prev, submitAmount: false }));
              setForm((prev) => ({ ...prev, submitAmount: e.target.value }));
            }}
          />
        </div>
      </BuildFormRow>
      <BuildFormRow label="Refund Reason">
        <Input />
      </BuildFormRow>
      <div className="flex flex-row gap-2 justify-end">
        <Button
          size={"sm"}
          onClick={() => {
            OnCredit(false);
            setShowRefund(false);
          }}
        >
          Refund
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
          onClick={() => setShowRefund(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default Main;
