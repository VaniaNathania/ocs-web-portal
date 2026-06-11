import { KeenIcon } from "@/components";
import Detail from "./orderInfoComp/detail";
import { Button } from "@/components/ui/button";
import RelationOrder from "./orderInfoComp/relation";
import { useOrderListContext } from "../../../hooks";

const OrderInfo = () => {
  const { selectedOrder } = useOrderListContext();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 justify-between items-center border-b-2 pb-5">
        <div>Order Number : {selectedOrder?.orderNbr}</div>
        <div className="flex felx-row gap-2 items-center">
          <KeenIcon icon="time" />
          <span>Basic Information</span>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <div className="h-5 w-2 rounded-sm bg-primary" />
        <div>Order Information</div>
      </div>
      <Detail />
      <RelationOrder />
      <div className="flex flex-row items-center gap-2">
        <div className="h-5 w-2 rounded-sm bg-primary" />
        <div>Attachment</div>
        <Button size={"sm"} className="w-[30px] h-[30px]" variant={"ghost"}>
          <KeenIcon icon="file-down" />
        </Button>
      </div>
    </div>
  );
};

export default OrderInfo;
