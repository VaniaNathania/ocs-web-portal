import { KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/pages/main-menu/order/hooks/orderContext";
import { useNavigate } from "react-router";
import { useOrderShop } from "../hooks/shopContext";
import { verticalLineDivider } from "@/styles/style";
import { useOrderLayout } from "@/layouts/main-menu/order";

const OrderShopHeader = () => {
  const { setSelectedUser } = useOrder();
  const { setActiveTab } = useOrderLayout();
  const { setSearch, search } = useOrderShop();
  const navigate = useNavigate();
  const logOut = () => {
    setSelectedUser(undefined);
    backToUser();
  };
  const backToUser = () => {
    setActiveTab("user");
  };
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-row items-center gap-1 rounded-md">
          <KeenIcon icon="shop" />
          <div>Shop</div>
        </div>
        <div>
          <label className="input input-sm w-full flex items-center gap-2">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              // value={search}
              onChange={(e) => {
                if (e.target.value === "") setSearch("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch(e.currentTarget.value);
              }}
              placeholder="Search offer..."
              className="w-full"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-row h-full items-center">
        <Button variant={"ghost"} onClick={logOut}>
          <KeenIcon icon="exit-right" />
          <div>Log Out</div>
        </Button>
        <div className={verticalLineDivider} />
        <Button variant={"ghost"} onClick={backToUser}>
          <KeenIcon icon="left" />
          <div>Go Back</div>
        </Button>
      </div>
    </div>
  );
};

export default OrderShopHeader;
