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
import { useSubscriberListContext } from "../../../hooks";
import { useReplacement } from "../hooks/context";
import { suspensionReason } from "../../SURSTEPS/interface/mock";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import SectionTitle from "../../sectionTitle";

const RepSteps2 = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { form, setForm, RepInfoUseQuery, allData } = useReplacement();

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* ================= Offer Information ================= */}
      <SectionTitle title="Offer Information" />

      <div className="grid grid-cols-2 w-full gap-10 gap-y-2">
        <BuildFormRow label="Subscription Plan">
          <Input size="sm" value={selectedSubs?.subsPlanName} disabled />
        </BuildFormRow>

        <BuildFormRow label="Order Number">
          <Input size="sm" value={allData?.custOrderNbr} disabled />
        </BuildFormRow>

        <BuildFormRow label="Service Number">
          <Input size="sm" value={selectedSubs?.accNbr} disabled />
        </BuildFormRow>
      </div>

      {/* ================= Order Information ================= */}
      <SectionTitle title="Order Information" className="mt-5" />

      <div
        className={`grid grid-cols-2 gap-10 ${!form.susPensionReasonId ? "gap-y-0" : "gap-y-2"} w-full`}
      >
        <BuildFormRow label="Order Reason">
          <div
            className={`flex items-center ${!form.susPensionReasonId ? "gap-0" : "gap-2"}  w-full`}
          >
            <Select
              value={form.susPensionReasonId?.toString()}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  susPensionReasonId: Number(value),
                }))
              }
              disabled
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
                {RepInfoUseQuery?.data?.orderReason.map((item) => (
                  <SelectItem
                    key={item.orderReasonId}
                    value={item.orderReasonId.toString()}
                  >
                    {item.orderReasonName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled
            />
          </BuildFormRow>
        </div>
      </div>
    </div>
  );
};

export default RepSteps2;
