import OrderShopHeader from "./block/header";
import Main from "./block/main";
import { OrderShopProvider } from "./hooks/shopContext";

const OrderShopMain = () => {
  return (
    <OrderShopProvider>
      <Main />
    </OrderShopProvider>
  );
};

export default OrderShopMain;
