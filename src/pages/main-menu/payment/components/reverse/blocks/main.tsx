import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReverseDialog } from "../hooks/context";
import { usePayment } from "../../../hooks/PaymentContext";

const Main = () => {
  const { reserveData } = useReverseDialog();
  const { setShowReverse } = usePayment();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 p-2 items-center">
        <div className="w-30">
          Payment SN <span className="text-red-500">*</span>
        </div>
        <div className="input input-sm flex-1">
          <Input size={"sm"} className="border-none p-0" value={reserveData?.paymentId} />
        </div>
        <Button size={"sm"}>Query</Button>
      </div>
      <div className="border-2 rounded-md p-2 flex flex-col gap-2">
        <div className="mb-2 font-bold">Detail</div>
        <div className=" flex flex-col gap-2 mx-5">
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Payment SN</Label>
            <Input className="col-span-2" size={"sm"} value={reserveData?.paymentId} />
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Bill Received</Label>
            <Input className="col-span-2" size={"sm"} />
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Payment Date</Label>
            <Input className="col-span-2" size={"sm"} value={reserveData?.createdDate} />
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Staff Name</Label>
            <Input className="col-span-2" size={"sm"} value={reserveData?.staffName} />
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Company</Label>
            <Input className="col-span-2" size={"sm"} value={reserveData?.orgName} />
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <div></div>
            <div className="col-span-2 flex items-center gap-2">
              <Input type="checkbox" size={"sm"} className="w-4" />
              <Label className="w-full">Mandatory Reversion</Label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <Label>Refund Reason</Label>
            <Select>
              <SelectTrigger className="col-span-2" size={"sm"}>
                <SelectValue placeholder="Please Select" />
              </SelectTrigger>
              <SelectContent>
                {/* {subsEvent.data?.map((item) => (
                  <SelectItem
                    value={item.subsEventId.toString()}
                    key={item.subsEventId}
                  >
                    {item.eventName}
                  </SelectItem>
                ))} */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="col-span-2 flex justify-end gap-2">
          <Button size={"sm"}>OK</Button>
          <Button variant={"outline"} size={"sm"} onClick={() => setShowReverse(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Main;
