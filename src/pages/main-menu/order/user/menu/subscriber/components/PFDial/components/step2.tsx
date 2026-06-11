import { BuildFormRow } from "@/components/common/BuildFormRow";
import SectionTitle from "../../sectionTitle";
import { Input } from "@/components/ui/input";
import { usePFDial } from "../hooks/context";
import { useSubscriberListContext } from "../../../hooks";

const Step2 = () => {
  const { allData } = usePFDial();
  const { selectedSubs } = useSubscriberListContext();
  return (
    <div className="flex flex-col gap-2 w-full  p-5">
      {/* ================= Offer Information ================= */}
      <SectionTitle title="Offer Information" />

      <div className="grid grid-cols-2 gap-10 gap-y-2 w-full">
        <BuildFormRow label="Subscription Plan">
          <Input size="sm" value={selectedSubs?.subsPlanName} disabled />
        </BuildFormRow>

        <BuildFormRow label="Order Number">
          <Input size="sm" value={allData?.custOrderNbr} disabled />
        </BuildFormRow>

        <BuildFormRow label="Service Number">
          <Input size="sm" value={selectedSubs?.accNbr} disabled />
        </BuildFormRow>

        <BuildFormRow label="Payment Account">
          <Input size="sm" value={selectedSubs?.acctNbr} disabled />
        </BuildFormRow>
      </div>
    </div>
  );
};

export default Step2;
