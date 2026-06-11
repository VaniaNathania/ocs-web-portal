import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountBalance } from "../hooks/context";

const ListToolBar = () => {
  const { setBalAdd, setPointExchangeDialog, handleCheckbox, loading, isChecked, setIsChecked } = useAccountBalance();
  return (
    <div className="flex flex-row gap-2 p-5 items-center justify-between">
      <div className="flex flex-row items-center gap-2">
        <Input
          type="checkbox"
          checked={isChecked}
          className="w-[14px]"
          onChange={(e) => {
            const checked = e.target.checked;
            handleCheckbox(checked);
            setIsChecked(checked);
          }}
          disabled={loading}
        />
        <Label>Include Expiry Bal</Label>
      </div>
      <div className="flex flex-row gap-2">
        <Button size={"sm"} variant={"outline"} onClick={() => setBalAdd(true)}>
          Balance Limit Management
        </Button>
        <Button size={"sm"} variant={"outline"} onClick={() => setPointExchangeDialog(true)}>
          Point Exchange
        </Button>
      </div>
    </div>
  );
};

export default ListToolBar;
