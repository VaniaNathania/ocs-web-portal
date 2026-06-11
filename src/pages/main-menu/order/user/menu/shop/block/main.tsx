import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import OrderForm from "../component/orderForm/OrderForm";
import { useOrderShop } from "../hooks/shopContext";
import OrderShopHeader from "./header";
import ShopItems from "./ShopItem";

const Main = () => {
  const { showOrderForm, isLoading } = useOrderShop();
  return (
    <div>
      {!showOrderForm ? (
        <div className="flex flex-col px-2">
          {isLoading && <Loading />}
          <OrderShopHeader />
          <ShopItems />
        </div>
      ) : (
        <OrderForm />
      )}
    </div>
  );
};

export default Main;
