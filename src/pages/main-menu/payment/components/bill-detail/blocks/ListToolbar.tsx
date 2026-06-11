import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBillDetailContext } from "../hooks/context";

const ListToolbar = () => {
  const { selectQuerry, handleCheckbox, handleQuerry, setTriggerNotPaid, triggerNotPaid } = useBillDetailContext();
  return (
    <div className="flex flex-row gap-5 p-5 items-center">
      <div className="flex flex-row items-center gap-2">
        <Input type="checkbox" className="w-[14px]" checked={selectQuerry.includes(1)} onChange={() => handleCheckbox(1)} />
        <Label>Billing Cycle</Label>
      </div>
      <div className="flex flex-row items-center gap-2">
        <Input type="checkbox" className="w-[14px]" checked={selectQuerry.includes(10)} onChange={() => handleCheckbox(10)} />
        <Label>Service Number</Label>
      </div>
      <div className="flex flex-row items-center gap-2">
        <Input type="checkbox" className="w-[14px]" checked={selectQuerry.includes(100)} onChange={() => handleCheckbox(100)} />
        <Label>Account Item Type</Label>
      </div>
      <div className="flex flex-row items-center gap-2">
        <Input
          type="checkbox"
          className="w-[14px]"
          checked={triggerNotPaid}
          onChange={(e) => {
            const checked = e.target.checked;
            setTriggerNotPaid(checked);
          }}
        />
        <Label>Not Paid</Label>
      </div>
      <Button size={"sm"} onClick={handleQuerry}>
        Query
      </Button>
    </div>
  );
};

export default ListToolbar;
