import { Button } from "@/components/ui/button";
import { IPLimitList } from "./block/IPLimitList";
import { useUserGrantIPLimit } from "./hook/useUserGrantIPLimit";

export const IPLimitMain = () => {
  const { addIP, removeIP } = useUserGrantIPLimit();

  return (
    <div className="p-5 h-full flex flex-col gap-5">
      <div className="h-5/6">
        <IPLimitList />
      </div>
      <div className="w-full flex flex-1 justify-end space-x-5">
        <Button variant="ghost" onClick={addIP}>
          Add
        </Button>
        <Button variant="ghost" onClick={removeIP}>
          Remove
        </Button>
      </div>
    </div>
  );
};
