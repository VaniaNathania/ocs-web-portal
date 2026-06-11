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
import { useOneWayBlockOwe } from "../hooks/context";
import SectionTitle from "../../sectionTitle";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { suspensionReason } from "../../SURSTEPS/interface/mock";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";

const OWBOStep1 = () => {
  const { selectedSubs, isLoading } = useSubscriberListContext();
  const { allDatas } = useOneWayBlockOwe();
  // console.log(selectedSubs);

  // if (!startOrderFlow.data?.custOrderNbr) return;

  return (
    <div className="flex flex-col gap-2 w-full">
      {isLoading && <Loading />}
      <SectionTitle title="Offer Information" />

      <div className="grid grid-cols-2 w-full gap-10 gap-y-2">
        <BuildFormRow label="Subscription Plan">
          <Input
            size="sm"
            value={allDatas?.orderItemList[0].subsPlanName}
            disabled
          />
        </BuildFormRow>

        <BuildFormRow label="Order Number">
          <Input size="sm" value={allDatas?.custOrderNbr} disabled />
        </BuildFormRow>

        <BuildFormRow label="Service Number">
          <Input size="sm" value={allDatas?.orderItemList[0].accNbr} disabled />
        </BuildFormRow>
        <BuildFormRow label="Payment Account">
          <Input
            size="sm"
            value={allDatas?.orderItemList[0].acctNbr}
            disabled
          />
        </BuildFormRow>
      </div>
      {/* <SectionTitle title="Order Information" /> */}

      {/* <div className="grid-cols-2 grid gap-10 gap-y-2 w-full">
        {form.suspensionReasonsId === "1" && (
          <BuildFormRow label="Order Reason">
            <Select value={form.suspensionReasonsId ?? ""} onValueChange={(value) => setForm((prev) => (prev = { ...prev, suspensionReasonsId: value }))} disabled>
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

        {form.otherReason != "" && (
          <BuildFormRow label="Other Order Reason">
            <Input size={"sm"} className="flex-1" value={form.otherReason} onChange={(e) => setForm((prev) => (prev = { ...prev, otherReason: e.target.value }))} disabled />
          </BuildFormRow>
        )}
      </div> */}
    </div>
  );
};

export default OWBOStep1;
