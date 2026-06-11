import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import SuccessBlock from "../../../../subscriber/blocks/SuccessBlock";
import { useOrderShop } from "../../../hooks/shopContext";
import { useOrderForm } from "../hooks/context";

const Steps3 = () => {
  const { selectedTableItem } = useOrderShop();
  const { selectedUser } = useOrder();
  const { orderNbr } = useOrderForm();
  // console.log(selectedTableItem);

  return (
    <SuccessBlock
      custNbr={selectedUser?.custId ?? 0}
      offerName={selectedTableItem?.name ?? ""}
      // orderId={orderNbr}
    />
  );
};

export default Steps3;
