import UnderConstruction from "@/components/common/UnderConstruction";
import { useOrderSubsDetailOrderInfo } from "../hooks/SubsDetailOrderInfoContext";
import OrderInfo from "../components/OrderInfo";

const Item = () => {
  const { selectedMenu } = useOrderSubsDetailOrderInfo();

  switch (selectedMenu) {
    case "order":
      return <OrderInfo />;
    default:
      return <UnderConstruction />;
  }
};

export default Item;
