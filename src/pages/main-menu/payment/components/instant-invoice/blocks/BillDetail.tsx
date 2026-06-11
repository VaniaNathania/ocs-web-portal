import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BillDetail = () => {
  return (
    <div className="p-2">
      <h2 className="font-bold">Bill Detail</h2>
      <div className="grid grid-cols-3 gap-4 p-5">
        <div className="flex flex-row items-center space-x-2">
          <Label className="">Total Charge</Label>
          <Input className="flex-1" size={"sm"} />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <Label className="">Paid Amount</Label>
          <Input className="flex-1" size={"sm"} />
        </div>
        <div className="flex flex-row items-center space-x-2">
          <Label className="">Unpaid Amount</Label>
          <Input className="flex-1" size={"sm"} />
        </div>
      </div>
      <div className="flex justify-end pr-5">
        <Button variant={"outline"} size={"sm"}>
          Credit
        </Button>
      </div>
    </div>
  );
};

export default BillDetail;
