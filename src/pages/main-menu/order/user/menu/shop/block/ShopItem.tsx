import ShopItemHead from "../component/ShopBundle";
import ShopTable from "../component/ShopTable";

const ShopItems = () => {
  return (
    <div className="flex flex-col gap-2 transition-all duration-200">
      <ShopItemHead />
      <ShopTable />
    </div>
  );
};

export default ShopItems;
