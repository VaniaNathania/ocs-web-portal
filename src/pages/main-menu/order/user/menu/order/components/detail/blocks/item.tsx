import UnderConstruction from "@/components/common/UnderConstruction";
import { useOrderOrderDetail } from "../hooks/context";
import OrderInfo from "../components/orderInfo";
import Chargeinfo from "../components/chargeInfo";

const Item = () => {
  const { selectedMenu } = useOrderOrderDetail();

  switch (selectedMenu) {
    case "order":
      return <OrderInfo />;

    case "charge":
      return <Chargeinfo />;

    default:
      return <UnderConstruction desc={selectedMenu} />;
  }
};

export default Item;
