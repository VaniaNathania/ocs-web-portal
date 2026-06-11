import { useOrderShop } from "../hooks/shopContext";
import { useEffect } from "react";

const ShopItemHead = () => {
  const {
    selectedShopHeadItem,
    setSelectedShopHeadItem,
    shopHeadItems,
    groupedTable,
  } = useOrderShop();
  useEffect(() => {
    setSelectedShopHeadItem(shopHeadItems[0]);
    //  console.log(shopHeadItems);
  }, []);
  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-5">
        {shopHeadItems.map((item, index) => {
          return (
            <div
              key={index}
              className={`cursor-pointer border-slate-300  p-2 text-sm ${selectedShopHeadItem?.id === item.id ? "border-b-2 " : ""}`}
              onClick={() => setSelectedShopHeadItem(item)}
            >
              {item.name}
            </div>
          );
        })}
      </div>
      <div className="flex flex-row gap-5">
        {groupedTable
          .find(
            (item) =>
              item.parentCatgId === selectedShopHeadItem?.nodeId ||
              item.parentCatgId == selectedShopHeadItem?.parentCatgId,
          )
          ?.childCatg?.map((item, index) => (
            <div
              key={index}
              className={`cursor-pointer border-slate-300  p-2 text-xs ${selectedShopHeadItem?.id === item.id ? "text-primary " : ""}`}
              onClick={() => setSelectedShopHeadItem(item)}
            >
              {item.name}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ShopItemHead;
