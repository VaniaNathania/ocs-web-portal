import { useOrderLayout } from "../OrderLayoutProvider";
import AddAccInfo from "@/pages/main-menu/order/user/menu/accInfo/dialog/addAcc/AddAccInfo";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { lazy } from "react";
import OrderShopMain from "@/pages/main-menu/order/user/menu/shop/OrderShop";

const OrderMain = lazy(() => import("@/pages/main-menu/order/Order"));
const OrderUserLayout = lazy(
  () => import("@/pages/main-menu/order/user/layout/orderUserLayout"),
);

const Main = () => {
  const { activeTab } = useOrderLayout();
  const { showAddAcc, setShowAddAcc } = useOrder();
  return (
    <main className="grow bg-gray-100 min-h-[90vh]" role="content">
      {/* <Navbar /> */}
      {activeTab === "main" && <OrderMain />}
      {activeTab === "user" && <OrderUserLayout />}
      {activeTab === "shop" && <OrderShopMain />}
      <AddAccInfo isOpen={showAddAcc} handleDialog={setShowAddAcc} />
    </main>
  );
};

export { Main };
