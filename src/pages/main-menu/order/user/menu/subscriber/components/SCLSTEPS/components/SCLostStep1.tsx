import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSCL } from "../hooks/context";
import { suspensionReason } from "../../SURSTEPS/interface/mock";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import SectionTitle from "../../sectionTitle";

const SCLStep1 = () => {
  const { form, setForm, SCLInfoUseQuery } = useSCL();

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* ================= SIM Card Lost ================= */}
      <SectionTitle title="SIM Card Lost" />

      <div className="grid grid-cols-2 gap-10 gap-y-2 w-full">
        <BuildFormRow label="Card Lost Type">
          <div className="flex gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  lostType: "0",
                }))
              }
            >
              <Input
                type="radio"
                size={"sm"}
                checked={form.lostType === "0"}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    lostType: "0",
                  }))
                }
              />
              <span className="whitespace-nowrap">One-Way Block</span>
            </div>

            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  lostType: "1",
                }))
              }
            >
              <Input
                size={"sm"}
                type="radio"
                checked={form.lostType === "1"}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    lostType: "1",
                  }))
                }
              />
              <span className="whitespace-nowrap">Two-Way Block</span>
            </div>
          </div>
        </BuildFormRow>
      </div>

      {/* ================= Order Information ================= */}
      <SectionTitle title="Order Information" className="mt-5" />

      <div className="grid grid-cols-2 gap-10 gap-y-2 w-full">
        <BuildFormRow label="Order Reason">
          <div className="flex items-center gap-2 w-full">
            <Select
              value={form.susPensionReasonId?.toString()}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  susPensionReasonId: Number(value),
                }))
              }
            >
              <SelectTrigger size="sm" className="flex-1">
                <SelectValue placeholder="Select Order Reason" />
              </SelectTrigger>
              <SelectContent>
                {suspensionReason.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
                {SCLInfoUseQuery.data?.orderReason.map((item) => (
                  <SelectItem
                    key={item.orderReasonId}
                    value={item.orderReasonId.toString()}
                  >
                    {item.orderReasonName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                !form.susPensionReasonId ? "max-w-0" : "max-w-[40px]"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    susPensionReasonId: undefined,
                  }))
                }
              >
                <KeenIcon icon="cross" />
              </Button>
            </div>
          </div>
        </BuildFormRow>

        <div
          className={`transition-all duration-300 overflow-hidden ${
            !form.susPensionReasonId
              ? "opacity-0 max-h-0"
              : "opacity-100 max-h-20"
          }`}
        >
          <BuildFormRow label="Other Order Reason">
            <Input
              size="sm"
              value={form.otherReason}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  otherReason: e.target.value,
                }))
              }
            />
          </BuildFormRow>
        </div>
      </div>
    </div>
  );
};

export default SCLStep1;
