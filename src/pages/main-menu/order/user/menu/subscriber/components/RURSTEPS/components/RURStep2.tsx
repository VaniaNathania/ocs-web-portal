import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubscriberListContext } from "../../../hooks";
import { useRUR } from "../hooks/context";
import SectionTitle from "../../sectionTitle";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { suspensionReason } from "../../SURSTEPS/interface/mock";

const RURStep2 = () => {
  const { selectedSubs, startOrderFlow } = useSubscriberListContext();
  const { form, setForm, allDatas } = useRUR();
  // console.log(selectedSubs);

  // if (!startOrderFlow.data?.custOrderNbr) return;

  return (
    <div className="flex flex-col gap-2 w-full">
      <SectionTitle title="Offer Information" />

      <div className="grid grid-cols-2 w-full gap-10 gap-y-2">
        <BuildFormRow label="Subscription Plan">
          <Input size="sm" value={selectedSubs?.subsPlanName} disabled />
        </BuildFormRow>

        <BuildFormRow label="Order Number">
          <Input size="sm" value={allDatas?.custOrderNbr ?? ""} disabled />
        </BuildFormRow>

        <BuildFormRow label="Service Number">
          <Input size="sm" value={selectedSubs?.accNbr} disabled />
        </BuildFormRow>
        <BuildFormRow label="Payment Account">
          <Input size="sm" value={selectedSubs?.acctNbr} disabled />
        </BuildFormRow>
      </div>
      <SectionTitle title="Order Information" />

      <div className="grid-cols-2 grid gap-10 gap-y-2 w-full">
        {form.suspensionReasonId === "1" && (
          <BuildFormRow label="Order Reason">
            <Select
              value={form.suspensionReasonId ?? ""}
              onValueChange={(value) =>
                setForm(
                  (prev) => (prev = { ...prev, suspensionReasonId: value }),
                )
              }
              disabled
            >
              <SelectTrigger className="flex-1" size="sm">
                <SelectValue placeholder="Select Suspension Reason" />
              </SelectTrigger>
              <SelectContent>
                {suspensionReason.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BuildFormRow>
        )}

        {allDatas?.orderItemList[0].orderReason != "" && (
          <BuildFormRow label="Other Order Reason">
            <Input
              size={"sm"}
              className="flex-1"
              value={allDatas?.orderItemList[0].orderReason}
              disabled
            />
          </BuildFormRow>
        )}
      </div>
    </div>
  );
};

export default RURStep2;
