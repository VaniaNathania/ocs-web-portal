import { DefaultTooltip } from "@/components";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrderOrderDetail } from "../../hooks/context";

const Detail = () => {
  const { orderDetail } = useOrderOrderDetail();

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Account Number" placement="top">
          <Label className="w-32 truncate">Account Number</Label>
        </DefaultTooltip>
        <Input
          value={
            orderDetail.data?.orderFeeRespDto.orderFeeSubjectRespDto.acctNbr
          }
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Payment Plan" placement="top">
          <Label className="w-32 truncate">Payment Plan</Label>
        </DefaultTooltip>
        <Input
          value={
            orderDetail.data?.orderFeeRespDto.orderFeeSubjectRespDto.payPlan ??
            ""
          }
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Amount Receiveable" placement="top">
          <Label className="w-32 truncate">Amount Receiveable</Label>
        </DefaultTooltip>
        <Input
          value={
            orderDetail.data?.orderFeeRespDto.orderFeeSubjectRespDto
              .receivableCharge
          }
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Discount Amount" placement="top">
          <Label className="w-32 truncate">Discount Amount</Label>
        </DefaultTooltip>
        <Input
          value={
            orderDetail.data?.orderFeeRespDto.orderFeeSubjectRespDto
              .promotionCharge
          }
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Payment Type" placement="top">
          <Label className="w-32 truncate">Payment Type</Label>
        </DefaultTooltip>
        <Input
          value={
            orderDetail.data?.orderFeeRespDto.orderFeeSubjectRespDto
              .paymentMethodName
          }
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Invoice Number" placement="top">
          <Label className="w-32 truncate">Invoice Number</Label>
        </DefaultTooltip>
        <Input
          value={
            orderDetail.data?.orderFeeRespDto.orderFeeSubjectRespDto.checkNbr ??
            ""
          }
          size={"sm"}
          className="flex-1"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <DefaultTooltip title="Remarks" placement="top">
          <Label className="w-32 truncate">Remarks</Label>
        </DefaultTooltip>
        <Input
          value={
            orderDetail.data?.orderFeeRespDto.orderFeeSubjectRespDto.comments ??
            ""
          }
          size={"sm"}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default Detail;
