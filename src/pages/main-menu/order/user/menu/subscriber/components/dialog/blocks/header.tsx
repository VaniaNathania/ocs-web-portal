import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useSubscriberListContext } from "../../../hooks";
import { verticalLineDivider } from "@/styles/style";

const SubsDetailHeader = () => {
  const { selectedSubs } = useSubscriberListContext();
  const { selectedUser } = useOrder();
  return (
    <div className="flex flex-row gap-5 py-3 items-center w-full border-b-2 text-sm">
      <div>Service Number : {selectedSubs?.accNbr}</div>
      <div className={verticalLineDivider} />
      <div>Customer : {selectedUser?.custName}</div>
      <div className={verticalLineDivider} />
      <div>Certificate : {selectedUser?.certNbr}</div>
    </div>
  );
};

export default SubsDetailHeader;
