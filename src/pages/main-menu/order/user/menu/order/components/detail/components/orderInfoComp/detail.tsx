import { DefaultTooltip } from "@/components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrderListContext } from "../../../../hooks";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { apiConfigOrder } from "@/config/api.config";
import { useOrderOrderDetail } from "../../hooks/context";

const API_URL = apiConfigOrder.order;

const Detail = () => {
  const { selectedUser } = useOrder();
  const { selectedOrder } = useOrderListContext();
  const { orderDetail } = useOrderOrderDetail();

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Service Number" placement="top">
          <Label className="w-32 truncate">Service Number</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={selectedOrder?.accNbr}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Business Key" placement="top">
          <Label className="w-32 truncate">Business Key</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={selectedOrder?.custOrderId}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Dispatch Order Id" placement="top">
          <Label className="w-32 truncate">Dispatch Order Id</Label>
        </DefaultTooltip>
        {/* gk tau apa */}
        <Input disabled value={""} size={"sm"} className="flex-1" />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Brand" placement="top">
          <Label className="w-32 truncate">Brand</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={selectedOrder?.offerName}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Subscription Plan" placement="top">
          <Label className="w-32 truncate">Subscription Plan</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={orderDetail.data?.orderSubjectDto.subsPlanName}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Order Event" placement="top">
          <Label className="w-32 truncate">Order Event</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={selectedOrder?.eventName}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Order Number" placement="top">
          <Label className="w-32 truncate">Order Number</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={selectedOrder?.orderNbr}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Order State" placement="top">
          <Label className="w-32 truncate">Order State</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={selectedOrder?.orderStateName}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Customer Name" placement="top">
          <Label className="w-32 truncate">Customer Name</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={selectedUser?.custName}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Customer Type" placement="top">
          <Label className="w-32 truncate">Customer Type</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={selectedUser?.custTypeName}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Doc Number" placement="top">
          <Label className="w-32 truncate">Doc Number</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={`${selectedUser?.certNbr} [${selectedUser?.certTypeName}]`}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Accept Channel" placement="top">
          <Label className="w-32 truncate">Accept Channel</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={selectedOrder?.contactChannelName}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Accept Staff" placement="top">
          <Label className="w-32 truncate">Accept Staff</Label>
        </DefaultTooltip>
        <Input
          disabled
          // value={orderDetail.data?.orderSubjectDto.apartyName}
          value={selectedOrder?.createdMan}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Accept Date" placement="top">
          <Label className="w-32 truncate">Accept Date</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={orderDetail.data?.orderSubjectDto.acceptDate.replace("T", " ")}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Agreement Effective Date" placement="top">
          <Label className="w-32 truncate">Agreement Effective Date</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={orderDetail.data?.orderSubjectDto.agmEffDate}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Duration of Agreement" placement="top">
          <Label className="w-32 truncate">Duration of Agreement</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={orderDetail.data?.orderSubjectDto.oldAgmEffDate}
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center col-span-3">
        <DefaultTooltip title="Remarks" placement="top">
          <Label className="w-32 truncate">Remarks</Label>
        </DefaultTooltip>
        <Input
          disabled
          value={orderDetail.data?.orderSubjectDto.comments}
          size={"sm"}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default Detail;
