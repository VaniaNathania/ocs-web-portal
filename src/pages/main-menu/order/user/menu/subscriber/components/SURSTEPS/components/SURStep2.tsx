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
import {
  periodType,
  reactivationTime,
  suspensionReason,
} from "../interface/mock";
import { useSUR } from "../hooks/context";
import SectionTitle from "../../sectionTitle";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const SURStep2 = () => {
  const { selectedSubs, startOrderFlow } = useSubscriberListContext();
  const { form, setForm, allData, isLoadingSUR } = useSUR();
  // console.log(selectedSubs);

  // if (!startOrderFlow.data?.custOrderNbr) return;

  return (
    <div className="flex flex-col gap-2 w-full">
      {isLoadingSUR && <Loading />}
      <SectionTitle title="Offer Information" />

      <div className="grid grid-cols-2 w-full gap-10 gap-y-2">
        <BuildFormRow label="Subscription Plan">
          <Input size="sm" value={selectedSubs?.subsPlanName} disabled />
        </BuildFormRow>

        <BuildFormRow label="Order Number">
          <Input size="sm" value={allData?.custOrderNbr ?? ""} disabled />
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
        {form.susPensionReasonId === "1" && (
          <BuildFormRow label="Order Reason">
            <Select value={form.susPensionReasonId ?? ""} disabled>
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

        {form.orderReason != "" && (
          <BuildFormRow label="Other Order Reason">
            <Input
              size={"sm"}
              className="flex-1"
              value={allData?.orderItemList[0].orderReason}
              disabled
            />
          </BuildFormRow>
        )}

        <BuildFormRow label="Reservation Time">
          <input
            type="datetime-local"
            className="input input-sm bg-white flex-1 disabled:bg-white disabled:border-slate-100 disabled:text-slate-400"
            value={form.resrvTime}
            // onChange={(e) => setForm((prev) => (prev = { ...prev, resrvTime: e.target.value }))}
            step={1}
            disabled
          />
        </BuildFormRow>

        <BuildFormRow label="Remarks">
          <Input
            size={"sm"}
            className="flex-1"
            value={allData?.orderItemList[0].comments}
            disabled
          />
        </BuildFormRow>
      </div>
    </div>
  );
};

export default SURStep2;
