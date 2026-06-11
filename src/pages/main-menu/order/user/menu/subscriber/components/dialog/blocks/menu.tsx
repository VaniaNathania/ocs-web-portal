import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useSubscriberListContext } from "../../../hooks";
import { Button } from "@/components/ui/button";
import { useOrderSubsDetail } from "../hooks/SubsDetailContext";

export const highlighted = "border-b-2 border-primary text-primary";
export const nonHighlighted = "cursor-pointer hover:text-primary";

const SubsDetailMenu = () => {
  const { selectedMenu, setSelectedMenu } = useOrderSubsDetail();
  return (
    <div className="flex flex-row gap-5 items-center w-full border-b-2 text-sm">
      <div
        onClick={() => setSelectedMenu("subscriber")}
        className={`py-3 ${selectedMenu === "subscriber" ? highlighted : nonHighlighted}`}
      >
        Subscriber Information
      </div>
      <div
        onClick={() => setSelectedMenu("order")}
        className={`py-3 ${selectedMenu === "order" ? highlighted : nonHighlighted}`}
      >
        Order Information
      </div>
      <div
        onClick={() => setSelectedMenu("account")}
        className={`py-3 ${selectedMenu === "account" ? highlighted : nonHighlighted}`}
      >
        Account Information
      </div>
    </div>
  );
};

export default SubsDetailMenu;
